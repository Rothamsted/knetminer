package rres.knetminer.datasource.ondexlocal.service.utils;

import static org.junit.Assert.assertEquals;

import java.util.Set;

import org.junit.Test;

import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.DataSource;
import net.sourceforge.ondex.core.EvidenceType;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 Dec 2021</dd></dl>
 *
 */
public class KGUtilsTest
{
	private ONDEXGraph graph = new MemoryONDEXGraph ( "test" );
	
	private ConceptClass ccA = ONDEXGraphUtils.getOrCreateConceptClass ( graph, "A" );
	private DataSource srcA = ONDEXGraphUtils.getOrCreateDataSource ( graph, "srcA" );
	private EvidenceType evA = ONDEXGraphUtils.getOrCreateEvidenceType ( graph, "evA" );
	
	private ONDEXConcept c = graph.createConcept ( "foo", "", "", srcA, ccA, Set.of ( evA ) );
	
	
	/**
	 * Tests #584
	 */
	@Test
	public void testBestNameMixedTypes ()
	{
		c.createConceptName ( "ABC-transporter", true );
		c.createConceptName ( "CINC_01G003904", false );
		
		assertEquals ( "Wrong name picked!", "ABC-transporter", KGUtils.getBestName ( c ) );
	}


	/**
	 * Tests #584
	 */
	@Test
	public void testBestAccessionMixedTypes ()
	{
		c.createConceptAccession ( "ABC Gene", srcA, false ); // unique
		c.createConceptAccession ( "ABC", srcA, true ); // shorter, but should choose the non-ambiguous anyway
		
		assertEquals ( "Wrong accession picked!", "ABC Gene", KGUtils.getBestAccession ( c ) );
	}

	/**
	 * Tests #584
	 */
	@Test
	public void testBestGeneAccessionPrioritySources ()
	{
		DataSource srcENSEMBL = ONDEXGraphUtils.getOrCreateDataSource ( graph, "ENSEMBL" );
		
		
		c.createConceptAccession ( "ABC Gene", srcENSEMBL, false ); // unique
		c.createConceptAccession ( "ABC", srcA, false ); // shorter but ENSEMBL should have priority.
		
		assertEquals ( "Wrong accession picked!", "ABC Gene", KGUtils.getBestGeneAccession ( c ) );
	}

	/**
	 * Tests #593
	 */
	@Test
	public void testZMSynonyms ()
	{
		DataSource srcENSEMBL = ONDEXGraphUtils.getOrCreateDataSource ( graph, "ENSEMBL" );
		
		c.createConceptAccession ( "ZM00001EB425260", srcENSEMBL, false ); // unique
		c.createConceptAccession ( "ZM00001D025723", srcENSEMBL, false ); // shorter but EB should have priority.
		
		assertEquals ( "Wrong accession picked!", "ZM00001EB425260", KGUtils.getBestAccession ( c ) );
	}
	
	/**
	 * Tests #584
	 */
	@Test
	public void testBestLabel ()
	{
		c.createConceptName ( "ABC-transporter", true );
		c.createConceptName ( "CINC_01G003904", false );
		c.createConceptAccession ( "ABC Gene", srcA, false ); // unique
		c.createConceptAccession ( "ABC", srcA, true ); // shorter, but should choose the non-ambiguous anyway
		
		assertEquals ( "Wrong label picked!", "ABC-transporter", KGUtils.getBestConceptLabel ( c ) );
	}	

	/**
	 * Tests #584
	 */
	@Test
	public void testBestLabelAccessionFallBack ()
	{
		c.createConceptAccession ( "ABC Gene", srcA, false ); // unique
		c.createConceptAccession ( "ABC", srcA, true ); // shorter, but should choose the non-ambiguous anyway
		
		assertEquals ( "Wrong label picked!", "ABC Gene", KGUtils.getBestConceptLabel ( c ) );
	}	

	@Test
	public void testBestLabelPIDFallBack ()
	{
		assertEquals ( "Wrong label picked!", c.getPID (), KGUtils.getBestConceptLabel ( c ) );
	}	

}
