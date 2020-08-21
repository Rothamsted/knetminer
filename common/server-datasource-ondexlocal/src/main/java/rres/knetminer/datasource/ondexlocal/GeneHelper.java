package rres.knetminer.datasource.ondexlocal;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.text.DecimalFormat;
import java.util.Optional;
import java.util.Set;

import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;

/**
 * An helper for {@link ONDEXConcept} representing genes, which computes several gene-related information that are 
 * useful for the Knetminer API and interfaces, eg, chromosome, label, genome coordinates.
 *  
 * TODO: For the moment, this code has been inferred from the many copy-pasted variants found in 
 * {@link OndexServiceProvider} and needs review, see https://github.com/Rothamsted/knetminer/issues/518.
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
	private Double cM;
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
		this.cM = Optional.ofNullable ( (Double) getAttrValue ( graph, gene, "cM", false ) )
			.orElse ( 0d );
		this.beginBP = Optional.ofNullable ( (Integer) getAttrValue ( graph, gene, "BEGIN", false ) )
			.orElse ( 0 );
		this.endBP = Optional.ofNullable ( (Integer) getAttrValue ( graph, gene, "END", false ) )
			.orElse ( 0 );
		this.taxID = getAttrValueAsString ( graph, gene, "TAXID", false );		
	}

	/**
	 * No default.
	 */
	public Double getcM ()
	{
		return getcM ( false );
	}

	/**
	 * The gene's attribute 'cM'. if the flag is false, possibly returns null, else returns 0 as default for nulls.
	 */
	public Double getcM ( boolean withDefault )
	{
		return defaultedGetter ( cM, 0d, withDefault );
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
		return defaultedGetter ( beginBP, 0, withDefault );
	}
	

	/**
	 * When {@link #getcM(boolean))} is available, returns this value
	 * If no cM is available, returns {@link #getBeginBP(boolean))}. In this case, if
	 * the begin BP value is non null and convertCM is true, returns the BP value multiplied by 1E6.
	 * When cM is null, usues a default value for BP (multiplied or not), if the withDefaultBP is true.
	 */
	public Double computeBegin ( boolean withDefaultBP, boolean convertCM )
	{
		Integer result = getBeginBP ( withDefaultBP );
		if ( cM == null ) 
			return result == null ? null : convertCM ? 1E6 * result : result ;
		return cM;
	}

	/**
	 * Doesn't convert to cM.
	 */
	public Double computeBegin ( boolean withDefaults )
	{
		return computeBegin ( withDefaults, false );
	}

	/**
	 * Doesn't convert to cM, no defaults
	 */
	public Double computeBegin ()
	{
		return computeBegin ( false );
	}
	
	/**
	 * Returns {@link #getEndBP(boolean))}, which might be null (affected by withDefault flag). 
	 * If that's not null and convertCM is true, returns {@link #getEndBP()} multiplied by 1E6.
	 * 
	 * TODO: Some code in {@link OndexServiceProvider} uses the same {@link #getcM()} * 1E6 for 
	 * both begin and end. Likely, that's an error and it's not  supported use case here.
	 * 
	 */
	public Double computeEnd ( boolean withDefaultBP, boolean convertCM )
	{
		Integer result = getEndBP ( withDefaultBP );
		if ( result == null ) return null;
		return result * (convertCM ? 1E6 : 1d );
	}
	
	/**
	 * Doesn't convert to cM.
	 */
	public Double computeEnd ( boolean withDefaults )
	{
		return computeEnd ( withDefaults, false );
	}

	/**
	 * Doesn't convert to cM, no defaults
	 */
	public Double computeEnd ()
	{
		return computeBegin ( false );
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
	 */
	public String getBestAccession ()
	{
		Set<ConceptAccession> geneAccs = gene.getConceptAccessions ();
		
		if ( geneAccs.size () == 0 ) return "";
		
		// TODO: What is this?! FACTORISE!
		return geneAccs
		.stream ()
		.filter ( acc -> {
			String accStr = acc.getAccession ();
			String accSrcId = acc.getElementOf ().getId ();
			if ( "ENSEMBL-HUMAN".equals ( accSrcId ) ) return true;
			if ( "PHYTOZOME".equals ( accSrcId ) ) return true;
			if ( "TAIR".equals ( accSrcId ) && accStr.startsWith ( "AT" ) && accStr.indexOf ( "." ) == -1 ) return true;
			return false;
		})
		.map ( ConceptAccession::getAccession )
		.findAny ()
		.orElse ( geneAccs.iterator ().next ().getAccession () );		
	}
	
	
	private <T> T defaultedGetter ( T value, T defaultValue, boolean withDefault )
	{
		if ( !withDefault ) return value;
		return value == null ? defaultValue : value;
	}
}
