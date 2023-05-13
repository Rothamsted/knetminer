// TODO: table-handler.js is a meaningless name, rename it to something like
// table-scrolling.js 
// 
// Also, 'handler' using refer to small components such as event triggers, 
// connection stream readers, cache update functions. Here, it could be name handler, but 
// manager is maybe more appropriate. Apart from this, the problem is that 'scroll' was missing
// from names
//    

class InfiniteScrollManager
{
	#tableData = null
	#tableId = null
	#tableBodyGenerator = null 
	
	#page = 0
	
	#pageSize = 30
		
	constructor ( tableId, tableBodyGenerator )
	{
		if ( this.constructor === InfiniteScrollManager ) 
			throw new TypeError ( "Can't instantiate abstract class InfiniteScrollManager" )
			
		if ( !( typeof tableId == 'string' || tableId == "" ) ) throw TypeError ( 
			"Can't set InfiniteScrollManager with null, empty or non string tableId" 
		) 
		if ( typeof tableBodyGenerator == 'function' )
		
		this.#tableId = tableId
		this.#tableBodyGenerator = tableBodyGenerator
	}
		
	getTableId ()
	{
		return this.#tableId
	}
	
	
	setTableData ( tableData ) 
	{
		if ( !Array.isArray ( tableData ) ) throw new TypeError ( 
			"Can't set InfiniteScrollManager with null or non-array table" 
		) 
		
		this.#tableData = tableData
		this.setPage ( 0 )
	}
	
	#validateTable () {
		if ( ! this.#tableData ) throw new TypeError ( 
			"InfiniteScrollManager, table not set" 
		) 
	}
	
	getPageSize () {
		this.#validateTable ()
		return this.#pageSize
	}

	setPageSize ( pageSize )
	{
		this.#validateTable ()
		
		if ( pageSize < 1 ) throw new RangeError ( 
			`Invalid page size of ${pageSize}, must be a positive value` 
		)
				
		$this.#pageSize = pageSize
	}
	
	getPagesCount ()
	{
		this.#validateTable ()
		return Math.ceil ( this.#tableData.length / this.#pageSize )
	}
	
	
	getPage () {
		this.#validateTable ()
		return this.#page
	}

	setPage ( page )
	{
		this.#validateTable ()
		const pagesCt =  this.getPagesCount ()
		if ( page >= pagesCt ) throw new RangeError ( 
			`Invalid page value #${page} for table '${tableId}', which has ${pagesCt}` 
		)
		
		this.#page = page
	}


	hasNextPage () {
		this.#validateTable ()
		return ( this.#page + 1 ) < this.getPagesCount ()
	}

	goNextPage ()
	{
		this.#validateTable ()
		this.setPage ( this.#page + 1 )
		return this.getPage ()
	}

	
	getPageStart ()
	{
		this.#validateTable ()
		return this.#page * this.#pageSize
	}
	
	getPageEnd ()
	{
		this.#validateTable ()
		
		const result = ( this.#page + 1 ) * this.#pageSize
		return Math.min ( result, this.#tableData.length ) 
	}
	
	setupScrollHandler ()
	{
		this.#validateTable ()
		
		const jqTable = $(`#${ this.#tableId }` )
		var timer = null
		
		// Else, they're not visible below
		const tableData = this.#tableData
		const tableBodyGenerator = this.#tableBodyGenerator
		
		jqTable.scroll ( () => {
			// Clear/set used to throttle the scroll event firing:
			// https://stackoverflow.com/a/29654601/529286
			// The scroll event clears any previous timeout for a while, nothing happens until the 
			// delayed timeout handler fires too.
			//
			clearTimeout ( timer )
			
			timer = setTimeout ( () => 
			{
				// TODO: can't we use jqTable here?
				const tableElem = document.getElementById ( this.getTableId () ); 
				const needsMoreRows = tableElem.scrollTop + tableElem.offsetHeight >= tableElem.scrollHeight
				if ( !needsMoreRows ) return
				if ( !this.hasNextPage () ) return
				
				this.goNextPage ()
				tableBodyGenerator ( tableData, true )
			}, 300 ) // setTimeout
		}) // scroll()
	} // scrollHandler ()
}

class GenesTableScroller extends InfiniteScrollManager
{
	constructor () {
		super ( 'geneViewTable', createGeneTableBody )
	}
}

class EvidenceTableScroller extends InfiniteScrollManager
{
	constructor () {
		super ( 'evidenceViewTable', createEvidenceTableBody )
	}
}

const genesTableScroller = Object.freeze ( new GenesTableScroller () )
const evidenceTableScroller = Object.freeze ( new EvidenceTableScroller () )


/**
 * TODO: remove, replaced by the classes and objects above.
 * 
 * function handles scroll events for Geneview and Evidence view tables.
 * 
*/
const _tableHandler = function(){

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


/** 
 * TODO: I wrote this to run them manually, needs to be rewritten for Jasmine and integrated 
 * into Maven with the Jasmine plug-in
 *  
 */
// Provisionally set it to true when you want test. DO NOT COMMIT TRUE!!!
const doTest = false
if ( doTest )
{
	// function createGeneTableBody () {}
	
	const testTable = Array ( 100 ).fill ( [ 'fooRowValue' ] )
	genesTableScroller.setTableData ( testTable ) 
	
	console.assert ( genesTableScroller.getPageSize () == 30, "page size wrong!" )
	console.assert ( 
		genesTableScroller.getPagesCount () == Math.ceil ( testTable.length / 30 ), "pages count wrong!"
	)
	console.assert ( 
		genesTableScroller.getPagesCount () == Math.ceil ( testTable.length / 30 ), "pages count wrong!"
	)
	console.assert ( genesTableScroller.getPageStart () == 0, "page start wrong!" )
	console.assert ( genesTableScroller.getPageEnd () == 30, "page end wrong!" )
	
	genesTableScroller.setPage ( 2 )
	console.assert ( genesTableScroller.getPageStart () == 30 * 2, "page start at page 2 is wrong!" )
	console.assert ( genesTableScroller.getPageEnd () == 30 * 3, "page end at page 2 is wrong!" )
	
	console.assert ( genesTableScroller.hasNextPage (), "hasNextPage() is wrong!" )
	console.assert ( genesTableScroller.goNextPage () == 3, "goNextPage() is wrong!" ) 
	console.assert ( genesTableScroller.getPage () == 3, "getPage () after goNextPage() is wrong!" ) 
	
	genesTableScroller.setPage ( genesTableScroller.getPagesCount () - 1 )
	console.assert ( genesTableScroller.getPageEnd () == testTable.length, "page end at pageCount is wrong!" )
	console.assert ( !genesTableScroller.hasNextPage (), "hasNextPage() at last page is true!" )
}
