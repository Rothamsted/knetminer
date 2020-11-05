package rres.knetminer.datasource.ondexlocal;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
// import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.core.ONDEXConcept;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;

/**
 * 
 * TODO: very messy, with computed stuff made stateful fields or viceversa, needs serious review.
 * 
 * @author zorc, pakk, singha
 *
 */
public class Hits
{
	protected final Logger log = LogManager.getLogger ( getClass () );

	private OndexServiceProvider ondexProvider;
	private Map<ONDEXConcept, Float> luceneConcepts; // concept and Lucene score
	private int luceneDocumentsLinked;
	private int numConnectedGenes;
	private SemanticMotifsSearchResult searchResult = null;
	private String keyword = ""; // TODO: not used

	// TODO: keyword is not used!
	public Hits ( String keyword, OndexServiceProvider ondexProvider, Collection<ONDEXConcept> geneList )
	{
		this.ondexProvider = ondexProvider;
		this.keyword = keyword;
		try
		{
			this.luceneConcepts = ondexProvider.getSearchService ().searchGeneRelatedConcepts ( keyword, geneList, true );
			// remove from constructor if it slows down search noticeably
			this.countLinkedGenes ();
		}
		catch ( IOException | ParseException e )
		{
			log.error ( "Hits failed", e );
		}
	}

	public void countLinkedGenes ()
	{
		int linkedDocs = 0;
		Set<Integer> uniqGenes = new HashSet<> ();
		log.info ( "Matching Lucene concepts: " + luceneConcepts.keySet ().size () );

		Map<Integer, Set<Integer>> concept2Genes = ondexProvider.getSemanticMotifService ().getConcepts2Genes ();
		for ( ONDEXConcept lc : luceneConcepts.keySet () )
		{
			Integer luceneOndexId = lc.getId ();
			// Checks if the document is related to a gene
			if ( !concept2Genes.containsKey ( luceneOndexId ) )
			{
				continue;
			}
			linkedDocs++;
			uniqGenes.addAll ( concept2Genes.get ( luceneOndexId ) );
		}

		log.info ( "Matching unique genes: " + uniqGenes.size () );
		this.numConnectedGenes = uniqGenes.size ();
		this.luceneDocumentsLinked = linkedDocs;
	}

	public int getLuceneDocumentsLinked ()
	{
		return luceneDocumentsLinked;
	}

	public int getNumConnectedGenes ()
	{
		return numConnectedGenes;
	}

	public Map<ONDEXConcept, Float> getLuceneConcepts ()
	{
		return this.luceneConcepts;
	}

	public Map<ONDEXConcept, Double> getSortedCandidates ()
	{
		return getSearchResult ().getRelatedConcept2Score ();
	}

	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return getSearchResult ().getGeneId2RelatedConceptIds ();
	}

	public SemanticMotifsSearchResult getSearchResult ()
	{
		// TODO: I hope I got the semantics found in the original code right
		if ( searchResult != null )
			return searchResult;
		return searchResult = ondexProvider.getSearchService ().getScoredGenes ( luceneConcepts );
	}
}
