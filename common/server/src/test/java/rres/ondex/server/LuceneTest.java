package rres.ondex.server;

import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import org.junit.Test;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.core.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;

/**
 * Lucene results comparison (post upgrade from Lucene-0.6.0-SNAPSHOT.jar to Lucene-1.2.1-SNAPSHOT.jar
 * @author singha
 */
public class LuceneTest {
    
    @Test
    public void testLuceneResults() throws Throwable {

        // Old results (gene-scores) from older Lucene version (0.6.0-SNAPSHOT.jar)
        
        // Creating a MemoryONDEXGraph object.
        //ONDEXGraph graph= new MemoryONDEXGraph("test");
        
        // Get Lucene scores for same gene ID's using latest Lucene snapshot (1.2.1) .jar
        
        // Compare scores.
        
    }
}
