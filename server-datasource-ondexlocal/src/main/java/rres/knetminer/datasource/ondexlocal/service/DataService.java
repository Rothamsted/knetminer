package rres.knetminer.datasource.ondexlocal.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.parser.oxl.Parser;
import rres.knetminer.datasource.api.config.KnetminerConfiguration;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.opt.net.ConfigBootstrapWebListener;
import uk.ac.rothamsted.knetminer.backend.KnetMinerInitializer;

/**
 * The data sub-service for {@link OndexServiceProvider}.
 * 
 * A component served by OndexServiceProvider that provides the data structures
 * needed by the Knetminer application. This includes the {@link #getConfiguration() configuration options},
 * and the Ondex graph.  
 * 
 * In 2023 several functions were moved from here to {@link KnetMinerInitializer}.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>16 Sep 2020</dd></dl>
 *
 */
@Component
public class DataService
{  	
  @Autowired
  private KnetMinerInitializer knetInitializer;
  
    
	private final Logger log = LogManager.getLogger ( getClass() );

	
	private DataService () {}

	/**
	 * Entry point to load the {@link #getConfiguration() Knetminer configuration} from a root
	 * YAML file.
	 * 
	 * This is usually invoked by {@link OndexLocalDataSource}.init(), which, in turn is
	 * picked up by Spring. That init() method gets configFilePath from the 
	 * property {@link OndexLocalDataSource#CONFIG_FILE_PATH_PROP}, via {@link ConfigBootstrapWebListener}.
	 * 
	 * The method is a wrapper of {@link KnetMinerInitializer#setKnetminerConfiguration(String)}, which, in turn
	 * uses {@link KnetminerConfiguration#load(String)}.
	 */
	public void loadConfiguration ( String configYmlPath )
	{
		knetInitializer.setKnetminerConfiguration ( configYmlPath );
	}

	
  /**
   * Performs several data inititalisation operations, including, OXL loading, Lucene indexing, semantic motif search
   * and storage of its results.
   * 
   */
  void initGraph ()
	{
  	String oxlPath = this.knetInitializer.getOxlFilePath ();
		log.info ( "Loading graph from " + oxlPath );

		ONDEXGraph graph = new MemoryONDEXGraph ( "OndexKB" );
		Parser.loadOXL ( oxlPath, graph );
    UIUtils.removeOldGraphAttributes ( graph );

    this.knetInitializer.setGraph ( graph );
    
		log.info ( "OXL Graph initialisation done" );
	}	
	
	
  /**
   * The Knetminer configuration, as loaded from {@link #loadConfiguration(String)}.
   */
	public KnetminerConfiguration getConfiguration ()
	{
		return knetInitializer.getKnetminerConfiguration ();
	}
	
  public ONDEXGraph getGraph () {
		return knetInitializer.getGraph ();
	}

	/**
	 * Wrapper of {@link KnetMinerInitializer#getGenomeGenesCount()}.
	 */
	public int getGenomeGenesCount ()
	{
		return knetInitializer.getGenomeGenesCount ();
	}
	
 }
