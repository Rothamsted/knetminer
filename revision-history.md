# Revision History

*This file was last reviewed on 20/08/2021*

# 5.0

## What's new?

Data:
1. Our new multi-species knowledge graph (KG) integrates a vast amount of: genetic, genomic and literature data from the four most important global cereal crops: wheat, rice, maize, barley, combined with the model plant species Arabidopsis and Brachypodium. We have cleaned, processed, and integrated over 100 datasets which has resulted in a KG of 2 million nodes and 10 million relationships between them.
2. Several new datasets have been added (poaceae, sorghum, maize, f.culmorum, solanaceae, tomato, potato, pepper, barley).

Features:
1. KnetMiner (https://knetminer.com) now also offers a range of Free and Pro features. The free version is a perfect starting point for using or testing the platform with a small number of genes. The Pro version enables searching the knowledge graph with any number of genes, creating very large gene networks and storing as many networks as you wish. 
2. The gene list search feature has received a major performance enhancement. It now supports wildcards (eg. search for all TPS* genes) and can perform a novel KG enrichment analysis. <img width="939" alt="wheat_genelist_wildcard_search" src="https://user-images.githubusercontent.com/1078989/134174683-a7970f2f-8eda-455c-afad-54ace9632d58.png">

3. The Evidence View has seen major upgrades to allow users download the content and to generate gene networks for multiple enriched terms. 
4. The Network View has been vastly improved as well, with auto-filtering when the knetworks are too big and a new feature to export the content of the network (all visible genes) as a table. 
5. The network visualisation has been enhanced with better node labelling to highlight important parts of the graph and to distinguish genes from different species by taxID. A new type of edge (dashed lines) has also been introduced to flag relationships which need to be treated with caution.
6. KnetMiner generated gene networks can be easily saved to KnetSpace (https://knetminer.com/beta/knetspace/) and shared with colleagues and published online.

References and further details:
1. Latest KnetMiner publication: https://onlinelibrary.wiley.com/doi/10.1111/pbi.13583
2. KnetMiner covid19 data note: https://f1000research.com/articles/10-703/v1

## Software improvements and bug fixes:

### Search and analysis
 * Free and Pro KnetMiner features added. Free users are those without a KnetSpace account or those on a KnetSpace `Free` Plan wile Pro users are subscribers of the KnetSpace Pro plan. Under the free version, users can search KnetMiner with upto 20 genes in their gene list and visualize a knetwork of max. 10 genes. Pro users can search KnetMiner with no limits on gene list size and can render knetworks to analyse upto 200 genes at once.
 * Search results messages now show detailed information such as number of linked, unlinked and not-found user genes based on user query and gene list, and also the time taken for the query to run.
 * Error messages now return more detailed and user-friendly information.
 * Users can now directly add/omit evidence terms to their search box from Evidence View.
 * Evidence view table can now be downloaded by users as a tab-delimited file.
 * Users can render a combined knetwork of multiple evidence terms from Evidence View.

### KnetMiner API
 * New auto-generated explainer implemented for KnetMiner genepage API that analysises the user query to generate a word summary of what the resulting knetwork contains.
 * KnetMiner knowledge graph (dataset) version now added to `latestNetworkStats` API to have it displayed in release_notes html page.

### KnetMiner back-end
 * Migration to Java 11. **Now you do need Java >= 11 to make knetminer work** If you use Docker, our images use the right Java version automatically.
 * Big refactoring of the `OndexServiceProvider` component.
 * Wildcards now supported in the Gene List Search box (eg, 'MYB*', 'TT?')
 * knetminer-base image removed, now there are only `two` docker image levels.
 * Migration from Travis to GitHub Actions for CI builds.
 * KnetMiner now allows developer users to enable/disable knetspace login in their KnetMiners, and to enable/disable or re-route google analytics to an Amazon S3 bucket.
 * Extensive review of the codebase file structure and names.
 * Third-party dependency updates.

### Network View (KnetMaps)
 * Users can now export all visible genes and associated information as a tab-delimited file
 * Network View now auto-filters large knetworks to let users visualize subsets and avoid browser issues.
 * The network visualization now has more advanced node labelling to highlight important parts of the graph and to distinguish genes by taxID as well, by coloring gene node labels appropriately, which is highly useful for multi-species KGs. 
 * Network visualization now also used "dashed" edges to flag relationships that are not abdolute and need to be treated with caution.
 * Multiple new data sources hyperlinks added/updated to enable users to explore ARA-GWAS, ENSEMBL_PLANTS, wheat-expression, ARA-PHENO and other sources.

### Other updates
 * KnetMiner wiki (https://github.com/Rothamsted/knetminer/wiki) updated with new instructions for developers.


# 4.0

## What's new?

1. New KnetMiner branding
    * KnetMiner 4.0 sees a major revamp with an all-new [website](https://knetminer.com/wordpress/) and new branding, logo, fonts, and separated sub- products and services with their own logo, content pages and demos.
    * KnetMiner now on [wikipedia](https://en.wikipedia.org/wiki/KnetMiner).

2. New COVID-19 KnetMiner
    * We have developed a new [COVID-19 KnetMiner](www.knetminer.org/COVID-19). Read the full press release [here](https://www.rothamsted.ac.uk/news/rothamsted-answers-white-house-call-coronavirus-data-help) and check out COVID-19 KnetMiner's [feature appearance in Nature](https://www.nature.com/articles/d41586-020-01733-7).

3. Save your knetworks in the all-new KnetSpace
    * KnetMiner users can now save their knowledge networks on [KnetSpace (beta)](https://knetminer.com/beta/knetspace/),  our new collaborative knowledge discovery platform to manage KnetMiner knetworks.
    * New login feature added to KnetMiner with a “Sign in '' button in the header. Users can now sign-in using their KnetSpace username and password (sign-up is very quick). In future, we will add Google login and similar.
    * Previously, users could perform a keyword or gene list search in KnetMiner, generate an initial network for some genes and export a PNG image. As of KnetMiner 4.0, you can save it to your KnetSpace and can edit it anytime in future and share it with your students, colleagues or collaborators to help you find interesting links or curate the network collaboratively (eg hide certain nodes/edges, add labels, change layout). 
   * You can give people permissions to either edit your original network or clone it to their own KnetSpace. Once you are happy with a network you can tweet the link or share the interactive network on your own website. 
   * To save networks, simply click the new “Save network” button on the KnetMiner Network View tab and provide a name and description. This will quickly save the visible network, its layout and metadata information such as owner, date, version, source, genes, keywords used, etc. to your KnetSpace account.
![knetspace_git](https://user-images.githubusercontent.com/47788638/84669863-4254fd80-af1d-11ea-8b07-9c8ad349fc61.gif)

4. Free and Pro user subscription plans
    * We have added Free and Pro subscription plans. Sign-up to KnetMiner and KnetSpace is for free. The Free plan provides all standard KnetMiner features, plus allows users to store a limited number of user knetworks to KnetSpace. The Pro plan provides greater storage and allows users to make their saved Knetworks private. Choose a plan that’s right for you.

5. Neo4j-Cypher integration (beta)
   * The graph traversal code was re-engineered to support the Cypher graph query language. This is the first major milestone to transition towards an alternative graph database backend. Cypher is a more expressive and more standardised query language. This feature is still experimental and requires a separate Neo4j database installation, based on our RDF and Neo4j export tools. The default KnetMiner 4.0 option is to use the old semantic motif search.

References and further details:
   * overview of the new Knetminer architecture, https://www.degruyter.com/view/journals/jib/15/3/article-20180023.xml
   * Details on the Knetminer backend and sample Cypher motif queries, https://www.slideshare.net/mbrandizi/knetminer-backend-training-nov-2018-124145829
   * Real use cases can be found on our dataset files, [example](https://github.com/Rothamsted/knetminer/blob/master/datasets/wheat-beta/ws/cypher-queries.txt). More documentation will be released soon.

## Bug fixes and software improvements

### Search
 * Searches pertaining to a gene identifier, using the Gene List, are now *exact*.

### API
Several new APIs have been implemented now, including the following:
   * API for KnetSpace host url address, as defined in the POM by variable knetminer.knetSpaceHost with the API URL given as /ws/{$speciesName}/ksHost 
   * API for geneCount added which provides the size of the subgraph (number of nodes, edges) generated by KnetMiner for a given gene list. Given as /ws/{$speciesName}/geneCount?list=
   * DataSource information of the knowledge graph including source organisation, database version,  provider, species tax ID, date of creation, and species name, is accessible via the /ws/{$speciesName}/dataSource API. 

### KnetMiner back-end
   * KnetMiner can now be customised and deployed with a subset of genes. For example, we limited the COVID-19 KnetMiner to call 8,000 human genes as the seed. The path to the seed gene list can be defined in the main KnetMiner POM file variable knetminer.backend.seedGenesFile. This means only the seed genes will appear in the KnetMiner search index. The default is to index all genes. Refer to this [commit](https://github.com/Rothamsted/knetminer/commit/fe16a32196cdb18025ce11728d02aa03799f7c25).
   * Users may now define the number of Publications exported in knowledge subgraphs by altering the main POM configuration variable defaultExportedPublicationCount. The default is set to 20 most recent publications. 
   * The unconnected filter prior to JSON export was extended with additional concept classes 
   * Metadata information for the knowledge graph can now be defined in the KnetMiner dataset/species POM.

### Network view
  * Updated to [KnetMaps.js](https://knetminer.rothamsted.ac.uk/KnetMaps/) v2.0.2. 
  * Save PNG and JSON have been replaced with a ‘Save Knetwork’ button, as described in the KnetSpace integration section.
   * More data sources URLs added to support rendering of new data types.
   * Custom branding and fonts packaged for KnetMaps as well via gulp-configs.
   * Keyword highlighting logic updated and limited only to primary colours and some shades.

   
   
# 3.2

## New features/enhancements
* New genepage design using KnetMiner look & feel
* New analytics logger for genome, network and genepage modes
* Network View legend was enhanced
* Release Notes stats table was expanded with further graph analytics 
* New search button
* Updated footer
