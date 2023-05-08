/**
 * function handles scroll events for Geneview and Evidence view tables.
*/
const tableHandler = function(){

    // Update: Tried using classes as recommended but found it diffcult to handle data changes because each instance will only have access data it was instantiated with. Currently investigating better approach as recommended. 
    var tableData

    function saveTableData(data){
        tableData = data
        var pageCount = Math.ceil(tableData.length/30)
        var itemsLength = tableData.length < 30 ? tableData.length : 30;
        
        var data =  {
            totalPage:pageCount,
            itemsLength:itemsLength
        }
    
        return data;
    }

    function scrollTable(table){

        var tableContainer = table == 'geneViewTable' ? 'resultsTable' : 'evidenceTable';
        var isTableScrollable;
        var tableElement =  $(`#${table}`);

        tableElement.scroll(function(e){
            if(isTableScrollable) return
            isTableScrollable = true; 

            // throtting to prevent hundreds of events firing at once
            setTimeout(function(){
                isTableScrollable = false; 
                
                const selectedtable = document.getElementById(table); 
                // checks if user reaches the end of page
                var tableOverflow =  selectedtable.scrollTop + selectedtable.offsetHeight >= selectedtable.scrollHeight;
                var itemsLength = $(`#${tableContainer}`).find('.count').text(); 
                var currentPage = Math.ceil(+itemsLength/30);
                var totalPage  = Math.ceil(tableData.length/30);

                    // if user reaches end of the page new rows are created
                    if(tableOverflow && totalPage !== currentPage){
                        switch(table){
                            // creates evidence table 
                            case 'evidenceViewTable':
                            createEvidenceTableBody(tableData, currentPage + 1, totalPage)
                            break;
                            // creates geneview table
                            case 'geneViewTable':
                            createGeneTableBody(tableData,currentPage+1,totalPage)
                            break;
                        }
                    }
            }, 1000)
        })
    }

    return {saveTableData, scrollTable} 
}()