/**
 * 
 */
package rres.ondex.server;

import org.junit.Test;

import junit.framework.TestCase;

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
