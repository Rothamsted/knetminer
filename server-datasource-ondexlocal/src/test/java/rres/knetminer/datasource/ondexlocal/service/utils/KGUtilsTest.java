package rres.knetminer.datasource.ondexlocal.service.utils;

import static org.junit.Assert.assertEquals;

import java.util.Set;

import org.junit.Test;

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
	@Test
	public void testBestNameMixedTypes ()
	{
		var graph = new MemoryONDEXGraph ( "test" );
		
		var ccA = ONDEXGraphUtils.getOrCreateConceptClass ( graph, "A" );
		var srcA = ONDEXGraphUtils.getOrCreateDataSource ( graph, "srcA" );
		var evA = ONDEXGraphUtils.getOrCreateEvidenceType ( graph, "evA" );
		
		var c = graph.createConcept ( "foo", "", "", srcA, ccA, Set.of ( evA ) );
		
		c.createConceptName ( "ABC-transporter", true );
		c.createConceptName ( "CINC_01G003904", false );
		
		assertEquals ( "Wrong ", "ABC-transporter", KGUtils.getBestName ( c ) );
	}
}
