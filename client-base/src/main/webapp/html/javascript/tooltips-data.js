// function returns a JSON object containing the tooltip data for the various tooltips in the UI
function getToolTipsData(){
    return {
        "hintSearchQtlGenome":["Select the 'whole-genome' option to search the whole genome for potential candidate genes or select the 'within QTL' option to search for candidate genes within the QTL coordinates."],
        "hintEnterGenes":["Input a list of target genes using reference gene ID's."], 
        "hintQuerySuggestor":["Add, remove or replace terms from your query using the list of suggested terms based on your search criteria"], 
        "knetScore":["The KnetMiner Gene Rank score published in <b>Hassani-Pak et al 2021</b>. The score is not normalised.", "knetscorehint"],
        "accessionInfo":["<p>Genes in the current Knowledge Graph related to your Evidence of interest.</p>", "knetscorehint"], 
        "pvalue":["<p>Calculated using Fisher's exact test across all Species in dataset.</p>", "knetscorehint"], 
        "genelistHint":["<p>Genes in your list with a valid path to this graph node.</p>",
        "knetscorehint"],
        "genesHint":["<p>Genes in KG with a valid paths to this graph node.</p>","knetscorehint"]
    }
}  



