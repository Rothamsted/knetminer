/**
 * Util Object handles geneview and evidence table data state management and concept filtering.
 * 
 * @param {displayOn} a boolean
 * 
 * TODO: where is displayOn used? Is it still used? Update the comment accordingly 
 * (and remove this TODO too).
 */
let conceptFilter =  {

    table :[],
    tableId:'', // Stores tableId for the gene or evidence views
    selectedKeys:[], //Stores strings of currently selected concept
    filtered:false, // Boolean check for geneview table data aiming to see if additional filters (graphDistance and knetscore filters) have been triggered. 
    /**
     * Saves table data and tableId which are used by methods present in parent  and children objects (conceptFilter, geneViewConceptFilter and evidenceViewConceptFilter)
     * @param {*} tableData table data passed to setup for purpose of state management 
     * @param {*} tableId table Id used to check the current view the user is on (currently targeting gene and evidence views)
     */
    setup(tableData, tableId){
        this.table = tableData
        this.selectedKeys = []; 
        this.tableId = tableId
    },
    //  function updates, store and checks for non-active legend keys
    updateKeys (concept, event){

        $(event).toggleClass('active-legend');

        const isConceptActive = $(event).hasClass('active-legend')
        var conceptIndex = this.selectedKeys.indexOf(concept);
        
        if(isConceptActive){
            this.selectedKeys.push(concept)
        }else if(conceptIndex >= 0){
            let updatedKeys = this.selectedKeys;
            updatedKeys.splice(conceptIndex, 1);

            this.selectedKeys = updatedKeys; 
        }

    },
    // Filters gene or evidence table by the selected Concept Type (coming from the legend).
    /**
     * 
     * @param {*} concept the concept type ID from the legend to be used as filter key
     * @param {*} element target element object used to attach active class to current filtered concept 
     * @param {*} rowFilterPredicate a function (selectedTypes, tableRow) => boolean tells if the
 *        concept type(s) associated to a target table row are selected by the current selection
 *        from the legend, selectedTypes. The criteria are different for the two tables, see the
 *        invocations below.
     * @param {*} renderingFun either createFilteredGenesTable or createFilteredEvidenceTable, see below
     * @param {*} resetFun Resets GenesTable and evidenceTable table
     * @returns 
     */
    filterTable(concept,element,rowFilterPredicate, renderingFun, resetFun){
        this.updateKeys(concept,element)

        try{

            if ($('#'+this.tableId).css('display') !== 'block') return 

            const selectedConcepts = this.getConceptKeys(); 
    
            if(!selectedConcepts.length) {
                resetFun()
                return 
            }


        // Select what required, using the helper
            const filteredTable = this.table.filter ( row => rowFilterPredicate ( selectedConcepts, row ) )
        
           if (filteredTable.length > 0){
            renderingFun ( filteredTable, this.tableId )
           }
        }catch(error){
            console.error ( "Error while selecting from concept legend", error );
        }
    },
    getConceptKeys(){
        return this.selectedKeys
    }, 
    setConceptKeys(keys){
        this.selectedKeys = keys
    }, 

   
    

}

/**
 * Extends concept filter util object to manage geneView table concept filter state management
 */
let geneViewConceptFilter = {
    ...conceptFilter,

    async filterGeneTableByType ( event, conceptType )
    {
        this.updateKeys(conceptType,event)
        try{
            geneTableFilterMgr.filterByDistanceAndScore(null);
        }catch(error){
            console.log("Error while selecting from concept legend",error)
        }
    },
    rowFilterPred( selectedTypes, tableRow )
    {
        const { conceptEvidences } = tableRow
        if ( !conceptEvidences ) return false // just in case
        // Splits the gene evidences string in the gene table into an array of evidences. 
    // See the API for details about this format
    
    const rowEvidences = Object.keys ( conceptEvidences )
    return selectedTypes.every ( t => rowEvidences.includes ( t ) ) 
    },
    resetTable(){
        if(conceptFilter.filtered){
            geneTableFilterMgr.filterGeneTable(null); 
        }else{
            document.getElementById("revertGeneView").click();
        }

    },
    filterbySelectedConcept(tableData){

        if ($('#'+this.tableId).css('display') !== 'block') return 
        const selectedConcepts = this.getConceptKeys(); 

        // Select what required, using the helper
        const filteredTable = tableData.filter ( row => this.rowFilterPred ( selectedConcepts, row ) );

        // Checks if filteredTable length is less than 0 to show no filter found message
        geneTableFilterMgr.toggleTableState(filteredTable.length )
            if (filteredTable.length > 0 ){
                    genesTableScroller.setTableData (filteredTable);
                    createGeneTableBody(filteredTable)
            }

      

    }, 
}

/**
 * Extends concept filter util object to manage evidence table concept state management
 */
let evidenceViewConceptFilter = {

    ...conceptFilter,

    async createFilteredEvidenceTable ( filteredTable )
    {
        if ( filteredTable && filteredTable.length > 0)
            evidenceTableScroller.setTableData ( filteredTable )
        
        createEvidenceTableBody ( filteredTable )
    },
    filterEvidenceTableByType ( event, conceptType )
    {
              
        this.filterTable( 
         conceptType, event, this.rowFilterPred, this.createFilteredEvidenceTable, this.resetTable
        )
    },
    rowFilterPred ( selectedTypes, tableRow ){
        return selectedTypes.some ( t => t == tableRow.conceptType )
    },
    getTableData(){
        return this.table
    },
    resetTable(){
        document.getElementById("revertEvidenceView").click();
    }, 

}

