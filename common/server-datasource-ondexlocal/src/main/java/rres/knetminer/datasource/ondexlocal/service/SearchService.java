package rres.knetminer.datasource.ondexlocal.service;

import java.io.File;
import java.nio.file.Paths;

import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.logging.ONDEXLogger;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class SearchService
{
	// TODO: must become private when the refactoring is over
  LuceneEnv luceneMgr;
  
	@Autowired
	private DataService dataService;
  
  private final Logger log = LogManager.getLogger(getClass());

	
	private SearchService () {}

  void indexOndexGraph ()
  {
  	var graph = dataService.getGraph ();
  	var oxlGraphPath = dataService.getOxlPath ();
  	var dataPath = dataService.getDataPath (); 
  	
    try 
    {
      // index the Ondex graph
      File graphFile = new File ( oxlGraphPath );
      File indexFile = Paths.get ( dataPath, "index" ).toFile();
      if (indexFile.exists() && (indexFile.lastModified() < graphFile.lastModified())) {
          log.info("Graph file updated since index last built, deleting old index");
          FileUtils.deleteDirectory(indexFile);
      }
      log.info("Building Lucene Index: " + indexFile.getAbsolutePath());
      luceneMgr = new LuceneEnv(indexFile.getAbsolutePath(), !indexFile.exists());
      luceneMgr.addONDEXListener( new ONDEXLogger() ); // sends Ondex messages to the logger.
      luceneMgr.setONDEXGraph ( graph );
      luceneMgr.setReadOnlyMode ( true );

      log.info ( "Lucene index created");
    } 
    catch (Exception e)
    {
      log.error ( "Error while loading/creating graph index: " + e.getMessage (), e );
      ExceptionUtils.throwEx (
      	RuntimeException.class, e, "Error while loading/creating graph index: %s", e.getMessage ()
      ); 
    }
  }	
}
