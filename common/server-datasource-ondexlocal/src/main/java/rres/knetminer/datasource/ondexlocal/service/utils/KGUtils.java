package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import rres.knetminer.datasource.ondexlocal.service.DataService;
import rres.knetminer.datasource.ondexlocal.service.SearchService;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifService;

/**
 * 
 * Miscellanea utilities to manipulate the OXL graph coming from the {@link DataService}.
 * 
 * <b>Please, note the criteria to include things in here:</b> it should contain functions that
 * do simple access to the graph, without requiring complex tasks like index-based searches (use the 
 * {@link SearchService search service} for that), or being about more core functionality like loading data and 
 * preparing support structures like semantic motifs (use {@link SemanticMotifService} for that). In general, 
 * don't mess up with these components, think carefully where to add things and adopt best practices like
 * favouring re-usability.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>6 Oct 2020</dd></dl>
 *
 */
public class KGUtils
{
	private KGUtils ()
	{
	}

	
  /**
   * Searches for ONDEXConcepts with the given accessions in the OndexGraph. Assumes a keyword-oriented syntax
   * for the accessions, eg, characters like brackets are removed.
   *
   * Was named searchGenesByAccessionKeywords
   */
	public static Set<ONDEXConcept> filterGenesByAccessionKeywords ( DataService dataService, List<String> accessions )
	{
		if ( accessions.size () == 0 ) return null;
		
    var graph = dataService.getGraph ();
		AttributeName attTAXID = ONDEXGraphUtils.getAttributeName ( graph, "TAXID" ); 
		ConceptClass ccGene = graph.getMetaData ().getConceptClass ( "Gene" );
		Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass ( ccGene );

		Set<String> normAccs = accessions.stream ()
		.map ( acc -> 
			acc.replaceAll ( "^[\"()]+", "" )
			.replaceAll ( "[\"()]+$", "" )
			.toUpperCase () 
		).collect ( Collectors.toSet () );			
		
		return seed.stream ()
		.filter ( gene -> {
      String thisTaxId = getAttrValueAsString ( gene, attTAXID, false );
      return dataService.containsTaxId ( thisTaxId );
		})
		.filter ( gene ->
		{
			if ( gene.getConceptAccessions ()
			.stream ()
			.map ( ConceptAccession::getAccession )
			.map ( String::toUpperCase )
			.anyMatch ( normAccs::contains ) ) return true;

			// Search the input in names too, it might be there
			if ( gene.getConceptNames ()
			.stream ()
			.map ( ConceptName::getName )
			.map ( String::toUpperCase )
			.anyMatch ( normAccs::contains ) ) return true;
			
			return false;
		})
		.collect ( Collectors.toSet () );
	}	

}
