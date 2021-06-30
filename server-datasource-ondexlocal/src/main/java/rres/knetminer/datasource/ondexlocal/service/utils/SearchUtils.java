package rres.knetminer.datasource.ondexlocal.service.utils;

import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import rres.knetminer.datasource.ondexlocal.service.SearchService;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifDataService;

/**
 * Search utilities
 * 
 * Small utilities that are static and do not depend on instantiated components like
 * {@link SearchService}
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>30 Sep 2020</dd></dl>
 *
 */
public class SearchUtils
{
  private static final Logger log = LogManager.getLogger ( SearchUtils.class );
	

	private SearchUtils () {}

  /**
   * Converts a Lucene search expression into a list of words. Returns an empty set if it couldn't find any.
   *
   */
	public static Set<String> getSearchWords ( String searchString )
	{
		Set<String> result = new HashSet<> ();
		searchString = searchString
		.replace ( "(", " " )
		.replace ( ")", " " )
		.replace ( "AND", " " )
		.replace ( "OR", " " )
		.replace ( "NOT", " " )
		.replaceAll ( "\\s+", " " )
		.trim ();
				
		for (
			// TODO: cache the pattern
			var tokenMatcher = Pattern.compile ( "\"[^\"]+\"|[^\\s]+" ).matcher ( searchString );
			tokenMatcher.find ();
		)
		{
			String token = tokenMatcher.group ();
			// Also fixes errors like odd no. of quotes
			if ( token.startsWith ( "\"") ) token = token.substring ( 1 );
			if ( token.endsWith ( "\"" ) ) token = token.substring ( 0, token.length () - 1 );
			token = token.trim ();

			result.add ( token );
		}

		log.info ( "getSearchWords(), tokens: {}", result );
		return result;
	}	
	
	
  /**
   * Creates a new Lucene search expression where the NOT operator is removed from clauses having it.
   * This is used in searches with exclusion lists. 
   * 
   * The input is split into sub-expression tracking AND/OR operators.
   * 
   * TODO - KHP: There must be a smarter way (regex?) for getting the NOT "terms"
   */
  public static String getExcludingSearchExp ( String searchExp )
  {
    String result = "";
    if (searchExp == null) searchExp = "";

    searchExp = searchExp.replace ( "(", "" );
    searchExp = searchExp.replace ( ")", "" );

    String[] subExps = searchExp.split ( " *(AND|OR) *" );
    for (String subExp : subExps)
    {
      String[] notExps = subExp.split ( "NOT" );
      // Initial value is skipped
      for ( int i = 1; i < notExps.length; i++ )
      {
      	if ( !result.isEmpty () ) result += " OR ";
        result += notExps [ i ];
      }
    }
    return result;
  } 	
	
  /**
   * Merge two maps using the greater scores. This is needed when a keyword matches more than 
   * one concept field eg. name, description and attribute. It will ensure that the highest
   * Lucene score is used in the Gene Rank.
   *
   * @param hit2scoreResult the result of the merge. This always contains OndexConcept instances (not LuceneConcept)
   * @param sHits map that holds search results
   * @param exclusionHits concepts to be excluded from the result, can be null
   */
  public static void mergeHits ( 
  	Map<ONDEXConcept, Float> hit2scoreResult, ScoredHits<ONDEXConcept> sHits, ScoredHits<ONDEXConcept> exclusionHits
  )
	{
  	var exclusions = Optional.ofNullable ( exclusionHits )
  		.map ( ScoredHits::getOndexHits )
  		.orElse ( Set.of () );
  	var hasExclusions = !exclusions.isEmpty ();

  	// Usually the notHits contains LuceneConcept only, but just in case
  	var hasLuceneExclusions = hasExclusions 
  			&& exclusions.iterator ().next () instanceof LuceneConcept; 
  	
  	sHits.getOndexHits ()
  	.stream ()
  	.filter ( c ->
  	{
  		if ( !hasExclusions ) return true;
  		if ( hasLuceneExclusions )
  		{
  			if ( !( c instanceof LuceneConcept) ) throw new IllegalArgumentException ( 
  				"Can't merge lucene hits that aren't LuceneConcept instances" 
  			);
  		}
  		else
  			// exclusions are based on OndexConcept, extract the OndexConcept if not already done
  			if ( c instanceof LuceneConcept ) c = ((LuceneConcept) c).getParent ();

  		// Now we can compare
			return !exclusions.contains ( c );
  	})
  	.forEach ( c ->
  	{ 
  		var score = sHits.getScoreOnEntity ( c );
  		if ( c instanceof LuceneConcept )
  		{ 
  			// Results are always OndexConcept
  			c = ( (LuceneConcept) c ).getParent ();
    		// sHits usually contains Lucene concepts, but just in case
    		if ( score == -1 ) score = sHits.getScoreOnEntity ( c );
  		}
  		hit2scoreResult.merge ( c, score, Math::max ); 
  	});
	}	
	
    
	/**
	 * TODO: this is only used by {@link OndexLocalDataSource} and only to know the size of 
	 * concepts that match. So, do we need to compute the map, or do wee need the count only?
	 * 
	 * The two tasks are different, see below.
	 * 
	 */
	public static Map<Integer, Set<Integer>> getMapEvidences2Genes ( 
		SemanticMotifDataService semanticMotifDataService, Map<ONDEXConcept, Float> luceneConcepts
	)
	{
		var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();

		return luceneConcepts.keySet ()
		.stream ()
		.map ( ONDEXConcept::getId )
		.filter ( concepts2Genes::containsKey )
		// .count () As said above, this would be enough if we need a count only
		.collect ( Collectors.toMap ( Function.identity (), concepts2Genes::get ) );
	}  
}
