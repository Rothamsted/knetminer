package rres.knetminer.datasource.ondexlocal.service;

import static java.lang.String.format;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import rres.knetminer.datasource.ondexlocal.ConfigFileHarvester;
import uk.ac.ebi.utils.collections.OptionsMap;

/**
 * A component served by {@link OndexServiceProvider} that provides the data structures
 * needed by the Knetminer application. This includes the {@link #getOptions() configuration options},
 * 
 * the Ondex graph and the gene/semantic motif associations.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>16 Sep 2020</dd></dl>
 *
 */
@Component
public class OndexDataService
{
  private OptionsMap options = null;
	  
  private List<String> taxIds = null;
  
	private final Logger log = LogManager.getLogger(getClass());

	
	private OndexDataService ()
	{
	}

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
	public void loadOptions ( String configXmlPath )
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
	
	private <T> T getRequiredOption ( String key, Function<String, T> optionSelector )
	{
		return Optional.ofNullable ( optionSelector.apply ( key ) )
			.orElseThrow ( () -> new IllegalArgumentException ( format ( "Missing '%s' config option", key )) );
	}
	


  /**
   * TODO: should this become DatasetName?
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
   */
  public boolean containsTaxId ( String taxId )
  {
  	if ( taxId == null ) return false;
  	return taxIds.contains ( taxId );
  }
  
  public boolean isExportVisibleNetwork ()
  {
    return this.options.getBoolean ( "export_visible_network", false );
  }
  
  public int getDatasetVersion ()
  {
  	return getRequiredOption ( "version", options::getInt );
  }  
}
