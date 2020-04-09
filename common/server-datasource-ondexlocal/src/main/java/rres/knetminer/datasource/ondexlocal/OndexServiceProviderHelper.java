package rres.knetminer.datasource.ondexlocal;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;

/**
 * This is a TODO:temporary class of utilities, written separately from the {@link OndexServiceProvider}
 * beast, in the attempt to avoid that that class becomes even bigger and more awful. This class is to be
 * removed when we (eventually) will do a big refactory of the OSP. 
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>9 Apr 2020</dd></dl>
 *
 */
public class OndexServiceProviderHelper
{
	public static final String OPT_SEED_GENES_FILE = "seedGenesFile";

	// Only static functions please
	private OndexServiceProviderHelper () {}
	
  private final static Logger log = LogManager.getLogger();

	
	/**
	 * This set of methods get the genes to seed the {@link AbstractGraphTraverser semantic motif traverser}.
	 * 
	 * If the {@link #OPT_SEED_GENES_FILE} is set in opts, gets such list from
	 * {@link AbstractGraphTraverser#ids2Genes(ONDEXGraph, java.io.File) the corresponding file}, else
	 * it gets all the genes in graph that have their TAXID attribute within the taxIds list, as per 
	 * {@link #getSeedGenesFromTaxIds(ONDEXGraph, List)}.
	 * 
	 */
	public static Set<ONDEXConcept> getSeedGenes ( ONDEXGraph graph, List<String> taxIds, Map<String, Object> opts )
	{
		String seedGenesPath = StringUtils.trimToNull ( (String) opts.get ( OPT_SEED_GENES_FILE ) );
		if ( seedGenesPath == null ) {
			log.info ( "Initialising seed genes from TAXID list" );
			return getSeedGenesFromTaxIds ( graph, taxIds );
		}
		
		log.info ( "Initialising seed genes from file: '{}' ", seedGenesPath );
		return AbstractGraphTraverser.ids2Genes ( graph, seedGenesPath );
	}

	private static Set<ONDEXConcept> getSeedGenesFromTaxIds ( ONDEXGraph graph, List<String> taxIds )
	{
		Set<String> myTaxIds = new HashSet<> ( taxIds );
		ONDEXGraphMetaData meta = graph.getMetaData ();
		ConceptClass ccGene = meta.getConceptClass ( "Gene" );
		AttributeName attTaxId = meta.getAttributeName ( "TAXID" );

		Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );
		return genes.parallelStream ().filter ( gene -> gene.getAttribute ( attTaxId ) != null )
			.filter ( gene -> myTaxIds.contains ( gene.getAttribute ( attTaxId ).getValue ().toString () ) )
			.collect ( Collectors.toSet () );
	}	
}
