/**
 * 
 */
package rres.ondex.server;

import junit.framework.TestCase;

import org.junit.Test;

/**
 * @author zorcm
 *
 */
public abstract class OndexServiceProviderTest extends TestCase {

	@Test
	public void testCreateGraph() {
		OndexServiceProvider provider = new OndexServiceProvider();
		assertEquals("Result", 50, 50);
	}

}
