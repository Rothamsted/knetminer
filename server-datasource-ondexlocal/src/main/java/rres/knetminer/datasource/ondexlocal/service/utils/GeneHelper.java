package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.lang3.ObjectUtils;

import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import uk.ac.ebi.utils.regex.RegEx;

/**
 * The Gene helper for an Ondex graph.
 * 
 * An helper for {@link ONDEXConcept} representing genes, which computes several gene-related information that are 
 * useful for the Knetminer API and interfaces, eg, chromosome, label, genome coordinates.
 *  
 * This code has been inferred from the many copy-pasted variants found in 
 * {@link OndexServiceProvider}, see https://github.com/Rothamsted/knetminer/issues/518.
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>20 Aug 2020</dd></dl>
 *
 */
public class GeneHelper
{
	private ONDEXGraph graph;
	private ONDEXConcept gene;
	
	private String chromosome;
	private Integer beginBP;
	private Integer endBP;
	private String taxID;
	
	
	public GeneHelper ( ONDEXGraph graph, ONDEXConcept gene )
	{
		this.graph = graph;
		this.gene = gene;
		
		init ();
	}

	private void init ()
	{
		this.chromosome = getAttrValueAsString ( graph, gene, "Chromosome", false );
		this.beginBP = Optional.ofNullable ( (Integer) getAttrValue ( graph, gene, "BEGIN", false ) )
			.orElse ( 0 );
		this.endBP = Optional.ofNullable ( (Integer) getAttrValue ( graph, gene, "END", false ) )
			.orElse ( 0 );
		this.taxID = getAttrValueAsString ( graph, gene, "TAXID", false );		
	}

	
	/**
	 * no default value
	 */
	public Integer getBeginBP ()
	{
		return getBeginBP ( false );
	}
	
	/**
	 * The gene's attribute 'BEGIN'. if the flag is false, possibly returns null, else returns 0 as default for nulls.
	 */
	public Integer getBeginBP ( boolean withDefault )
	{
		return defaultedGetter ( beginBP, 0, withDefault );
	}
	

	/**
	 * No default value
	 */
	public Integer getEndBP ()
	{
		return endBP;
	}

	/**
	 * The gene's attribute 'END'. if the flag is false, possibly returns null, else returns 0 as default for nulls.
	 */
	public Integer getEndBP ( boolean withDefault )
	{
		return defaultedGetter ( endBP, 0, withDefault );
	}
	
	public String getTaxID ()
	{
		return taxID;
	}

	public String getChromosome ()
	{
		return chromosome;
	}


	/**
	 * Gets the best accession string for the gene. This considers special sources like 
	 * TAIR, ENSEMBL, PHYTOZOME.
	 * 
	 * This is specific of genes and the gene view, a more generic facility is 
	 * {@link KGUtils#getShortestNotAmbiguousAccession(Set)}.
	 * 
	 */
	public String getBestAccession ()
	{
		Set<ConceptAccession> geneAccs = gene.getConceptAccessions ();
		
		if ( geneAccs.size () == 0 ) return "";
		
		return geneAccs
		.parallelStream ()
		.filter ( acc -> {
			String accStr = acc.getAccession ();
			String accSrcId = acc.getElementOf ().getId ();
			if ( "ENSEMBL-HUMAN".equals ( accSrcId ) ) return true;
			if ( "PHYTOZOME".equals ( accSrcId ) ) return true;
			if ( "TAIR".equals ( accSrcId ) && accStr.startsWith ( "AT" ) && accStr.indexOf ( "." ) == -1 ) return true;
			return false;
		})
		.map ( ConceptAccession::getAccession )
		// Makes the result predictable by preferring them in order (and hence the shortest ones)
		.sorted ( (acc1, acc2) -> 
		{
			// This is to privilege maize genes of type EB (#593)
			if ( acc1.length () == acc2.length () ) return 0;
			if ( acc1.length () > acc2.length () ) {
				if ( acc1.matches ( "^ZM.+EB[0-9].*" ) && acc2.matches ( "^ZM.+D[0-9].*" ) )
					return -1;
			}
			else if ( acc2.matches ( "^ZM.+EB[0-9].*" ) && acc1.matches ( "^ZM.+D[0-9].*" ) )
				return 1;
			
			return acc1.compareTo ( acc2 );
		})
		.findFirst ()
		.orElse ( geneAccs.iterator ().next ().getAccession () );		
	}
	
	
	private <T> T defaultedGetter ( T value, T defaultValue, boolean withDefault )
	{
		if ( !withDefault ) return value;
		return value == null ? defaultValue : value;
	}
}
