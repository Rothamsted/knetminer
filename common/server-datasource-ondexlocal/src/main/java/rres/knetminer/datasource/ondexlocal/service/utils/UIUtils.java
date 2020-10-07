package rres.knetminer.datasource.ondexlocal.service.utils;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;

import java.awt.Color;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.Attribute;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
public class UIUtils
{
	private static final Logger log = LogManager.getLogger ( UIUtils.class );

	private UIUtils () {}

  /**
   * remove any pre-existing, visible, size and flagged attributes from
   * concepts and relations 29-07-2019
   */
  public static void removeOldGraphAttributes ( ONDEXGraph graph ) 
  {
  	try
  	{
      log.debug ( "Remove old 'visible' attributes from all concepts and relations..." );
      
      Stream.of ( "visible", "size", "flagged" )
      .forEach ( attrId -> ONDEXGraphUtils.removeConceptAttribute ( graph, attrId ) );

      Stream.of ( "visible", "size" )
      .forEach ( attrId -> ONDEXGraphUtils.removeRelationAttribute ( graph, attrId ) );
  	}
  	catch (Exception ex)
  	{
      log.warn("Failed to remove pre-existing attributes from graph: {}", ex.getMessage());
      log.trace("Failed to remove pre-existing attributes from graph, details: ", ex );
    }
  }
  

	/**
	 * Creates a mapping between keywords and random HTML colour codes, used by the search highlighting functions.
	 * if colors is null, uses {@link #createHighlightColors(int)}.
	 * If colours are not enough for the set of parameter keywords, they're reused cyclically.
	 */
	public static Map<String, String> createHilightColorMap ( Set<String> keywords, List<String> colors )
	{
		if ( colors == null ) colors = createHighlightColors ( keywords.size () );
		Map<String, String> keywordColorMap = new HashMap<> ();
		
		int colIdx = 0;
		for ( String key: keywords )
			keywordColorMap.put ( key, colors.get ( colIdx++ % colors.size () ) );
		
		return keywordColorMap;
	}

	/**
	 * Defaults to null.
	 */
	public static Map<String, String> createHilightColorMap ( Set<String> keywords )
	{
		return createHilightColorMap ( keywords, null );
	}

	/**
	 * Can be used with {@link #createHilightColorMap(Set, List)}. Indeed, this is 
	 * what it's used when no color list is sent to it. It genereates a list of the size
	 * sent and made of random different colors with visibility characteristics.
	 * 
	 */
	private static List<String> createHighlightColors ( int size )
	{
		Random random = new Random ();
		Set<Integer> colors = new HashSet<> (); // Compare each colour to ensure we never have duplicates
		int colorCode = -1;

		for ( int i = 0; i < size; i++ ) 
		{
			// Ensure colour luminance is >40 (git issue #466),
			// no colours are repeated and are never yellow
			//
			while ( true )
			{
				colorCode = random.nextInt ( 0x666666 + 1 ) + 0x999999; // lighter colours only
				if ( colors.contains ( colorCode ) ) continue;
									
				String colorHex = "#" + Integer.toHexString ( colorCode );
				
				Color colorVal = Color.decode ( colorHex );
				if ( Color.YELLOW.equals ( colorVal ) ) continue;
				
				int colorBrightness = (int) sqrt ( 
					pow ( colorVal.getRed (), 2 ) * .241
					+ pow ( colorVal.getGreen (), 2 ) * .691 
					+ pow ( colorVal.getBlue (), 2 ) * .068 
				);
				
				if ( colorBrightness <= 40 ) continue;
				
				break;
			}
			colors.add ( colorCode ); // Add to colour ArrayList to track colours
		}
		
		return colors.stream ()
		.map ( colCode -> String.format ( "#%06x", colCode ) )
		.collect ( Collectors.toList () );
	}
	
	
	
