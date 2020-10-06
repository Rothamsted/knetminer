package rres.knetminer.datasource.ondexlocal.service;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttributeName;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.core.Attribute;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import rres.knetminer.datasource.ondexlocal.ConfigFileHarvester;
import rres.knetminer.datasource.ondexlocal.Hits;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import rres.knetminer.datasource.ondexlocal.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.FisherExact;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.QTL;
import rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.io.IOUtils;


/**
 * 
 * The Ondex-based service provider for Knetminer.
 * 
 * This class is rather central in the current Knetminer architecture. It realises most of the data-related functions
 * that are needed to serve the Knetminer web application, such as loading an Ondex file, indexing it, performing
 * Lucene-based searches rendering and exporting results.
 * 
 * <b>=====> WARNING <======</b>: this used to be an horrible mess of over 3k lines, DO NOT let it to happen again!
 * As you can see below, the class is mostly a wrapper of different sub-services, where functionality is split according
 * to types of functions. The wiring between all the components is done via Spring, with a 
 * {@link #springContext specific Spring context}, which is initialised here.  
 *
 * TODO: refactoring, continue with UI-related stuff.
 * 
 * @author Marco Brandizi (refactored heavily in 2020)
 * @author taubertj, pakk, singha
 */
@Component
public class OndexServiceProvider 
{
	@Autowired
	private DataService dataService;

	@Autowired
	private SearchService searchService;
	
	@Autowired
	private SemanticMotifService semanticMotifService;
	
	@Autowired
	private ExportService exportService;
	
	
	private static AbstractApplicationContext springContext;
	
	private final Logger log = LogManager.getLogger ( getClass() );
	
	/**
	 * It's a singleton, use {@link #getInstance()}.
	 */
  private OndexServiceProvider () {}
  
	
	public DataService getDataService () {
		return dataService;
	}
	
	public SearchService getSearchService ()
	{
		return searchService;
	}

	public SemanticMotifService getSemanticMotifService ()
	{
		return semanticMotifService;
	}

	public ExportService getExportService ()
	{
		return exportService;
	}


	public static OndexServiceProvider getInstance () 
	{
		initSpring ();
		return springContext.getBean ( OndexServiceProvider.class );
	}
  
  private static void initSpring ()
	{
		// Double-check lazy init (https://www.geeksforgeeks.org/java-singleton-design-pattern-practices-examples/)
		if ( springContext != null ) return;
		
		synchronized ( OndexServiceProvider.class )
		{
			if ( springContext != null ) return;
			
			springContext = new AnnotationConfigApplicationContext ( "rres.knetminer.datasource.ondexlocal.service" );
			springContext.registerShutdownHook ();
			
			getInstance ().log.info ( "Spring context for {} initialised", OndexServiceProvider.class.getSimpleName () );
		}		
	}	

  /**
   * Coordinates the initialisation of several sub-services.
   * 
   * This is called before anything can be used. The config file comes from 
   * initialisation mechanisms like {@link ConfigFileHarvester}, see {@link OndexLocalDataSource#init()}.
   * 
   * @param configXmlPath
   */
	public void initGraph ( String configXmlPath )
	{
		this.dataService.loadOptions ( configXmlPath );
		dataService.initGraph ();
		
		this.searchService.indexOndexGraph ();
		this.semanticMotifService.initSemanticMotifData ();
		
		this.exportService.exportGraphStats ();
	}
	
	
	// -------------------------------- OLD STUFF --------------------------------------------
	
	/**
	 * Old code for OSP is temporary DOWN here, waiting to be reviewed.
	 */
	
        

