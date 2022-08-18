package rres.knetminer.datasource.ondexlocal.service;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.throwEx;

import java.util.Set;
import java.util.function.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import net.sourceforge.ondex.parser.oxl.Parser;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import rres.knetminer.datasource.ondexlocal.config.KnetminerConfiguration;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.opt.net.ConfigBootstrapWebListener;

/**
 * The data sub-service for {@link OndexServiceProvider}.
 * 
 * A component served by OndexServiceProvider that provides the data structures
 * needed by the Knetminer application. This includes the {@link #getOptions() configuration options},
 * 
 * the Ondex graph and the gene/semantic motif associations.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>16 Sep 2020</dd></dl>
 *
 */
@Component
public class DataService
{  
	/**
	 * The Knetminer configuration coming from the instance YAML file and its included files.
	 * This is 
	 */
	private KnetminerConfiguration configuration;
	
// TODO:newConfig, remove
//  private OptionsMap options = null;
//  private List<String> taxIds = null;

  private ONDEXGraph graph;
  
  /**
   * TODO: was numGenesInGenome 
   */
  private int genomeGenesCount = -1;

    
	private final Logger log = LogManager.getLogger ( getClass() );

	
	private DataService () {}

	/**
	 * Entry point to load the {@link #getConfiguration() Knetminer configuration} from a root
	 * YAML file.
	 * 
	 * This is usually invoked by {@link OndexLocalDataSource}.init(), which, in turn is invoked
	 * picked up by Spring. That init() method gets configFilePath from the 
	 * property {@link OndexLocalDataSource#CONFIG_FILE_PATH_PROP}, via {@link ConfigBootstrapWebListener}.
	 * 
	 * The configuration can also be loaded separately, 
	 * see {@link OndexServiceProvider#initData()}.
	 * 
	 */
	public void loadConfiguration ( String configFilePath )
	{
		this.configuration = KnetminerConfiguration.load ( configFilePath );
	}

	
  /**
   * Performs several data inititalisation operations, including, OXL loading, Lucene indexing, semantic motif search
   * and storage of its results.
   * 
   */
  void initGraph ()
	{
  	String oxlPath = this.configuration.getOxlFilePath ();
  			
		log.info ( "Loading graph from " + oxlPath );

		this.graph = new MemoryONDEXGraph ( "OndexKB" );

		loadGraph ( oxlPath );
    UIUtils.removeOldGraphAttributes ( graph );
		
		// determine number of genes in given species (taxid)
		ConceptClass ccGene = ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
		Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass ( ccGene );

		var dsetInfo = this.configuration.getServerDatasetInfo ();
		
		this.genomeGenesCount = (int) seed.parallelStream ()
		.map ( gene -> new GeneHelper ( graph, gene ) )
		.map ( GeneHelper::getTaxID )
		.filter ( dsetInfo::containsTaxId )
		.count ();

		log.info ( "OXL Graph loaded from '" + oxlPath + "'" );
	}	
	
  /**
   *  Just a small helper to load an OXL and do proper error reporting
   */
  private void loadGraph ( String oxlFilePath )
  {
    try 
    {
      log.info ( "Loading OXL from {}", oxlFilePath );
      Parser.loadOXL ( oxlFilePath, graph );
      log.info ( "OXL Loaded" );
    } 
    catch (Exception e) {
      throwEx ( RuntimeException.class, e, "Error while loading Knetminer graph: $cause" ); 
    }
  }  
  
  
	/**
	 * BEWARE!!! This is AN OPTIONS MAP. It means that YOU DON'T NEED to do things like type casting 
	 * or integer conversions from strings, since the {@link OptionsMap} is already designed for that, 
	 * eg, you can use {@link OptionsMap#getDouble(String, Double)}. See its Javadoc or sources for details.
	 * 
	 * If you feel that your special method to access an option is general enough, please, contribute to
	 * OptionsMap! 
	 * 
	 * This returns a read-only map (never null). Options here can only be loaded and then changed via class
	 * setters. 
	 * 
	 * TODO:newConfig remove
	 */
//	public OptionsMap _getOptions ()
//	{
//		return this.options != null 
//			? OptionsMap.unmodifiableOptionsMap ( this.options )
//			: OptionsMap.from ( Collections.emptyMap () );
//	}
	
