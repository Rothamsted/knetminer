package uk.ac.rothamsted.knetminer.backend.graph.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.Optional;

import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;

/**
 * The Gene helper for an Ondex graph.
 * 
 * An helper for {@link ONDEXConcept} representing genes, which computes several gene-related information that are 
 * useful for the Knetminer API and interfaces, eg, chromosome, label, genome coordinates.
 *  
 * This code has been inferred from the many copy-pasted variants found in 
 * {@link OndexServiceProvider}, see https://github.com/Rothamsted/knetminer/issues/518.
 * 
 * TODO: in 2023 I moved this to the knetminer-initializer module, since I need it there.
 * We need to re-arrange the whole Maven structure for Knetminer, with a sharp separation between,
 * on the one hand, the data functionality that is web-independent (eg, OndexServiceProvider and sub-services) 
 * and, on the other hand, the web/API components.
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
	private int beginBP;
	private int endBP;
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
	 * The gene's attribute 'BEGIN'. 0 if it's 0 or doesn't exist. 
	 */
	public int getBeginBP ()
	{
		return beginBP;
	}
	

	/**
	 * The gene's attribute 'END'. 0 if it's 0 or doesn't exist. 
	 */
	public int getEndBP ()
	{
		return endBP;
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
	 * Tells if this gene overlaps with the QTL region. It also makes some sanity checks, like 
	 * TAXID, chromosome name, existence of coordinates. 
	 */
	public boolean isInQTL ( QTL qtl )
	{
		if ( this.taxID == null 
				 || this.chromosome == null
				 || this.beginBP == 0 
				 || this.endBP == 0
		) return false;

		if ( !taxID.equals ( qtl.getTaxID () ) ) return false;
		if ( !chromosome.equals ( qtl.getChromosome () ) ) return false;
		
		var qbegin = qtl.getStart ();
		var qend = qtl.getEnd ();

		// The gene starts before the QTL start, the other end has to start after the QTL start
		if ( beginBP <= qbegin && endBP >= qbegin ) return true;

		// The gene starts after the QTL start, it must also start before the QTL end
		return beginBP <= qend;
	}

}