    /**
     * Export the Ondex graph as a JSON file using the Ondex JSON Exporter plugin.
     *
     * @return a pair containing the JSON result and the the graph that was actually exported
     * (ie, the one computed by {@link Filter filtering isolated entities}.
     * 
     * Note that this used to return just a string and to set nodeCount and relationshipCount
     * WE MUST STOP PROGRAMMING SO BADLY, DAMN IT!!!
     * 
     */
    public Pair<String, ONDEXGraph> exportGraph2Json(ONDEXGraph og) throws InvalidPluginArgumentException
    {
      // Unconnected filter
      Filter uFilter = new Filter();
      ONDEXPluginArguments uFA = new ONDEXPluginArguments(uFilter.getArgumentDefinitions());
      uFA.addOption(ArgumentNames.REMOVE_TAG_ARG, true);

      List<String> ccRestrictionList = Arrays.asList(
      	"Publication", "Phenotype", "Protein",
        "Drug", "Chromosome", "Path", "Comp", "Reaction", "Enzyme", "ProtDomain", "SNP",
        "Disease", "BioProc", "Trait"
      );
      ccRestrictionList.stream().forEach(cc -> 
      {
        try {
        	uFA.addOption(ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG, cc);
        } 
        catch (InvalidPluginArgumentException ex) {
        	// TODO: End user doesn't get this!
        	log.error ( "Failed to restrict concept class " + cc + ": " + ex, ex );
        }
      });
      log.info ( "Filtering concept classes " + ccRestrictionList );

      uFilter.setArguments(uFA);
      uFilter.setONDEXGraph(og);
      uFilter.start();

      ONDEXGraph graph2 = new MemoryONDEXGraph ( "FilteredGraphUnconnected" );
      uFilter.copyResultsToNewGraph ( graph2 );

      // Export the graph as JSON too, using the Ondex JSON Exporter plugin.
      Export jsonExport = new Export();
      File exportFile = null;
      try 
      {
        exportFile = File.createTempFile ( "knetminer", "graph");
        exportFile.deleteOnExit(); // Just in case we don't get round to deleting it ourselves
        String exportPath = exportFile.getAbsolutePath (); 
        
        ONDEXPluginArguments epa = new ONDEXPluginArguments(jsonExport.getArgumentDefinitions());
        epa.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath);

        log.debug ( "JSON Export file: " + epa.getOptions().get(FileArgumentDefinition.EXPORT_FILE) );

        jsonExport.setArguments(epa);
        jsonExport.setONDEXGraph(graph2);
        log.debug ( 
        	"Export JSON data: Total concepts= " + graph2.getConcepts().size() + " , Relations= "
        	+ graph2.getRelations().size()
        );
        // Export the contents of the 'graph' object as multiple JSON
        // objects to an output file.
        jsonExport.start();
        
        log.debug ( "Network JSON file created:" + exportPath );
        
        // TODO: The JSON exporter uses this too, both should become UTF-8
        return Pair.of ( IOUtils.readFile ( exportPath, Charset.defaultCharset() ), graph2 );
      } 
      catch (IOException ex)
      {
      	// TODO: client side doesn't know anything about this, likely wrong
        log.error ( "Failed to export graph", ex );
        return Pair.of ( "", graph2 );
      }
      finally {
      	if ( exportFile != null ) exportFile.delete ();
      }
    }


		
    /**
     * Searches for genes within genomic regions (QTLs), using the special format in the parameter.
     *
     */
		public Set<ONDEXConcept> fetchQTLs ( List<String> qtlsStr )
		{
			log.info ( "searching QTL against: {}", qtlsStr );
			Set<ONDEXConcept> concepts = new HashSet<> ();

			// convert List<String> qtlStr to List<QTL> qtls
			List<QTL> qtls = QTL.fromStringList ( qtlsStr );

			for ( QTL qtl : qtls )
			{
				try
				{
					String chrQTL = qtl.getChromosome ();
					int startQTL = qtl.getStart ();
					int endQTL = qtl.getEnd ();
					log.info ( "user QTL (chr, start, end): " + chrQTL + " , " + startQTL + " , " + endQTL );
					// swap start with stop if start larger than stop
					if ( startQTL > endQTL )
					{
						int tmp = startQTL;
						startQTL = endQTL;
						endQTL = tmp;
					}

					var graph = dataService.getGraph ();
					var gmeta = graph.getMetaData ();
					ConceptClass ccGene = gmeta.getConceptClass ( "Gene" );

					Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );

					log.info ( "searchQTL, found {} matching gene(s)", genes.size () );

					for ( ONDEXConcept gene : genes )
					{
						GeneHelper geneHelper = new GeneHelper ( graph, gene );

						String geneChr = geneHelper.getChromosome ();
						if ( geneChr == null ) continue;
						if ( !chrQTL.equals ( geneChr )) continue;

						int geneStart = geneHelper.getBeginBP ( true );
						if ( geneStart == 0 ) continue;

						int geneEnd = geneHelper.getEndBP ( true );
						if ( geneEnd == 0 ) continue;

						if ( ! ( geneStart >= startQTL && geneEnd <= endQTL ) ) continue;
						
						if ( !this.dataService.containsTaxId ( geneHelper.getTaxID () ) ) continue;

						concepts.add ( gene );
					}
				}
				catch ( Exception e )
				{
					// TODO: the user doesn't get any of this!
					log.error ( "Not valid qtl: " + e.getMessage (), e );
				}
			}
			return concepts;
		}

		
    /**
     * Searches the knowledge base for QTL concepts that match any of the user
     * input terms.
     * 
     */
    private Set<QTL> getQTLHelpers ( String keyword ) throws ParseException
    {
    	var graph = dataService.getGraph ();
  		var gmeta = graph.getMetaData();
      ConceptClass ccTrait = gmeta.getConceptClass("Trait");
      ConceptClass ccQTL = gmeta.getConceptClass("QTL");
      ConceptClass ccSNP = gmeta.getConceptClass("SNP");

      // no Trait-QTL relations found
      if (ccTrait == null && (ccQTL == null || ccSNP == null)) return new HashSet<>();

      // no keyword provided
      if ( keyword == null || keyword.equals ( "" ) ) return new HashSet<>();

      log.debug ( "Looking for QTLs..." );
      
      // If there is not traits but there is QTLs then we return all the QTLs
      if (ccTrait == null) return getAllQTLHelpers ();
      return searchService.searchQTLForTrait ( keyword );
    }

    
    private Set<QTL> getAllQTLHelpers ()
    {
      log.info ( "No Traits found: all QTLS will be shown..." );

      Set<QTL> results = new HashSet<> ();
      
      var graph = dataService.getGraph ();
      var gmeta = graph.getMetaData ();
      ConceptClass ccQTL = gmeta.getConceptClass ( "QTL" );
      
      // results = graph.getConceptsOfConceptClass(ccQTL);
      for (ONDEXConcept qtl : graph.getConceptsOfConceptClass(ccQTL))
      {
        String type = qtl.getOfType().getId();
        String chrName = getAttrValue ( graph, qtl, "Chromosome" );
        int start = (Integer) getAttrValue ( graph, qtl, "BEGIN" );
        int end = (Integer) getAttrValue ( graph, qtl, "END" );
        
        String trait = Optional.ofNullable ( getAttrValueAsString ( graph, qtl, "Trait", false ) )
        	.orElse ( "" );
        
        String taxId = Optional.ofNullable ( getAttrValueAsString ( graph, qtl, "TAXID", false ) )
        	.orElse ( "" );
        
        String label = qtl.getConceptName().getName();
        
        results.add ( new QTL ( chrName, type, start, end, label, "", 1.0f, trait, taxId ) );
      }
      return results;    	
    }

    


    


		





		
		
    
		/**
		 * Creates a mapping between keywords and random HTML colour codes, used by the search highlighting functions.
		 * if colors is null, uses {@link #createHighlightColors(int)}.
		 * If colours are not enough for the set of parameter keywords, they're reused cyclically.
		 */
		private Map<String, String> createHilightColorMap ( Set<String> keywords, List<String> colors )
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
		 * TODO: package visibility until refactoring is completed
		 */
		Map<String, String> createHilightColorMap ( Set<String> keywords )
		{
			return createHilightColorMap ( keywords, null );
		}

		/**
		 * Can be used with {@link #createHilightColorMap(Set, List)}. Indeed, this is 
		 * what it's used when no color list is sent to it. It genereates a list of the size
		 * sent and made of random different colors with visibility characteristics.
		 * 
		 */
		private List<String> createHighlightColors ( int size )
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
    private boolean highlightSearchStringFragment ( Pattern pattern, String target, String highlighter, Consumer<String> consumer )
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
    private boolean highlightSearchKeyword ( ONDEXConcept concept, String keyword, String highlighter )
    {
			boolean found = false;

			String keywordRe = '(' + keyword + ')';
			// TODO: the end user is supposed to be writing Lucene expressions, 
			// so we fix them this way. But using Lucene for highlighting should be simpler.
			keywordRe = keywordRe.replaceAll ( "\\*", "\\S*" )
				.replaceAll ( "\\?", "\\S?" );
			
			Pattern kwpattern = Pattern.compile ( keywordRe, Pattern.CASE_INSENSITIVE );

			found |= this.highlightSearchStringFragment ( kwpattern, concept.getAnnotation (), highlighter, concept::setAnnotation );
			found |= this.highlightSearchStringFragment ( kwpattern, concept.getDescription (), highlighter, concept::setDescription );
			
			// old name -> is preferred, new name
			HashMap<String, Pair<Boolean, String>> namesToCreate = new HashMap<> ();
			for ( ConceptName cname : concept.getConceptNames () )
			{
				String cnameStr = cname.getName ();
				// TODO: initially cnameStr.contains ( "</span>" ) was skipped too, probably to be removed
				if ( cnameStr == null ) continue;
					
				found |= this.highlightSearchStringFragment ( 
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
				found |= this.highlightSearchStringFragment ( kwpattern, value, highlighter, attribute::setValue );
			}
			
			return found;
    }
    
    
    /**
     * Searches different fields of a concept for a query or pattern and
     * highlights them.
     * 
     * TODO: this is ugly, Lucene should already have methods to do the same.
     * TODO: change visibility after refactoring
     *
     * @return true if one of the concept fields contains the query
     */
		boolean highlightSearchKeywords ( ONDEXConcept concept, Map<String, String> keywordColourMap )
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

		
    /**
     * Write Genomaps XML file (to a string).
     * 
     * TODO: how is it that a URI has to be used to invoke functions that sit around here, in the same .WAR?!
     * This is bad design, we want a functional layer that could be invoked independently on the higher HTTP 
     * layers, possibly open a ticket to clean this in the medium/long term.
     * 
     * @param apiUrl ws url for API
     * @param genes list of genes to be displayed (all genes for search result)
     * @param userGenes gene list from user
     * @param userQtlStr user QTLs
     * @param keyword user-specified keyword
     * @param maxGenes
     * @param hits search Hits
     * @param listMode
     * @return
     */
		public String writeAnnotationXML ( String apiUrl, List<ONDEXConcept> genes, Set<ONDEXConcept> userGenes,
			List<String> userQtlStr, String keyword, int maxGenes, Hits hits, String listMode,
			Map<ONDEXConcept, Double> scoredCandidates )
		{
			log.info ( "Genomaps: generating XML..." );

			List<QTL> userQtl = QTL.fromStringList ( userQtlStr );  

			// TODO: can we remove this?
			// If user provided a gene list, use that instead of the all Genes (04/07/2018, singha)
			/*
			 * if(userGenes != null) { // use this (Set<ONDEXConcept> userGenes) in place of the genes
			 * ArrayList<ONDEXConcept> genes. genes= new ArrayList<ONDEXConcept> (userGenes);
			 * log.info("Genomaps: Using user-provided gene list... genes: "+ genes.size()); }
			 */
			// added user gene list restriction above (04/07/2018, singha)

      var graph = dataService.getGraph ();
			ONDEXGraphMetaData gmeta = graph.getMetaData ();

			ConceptClass ccQTL = gmeta.getConceptClass ( "QTL" );
			
			Set<QTL> qtlDB = new HashSet<> ();
			if ( ccQTL != null && ! ( keyword == null || "".equals ( keyword ) ) )
			{
				// qtlDB = graph.getConceptsOfConceptClass(ccQTL);
				try
				{
					qtlDB = getQTLHelpers ( keyword );
				}
				catch ( ParseException e )
				{
					// TODO: is it fine to continue without any exception!?
					log.error ( "Failed to find QTLs", e );
				}
			}

			StringBuffer sb = new StringBuffer ();
			sb.append ( "<?xml version=\"1.0\" standalone=\"yes\"?>\n" );
			sb.append ( "<genome>\n" );
			int id = 0;

			// genes are grouped in three portions based on size
			int size = Math.min ( genes.size (), maxGenes );

			log.info ( "visualize genes: " + genes.size () );
			for ( ONDEXConcept c : genes )
			{
				var geneHelper = new GeneHelper ( graph, c );
				
				// only genes that are on chromosomes (not scaffolds)
				// can be displayed in Map View
				String chr = geneHelper.getChromosome ();
				if ( chr == null || "U".equals ( chr ) )
					continue;
				
				int beg = geneHelper.getBeginBP ( true );
				int end = geneHelper.getEndBP ( true );


				String name = c.getPID ();
				// TODO: What does this mean?! Getting a random accession?! Why
				// not using the methods for the shortest name/accession?
				for ( ConceptAccession acc : c.getConceptAccessions () )
					name = acc.getAccession ();

				String label = getMolBioDefaultLabel ( c );
				String query = null;
				try
				{
					query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;list="
							+ URLEncoder.encode ( name, "UTF-8" );
				}
				catch ( UnsupportedEncodingException e )
				{
					log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
					throw ExceptionUtils.buildEx ( RuntimeException.class, e,
							"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
				}
				String uri = apiUrl + "/network?" + query; // KnetMaps (network) query
				// log.info("Genomaps: add KnetMaps (network) query: "+ uri);

				// Genes
				sb.append ( "<feature id=\"" + id + "\">\n" );
				sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
				sb.append ( "<start>" + beg + "</start>\n" );
				sb.append ( "<end>" + end + "</end>\n" );
				sb.append ( "<type>gene</type>\n" );
				
				if ( id <= size / 3 )
					sb.append ( "<color>0x00FF00</color>\n" ); // Green
				else if ( id > size / 3 && id <= 2 * size / 3 )
					sb.append ( "<color>0xFFA500</color>\n" ); // Orange
				else
					sb.append ( "<color>0xFF0000</color>\n" ); // Red
				
				sb.append ( "<label>" + label + "</label>\n" );
				sb.append ( "<link>" + uri + "</link>\n" );
				
				// Add 'score' tag as well.
				Double score = 0.0;
				if ( scoredCandidates != null && scoredCandidates.get ( c ) != null )
					score = scoredCandidates.get ( c ); // fetch score
				
				sb.append ( "<score>" + score + "</score>\n" ); // score
				sb.append ( "</feature>\n" );

				if ( id++ > maxGenes )
					break;
			}

			log.info ( "Display user QTLs... QTLs provided: " + userQtl.size () );
			for ( QTL region : userQtl )
			{
				String chr = region.getChromosome ();
				int start = region.getStart ();
				int end = region.getEnd ();
				
				String label = Optional.ofNullable ( region.getLabel () )
					.filter ( lbl -> !lbl.isEmpty () )
					.orElse ( "QTL" );

				String query = null;
				try
				{
					query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;qtl=" + URLEncoder.encode ( chr, "UTF-8" )
							+ ":" + start + ":" + end;
				}
				catch ( UnsupportedEncodingException e )
				{
					log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
					throw ExceptionUtils.buildEx ( RuntimeException.class, e,
							"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
				}
				String uri = apiUrl + "/network?" + query;

				sb.append ( "<feature>\n" );
				sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
				sb.append ( "<start>" + start + "</start>\n" );
				sb.append ( "<end>" + end + "</end>\n" );
				sb.append ( "<type>qtl</type>\n" );
				sb.append ( "<color>0xFF0000</color>\n" ); // Orange
				sb.append ( "<label>" + label + "</label>\n" );
				sb.append ( "<link>" + uri + "</link>\n" );
				sb.append ( "</feature>\n" );
			}

			// TODO: createHilightColorMap() generates colours randomly by default, why doing the same differently, here?!
			// TODO: possibly, move this to a constant

			List<String> colorHex = List.of ( "0xFFB300", "0x803E75", "0xFF6800", "0xA6BDD7", "0xC10020", "0xCEA262", "0x817066",
					"0x0000FF", "0x00FF00", "0x00FFFF", "0xFF0000", "0xFF00FF", "0xFFFF00", "0xDBDB00", "0x00A854", "0xC20061",
					"0xFF7E3D", "0x008F8F", "0xFF00AA", "0xFFFFAA", "0xD4A8FF", "0xA8D4FF", "0xFFAAAA", "0xAA0000", "0xAA00FF",
					"0xAA00AA", "0xAAFF00", "0xAAFFFF", "0xAAFFAA", "0xAAAA00", "0xAAAAFF", "0xAAAAAA", "0x000055", "0x00FF55",
					"0x00AA55", "0x005500", "0x0055FF" );
			// 0xFFB300, # Vivid Yellow
			// 0x803E75, # Strong Purple
			// 0xFF6800, # Vivid Orange
			// 0xA6BDD7, # Very Light Blue
			// 0xC10020, # Vivid Red
			// 0xCEA262, # Grayish Yellow
			// 0x817066, # Medium Gray
			
			Set<String> traits = qtlDB.stream ()
			.map ( QTL::getTrait )
			.collect ( Collectors.toSet () );
			
			Map<String, String> trait2color = createHilightColorMap ( traits, colorHex );

			final var taxIds = this.dataService.getTaxIds ();
			log.info ( "Display QTLs and SNPs... QTLs found: " + qtlDB.size () );
			log.info ( "TaxID(s): {}", taxIds );
			
			for ( QTL loci : qtlDB )
			{
				String type = loci.getType ().trim ();
				String chrQTL = loci.getChromosome ();
				Integer startQTL = loci.getStart ();
				Integer endQTL = loci.getEnd ();
				String label = loci.getLabel ().replaceAll ( "\"", "" );
				String trait = loci.getTrait ();

				Float pvalue = loci.getpValue ();
				String color = trait2color.get ( trait );

				// TODO get p-value of SNP-Trait relations
				if ( type.equals ( "QTL" ) )
				{
					sb.append ( "<feature>\n" );
					sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
					sb.append ( "<start>" + startQTL + "</start>\n" );
					sb.append ( "<end>" + endQTL + "</end>\n" );
					sb.append ( "<type>qtl</type>\n" );
					sb.append ( "<color>" + color + "</color>\n" );
					sb.append ( "<trait>" + trait + "</trait>\n" );
					sb.append ( "<link>http://archive.gramene.org/db/qtl/qtl_display?qtl_accession_id=" + label + "</link>\n" );
					sb.append ( "<label>" + label + "</label>\n" );
					sb.append ( "</feature>\n" );
					// log.info("add QTL: trait, label: "+ trait +", "+ label);
				} 
				else if ( type.equals ( "SNP" ) )
				{
					/* add check if species TaxID (list from client/utils-config.js) contains this SNP's TaxID. */
					if ( this.dataService.containsTaxId ( loci.getTaxID () ) )
					{
						sb.append ( "<feature>\n" );
						sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
						sb.append ( "<start>" + startQTL + "</start>\n" );
						sb.append ( "<end>" + endQTL + "</end>\n" );
						sb.append ( "<type>snp</type>\n" );
						sb.append ( "<color>" + color + "</color>\n" );
						sb.append ( "<trait>" + trait + "</trait>\n" );
						sb.append ( "<pvalue>" + pvalue + "</pvalue>\n" );
						sb.append (
								"<link>http://plants.ensembl.org/arabidopsis_thaliana/Variation/Summary?v=" + label + "</link>\n" );
						sb.append ( "<label>" + label + "</label>\n" );
						sb.append ( "</feature>\n" );
					}
				}

			} // for loci

			sb.append ( "</genome>\n" );
			return sb.toString ();
		} // writeAnnotationXML()

		
		
    /**
     * This table contains all possible candidate genes for given query
     * TODO: too big! Split into separated functions.
     *
     */
		public String writeGeneTable ( 
			List<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes, List<String> qtlsStr, 
			String listMode,  SemanticMotifsSearchResult searchResult 
		)
		{
			log.info ( "generate Gene table..." );
			
			List<QTL> qtls =  QTL.fromStringList ( qtlsStr );
			Set<Integer> userGeneIds = new HashSet<> ();
      var graph = dataService.getGraph ();
			var genes2QTLs = semanticMotifService.getGenes2QTLs ();
			var options = dataService.getOptions ();

			if ( userGenes != null )
			{
				userGeneIds = userGenes.stream ()
					.map ( ONDEXConcept::getId )
					.collect ( Collectors.toSet () );
			} 
			else
				log.info ( "No user gene list defined." );

			if ( qtls.isEmpty () ) log.info ( "No QTL regions defined." );
			
			var mapGene2HitConcept = searchResult.getGeneId2RelatedConceptIds ();
			
			// TODO: but could it be null?!
			var scoredCandidates = Optional.ofNullable ( searchResult.getRelatedConcept2Score () )
				.orElse ( Collections.emptyMap () );			
			
			// Removed ccSNP from Geneview table (12/09/2017)
			// AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
			// ConceptClass ccSNP = md.getConceptClass("SNP");

			StringBuffer out = new StringBuffer ();
			// out.append("ONDEX-ID\tACCESSION\tGENE
			// NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\tEVIDENCES_LINKED\tEVIDENCES_IDs\n");
			out.append ( "ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n" );
			for ( ONDEXConcept gene : candidates )
			{
				int id = gene.getId ();

				var geneHelper = new GeneHelper ( graph, gene );
				Double score = scoredCandidates.getOrDefault ( gene, 0d );

				// use shortest preferred concept name
				String geneName = getShortestPreferedName ( gene.getConceptNames () );

				boolean isInList = userGenes != null && userGeneIds.contains ( gene.getId () );
 
				List<String> infoQTL = new LinkedList<> ();
				for ( Integer cid : genes2QTLs.getOrDefault ( gene.getId (), Collections.emptySet () ) )
				{
					ONDEXConcept qtl = graph.getConcept ( cid );

					/*
					 * TODO: a TEMPORARY fix for a bug wr're seeing, we MUST apply a similar massage to ALL cases like this,
					 * and hence we MUST move this code to some utility.
					 */
					if ( qtl == null )
					{
						log.error ( "writeTable(): no gene found for id: ", cid );
						continue;
					}
					String acc = Optional.ofNullable ( qtl.getConceptName () )
						.map ( ConceptName::getName )
						.map ( StringEscapeUtils::escapeCsv )
						.orElseGet ( () -> {
							log.error ( "writeTable(): gene name not found for id: {}", cid );
							return "";
						});

					String traitDesc = Optional.of ( getAttrValueAsString ( graph, gene, "Trait", false ) )
						.orElse ( acc );

					// TODO: traitDesc twice?! Looks wrong.
					infoQTL.add ( traitDesc + "//" + traitDesc ); 
				} // for genes2QTLs


				qtls.stream ()
				.filter ( loci -> !loci.getChromosome ().isEmpty () )
				.filter ( loci -> geneHelper.getBeginBP ( true ) >= loci.getStart () )
				.filter ( loci -> geneHelper.getEndBP ( true ) <= loci.getEnd () )
				.map ( loci -> loci.getLabel () + "//" + loci.getTrait () )
				.forEach ( infoQTL::add );

				String infoQTLStr = infoQTL.stream ().collect ( Collectors.joining ( "||" ) );
				
				// get lucene hits per gene
				Set<Integer> luceneHits = mapGene2HitConcept.getOrDefault ( id, Collections.emptySet () );

				// organise by concept class
				Map<String, String> cc2name = new HashMap<> ();

				Set<Integer> evidencesIDs = new HashSet<> ();
				for ( int hitID : luceneHits )
				{
					ONDEXConcept c = graph.getConcept ( hitID );
					evidencesIDs.add ( c.getId () ); // retain all evidences' ID's
					String ccId = c.getOfType ().getId ();

					// skip publications as handled differently (see below)
					if ( ccId.equals ( "Publication" ) ) continue;

					String name = getMolBioDefaultLabel ( c );
					cc2name.merge ( ccId, name, (thisId, oldName) -> oldName + "//" + name );
				}

				// special case for publications to sort and filter most recent publications
				Set<ONDEXConcept> allPubs = luceneHits.stream ()
					.map ( graph::getConcept )
					.filter ( c -> "Publication".equals ( c.getOfType ().getId () ) )
					.collect ( Collectors.toSet () );
				
				
				AttributeName attYear = getAttributeName ( graph, "YEAR" );
				List<Integer> newPubs = PublicationUtils.newPubsByNumber ( 
					allPubs, 
					attYear, 
					options.getInt ( SearchService.OPT_DEFAULT_NUMBER_PUBS, -1 ) 
				);

				// add most recent publications here
				if ( !newPubs.isEmpty () )
				{
					String pubString = "Publication__" + allPubs.size () + "__";
					pubString += newPubs.stream ()
						.map ( graph::getConcept )
					  .map ( this::getMolBioDefaultLabel )
					  .map ( name -> name.contains ( "PMID:" ) ? name : "PMID:" + name )
					  .collect ( Collectors.joining ( "//" ) );
					cc2name.put ( "Publication", pubString );
				}

				// create output string for evidences column in GeneView table
				String evidenceStr = cc2name.entrySet ()
				.stream ()
				.map ( e -> 
					"Publication".equals ( e.getKey () )  
						? e.getValue ()
						: e.getKey () + "__" + e.getValue ().split ( "//" ).length + "__" + e.getValue ()
				)
				.collect ( Collectors.joining ( "||" ) );
								
				if ( luceneHits.isEmpty () && listMode.equals ( "GLrestrict" ) ) continue;
				
				if ( ! ( !evidenceStr.isEmpty () || qtls.isEmpty () ) ) continue;
				
				out.append (
					id + "\t" + geneHelper.getBestAccession () + "\t" + geneName + "\t" + geneHelper.getChromosome () + "\t" 
					+ geneHelper.getBeginBP ( true ) + "\t" + geneHelper.getTaxID () + "\t" 
					+ new DecimalFormat ( "0.00" ).format ( score ) + "\t" + (isInList ? "yes" : "no" ) + "\t" + infoQTLStr + "\t" 
					+ evidenceStr + "\n" 
				);

			} // for candidates
			log.info ( "Gene table generated..." );
			return out.toString ();
		
		} // writeGeneTable()


		
    /**
     * Write Evidence Table for Evidence View file
     *
     */
		public String writeEvidenceTable ( 
			String keywords, Map<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes, List<String> qtlsStr 
		)
		{
      var graph = dataService.getGraph ();
			
			StringBuffer out = new StringBuffer ();
			out.append ( "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER GENES\tQTLS\tONDEXID\n" );
			
			if ( userGenes == null || userGenes.isEmpty () ) return out.toString ();
			
			var genes2Concepts = semanticMotifService.getGenes2Concepts ();			
			int allGenesSize = genes2Concepts.keySet ().size ();
			int userGenesSize = userGenes.size ();

			log.info ( "generate Evidence table..." );
			List<QTL> qtls = QTL.fromStringList ( qtlsStr );					

			DecimalFormat sfmt = new DecimalFormat ( "0.00" );
			DecimalFormat pfmt = new DecimalFormat ( "0.00000" );

			for ( ONDEXConcept lc : luceneConcepts.keySet () )
			{
				// Creates type,name,score and numberOfGenes
				String type = lc.getOfType ().getId ();
				String name = getMolBioDefaultLabel ( lc );
				// All publications will have the format PMID:15487445
				// if (type == "Publication" && !name.contains("PMID:"))
				// name = "PMID:" + name;
				// Do not print publications or proteins or enzymes in evidence view
				if ( Stream.of ( "Publication", "Protein", "Enzyme" ).anyMatch ( t -> t.equals ( type ) ) ) 
					continue;
				
				var concepts2Genes = semanticMotifService.getConcepts2Genes ();
				var genes2QTLs = semanticMotifService.getGenes2QTLs ();

				Float score = luceneConcepts.get ( lc );
				Integer ondexId = lc.getId ();
				if ( !concepts2Genes.containsKey ( lc.getId () ) ) continue;
				Set<Integer> listOfGenes = concepts2Genes.get ( lc.getId () );
				Integer numberOfGenes = listOfGenes.size ();
				Set<String> userGenesStrings = new HashSet<> ();
				Integer numberOfQTL = 0;

				for ( int log : listOfGenes )
				{
					ONDEXConcept gene = graph.getConcept ( log );
					var geneHelper = new GeneHelper ( graph, gene );
					
					if ( ( userGenes != null ) && ( gene != null ) && ( userGenes.contains ( gene ) ) )
					{
						// numberOfUserGenes++;
						// retain gene Accession/Name (18/07/18)
						userGenesStrings.add ( geneHelper.getBestAccession () );
						
						// This was commented at some point and it's still unclear if needed. Keeping for further verifications

						
						
						// String geneName = getShortestPreferedName(gene.getConceptNames()); geneAcc= geneName;

					}

					if ( genes2QTLs.containsKey ( log ) ) numberOfQTL++;

					String chr = geneHelper.getChromosome ();
					int beg = geneHelper.getBeginBP ( true );
										
					for ( QTL loci : qtls )
					{
						String qtlChrom = loci.getChromosome ();
						Integer qtlStart = loci.getStart ();
						Integer qtlEnd = loci.getEnd ();

						if ( qtlChrom.equals ( chr ) && beg >= qtlStart && beg <= qtlEnd ) numberOfQTL++;
					}

				} // for log

				if ( userGenesStrings.isEmpty () ) continue;
				
				double pvalue = 0.0;

				// quick adjustment to the score to make it a P-value from F-test instead
				int matchedInGeneList = userGenesStrings.size ();
				int notMatchedInGeneList = userGenesSize - matchedInGeneList;
				int matchedNotInGeneList = numberOfGenes - matchedInGeneList;
				int notMatchedNotInGeneList = allGenesSize - matchedNotInGeneList - matchedInGeneList - notMatchedInGeneList;

				FisherExact fisherExact = new FisherExact ( allGenesSize );
				pvalue = fisherExact.getP ( 
					matchedInGeneList, matchedNotInGeneList, notMatchedInGeneList, notMatchedNotInGeneList
				);
				
				var userGenesStr = userGenesStrings.stream ().collect ( Collectors.joining ( "," ) ); 
				out.append ( 
					type + "\t" + name + "\t" + sfmt.format ( score ) + "\t" + pfmt.format ( pvalue ) + "\t"
					+ numberOfGenes + "\t" + userGenesStr + "\t" + numberOfQTL + "\t" + ondexId + "\n" 
				);
			} // for luceneConcepts()
			
			return out.toString ();
		} // writeEvidenceTable()

						
    /**
     * Write Synonym Table for Query suggestor
     *
     */
		public String writeSynonymTable ( String keyword ) throws ParseException
		{
			StringBuffer out = new StringBuffer ();
			// TODO: Lucene shouldn't be used directly
			Analyzer analyzer = new StandardAnalyzer ();
      var graph = dataService.getGraph ();
			
			Set<String> synonymKeys = SearchUtils.getSearchWords ( keyword );
			for ( var synonymKey: synonymKeys )
			{
				log.info ( "Checking synonyms for \"{}\"", synonymKey );
				if ( synonymKey.contains ( " " ) && !synonymKey.startsWith ( "\"" ) ) 
					synonymKey = "\"" + synonymKey + "\"";

				Map<Integer, Float> synonyms2Scores = new HashMap<> ();

				// search concept names
				String fieldNameCN = SearchUtils.getLuceneFieldName ( "ConceptName", null );
				QueryParser parserCN = new QueryParser ( fieldNameCN, analyzer );
				Query qNames = parserCN.parse ( synonymKey );
				ScoredHits<ONDEXConcept> hitSynonyms = searchService.luceneMgr.searchTopConcepts ( qNames, 500 );

        /*
         * TODO: does this still apply?
         * 
         * number of top concepts searched for each Lucene field, increased for now from
         * 100 to 500, until Lucene code is ported from Ondex to KnetMiner, when we'll
         * make changes to the QueryParser code instead.
         */

				for ( ONDEXConcept c : hitSynonyms.getOndexHits () )
				{
					if ( c instanceof LuceneConcept ) c = ( (LuceneConcept) c ).getParent ();
					
					int cid = c.getId ();
					float cscore = hitSynonyms.getScoreOnEntity ( c );
					
					synonyms2Scores.merge ( cid, cscore, Math::max );
				}

				
				if ( synonyms2Scores.isEmpty () ) continue;

				// Only start a KEY tag if it will have contents. Otherwise skip it.
				out.append ( "<" + synonymKey + ">\n" );

				Stream<Map.Entry<Integer, Float>> sortedSynonyms = synonyms2Scores.entrySet ()
				.stream ()
				.sorted ( Collections.reverseOrder ( Map.Entry.comparingByValue () ) );

				Map<String, Integer> entryCountsByType = new HashMap<> ();
				final int MAX_SYNONYMS = 25; // we store this no of top synonyms per concept
						
				// writes the topX values in table
				sortedSynonyms.forEach ( entry -> 
				{
					int synonymId = entry.getKey ();
					float score = entry.getValue ();
					
					ONDEXConcept eoc = graph.getConcept ( synonymId );
					String type = eoc.getOfType ().getId ();

					if ( ( type.equals ( "Publication" ) || type.equals ( "Thing" ) ) ) return;
					
					// TODO: before, this count was incremented in the cNames loop below, however, that way either we
					// get the same because there's one preferred name only,
					// or the count computed that way is likely wrong, cause it increases with names
					//
					int synCount = entryCountsByType.compute ( type, 
						(thisType, thisCount) -> thisType == null ? 1 : ++thisCount
					); 

					if ( synCount > MAX_SYNONYMS ) return;

					
					Set<ConceptName> cNames = eoc.getConceptNames ();

					cNames.stream ()
					.filter ( ConceptName::isPreferred )
					.map ( ConceptName::getName )
					.forEach ( name ->
					{
						// error going around for publication
						// suggestions
						if ( name.contains ( "\n" ) ) name = name.replace ( "\n", "" );

						// error going around for qtl
						// suggestions
						if ( name.contains ( "\"" ) ) name = name.replaceAll ( "\"", "" );
						
						out.append ( name + "\t" + type + "\t" + Float.toString ( score ) + "\t" + synonymId + "\n" );
					});
				}); // forEach synonym

				out.append ( "</" + synonymKey + ">\n" );
					
			} // for synonymKeys
			return out.toString ();
		} //

		
    /**
     * Returns the shortest preferred Name from a set of concept Names or ""
     * [Gene|Protein][Phenotype][The rest]
     *
     * @param cns Set<ConceptName>
     * @return String name
     */
    private String getShortestPreferedName ( Set<ConceptName> cns ) 
    {
    	return cns.stream ()
      .filter ( ConceptName::isPreferred )
    	.map ( ConceptName::getName )
    	.map ( String::trim )
    	.sorted ( Comparator.comparing ( String::length ) )
    	.findFirst ()
    	.orElse ( "" );
    }

    /**
     * Returns the shortest not ambiguous accession or ""
     *
     * @param accs Set<ConceptAccession>
     * @return String name
     */
    private String getShortestNotAmbiguousAccession(Set<ConceptAccession> accs) 
    {
    	return accs.stream ()
      .filter ( acc -> !acc.isAmbiguous () )
    	.map ( ConceptAccession::getAccession )
    	.map ( String::trim )
    	.sorted ( Comparator.comparing ( String::length ) )
    	.findFirst ()
    	.orElse ( "" );
    }


    
    /**
     * Returns the best name for certain molecular biology entities, like Gene, Protein, falls back to a default
     * label in the other cases. 
     * 
     */
		private String getMolBioDefaultLabel ( ONDEXConcept c )
		{
			String type = c.getOfType ().getId ();
			String bestAcc = StringUtils.trimToEmpty ( getShortestNotAmbiguousAccession ( c.getConceptAccessions () ) );
			String bestName = StringUtils.trimToEmpty ( getShortestPreferedName ( c.getConceptNames () ) );

			String result = "";
			
			if ( type == "Gene" || type == "Protein" )
			{
				if ( bestAcc.isEmpty () ) result = bestName;
				else result = bestAcc.length () < bestName.length () ? bestAcc : bestName;
			}
			else
				result = !bestName.isEmpty () ? bestName : bestAcc;

			return StringUtils.abbreviate ( result, 30 );
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
		
      var graph = dataService.getGraph ();
			
			ConceptClass ccGene =	ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
			Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );
			
			return (int) genes.stream()
			.map ( gene -> new GeneHelper ( graph, gene ) )
			.filter ( geneHelper -> chr.equals ( geneHelper.getChromosome () ) )
			.filter ( geneHelper -> dataService.containsTaxId ( geneHelper.getTaxID () ) )
			.filter ( geneHelper -> geneHelper.getBeginBP ( true ) >= start )
			.filter ( geneHelper -> geneHelper.getEndBP ( true ) <= end )
			.count ();
		}
 
}
