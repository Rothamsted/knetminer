package rres.knetminer.datasource.ondexlocal;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import rres.knetminer.datasource.api.CountHitsResponse;
import rres.knetminer.datasource.api.CountLociResponse;
import rres.knetminer.datasource.api.EvidencePathResponse;
import rres.knetminer.datasource.api.GenomeResponse;
import rres.knetminer.datasource.api.KeywordResponse;
import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.NetworkResponse;
import rres.knetminer.datasource.api.QtlResponse;
import rres.knetminer.datasource.api.SynonymsResponse;

public abstract class OndexLocalDataSource extends KnetminerDataSource {

	private OndexServiceProvider ondexServiceProvider;

	public OndexLocalDataSource(String dsName, String configXmlPath, String semanticMotifsPath) {
		this.setDataSourceNames(new String[] {dsName});

		Properties props = new Properties();
		// Config.xml is provided by the implementing abstract class in its
		// src/main/resources folder
		URL configUrl = Thread.currentThread().getContextClassLoader().getResource(configXmlPath);
		try {
			props.loadFromXML(configUrl.openStream());
		} catch (IOException e) {
			throw new Error(e);
		}
		this.ondexServiceProvider = new OndexServiceProvider();
		this.ondexServiceProvider.setReferenceGenome(Boolean.parseBoolean(props.getProperty("reference_genome")));
		this.ondexServiceProvider.setTaxId(Arrays.asList(props.getProperty("SpeciesTaxId").split(",")));
		this.ondexServiceProvider.setExportVisible(Boolean.parseBoolean(props.getProperty("export_visible_network")));
		try {
			this.ondexServiceProvider.createGraph(props.getProperty("DataPath"), props.getProperty("DataFile"),
					semanticMotifsPath);
		} catch (Exception e) {
			throw new Error(e);
		}
	}

