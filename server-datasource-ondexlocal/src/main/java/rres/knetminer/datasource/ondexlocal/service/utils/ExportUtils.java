package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.args.FileArgumentDefinition.EXPORT_FILE;
import static net.sourceforge.ondex.filter.ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG;
import static net.sourceforge.ondex.filter.unconnected.ArgumentNames.REMOVE_TAG_ARG;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.common.base.Functions;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPlugin;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.exception.type.PluginException;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import uk.ac.ebi.utils.io.IOUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>7 Oct 2020</dd></dl>
 *
 */
public class ExportUtils
{
	private static final Logger log = LogManager.getLogger ( UIUtils.class );
	
	private ExportUtils () {}

	
  /**
   * Export the Ondex graph as a JSON file using the Ondex JSON Exporter plugin.
   *
   * @return a pair containing the JSON result and the the graph that was actually exported
   * (ie, the one computed by {@link Filter filtering isolated entities}. 
   * 
   * 
   */
  public static Pair<String, ONDEXGraph> exportGraph2Json ( ONDEXGraph graph ) throws InvalidPluginArgumentException
  {
  	File exportFile = null;
  	ONDEXGraph graph2 = new MemoryONDEXGraph ( "FilteredGraphUnconnected" );
  	try 
    {
	    List<String> ccRestrictionList = List.of (
	    	"Publication", "Phenotype", "Protein",
	      "Drug", "Chromosome", "Path", "Comp", "Reaction", "Enzyme", "ProtDomain", "SNP",
	      "Disease", "BioProc", "Trait"
	    );
	
	    log.info ( "Filtering concept classes " + ccRestrictionList );
			
	  	var uconnFilter = new Filter ();
	    Map<String, Object> filterOpts = ccRestrictionList
	    	.stream()
	    	.collect ( Collectors.toMap ( 
	    		cc -> CONCEPTCLASS_RESTRICTION_ARG,
	    		cc -> (Object) cc
	    ));
	    filterOpts.put ( REMOVE_TAG_ARG, true );
			ONDEXPlugin.runPlugin ( uconnFilter, graph, filterOpts );
			uconnFilter.copyResultsToNewGraph ( graph2 );
	
			
			// Export the graph as JSON too, using the Ondex JSON Exporter plugin.
		
    	// TODO: just change the plugin, so that the functionality is available outside of it and
    	// it can return a string instead of only writing to a file.
    	//
			exportFile = File.createTempFile ( "knetminer", "graph" );
			exportFile.deleteOnExit ();
			String exportPath = exportFile.getAbsolutePath ();
			
			ONDEXPlugin.runPlugin ( Export.class, graph2, Map.of ( EXPORT_FILE, exportPath ) );
      
      log.debug ( "Network JSON file created:" + exportPath );
			log.debug ( "JSON Export done to file: '{}'", exportPath );
      log.debug ( 
      	"Exported JSON data: Total concepts = {} , Relations= {}", 
      	graph2.getConcepts().size(), 
      	graph2.getRelations().size()
      );
      
      // TODO: The JSON exporter uses this too, both should become UTF-8
      return Pair.of ( IOUtils.readFile ( exportPath, Charset.defaultCharset() ), graph2 );
    } 
    catch ( Exception ex )
    {
    	// TODO: client side doesn't know anything about this, likely wrong
      log.error ( "Failed to export graph", ex );
      return Pair.of ( "", graph2 );
    }
    finally {
    	if ( exportFile != null ) exportFile.delete ();
    }
  }	
  
}
