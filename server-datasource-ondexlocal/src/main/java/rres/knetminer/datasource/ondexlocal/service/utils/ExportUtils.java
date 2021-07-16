package rres.knetminer.datasource.ondexlocal.service.utils;

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

import net.sourceforge.ondex.ONDEXPlugin;
import net.sourceforge.ondex.UncheckedPluginException;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.utils.OndexPluginUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
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
	private static final Logger log = LogManager.getLogger ( ExportUtils.class );
	
	private ExportUtils () {}

	
  /**
   * Export the Ondex graph as a JSON file using the Ondex JSON Exporter plugin.
   *
   * @return a pair containing the JSON result and the the graph that was actually exported
   * (ie, the one computed by {@link Filter filtering isolated entities}. 
   * 
   * 
   */
  public static Pair<String, ONDEXGraph> exportGraph2Json ( ONDEXGraph graph )
  {
  	exportOXL ( graph );
  	
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
			
			OndexPluginUtils.runPlugin ( Export.class, graph2, Map.of ( EXPORT_FILE, exportPath ) );
      
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
  	catch ( UncheckedPluginException ex ) {
    	String msg = "Failed to export graph due to an Ondex plug-in problem: " + ex.getMessage ();
      log.error ( msg, ex );
      throw new UncheckedPluginException ( msg, ex );
  	}
    catch ( IOException ex )
    {
    	String msg = "Failed to export graph due to an I/O problem: " + ex.getMessage ();
      log.error ( msg, ex );
      throw new UncheckedIOException ( msg, ex );
    }
    catch ( RuntimeException ex )
    {
    	String msg = "Failed to export graph due to: " + ex.getMessage ();
      log.error ( msg, ex );
      throw new RuntimeException ( msg, ex );
    }
    finally {
    	if ( exportFile != null ) exportFile.delete ();
    }
  }
  
  /**
   * Sometimes is used for debugging
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