  /**
   * Helper for {@link #highlightSearchKeywords(ONDEXConcept, Map)}. If the pattern matches the path, it  
   * {@link Matcher#replaceAll(String) replaces} the matching bits of the target with the new
   * highligher string and passes the result to the consumer (for operations like assignments)
   * 
   * Please note:
   * 
   * - target is assumed to be a Lucene token, "xxx*" or "xxx?" are translated into "\S*" or "\S?", in order to 
   * match the RE semantics.
   * - highlighter is a string for {@link Matcher#replaceAll(String)}, which should use "$1" to match a proper
   * bracket expression in target
   * - the matching is usually case-insensitive, but that depends on how you defined the pattern. 
   */
  private static boolean highlightSearchStringFragment ( Pattern pattern, String target, String highlighter, Consumer<String> consumer )
  {
  	Matcher matcher = pattern.matcher ( target );
  	if ( !matcher.find ( 0 ) ) return false;
  	var highlightedStr = matcher.replaceAll ( highlighter );
  	if ( consumer != null ) consumer.accept ( highlightedStr );
  	return true;
  }
  
  /**
   * Helper for {@link #highlightSearchKeywords(ONDEXConcept, Map)}, manages the hightlighting of a single
   * search keyword.
   * 
   */
  public static boolean highlightSearchKeyword ( ONDEXConcept concept, String keyword, String highlighter )
  {
		boolean found = false;

		String keywordRe = '(' + keyword + ')';
		// TODO: the end user is supposed to be writing Lucene expressions, 
		// so we fix them this way. But using Lucene for highlighting should be simpler.
		keywordRe = keywordRe.replaceAll ( "\\*", "\\S*" )
			.replaceAll ( "\\?", "\\S?" );
		
		Pattern kwpattern = Pattern.compile ( keywordRe, Pattern.CASE_INSENSITIVE );

		found |= highlightSearchStringFragment ( kwpattern, concept.getAnnotation (), highlighter, concept::setAnnotation );
		found |= highlightSearchStringFragment ( kwpattern, concept.getDescription (), highlighter, concept::setDescription );
		
		// old name -> is preferred, new name
		HashMap<String, Pair<Boolean, String>> namesToCreate = new HashMap<> ();
		for ( ConceptName cname : concept.getConceptNames () )
		{
			String cnameStr = cname.getName ();
			// TODO: initially cnameStr.contains ( "</span>" ) was skipped too, probably to be removed
			if ( cnameStr == null ) continue;
				
			found |= highlightSearchStringFragment ( 
				kwpattern, cnameStr, highlighter, 
				newName -> namesToCreate.put ( cnameStr, Pair.of ( cname.isPreferred (), newName ) ) 
			);
		}
		
		// And now do the replacements for real
		namesToCreate.forEach ( ( oldName, newPair ) -> {
			concept.deleteConceptName ( oldName );
			concept.createConceptName ( newPair.getRight (), newPair.getLeft () );
		});
		

		// search in concept attributes
		for ( Attribute attribute : concept.getAttributes () )
		{
			String attrId = attribute.getOfType ().getId ();
			
			if ( attrId.equals ( "AA" ) || attrId.equals ( "NA" ) 
					 || attrId.startsWith ( "AA_" ) || attrId.startsWith ( "NA_" ) )
				continue;
			
			String value = attribute.getValue ().toString ();
			found |= highlightSearchStringFragment ( kwpattern, value, highlighter, attribute::setValue );
		}
		
		return found;
  }
  
  
  /**
   * Searches different fields of a concept for a query or pattern and
   * highlights them.
   * 
   * TODO: this is ugly, Lucene should already have methods to do the same.
   *
   * @return true if one of the concept fields contains the query
   */
	public static boolean highlightSearchKeywords ( ONDEXConcept concept, Map<String, String> keywordColourMap )
	{
		// Order the keywords by length to prevent interference by shorter matches that are substrings of longer ones.
		String[] orderedKeywords = keywordColourMap.keySet ().toArray ( new String[ 0 ] );
		
		Comparator<String> strLenComp = (a, b) -> a.length () == b.length () 
			? a.compareTo ( b ) 
			: Integer.compare ( a.length(), b.length() );

		Arrays.sort ( orderedKeywords, strLenComp );
		boolean found = false;

		for ( String key : orderedKeywords )
		{
			var highlighter = "<span style=\"background-color:" + keywordColourMap.get ( key ) + "\">"
					+ "<b>$1</b></span>";				
			found |= highlightSearchKeyword ( concept, key, highlighter );
		}

		return found;
	}
  
}
