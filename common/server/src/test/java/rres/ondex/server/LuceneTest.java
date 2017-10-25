package rres.ondex.server;

import java.io.File;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * Lucene results comparison (post upgrade from Lucene-0.6.0-SNAPSHOT.jar to Lucene-1.2.1-SNAPSHOT.jar
 * 
 * @author singha, Marco Brandizi
 */
public class LuceneTest
{
	private Logger log = LoggerFactory.getLogger ( this.getClass () );
	
	private OndexServiceProvider startServiceProvider ( String oxlPath )
		throws Exception
	{
		OndexServiceProvider ondexServiceProvider = new OndexServiceProvider ();

		ondexServiceProvider.setReferenceGenome ( true );
		ondexServiceProvider.setTaxId ( Arrays.asList ( new String[] { "4565" } ) );
		ondexServiceProvider.setExportVisible ( false );
		ondexServiceProvider.loadConfig ();
		
		try {
			ondexServiceProvider.createGraph ( new File ( oxlPath ).getCanonicalPath () );
		}
		catch ( ArrayIndexOutOfBoundsException ex ) {
			// Don't worry, it's not relevant here
			log.warn ( 
				"Known problem while initialising the OndexServiceProvider: {}, message: {}", 
				ex.getClass ().getSimpleName (), 
				ex.getMessage ()  
			);
			log.trace ( "Known problem while initialising the OndexServiceProvider: " + ex.getMessage (), ex );
		}
		
		return ondexServiceProvider;
	}
	
	
	//@Test
	public void testLuceneResults () throws Throwable
	{

		// Old results (gene-scores) from older Lucene version (0.6.0-SNAPSHOT.jar)

		// Creating a MemoryONDEXGraph object.
		// ONDEXGraph graph= new MemoryONDEXGraph("test");

		// Get Lucene scores for same gene ID's using latest Lucene snapshot (1.2.1) .jar

		// Compare scores.

	}

	@Test
	public void testLuceneGeneSearch () throws Exception
	{
		// String oxlPath = "target/test-classes/text_mining_test_case.oxl";
		String oxlPath = "/Users/brandizi/Documents/Work/RRes/ondex_data/knet_miner_data/WheatKNET.oxl";
				
		OndexServiceProvider ondexServiceProvider = this.startServiceProvider ( oxlPath );
		
		Map<ONDEXConcept, Float> hits = ondexServiceProvider.searchLucene ( 
			"\"seed size\" OR \"grain size\"" 
		);

		//Map<ONDEXConcept, Float> hits = ondexServiceProvider.searchLucene ( 
		//	"dormancy OR germination OR color OR flavon* OR proanthocyanidin" 
		//);
		
		Map<ONDEXConcept, Double> geneHits = ondexServiceProvider.getScoredGenesMap ( hits ); 
		
		for ( ONDEXConcept c: geneHits.keySet () )
		{
			Double score = geneHits.get ( c );
			if ( score == null ) continue;
			
			log.info ( "{}\t{}", 
				Optional.ofNullable ( this.getGeneAcc ( c ) ).orElse ( "" ), 
				score
			);
		}
	}

	
	/**
	 * This is what the service computes for accs.
	 * 
	 */
	private String getGeneAcc ( ONDEXConcept c )
	{
		String geneAcc = "";
		for (ConceptAccession acc : c.getConceptAccessions()) 
		{
			String accValue = acc.getAccession();
			geneAcc = accValue;
			if (acc.getElementOf().getId().equalsIgnoreCase("TAIR") && accValue.startsWith("AT")
					&& (accValue.indexOf(".") == -1)) {
				geneAcc = accValue;
				break;
			} else if (acc.getElementOf().getId().equalsIgnoreCase("PHYTOZOME")) {
				geneAcc = accValue;
				break;
			}
		}
		
		return geneAcc;
	}
}