  /**
   * The Knetminer configuration, as loaded from {@link #loadConfiguration(String)}.
   */
	public KnetminerConfiguration getConfiguration ()
	{
		return configuration;
	}
	
	
  public ONDEXGraph getGraph () {
		return graph;
	}


  /**
   * Returns number of organism (taxID) genes at a given loci
   *
   * @param chr chromosome name as used in GViewer
   * @param start start position
   * @param end end position
   * @return 0 if no genes found, otherwise number of genes at specified loci
   */
	public int getLociGeneCount ( String chr, int start, int end, String taxId )
	{
		// TODO: should we fail with chr == "" too? Right now "" is considered == "" 
		if ( chr == null ) return 0; 
		
		ConceptClass ccGene =	ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
		Set<ONDEXConcept> genes = this.graph.getConceptsOfConceptClass ( ccGene );
		
		var taxIdNrm = StringUtils.trimToNull ( taxId );
		var dsetInfo = this.configuration.getServerDatasetInfo ();		
		
		Predicate<GeneHelper> taxIdGeneFilter = taxIdNrm == null  
		  ? geneHelper -> dsetInfo.containsTaxId ( geneHelper.getTaxID () ) // regular search over configured taxIds
		  : geneHelper -> taxIdNrm.equals ( geneHelper.getTaxID () ); // client-specified taxId
		
		return (int) genes.stream()
		.map ( gene -> new GeneHelper ( graph, gene ) )
		// Let's consider this first, they're likely to be more
		.filter ( taxIdGeneFilter )
		.filter ( geneHelper -> chr.equals ( geneHelper.getChromosome () ) )
		.filter ( geneHelper -> geneHelper.getBeginBP ( true ) >= start )
		.filter ( geneHelper -> geneHelper.getEndBP ( true ) <= end )
		.count ();
	}    
  
  
  /**
   * Was numGenesInGenome
   */
	int getGenomeGenesCount ()
	{
		return genomeGenesCount;
	}

	// TODO:newConfig remove stuff from old config
	/**
   * Should this become DatasetName?
   */
	/* 
	 * 
  public String getDataSourceName ()
  {
  	return options.getString ( "DataSourceName" );
  }
  
  public String getDatasetOrganization ()
  {
  	return options.getString ( "sourceOrganization" );
  }

  public String getDatasetProvider ()
  {
  	return options.getString ( "provider" );
  }
  
  public String getSpecies ()
  {
  	return options.getString ( "specieName" );
  }
  
  public String getKnetSpaceHost ()
  {
  	return options.getString ( "knetSpaceHost" );
  }
  
  public boolean isReferenceGenome() {
    return this.options.getBoolean ( "reference_genome", false );
  }

  public List<String> getTaxIds ()
  {
  	return this.taxIds;
  }
  */

	// TODO: remove, old config
	
  /**
   * USE THIS to test if a possibly null taxId is contained by the configured taxonomy IDs
   * If you use {@link #getTaxIds()} directly and taxId is null, YOU'LL GET A NullPointerException
   * 
   * This is a wrapper of {@link KGUtils#containsTaxId(String, String)}.
   */
  /*
  public boolean containsTaxId ( String taxId )
  {
  	return KGUtils.containsTaxId ( this.taxIds, taxId );
  }
  
  public boolean isExportVisibleNetwork ()
  {
    return this.options.getBoolean ( "export_visible_network", false );
  }
  
  public int getDatasetVersion ()
  {
  	return getRequiredOption ( "version", options::getInt );
  }
  
  public String getOxlPath ()
  {
  	return this.options.getString ( "DataFile" );
  }
  
  public String getDataPath ()
  {
  	return this.options.getString ( "DataPath" );
  }
  */
}
