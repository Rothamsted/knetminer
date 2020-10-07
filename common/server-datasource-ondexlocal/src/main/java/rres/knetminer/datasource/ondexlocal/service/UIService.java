package rres.knetminer.datasource.ondexlocal.service;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttributeName;

import java.text.DecimalFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import rres.knetminer.datasource.ondexlocal.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.KGUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.QTL;

/**
 * TODO: Comment me
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>7 Oct 2020</dd></dl>
 *
 */
@Component
public class UIService
{
	@Autowired
	private DataService dataService;

	@Autowired
	private SemanticMotifService semanticMotifService;
	
	private final Logger log = LogManager.getLogger ( getClass() );
	
	private UIService () {}
	
  /**
   * This table contains all possible candidate genes for given query
   * TODO: too big! Split into separated functions.
   *
   */
	public String writeGeneTable ( 
		List<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes, List<String> qtlsStr, 
		String listMode,  SemanticMotifsSearchResult searchResult 
	)
	{
		log.info ( "generate Gene table..." );
		
		List<QTL> qtls =  QTL.fromStringList ( qtlsStr );
		Set<Integer> userGeneIds = new HashSet<> ();
    var graph = dataService.getGraph ();
		var genes2QTLs = semanticMotifService.getGenes2QTLs ();
		var options = dataService.getOptions ();

		if ( userGenes != null )
		{
			userGeneIds = userGenes.stream ()
				.map ( ONDEXConcept::getId )
				.collect ( Collectors.toSet () );
		} 
		else
			log.info ( "No user gene list defined." );

		if ( qtls.isEmpty () ) log.info ( "No QTL regions defined." );
		
		var mapGene2HitConcept = searchResult.getGeneId2RelatedConceptIds ();
		
		// TODO: but could it be null?!
		var scoredCandidates = Optional.ofNullable ( searchResult.getRelatedConcept2Score () )
			.orElse ( Collections.emptyMap () );			
		
		// Removed ccSNP from Geneview table (12/09/2017)
		// AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
		// ConceptClass ccSNP = md.getConceptClass("SNP");

		StringBuffer out = new StringBuffer ();
		// out.append("ONDEX-ID\tACCESSION\tGENE
		// NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\tEVIDENCES_LINKED\tEVIDENCES_IDs\n");
		out.append ( "ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n" );
		for ( ONDEXConcept gene : candidates )
		{
			int id = gene.getId ();

			var geneHelper = new GeneHelper ( graph, gene );
			Double score = scoredCandidates.getOrDefault ( gene, 0d );

			// use shortest preferred concept name
			String geneName = KGUtils.getShortestPreferedName ( gene.getConceptNames () );

			boolean isInList = userGenes != null && userGeneIds.contains ( gene.getId () );

			List<String> infoQTL = new LinkedList<> ();
			for ( Integer cid : genes2QTLs.getOrDefault ( gene.getId (), Collections.emptySet () ) )
			{
				ONDEXConcept qtl = graph.getConcept ( cid );

				/*
				 * TODO: a TEMPORARY fix for a bug wr're seeing, we MUST apply a similar massage to ALL cases like this,
				 * and hence we MUST move this code to some utility.
				 */
				if ( qtl == null )
				{
					log.error ( "writeTable(): no gene found for id: ", cid );
					continue;
				}
				String acc = Optional.ofNullable ( qtl.getConceptName () )
					.map ( ConceptName::getName )
					.map ( StringEscapeUtils::escapeCsv )
					.orElseGet ( () -> {
						log.error ( "writeTable(): gene name not found for id: {}", cid );
						return "";
					});

				String traitDesc = Optional.of ( getAttrValueAsString ( graph, gene, "Trait", false ) )
					.orElse ( acc );

				// TODO: traitDesc twice?! Looks wrong.
				infoQTL.add ( traitDesc + "//" + traitDesc ); 
			} // for genes2QTLs


			qtls.stream ()
			.filter ( loci -> !loci.getChromosome ().isEmpty () )
			.filter ( loci -> geneHelper.getBeginBP ( true ) >= loci.getStart () )
			.filter ( loci -> geneHelper.getEndBP ( true ) <= loci.getEnd () )
			.map ( loci -> loci.getLabel () + "//" + loci.getTrait () )
			.forEach ( infoQTL::add );

			String infoQTLStr = infoQTL.stream ().collect ( Collectors.joining ( "||" ) );
			
			// get lucene hits per gene
			Set<Integer> luceneHits = mapGene2HitConcept.getOrDefault ( id, Collections.emptySet () );

			// organise by concept class
			Map<String, String> cc2name = new HashMap<> ();

			Set<Integer> evidencesIDs = new HashSet<> ();
			for ( int hitID : luceneHits )
			{
				ONDEXConcept c = graph.getConcept ( hitID );
				evidencesIDs.add ( c.getId () ); // retain all evidences' ID's
				String ccId = c.getOfType ().getId ();

				// skip publications as handled differently (see below)
				if ( ccId.equals ( "Publication" ) ) continue;

				String name = KGUtils.getMolBioDefaultLabel ( c );
				cc2name.merge ( ccId, name, (thisId, oldName) -> oldName + "//" + name );
			}

			// special case for publications to sort and filter most recent publications
			Set<ONDEXConcept> allPubs = luceneHits.stream ()
				.map ( graph::getConcept )
				.filter ( c -> "Publication".equals ( c.getOfType ().getId () ) )
				.collect ( Collectors.toSet () );
			
			
			AttributeName attYear = getAttributeName ( graph, "YEAR" );
			List<Integer> newPubs = PublicationUtils.newPubsByNumber ( 
				allPubs, 
				attYear, 
				options.getInt ( SearchService.OPT_DEFAULT_NUMBER_PUBS, -1 ) 
			);

			// add most recent publications here
			if ( !newPubs.isEmpty () )
			{
				String pubString = "Publication__" + allPubs.size () + "__";
				pubString += newPubs.stream ()
					.map ( graph::getConcept )
				  .map ( KGUtils::getMolBioDefaultLabel )
				  .map ( name -> name.contains ( "PMID:" ) ? name : "PMID:" + name )
				  .collect ( Collectors.joining ( "//" ) );
				cc2name.put ( "Publication", pubString );
			}

			// create output string for evidences column in GeneView table
			String evidenceStr = cc2name.entrySet ()
			.stream ()
			.map ( e -> 
				"Publication".equals ( e.getKey () )  
					? e.getValue ()
					: e.getKey () + "__" + e.getValue ().split ( "//" ).length + "__" + e.getValue ()
			)
			.collect ( Collectors.joining ( "||" ) );
							
			if ( luceneHits.isEmpty () && listMode.equals ( "GLrestrict" ) ) continue;
			
			if ( ! ( !evidenceStr.isEmpty () || qtls.isEmpty () ) ) continue;
			
			out.append (
				id + "\t" + geneHelper.getBestAccession () + "\t" + geneName + "\t" + geneHelper.getChromosome () + "\t" 
				+ geneHelper.getBeginBP ( true ) + "\t" + geneHelper.getTaxID () + "\t" 
				+ new DecimalFormat ( "0.00" ).format ( score ) + "\t" + (isInList ? "yes" : "no" ) + "\t" + infoQTLStr + "\t" 
				+ evidenceStr + "\n" 
			);

		} // for candidates
		log.info ( "Gene table generated..." );
		return out.toString ();
	
	} // writeGeneTable()	

}
