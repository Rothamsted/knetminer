# Revision History

*This file was last reviewed on 2023-04-05* **Please, keep this note updated** 

<br>

# 5.7-SNAPSHOT
* Current snapshot (to be changed after final 5.6).
* Bookmark: c986508 is the candidate commit for the final 5.6.


# 5.6

## What's new?

KnetMiner 5.6 brings multispecies functionality, performance improvements, bug fixes, UI enhancements, website improvements, new tutorial and several new species and updated datasets.

### Find the multispecies 5.6 (Beta) instances here:
- [Poaceae 3-Species](https://knetminer.com/poaceae/) containing: Arabidopsis Thaliana, Triticum aestivum and Oryza sativa Japonica.
- [Ascomycota 10-Species](https://knetminer.com/ascomycota/) containing: Fusarium culmorum CS7071, Fusarium graminearum PH-1, Zymoseptoria tritici, Aspergillus fumigatus Af293, Aspergillus nidulans, Candida albicans, Magnaporthe oryzae, Neurospora crassa, Saccharomyces cerevisiae and Schizosaccharomyces pombe.

<br>

## Key Features

### 1. Multispecies functionality
Multispecies functionality brings a major change to how KnetMiner functions and can be queried.

- KnetMiner can now be configured (see "New YAML based Configuration" below) to serve a knowledge graph with multiple species (taxonomy ids).
- Added a Species selector in the header which shows the list of species available in the config.yml.
- Search messages and sample queries have been made species specific.
- Genome Region Search has been updated to show chromosome names and gene numbers for selected species.
- Gene View will only show genes belonging to the selected species.
- Evidence View columns (p-value, total genes) are still based on all species data.
- Map View automatically picks the chromosome map for the selected species.
- Network View still shows nodes and relations across all species present in the KG.

<img width="350" alt="Multispecies functionality (top left of new KnetMiner interface)" src="https://user-images.githubusercontent.com/33641372/226940196-09651587-e194-4ff9-9741-0604dadc1b52.png"> 


### 2. New YAML based Configuration

KnetMiner is now easier than ever to configure. We have introduced a new YAML-based configuration system, which enables more efficient customisation and extension of default settings through the use of inclusions, overrides and merges. This system supports advanced features such as special markers, rules and property interpolation. 

For a comprehensive guide on creating and configuring a KnetMiner instance, please refer to our documentation available on [GitHub](https://github.com/Rothamsted/knetminer/wiki/3.-Deploying-KnetMiner-with-Docker#configuring-knetminer).

<img width="850" alt="Gene Synonyms dropdown" src="https://user-images.githubusercontent.com/33641372/227287258-a83c61cc-45a3-4531-afb3-ec725dd95ff6.png">

### 3. Gene names and synonyms
Show all synonyms in Gene View: allows users to view all synonyms for a gene, in Gene View.

- Gene preferred names are now correctly selected by default.

<img width="350" alt="Gene Synonyms dropdown" src="https://user-images.githubusercontent.com/33641372/220589349-4e32ecb8-6f95-471c-9f9a-d7e47952bd74.png">

We now append the species initials to the front of genes in Network View. 

- Helps identify genes from various species in multi-species networks.
- Stops users having to individually click on nodes to determine their species.

<img width="350" src="https://user-images.githubusercontent.com/33641372/220668770-a5870d88-8eb4-413f-a447-240b6ad87061.png">

### 4. Network data exporter
Users can now export their network data (from Network view).
- Both exporting methods will export the currently visible graph with node and edge information but without all details (which would normally be visible in the Info box).
- Allows for exporting in Tabular format and Cytoscape desktop (json) formats. 

<img width="350" alt="Gene Synonyms dropdown" src="https://user-images.githubusercontent.com/33641372/220590885-8577c736-f53e-49d4-8508-f12885406fca.png">

- Downloading the Cytoscape desktop format file prompts users to follow a [guide we've written for setting up Cytoscape desktop](https://knetminer.com/tutorial/cytoscape).

### 5. KnetScore visibility
Knetscore is now visible in Gene View
- Published in [KnetMiner: a comprehensive approach for supporting evidence-based gene discovery and complex trait analysis across species](https://onlinelibrary.wiley.com/doi/10.1111/pbi.13583).
- Gene View now exposes the KnetScore (not normalised) to order and better sort candidate genes by ranking their evidences and significance.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220595111-f2cafdd8-76c9-4450-b6e5-01d1346319cb.png">

### 6. Evidence View Gene List functionality
Quickly return all the genes associated to a concept via semantic motifs in the current Knowledge Graph.

- Allows users to quickly view all genes related to a particular Evidence 
- Quick copying of gene accessions for KnetMiner Gene List Search
- Quick downloading of entire table

<img width="850" src="https://user-images.githubusercontent.com/33641372/220596063-9375056e-9c11-421f-9b0e-3107784cfc72.png">

<img width="350" alt="Gene list popup" src="https://user-images.githubusercontent.com/33641372/220596245-cb948378-3a7d-4447-90dd-c70005b7ec13.png">

### 7. KnetMiner (KnetGraph) programmatic endpoints homepage update
**Available [here](https://knetminer.com/data)**.
- Modernised visuals
- Updated links
- Improved key features (logo, key texts)

<img width="850" src="https://user-images.githubusercontent.com/33641372/218739919-f30fe5e4-3f34-49a1-9856-6c9968294507.png">

### 8. New Tutorial
### Available [here](https://knetminer.com/tutorial)
The new and improved KnetMiner tutorial offers users a user-friendly platform to quickly troubleshoot problems or learn about features. We now also link to the tutorial page from within the KnetMiner header.

- Improved navigation
- Google indexed 

<img width="850" src="https://user-images.githubusercontent.com/33641372/226945410-75d94031-d4b2-4300-a9de-4b1ff6ed6f3a.png">

<br>

## Other new features

### More meaningful P-values in Evidence View
- Exponential values are now displayed correctly.
- Decimal place count has been increased.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220602429-7a59afa3-157d-42d9-b44a-c9643711c47f.png">

### Improved evidence filtering

- Added individual evidence names to key.
- Users can now multi-select evidences to filter by, both in Gene and Evidence views.
- New UI is translated into the evidence column too, with correct overflow and table scaling.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220663610-460763f3-564c-4785-8f4d-423825d21b9a.png">

### Added additional RefSeq gene IDs to Poaceae KG (Release 55+)

Improved gene identification by allowing users to query KnetMiner using a combination of gene ID formats. 
In 5.6, we've added:
- Triticum aestivum [RefSeq 2.1 gene IDs](https://www.ncbi.nlm.nih.gov/genome/?term=Triticum+aestivum).
- Oryza sativa Japonica [MSU gene IDs](http://rice.uga.edu/).

<br>

## Visual improvements

### Added information ("i") tooltips 
- Several column headers in Gene and Evidence views now contain helpful tooltips which describe the column.

<img width="350" alt="Evidence View headers with 'i'" src="https://user-images.githubusercontent.com/33641372/220669792-2717fbe1-55cc-4474-b6fd-33b82a1c6bca.png">

### Improved Evidence View handling of empty user Gene Lists
- N/A for P-values column.
- "0" for Gene List column.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220671862-0fd43418-be5d-4148-80a0-d619c6523f32.png">

### New KnetMiner Gene page
- Updated to visually match new KnetMiner interface.
- Correctly retains gene list and keywords via URL. 

<img width="850" src="https://user-images.githubusercontent.com/33641372/220673354-54cf4d11-b51b-47af-9b43-49b90dc05053.png">

### Refined knowledge graph release notes
Available via an animated button beside the multispecies selector (top left).

Contains:
- KG information: title, explainer, versioning and size details.
- A detailed tabulated breakdown of which data is available in the graph.

<img width="150" src="https://user-images.githubusercontent.com/33641372/220674508-a40e9e63-c3e4-44ab-af79-f721b4165da8.png">

<img width="250" src="https://user-images.githubusercontent.com/33641372/220674805-ab01429b-d5c8-41b9-9d26-8be645db33b8.png">

### Evidence view Node Label max character length increased
Evidence view Description/Node label can now display longer lengths of text.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220678402-3536ce8d-c25d-4065-9831-cc00a8cf0bb8.png">

### New loading animation
We've removed the double-helix loading animation and simplified the animation into the search button itself.

![image](https://user-images.githubusercontent.com/33641372/226440970-0ae4172b-b850-42af-9318-48f3f8aa4b48.png)

### KnetMiner is rebooting page
On the odd chance that a user finds us rebooting or updating the instance they selected, they are prompted about ongoing updates.

- Contact us directs to [/contact](https://knetminer.com/contact).
- Reload button refreshes the page and tries to access KnetMiner again.
- Home page returns to [KnetMiner.com](https://knetminer.com).

<img width="850" src="https://user-images.githubusercontent.com/33641372/220729050-bd64f289-7c70-4ff2-96a1-7333a082205f.png">

### Concept Selector updated
Query suggestor has become a “Concept selector”.

- Quickly map keywords to <b>concepts</b> from the knowledge graph.

<img width="850" src="https://user-images.githubusercontent.com/33641372/220732809-ac50afdc-31ec-41c9-92aa-83c889b5e528.png">


## Backend updates
- Overhauled KnetMiner configuration.
- New /graphinfo/concept-info endpoint to retrieve node properties.
- The text mining tool (from KnetBuilder) has been extended to allow for stop words which should be excluded from the text mining search.
- Bugfixes to Google Analytics for KnetMiner (with new configuration options for deployers).
- Cleaned up dataset data and configuration throughout KnetMiner and KnetMiner dependencies.

## APIs
- API URL auto-discovery in the UI code.
- New API to help the client get information on the available species and related information.
- KnetMiner now uses the same labels as the CytoscapeJS plugin (from KnetBuilder).
- Cleaning of JSON formats for the split genome API.
- API exception logging has been improved.
- Network API can now export plainJSON format.

## ETL updates
- New workflow for text mining, including (1) more gene name stop words and (2) expanded gene synonym searches
- Updates to obviate NCBI PubMed Abstract download restrictions
- Updates to use new UniProt REST interface
- Collections of names (chemical and brand) of both fungicides and insecticides for text-mining training

## New species in KnetMiner
- Ascomycota:
   * Aspergillus Fumigatus
   * Fusarium Culmorum
   * Neurospora Crassa
   * Zymoseptoria Tritici
   * Aspergillus Nidulans
   * Fusarium Graminearum
   * Saccharomyces Cerevisiae
   * Candida Albicans
   * Magnaporthe Oryzae
   * Schizosaccharomyces Pombe

- Brassica:
   * Brassica Napus
   * Brassica Oleracea
   * Brassica Rapa
   * Camelina Sativa
   * Arabidopsis Thaliana

- Tropicana:
   * Arabidopsis Thaliana
   * Musa Acuminata
   * Coffea Canephora

## New configurations
- Brassica Camelina.

## Minor visual updates
- Display number of genes inputted in Gene List box.
- "Clear Search Fields" button.
- Added "Help" popup.
- Removed background image.
- Updated top banner color to white.
- Added "Tutorial" and "Cite Us" buttons to banner.
- Rounded buttons, boxes and sections.
- Improved clarity of text pop ups, errors and notifications.
- Added "Revert all filtering changes" button to Gene and Evidence View keys.
- Moved positions of several UI features (amount of genes to show in gene view, unlinked/linked genes selectors, "X genes selected").
- Swapped Evidence and Map view positions.
- Network View more clearly separated from other views.
- Network View button is now greyed out/disabled when no graph has been created.
- Greyed out "Genes" box in Genome Region Search (as the value isn't user-adjustable).
- Revamped Region Search "Add region" UI/UX.
- Evidence view now correctly displays amount of "terms" selected.
- Added meaningful icons to views buttons.
- KnetMiner logo in banner now redirects to /products page.
- Example queries auto-changes with species.
- Now only show X on second (and beyond) Genome Region Search boxes.
- Renamed Evidence View's "Description" column to "Node label".

## Fixed bugs and internal improvements
- Multiple concept names having preferred flags mistakenly set to true.
- White text in several dropdowns displaying as white on white for users with darkmode active in their browser.
- Page crashing when clicking example queries while having multiple open Genome Region Search boxes.
- Removed incorrect numbering in Evidence View key.
- Interactive legend not scaling correctly with many evidence types.
- Methods to harmonise the gene and concept label displaying (#604).
- Compatibility with Neo4j 4.4.
- Heavy code refactoring, cleaning, etc for `KnetMinerServer`, `KnetMinerDataSource` and `OndexLocalDataSource`.
- UI's Javascript refactoring (#621).

## KnetMiner.com website updates
- Tutorial is now a searchable and Google indexed [Tutorial](https://knetminer.com/tutorial).
- Release notes are now available on [KnetMiner.com/release_notes](https://knetminer.com/release_notes).
- Added [MailChimp](https://mailchimp.com/en-gb/?currency=GBP) support.
- Changed product offering page to [KnetMiner.com/products](https://KnetMiner.com/products).
- Added several new paid and free species products to the [KnetMiner products page](https://KnetMiner.com/products).
- Added website-wide pop up to [KnetMiner.com](https://knetminer.com).
- Added several new publications [citing KnetMiner](https://KnetMiner.com/publications).
- Updated [KnetMiner.com/About](https://KnetMiner.com/about).
- Updated email for general queries to hello@knetminer.com.

## Misc
- We are now on [Twitter](https://twitter.com/KnetMiner), [LinkedIn](https://www.linkedin.com/company/knetminer/) and [Instagram](https://www.instagram.com/knetminer/)
- We've made a [KnetMiner introduction video](https://www.youtube.com/watch?v=F8OYhzWQn5Q).

<br>

# 5.0

## What's new?

KnetMiner 5.0 comes with a number of new features, speed improvements and a new freemium/premium version.

## Key Features
1. KnetMiner (https://knetminer.com) now also offers a range of Free and Pro features. The free version is a perfect starting point for using or testing the platform with a small number of genes. The Pro version enables searching the knowledge graph with any number of genes, creating very large gene networks and storing as many networks as you wish. 
2. The gene list search feature has received a major performance enhancement. It now supports wildcards (eg. search for all TPS* genes) and can perform a novel KG enrichment analysis. <img width="939" alt="wheat_genelist_wildcard_search" src="https://user-images.githubusercontent.com/1078989/134174683-a7970f2f-8eda-455c-afad-54ace9632d58.png">

3. The Evidence View has seen major upgrades to allow users download the content and to generate gene networks for multiple enriched terms. <img width="938" alt="wheat_evidenceview_new3" src="https://user-images.githubusercontent.com/1078989/134176807-8a07872f-17a3-4c73-9f84-5609849b5183.png">

4. The Network View has been vastly improved as well, with auto-filtering when the knetworks are too big and a new feature to export the content of the network (all visible genes) as a table. <img width="939" alt="wheat_knetmaps2_new" src="https://user-images.githubusercontent.com/1078989/134176826-e70b1729-817f-4b52-89cf-c26aed6d4e2e.png">

5. The network visualisation (knetmaps.js) has been enhanced with better node labelling to highlight important parts of the graph and to distinguish genes from different species by taxID. A new type of edge (dashed lines) has also been introduced to flag relationships which need to be treated with caution. <img width="941" alt="wheat_knetmaps_alsonew" src="https://user-images.githubusercontent.com/1078989/134179239-efcdb4fa-230d-4c96-adb4-d7ff27cec23c.png">

6. KnetMiner generated gene networks can be easily saved to KnetSpace (https://knetminer.com/beta/knetspace/) and shared with colleagues and published online. <img width="889" alt="wheat_knetspace" src="https://user-images.githubusercontent.com/1078989/134176872-017109de-bc64-40f4-aa8f-af736bc67438.png">


References and further details:
1. Latest KnetMiner publication: https://onlinelibrary.wiley.com/doi/10.1111/pbi.13583
2. KnetMiner covid19 data note: https://f1000research.com/articles/10-703/v1

## Software improvements and bug fixes

### Search and analysis
 * Free and Pro KnetMiner features added. Free users are those without a KnetSpace account or those on a KnetSpace `Free` Plan wile Pro users are subscribers of the KnetSpace Pro plan. Under the free version, users can search KnetMiner with upto 20 genes in their gene list and visualize a knetwork of max. 10 genes. Pro users can search KnetMiner with no limits on gene list size and can render knetworks to analyse upto 200 genes at once.
 * Search results messages now show detailed information such as number of linked, unlinked and not-found user genes based on user query and gene list, and also the time taken for the query to run.
 * Error messages now return more detailed and user-friendly information.
 * Users can now directly add/omit evidence terms to their search box from Evidence View.
 * Evidence view table can now be downloaded by users as a tab-delimited file.
 * Users can render a combined knetwork of multiple evidence terms from Evidence View.

### KnetMiner API
 * New **explainer** implemented for KnetMiner genepage API that analyses the user query to generate a word summary of what the resulting knetwork contains.
 * KnetMiner knowledge graph (dataset) version now added to `latestNetworkStats` API to have it displayed in release_notes html page.

### KnetMiner back-end
 * Migration to Java 11. **Now you do need Java >= 11 to make knetminer work** If you use Docker, our images use the right Java version automatically.
 * Big refactoring of the `OndexServiceProvider` component.
 * Wildcards now supported in the Gene List Search box (eg, 'MYB*', 'TT?')
 * knetminer-base image removed, now there are only `two` docker image levels.
 * Migration from Travis to GitHub Actions for CI builds.
 * KnetMiner now allows developer users to enable/disable knetspace login in their KnetMiners, and to enable/disable or **re-route** google **analytics** (keywords, gene lists, QTLs) to an Amazon S3 bucket as a set of useful metrics for internal analysis.
 * Extensive review of the codebase file structure and names.
 * Third-party dependency updates.

### Network View (KnetMaps.js)
 * Users can now export all visible genes and associated information as a tab-delimited file
 * Network View now auto-filters large knetworks to let users visualize subsets and avoid browser issues.
 * The network visualization now has more advanced node labelling to highlight important parts of the graph and to distinguish genes by taxID as well, by coloring gene node labels appropriately, which is highly useful for multi-species KGs. 
 * Network visualization now uses "dashed" edges to flag relationships that are not abdolute and need to be treated with caution.
 * Multiple new data sources hyperlinks added/updated to enable users to explore ARA-GWAS, ENSEMBL_PLANTS, wheat-expression, ARA-PHENO and other sources.

### Other updates
 * KnetMiner wiki (https://github.com/Rothamsted/knetminer/wiki) updated with new instructions for developers.

## Poaceae multi-species knowledge graph
A new multi-species poaceae knowledge graph (KG) integrates a vast amount of: genetic, genomic and literature data from the four most important global cereal crops: wheat, rice, maize, barley, combined with the model plant species Arabidopsis and Brachypodium. We have cleaned, processed, and integrated over 100 datasets which has resulted in a KG of 2 million nodes and 10 million relationships between them. This KG is available through through a paid KnetMiner resource subscribtion (request quote) and our free RDF-SPARQL and Neo4j-Cypher graph query endpoints (https://knetminer.com/data).


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
