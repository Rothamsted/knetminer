package rres.knetminer.datasource.ondexlocal.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils;

/**
 * TODO: Comment me
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>7 Oct 2020</dd></dl>
 *
 */
@Component
public class UIService
{
	@Autowired
	private DataService dataService;

	@Autowired
	private SearchService searchService;
	
	
	private final Logger log = LogManager.getLogger ( getClass() );
	
	private UIService () {}

	
  /**
   * Write Synonym Table for Query suggestor
   *
   */
	public String renderSynonymTable ( String keyword ) throws ParseException
	{
		StringBuffer out = new StringBuffer ();
		// TODO: Lucene shouldn't be used directly
		Analyzer analyzer = new StandardAnalyzer ();
    var graph = dataService.getGraph ();
		
		Set<String> synonymKeys = SearchUtils.getSearchWords ( keyword );
		for ( var synonymKey: synonymKeys )
		{
			log.info ( "Checking synonyms for \"{}\"", synonymKey );
			if ( synonymKey.contains ( " " ) && !synonymKey.startsWith ( "\"" ) ) 
				synonymKey = "\"" + synonymKey + "\"";

			Map<Integer, Float> synonyms2Scores = new HashMap<> ();

			// search concept names
			String fieldNameCN = SearchUtils.getLuceneFieldName ( "ConceptName", null );
			QueryParser parserCN = new QueryParser ( fieldNameCN, analyzer );
			Query qNames = parserCN.parse ( synonymKey );
			ScoredHits<ONDEXConcept> hitSynonyms = searchService.luceneMgr.searchTopConcepts ( qNames, 500 );

      /*
       * TODO: does this still apply?
       * 
       * number of top concepts searched for each Lucene field, increased for now from
       * 100 to 500, until Lucene code is ported from Ondex to KnetMiner, when we'll
       * make changes to the QueryParser code instead.
       */

			for ( ONDEXConcept c : hitSynonyms.getOndexHits () )
			{
				if ( c instanceof LuceneConcept ) c = ( (LuceneConcept) c ).getParent ();
				
				int cid = c.getId ();
				float cscore = hitSynonyms.getScoreOnEntity ( c );
				
				synonyms2Scores.merge ( cid, cscore, Math::max );
			}

			
			if ( synonyms2Scores.isEmpty () ) continue;

			// Only start a KEY tag if it will have contents. Otherwise skip it.
			out.append ( "<" + synonymKey + ">\n" );

			Stream<Map.Entry<Integer, Float>> sortedSynonyms = synonyms2Scores.entrySet ()
			.stream ()
			.sorted ( Collections.reverseOrder ( Map.Entry.comparingByValue () ) );

			Map<String, Integer> entryCountsByType = new HashMap<> ();
			final int MAX_SYNONYMS = 25; // we store this no of top synonyms per concept
					
			// writes the topX values in table
			sortedSynonyms.forEach ( entry -> 
			{
				int synonymId = entry.getKey ();
				float score = entry.getValue ();
				
				ONDEXConcept eoc = graph.getConcept ( synonymId );
				String type = eoc.getOfType ().getId ();

				if ( ( type.equals ( "Publication" ) || type.equals ( "Thing" ) ) ) return;
				
				// TODO: before, this count was incremented in the cNames loop below, however, that way either we
				// get the same because there's one preferred name only,
				// or the count computed that way is likely wrong, cause it increases with names
				//
				int synCount = entryCountsByType.compute ( type, 
					(thisType, thisCount) -> thisType == null ? 1 : ++thisCount
				); 

				if ( synCount > MAX_SYNONYMS ) return;

				
				Set<ConceptName> cNames = eoc.getConceptNames ();

				cNames.stream ()
				.filter ( ConceptName::isPreferred )
				.map ( ConceptName::getName )
				.forEach ( name ->
				{
					// error going around for publication
					// suggestions
					if ( name.contains ( "\n" ) ) name = name.replace ( "\n", "" );

					// error going around for qtl
					// suggestions
					if ( name.contains ( "\"" ) ) name = name.replaceAll ( "\"", "" );
					
					out.append ( name + "\t" + type + "\t" + Float.toString ( score ) + "\t" + synonymId + "\n" );
				});
			}); // forEach synonym

			out.append ( "</" + synonymKey + ">\n" );
				
		} // for synonymKeys
		return out.toString ();
	} //
	
}
