package rres.knetminer.datasource.ondexlocal.service.utils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
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
		// Unconnected filter
		Filter uFilter = new Filter ();
		ONDEXPluginArguments uFA = new ONDEXPluginArguments ( uFilter.getArgumentDefinitions () );
		uFA.addOption ( ArgumentNames.REMOVE_TAG_ARG, true );

    List<String> ccRestrictionList = Arrays.asList (
    	"Publication", "Phenotype", "Protein",
      "Drug", "Chromosome", "Path", "Comp", "Reaction", "Enzyme", "ProtDomain", "SNP",
      "Disease", "BioProc", "Trait"
    );
    
    ccRestrictionList.stream().forEach ( cc -> 
    {
      try {
				uFA.addOption ( ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG, cc );
      } 
      catch (InvalidPluginArgumentException ex) {
      	// TODO: End user doesn't get this!
      	log.error ( "Failed to restrict concept class " + cc + ": " + ex, ex );
      }
    });
    log.info ( "Filtering concept classes " + ccRestrictionList );

		uFilter.setArguments ( uFA );
		uFilter.setONDEXGraph ( graph );
		uFilter.start ();

		ONDEXGraph graph2 = new MemoryONDEXGraph ( "FilteredGraphUnconnected" );
		uFilter.copyResultsToNewGraph ( graph2 );

		// Export the graph as JSON too, using the Ondex JSON Exporter plugin.
		Export jsonExport = new Export ();
		File exportFile = null;
    try 
    {
			exportFile = File.createTempFile ( "knetminer", "graph" );
			exportFile.deleteOnExit (); // Just in case we don't get round to deleting it ourselves
			String exportPath = exportFile.getAbsolutePath ();

			ONDEXPluginArguments epa = new ONDEXPluginArguments ( jsonExport.getArgumentDefinitions () );
			epa.setOption ( FileArgumentDefinition.EXPORT_FILE, exportPath );

			log.debug ( "JSON Export file: " + epa.getOptions ().get ( FileArgumentDefinition.EXPORT_FILE ) );

			jsonExport.setArguments ( epa );
			jsonExport.setONDEXGraph ( graph2 );
      log.debug ( 
      	"Export JSON data: Total concepts = {} , Relations= {}", 
      	graph2.getConcepts().size(), 
      	graph2.getRelations().size()
      );
      // Export the contents of the 'graph' object as multiple JSON
      // objects to an output file.
      jsonExport.start ();
      
      log.debug ( "Network JSON file created:" + exportPath );
      
      // TODO: The JSON exporter uses this too, both should become UTF-8
      return Pair.of ( IOUtils.readFile ( exportPath, Charset.defaultCharset() ), graph2 );
    } 
    catch ( IOException ex )
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
