package rres.knetminer.datasource.ondexlocal.service;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import uk.ac.ebi.utils.io.IOUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class ExportService
{
	@Autowired
	private DataService dataService;
	
	@Autowired
	private SemanticMotifService semanticMotifService;
	

	private static final Logger log = LogManager.getLogger ( ExportService.class );

	private ExportService () {}
	
  /*
   * Generate stats about the created Ondex graph and its mappings:
   * mapConcept2Genes & mapGene2Concepts. Author Singhatt
   * Updating to also give Concept2Gene per concept
   *
   * TODO - KHP: Change this to return JSON, break it down into smaller components 
   * and add API endpoint for this. To be aligned with KnetSpace resource pages.
   */
	void exportGraphStats ()
	{
		ONDEXGraph graph = this.dataService.getGraph ();
		var exportDirPath = dataService.getDataPath ();
		
		log.info ( "Saving graph stats to '{}'", exportDirPath );

		
		// Update the Network Stats file that holds the latest Stats information.
		String fileName = Paths.get ( exportDirPath, "latestNetwork_Stats.tab" ).toString ();
		
		// Also, create a timetamped Stats file to retain historic Stats
		// information.
		long timestamp = System.currentTimeMillis ();
		String newFileName = Paths.get ( exportDirPath, timestamp + "_Network_Stats.tab" ).toString ();

		int totalGenes = dataService.getGenomeGenesCount ();
		int totalConcepts = graph.getConcepts ().size ();
		int totalRelations = graph.getRelations ().size ();
		
		var concepts2Genes = semanticMotifService.getConcepts2Genes ();
		int geneEvidenceConcepts = concepts2Genes.size ();

		int [] minValues = new int[] { geneEvidenceConcepts > 0 ? Integer.MAX_VALUE : 0 },
				maxValues = new int [] { 0 }, 
				allValuesCount = new int [] { 0 }; 

		// Min/Max/avg per each gene-related concept group
		var genes2Concepts = semanticMotifService.getGenes2Concepts ();
		
		genes2Concepts
		.entrySet ()
		.stream ()
		.map ( Map.Entry::getValue )
		.map ( Collection::size )
		.forEach ( thisSetSize ->
		{
			if ( thisSetSize < minValues [ 0 ] ) minValues [ 0 ] = thisSetSize;
			if ( thisSetSize > maxValues [ 0 ] ) maxValues [ 0 ] = thisSetSize;
			allValuesCount [ 0 ] += thisSetSize;					
		});

		// Total no. of keys in the HashMap.
		int genesCount = genes2Concepts.keySet ().size ();
		// Calculate average size of gene-evidence networks in the HashMap.
		int avgValues = genesCount > 0 ? allValuesCount [ 0 ] / genesCount : 0;

		// Write the Stats to a .tab file.
		StringBuffer sb = new StringBuffer ();
		// sb.append("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
		sb.append ( "<stats>\n" );
		sb.append ( "<totalGenes>" ).append ( totalGenes ).append ( "</totalGenes>\n" );
		sb.append ( "<totalConcepts>" ).append ( totalConcepts ).append ( "</totalConcepts>\n" );
		sb.append ( "<totalRelations>" ).append ( totalRelations ).append ( "</totalRelations>\n" );
		sb.append ( "<geneEvidenceConcepts>" ).append ( geneEvidenceConcepts ).append ( "</geneEvidenceConcepts>\n" );
		sb.append ( "<evidenceNetworkSizes>\n" );
		sb.append ( "<minSize>" ).append ( minValues [ 0 ] ).append ( "</minSize>\n" );
		sb.append ( "<maxSize>" ).append ( maxValues [ 0 ] ).append ( "</maxSize>\n" );
		sb.append ( "<avgSize>" ).append ( avgValues ).append ( "</avgSize>\n" );
		sb.append ( "</evidenceNetworkSizes>\n" );

		Set<ConceptClass> conceptClasses = graph.getMetaData ().getConceptClasses (); // get all concept classes
		Set<ConceptClass> sortedConceptClasses = new TreeSet<> ( conceptClasses ); // sorted

		// Display table breakdown of all conceptClasses in network
		sb.append ( "<conceptClasses>\n" );
		for ( ConceptClass conClass : sortedConceptClasses )
		{
			String conID = conClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue; 
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;

			int conCount = graph.getConceptsOfConceptClass ( conClass ).size ();
			if ( conCount == 0 ) continue;
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
			
			sb.append ( "<cc_count>" ).append ( conID ).append ( "=" ).append ( conCount ).append ( "</cc_count>\n" );
		}
		sb.append ( "</conceptClasses>\n" );
		sb.append ( "<ccgeneEviCount>\n" ); // Obtain concept count from concept2gene

		final Map<String, Long> concept2GenesCounts = concepts2Genes.entrySet ()
		.stream ()
		.collect ( Collectors.groupingBy ( 
			v -> graph.getConcept ( v.getKey () ).getOfType ().getId (), 
			Collectors.counting ()  
		));

		// Ensure that the missing ID's are added to the Map, if they weren't in the mapConcept2Genes map.
		sortedConceptClasses.stream ()
		.forEach ( conceptClass -> 
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) return;
			String conceptID = conceptClass.getId ();
			if ( concept2GenesCounts.containsKey ( conceptID ) ) return;
			if ( conceptID.equalsIgnoreCase ( "Thing" ) ) return;
			if ( conceptID.equalsIgnoreCase ( "TestCC" ) ) return;
			concept2GenesCounts.put ( conceptID, Long.valueOf ( 0 ) );
		});
		
		// Prints concept -> gene counts
		concept2GenesCounts.entrySet ()
		.stream ()
		.sorted ( Map.Entry.comparingByKey () )
		.forEach ( pair ->
		{
			for ( ConceptClass conceptClass : sortedConceptClasses )
			{
				if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
				
				String conID = conceptClass.getId ();
				if ( !pair.getKey ().equals ( conID ) ) continue;

				if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
				else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
				sb.append ( "<ccEvi>" ).append ( conID ).append ( "=>" ).append ( Math.toIntExact ( pair.getValue () ) )
					.append ( "</ccEvi>\n" );
			}
		});

		sb.append ( "</ccgeneEviCount>\n" );
		sb.append ( "<connectivity>\n" ); // Relationships per concept
		
		// Print connectivity for each CC
		for ( ConceptClass conceptClass : sortedConceptClasses )
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
			String conID = conceptClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue;
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;
			
			int relationCount = graph.getRelationsOfConceptClass ( conceptClass ).size ();
			int conCount = graph.getConceptsOfConceptClass ( conceptClass ).size ();
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";

			float connectivity = ( (float) relationCount / (float) conCount );
			sb.append ( "<hubiness>" ).append ( conID ).append ( "->" )
				.append ( String.format ( "%2.02f", connectivity ) ).append ( "</hubiness>\n" );
		}
		sb.append ( "</connectivity>\n" );
		sb.append ( "</stats>" );
		
		try
		{
			IOUtils.writeFile ( fileName, sb.toString () );
			
			// Also, create the timestamped Stats file.
			IOUtils.writeFile ( newFileName, sb.toString () );

			// TODO: remove?
			// generateGeneEvidenceStats(exportPathDirUrl);
		}
		catch ( IOException ex )
		{
			log.error ( "Error while writing stats for the Knetminer graph: " + ex.getMessage (), ex );
		}
	}
	
	
  /*
   * Not in use right now. Might still be useful in future, so, keeping it. Needs
   * cleaning/rewriting. 
   *  
   * generate gene2evidence .tab file with contents of the mapGenes2Concepts
   * HashMap & evidence2gene .tab file with contents of the mapConcepts2Genes
   * author singha
   */
	private void generateGeneEvidenceStats ()
	{
		var exportDirPath = dataService.getDataPath ();

		try
		{
			String g2c_fileName = Paths.get ( exportDirPath, "gene2evidences.tab.gz" ).toString (); // gene2evidences.tab
			String c2g_fileName = Paths.get ( exportDirPath, "evidence2genes.tab.gz" ).toString (); // evidence2genes.tab
			String g2pl_fileName = Paths.get ( exportDirPath, "gene2PathLength.tab.gz" ).toString (); // gene2PathLength.tab

			log.debug ( "Print mapGene2Concepts Stats in a new .tab file: " + g2c_fileName );
			// Generate mapGene2Concepts HashMap contents in a new .tab file
			// BufferedWriter out1= new BufferedWriter(new FileWriter(g2c_fileName));
			BufferedWriter out1 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( g2c_fileName ) ) ) );
			// GZIPOutputStream gzip= new GZIPOutputStream(new FileOutputStream(new
			// File(g2c_fileName))); // gzip the file.
			// BufferedWriter out1= new BufferedWriter(new OutputStreamWriter(gzip,
			// "UTF-8"));
			
			out1.write ( "Gene_ONDEXID" + "\t" + "Total_Evidences" + "\t" + "EvidenceIDs" + "\n" );
			for ( Map.Entry<Integer, Set<Integer>> mEntry : semanticMotifService.getGenes2Concepts ().entrySet () )
			{ // for each <K,V> entry
				int geneID = mEntry.getKey ();
				Set<Integer> conIDs = mEntry.getValue (); // Set<Integer> value
				String txt = geneID + "\t" + conIDs.size () + "\t";
				Iterator<Integer> itr = conIDs.iterator ();
				while ( itr.hasNext () )
				{
					txt = txt + itr.next ().toString () + ",";
				}
				txt = txt.substring ( 0, txt.length () - 1 ) + "\n"; // omit last comma character
				out1.write ( txt ); // write contents.
			}
			out1.close ();

			log.debug ( "Print mapConcept2Genes Stats in a new .tab file: " + c2g_fileName );
			// Generate mapConcept2Genes HashMap contents in a new .tab file
			// BufferedWriter out2= new BufferedWriter(new FileWriter(c2g_fileName));
			BufferedWriter out2 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( c2g_fileName ) ) ) );
			out2.write ( "Evidence_ONDEXID" + "\t" + "Total_Genes" + "\t" + "GeneIDs" + "\n" );
			for ( Map.Entry<Integer, Set<Integer>> mapEntry : semanticMotifService.getConcepts2Genes ().entrySet () )
			{ // for each <K,V> entry
				int eviID = (Integer) mapEntry.getKey ();
				Set<Integer> geneIDs = mapEntry.getValue (); // Set<Integer> value
				String evi_txt = eviID + "\t" + geneIDs.size () + "\t";
				Iterator<Integer> iter = geneIDs.iterator ();
				while ( iter.hasNext () )
				{
					evi_txt = evi_txt + iter.next ().toString () + ",";
				}
				evi_txt = evi_txt.substring ( 0, evi_txt.length () - 1 ) + "\n"; // omit last comma character
				out2.write ( evi_txt ); // write contents.
			}
			out2.close ();

			// Generate gene2PathLength .tab file
			log.debug ( "Print mapGene2PathLength Stats in a new .tab file: " + g2pl_fileName );
			BufferedWriter out3 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( g2pl_fileName ) ) ) );
			out3.write ( "Gene_ONDEXID//EndNode_ONDEXID" + "\t" + "PathLength" + "\n" );
			for ( Map.Entry<Pair<Integer, Integer>, Integer> plEntry : semanticMotifService.getGenes2PathLengths ().entrySet () )
			{
				var idPair = plEntry.getKey ();
				String key = idPair.getLeft () + "//" + idPair.getRight ();
				int pl = plEntry.getValue ();
				String pl_txt = key + "\t" + pl + "\n";
				// log.info("mapGene2PathLength: "+ pl_txt);
				out3.write ( pl_txt ); // write contents.
			}
			out3.close ();
		}
		catch ( Exception ex )
		{
			log.error ( "Error while writing stats: " + ex.getMessage (), ex );
		}
	}
}