	public CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		Hits hits = new Hits(request.getKeyword(), this.ondexServiceProvider);
		CountHitsResponse response = new CountHitsResponse();
		response.setLuceneCount(hits.getLuceneConcepts().size()); // number of Lucene documents
		response.setLuceneLinkedCount(hits.getLuceneDocumentsLinked()); // number of Lucene documents related to genes
		response.setGeneCount(hits.getNumConnectedGenes()); // count unique genes linked to Lucene documents
		return response;
	}

	public SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		try {
			SynonymsResponse response = new SynonymsResponse();
			response.setSynonyms(this.ondexServiceProvider.writeSynonymTable(request.getKeyword()));
			return response;
		} catch (ParseException e) {
			throw new Error(e);
		}
	}

	public CountLociResponse countLoci(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		String[] loci = request.getKeyword().split("-");
		String chr = loci[0];
		int start = 0, end = 0;
		if (loci.length > 1) {
			start = Integer.parseInt(loci[1]);
		}
		if (loci.length > 2) {
			end = Integer.parseInt(loci[2]);
		}
		CountLociResponse response = new CountLociResponse();
		response.setGeneCount(this.ondexServiceProvider.getGeneCount(chr, start, end));
		return response;
	}

	public GenomeResponse genome(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		GenomeResponse response = new GenomeResponse();
		this._keyword(response, request);
		return response;
	}

	public QtlResponse qtl(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		QtlResponse response = new QtlResponse();
		this._keyword(response, request);
		return response;
	}

	private <T extends KeywordResponse> T _keyword(T response, KnetminerRequest request)
			throws IllegalArgumentException {
		// Find genes from the user's list
		Set<ONDEXConcept> userGenes = null;
		if (request.getList() != null && request.getList().size() > 0) {
			userGenes = this.ondexServiceProvider.searchGenes(request.getList());
			System.out.println("Number of user provided genes: " + userGenes.size());
		}

		// Genome search
		System.out.println("Search mode: " + response.getClass().getName());
		ArrayList<ONDEXConcept> genes = new ArrayList<ONDEXConcept>();
		Hits qtlnetminerResults = new Hits(request.getKeyword(), this.ondexServiceProvider);
		if (response.getClass().equals(GenomeResponse.class)) {
			genes = qtlnetminerResults.getSortedCandidates(); // find qtl and add to qtl list!
			System.out.println("Number of genes " + genes.size());
		} else if (response.getClass().equals(QtlResponse.class)) {
			genes = qtlnetminerResults.getSortedCandidates();
			System.out.println("Number of genes " + genes.size());
			genes = this.ondexServiceProvider.filterQTLs(genes, request.getQtls());
			System.out.println("Genes after QTL filter: " + genes.size());
		}
		if (request.getList().size() > 0) {
			Set<ONDEXConcept> userList = this.ondexServiceProvider.searchGenes(request.getList());
			if (response.getClass().equals(QtlResponse.class) && request.getListMode().equals("GLrestrict")) {
				ArrayList<ONDEXConcept> userListArray = new ArrayList<ONDEXConcept>(userList);
				userListArray = this.ondexServiceProvider.filterQTLs(userListArray, request.getQtls());
				userList = new HashSet<ONDEXConcept>(userListArray);
				System.out.println("Number of user provided genes within QTL: " + userList.size());
			}
			qtlnetminerResults.setUsersGenes(userList);
		}

		if (genes.size() > 0) {
			String xmlGViewer = "";
			if (this.ondexServiceProvider.getReferenceGenome() == true) { // Generate Annotation file.
				xmlGViewer = this.ondexServiceProvider.writeAnnotationXML(genes, userGenes, request.getQtls(),
						request.getKeyword(), 1000, qtlnetminerResults, request.getListMode());
				System.out.println("1.) Gviewer annotation ");
			} else {
				System.out.println("1.) No reference genome for Gviewer annotation ");
			}

			// Gene table file
			String geneTable = this.ondexServiceProvider.writeGeneTable(genes, userGenes, request.getQtls(),
					request.getListMode());
			System.out.println("2.) Gene table ");

			// Evidence table file
			String evidenceTable = this.ondexServiceProvider.writeEvidenceTable(qtlnetminerResults.getLuceneConcepts(),
					userGenes, request.getQtls());
			System.out.println("3.) Evidence table ");

			// Document count (only related with genes)
			int docSize = this.ondexServiceProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts())
					.size();

			// Total documents
			int totalDocSize = qtlnetminerResults.getLuceneConcepts().size();

			// We have annotation and table file
			response.setGViewer(xmlGViewer);
			response.setGeneTable(geneTable);
			response.setEvidenceTable(evidenceTable);
			response.setGeneCount(genes.size());
			response.setDocSize(docSize);
			response.setTotalDocSize(totalDocSize);
		}
		return response;
	}

	public NetworkResponse network(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		Set<ONDEXConcept> genes = new HashSet<ONDEXConcept>();

		System.out.println("Call applet! Search genes " + request.getList().size());

		// Search Genes
		if (!request.getList().isEmpty()) {
			genes.addAll(this.ondexServiceProvider.searchGenes(request.getList()));
		}

		// Search Regions
		if (!request.getQtls().isEmpty()) {
			genes.addAll(this.ondexServiceProvider.searchQTLs(request.getQtls()));
		}

		// Find Semantic Motifs
		ONDEXGraph subGraph = this.ondexServiceProvider.findSemanticMotifs(genes, request.getKeyword());

		// Export graph
		NetworkResponse response = new NetworkResponse();
		try {
			response.setGraph(this.ondexServiceProvider.exportGraph(subGraph));
		} catch (InvalidPluginArgumentException e) {
			throw new Error(e);
		}
		return response;
	}

	public EvidencePathResponse evidencePath(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		int evidenceOndexID = Integer.parseInt(request.getKeyword());
		ONDEXGraph subGraph = this.ondexServiceProvider.evidencePath(evidenceOndexID);

		// Export graph
		EvidencePathResponse response = new EvidencePathResponse();
		try {
			response.setGraph(this.ondexServiceProvider.exportGraph(subGraph));
		} catch (InvalidPluginArgumentException e) {
			throw new Error(e);
		}
		return response;
	}
}
