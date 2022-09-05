package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.Optional;

import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;

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
	
	/**
	 * Calls {@link #GeneHelper(ONDEXGraph, ONDEXConcept)} via {@link ONDEXGraph#getConcept(int)}. 
	 */
	public GeneHelper ( ONDEXGraph graph, Integer geneId )
	{
		this ( graph, graph.getConcept ( geneId ) );
	}
	
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
	
	
	private <T> T defaultedGetter ( T value, T defaultValue, boolean withDefault )
	{
		if ( !withDefault ) return value;
		return value == null ? defaultValue : value;
	}
}
