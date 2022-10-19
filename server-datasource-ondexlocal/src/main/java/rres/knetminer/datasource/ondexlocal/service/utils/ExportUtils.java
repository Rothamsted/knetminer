package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.args.BooleanArgumentDefinition.EXPORT_PLAIN_JSON;
import static net.sourceforge.ondex.args.FileArgumentDefinition.EXPORT_FILE;
import static net.sourceforge.ondex.filter.ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG;
import static net.sourceforge.ondex.filter.unconnected.ArgumentNames.REMOVE_TAG_ARG;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.UncheckedPluginException;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.utils.OndexPluginUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.io.IOUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>7 Oct 2020</dd></dl>
 *
 */
public class ExportUtils
{
	private static final Logger log = LogManager.getLogger ( ExportUtils.class );
	
	private ExportUtils () {}
	
	
  /**
   * Builds the KnetMiner 'Network View' (4th tab).
   * 
   * It works by exporting the Ondex graph as a JSON file using the Ondex JSON Exporter plugin.
   *
   * @return a pair containing the JSON result and the the graph that was actually exported
   * (ie, the one computed by {@link Filter filtering isolated entities}. 
   * 
   * 
   */
  public static Pair<String, ONDEXGraph> exportGraph2Json ( ONDEXGraph graph, boolean exportPlainJSON )
  {
  	// DEBUG exportOXL ( graph );
  	
  	File exportFile = null;
  	ONDEXGraph graph2 = new MemoryONDEXGraph ( "FilteredGraphUnconnected" );
  	try 
    {
	    List<String> filteredConceptClasses = List.of (
	    	"Publication", "Phenotype", "Protein",
	      "Drug", "Chromosome", "Path", "Comp", "Reaction", "Enzyme", "ProtDomain", "SNP",
	      "Disease", "BioProc", "Trait"
	    );
	    log.info ( "Filtering concept classes " + filteredConceptClasses );
			
	  	var uconnFilter = new Filter ();
			OndexPluginUtils.runPlugin ( 
				uconnFilter,
				graph,  
				Map.of ( 
					CONCEPTCLASS_RESTRICTION_ARG, filteredConceptClasses,
					REMOVE_TAG_ARG, true 	
				)
			);
			uconnFilter.copyResultsToNewGraph ( graph2 );
	
			
			// Export the graph as JSON too, using the Ondex JSON Exporter plugin.
		
    	// TODO: just change the plugin, so that the functionality is available outside of it and
    	// it can return a string instead of only writing to a file.
    	//
			exportFile = File.createTempFile ( "knetminer", "graph" );
			exportFile.deleteOnExit ();
			String exportPath = exportFile.getAbsolutePath ();
			
			OndexPluginUtils.runPlugin (
				Export.class, graph2, Map.of ( EXPORT_FILE, exportPath , EXPORT_PLAIN_JSON, exportPlainJSON )
			);
      
			log.debug ( "JSON Export done to file: '{}'", exportPath );
      log.info ( 
      	"Exported JSON data: Total concepts = {} , Relations= {}", 
      	graph2.getConcepts().size(), 
      	graph2.getRelations().size()
      );
      
      // TODO: The JSON exporter uses this too, both should become UTF-8
      return Pair.of ( IOUtils.readFile ( exportPath, Charset.defaultCharset() ), graph2 );
    }
  	catch ( UncheckedPluginException ex ) {
  		throw ExceptionUtils.buildEx ( UncheckedPluginException.class, ex, 
  			"Knetbuilder failed to export the graph, due to: $cause" 
  		);
  	}
    catch ( IOException ex )
    {
    	throw ExceptionUtils.buildEx ( UncheckedIOException.class, ex, 
  			"Knetbuilder failed to export the graph, due to I/O problem: $cause" 
  		);
    }
    catch ( RuntimeException ex )
    {
    	throw ExceptionUtils.buildEx ( RuntimeException.class, ex, 
  			"Knetbuilder failed to export the graph, due to: $cause" 
  		);
    }
    finally {
    	if ( exportFile != null ) exportFile.delete ();
    }
  }
  
  /**
   * Sometimes is used in {@link #exportGraph2Json(ONDEXGraph)} for debugging
   * @param graph
   */
  private static void exportOXL ( ONDEXGraph graph )
  { 
  	String outPath = null;
  	try
		{
			var outFile = File.createTempFile ( "knetminer", ".oxl" );
			outFile.deleteOnExit ();
			outPath = outFile.getAbsolutePath ();
			net.sourceforge.ondex.export.oxl.Export.exportOXL ( graph, outPath );
			log.info ( "OXL exported to {}", outPath );
		}
		catch ( IOException ex )
		{
			ExceptionUtils.throwEx ( UncheckedIOException.class, ex, 
				"Error while exporting to OXL file '%s'",
				outPath
			);
		}
  } 
}
