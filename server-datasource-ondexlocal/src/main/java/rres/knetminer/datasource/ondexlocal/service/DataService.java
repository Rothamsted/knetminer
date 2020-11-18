package rres.knetminer.datasource.ondexlocal.service;

import static java.lang.String.format;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import net.sourceforge.ondex.parser.oxl.Parser;
import rres.knetminer.datasource.ondexlocal.ConfigFileHarvester;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.KGUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

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
  private OptionsMap options = null;
  private List<String> taxIds = null;

  private ONDEXGraph graph;
  
  /**
   * TODO: was numGenesInGenome 
   */
  private int genomeGenesCount = -1;

    
	private final Logger log = LogManager.getLogger ( getClass() );

	
	private DataService () {}

	/**
	 * 
	 * Loads config properties from a Knetminer config file.
	 * 
	 * This is usually {@code <dataset>/config/data-source.xml} and the web API gets its path from
	 * {@link ConfigFileHarvester}. 
	 * 
	 * @param configXmlPath it's a path to a local file system URL, if it starts with "file://".
	 * If it hasn't such a prefix, the string is passed to 
	 * {@code Thread.currentThread().getContextClassLoader().getResource()}, ie, the config file is 
	 * looked up in the classpath.
	 * 
	 */
	void loadOptions ( String configXmlPath )
	{
		try 
		{
			URL configUrl = configXmlPath.startsWith ( "file://" )
				? new URL ( configXmlPath )
				: Thread.currentThread().getContextClassLoader().getResource ( configXmlPath );
			
			Properties props = new Properties ();
			props.loadFromXML ( configUrl.openStream() );
			this.options = OptionsMap.from ( props );
			this.updateFromOptions ();
		}
		catch (IOException e) {
			throw new UncheckedIOException ( "Error while loading config file <" + configXmlPath + ">", e);
		}		
	}
	
	/**
	 * Update some of the class fields from {@link #getOptions()}.
	 */
	private void updateFromOptions ()
	{
		log.info ( 
			"Ondex Configuration loaded, values are:\n{}", 
			options.entrySet ()
			.stream ()
			.map ( e -> 
				"  " + e.getKey () + ": " 
				+ Optional.ofNullable ( e.getValue () )
					.map ( v -> "\"" + v.toString () + "\"" )
					.orElse ( "<null>" ) 
			)
			.collect ( Collectors.joining ( "\n" ) )
		);
		
		this.taxIds = this.options.getOpt ( "SpeciesTaxId", List.of (), s -> List.of ( s.split ( "," ) ) );
	}
	
	/**
	 * An helper that is used internally to get an expected option and throw an {@link IllegalArgumentException}
	 * if that option doesn't exist. The selector should use methods from {@link #options} to fetch the option
	 * value.
	 */
	private <T> T getRequiredOption ( String key, Function<String, T> optionSelector )
	{
		return Optional.ofNullable ( optionSelector.apply ( key ) )
			.orElseThrow ( () -> new IllegalArgumentException ( format ( "Missing '%s' config option", key )) );
	}


	
  /**
   * Performs several data inititalisation operations, including, OXL loading, Lucene indexing, semantic motif search
   * and storage of its results.
   * 
   */
  void initGraph ()
	{
  	String oxlPath = getOxlPath ();
  			
		log.info ( "Loading graph from " + oxlPath );

		this.graph = new MemoryONDEXGraph ( "OndexKB" );

		loadGraph ( oxlPath );
    UIUtils.removeOldGraphAttributes ( graph );
		
		// determine number of genes in given species (taxid)
		ConceptClass ccGene = ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
		Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass ( ccGene );

		genomeGenesCount = (int) seed.stream ()
		.map ( gene -> new GeneHelper ( graph, gene ) )
		.map ( GeneHelper::getTaxID )
		.filter ( this::containsTaxId )
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
      log.debug ( "Start Loading OndexKB Graph..." + oxlFilePath );
      Parser.loadOXL(oxlFilePath, graph);
      log.debug("OndexKB Graph Loaded Into Memory");
    } 
    catch (Exception e) 
    {
      log.error("Failed to load graph", e);
      ExceptionUtils.throwEx (
      	RuntimeException.class, e, "Error while loading Knetminer graph: %s", e.getMessage ()
      ); 
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
	 * This returns a read-only map. Options here can only be loaded and then changed via class
	 * setters. 
	 * 
	 */
	public OptionsMap getOptions ()
	{
		return OptionsMap.unmodifiableOptionsMap ( this.options );
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
	public int getLociGeneCount ( String chr, int start, int end )
	{
		// TODO: should we fail with chr == "" too? Right now "" is considered == "" 
		if ( chr == null ) return 0; 
		
		ConceptClass ccGene =	ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
		Set<ONDEXConcept> genes = this.graph.getConceptsOfConceptClass ( ccGene );
		
		return (int) genes.stream()
		.map ( gene -> new GeneHelper ( graph, gene ) )
		.filter ( geneHelper -> chr.equals ( geneHelper.getChromosome () ) )
		.filter ( geneHelper -> this.containsTaxId ( geneHelper.getTaxID () ) )
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

	/**
   * Should this become DatasetName?
   */
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

  /**
   * USE THIS to test if a possibly null taxId is contained by the configured taxonomy IDs
   * If you use {@link #getTaxIds()} directly and taxId is null, YOU'LL GET A NullPointerException
   * 
   * This is a wrapper of {@link KGUtils#containsTaxId(String, String)}.
   */
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
}
