// See init-utils.js
if (TEST_MODE) {
	// This is used at the end of the hereby file
	// Stubs to be able to test without having to load anything else in Node.js
	// Normally I keep this disabled cause it interferes with my IDE.
	function createGeneTableBody () {}
	function createEvidenceTableBody () {}
}

/**
 * An helper to manage table infinite scrolling and paging.
 * 
 * It has a {@link setupTableScroller scroll event handler} and methods to manage a table 
 * pagination view.
 * 
 * We currently use with the gene and evidence table, but the design is generic enough to be
 * able to support virtually any table.
 * 
 * @author Marco Brandizi
 * 
 * @since 5.7 (2023-05-14)
 * 
 */
class InfiniteScrollManager
{
	#tableData = null

	/**
	 * The HTML ID of the element that represents the table we manage.
	 * 
	 * This is used by the {@link setupTableScroller scroll event handler}.
	 * 
	 * We don't expose this to the outside, since we don't want this class to deal with 
	 * the non-pertinent concern of holding its table reference for others.
	 * 
	 * Also, this is table-type specific and set by subclasses, by invoking the constructor.
	 */
	#tableId = null

	/**
	 * The method that {@link setupTableScroller} has to use to display additional rows when necessary.
	 * 
	 * This is table-type specific and set by subclasses, by invoking the constructor.
	 * 
	 */
	#tableBodyGenerator = null 
	
	#page = 0
	
	#pageSize = 30
		
	/**
	 * This class is abstract, the constructor raises an exception if you try to 
	 * instantiate it directly. You need to define concrete sublcasses, ad done below.
	 */
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
	
	/**
	 * The 'raw data' table we have to manage. This is the array of data, not the HTML
	 * correspondant.
	 * 
	 * We don't expose this to the outside, since we don't want this class to deal with 
	 * the non-pertinent concern of holding its table reference for others.
	 * 
	 */
	setTableData ( tableData ) 
	{
		if ( !Array.isArray ( tableData ) ) throw new TypeError ( 
			"Can't set InfiniteScrollManager with null or non-array table" 
		)
		if ( tableData.length == 0 ) throw new RangeError ( 
			"Can't set InfiniteScrollManager with empty table." 
		)
		
		this.#tableData = tableData
		this.setPage ( 0 )
	}
	
	/**
	 * Internal method used pretty much everywhere, do some preliminary sanity checks (eg, 
	 * the manage table is set).
	 * 
	 */
	#validateTableData () {
		if ( !this.#tableData ) throw new TypeError ( 
			"InfiniteScrollManager, table not set" 
		) 
	}
	
	/**
	 * The page size for paging and auto-scrolling functions. Default is 30.
	 */
	getPageSize () {
		this.#validateTableData ()
		return this.#pageSize
	}

	/**
	 * It raises a RangeError if < 1
	 */
	setPageSize ( pageSize )
	{
		this.#validateTableData ()
		
		if ( pageSize < 1 ) throw new RangeError ( 
			`Invalid page size of ${pageSize}, must be a positive value` 
		)
				
		$this.#pageSize = pageSize
	}
	
	/** 
	 * The no of available pages for the current table, which, of course is obtained by
	 * dividing the table size by {@link getPageSize}.
	 * 
	 */	
	getPagesCount ()
	{
		this.#validateTableData ()
		return Math.ceil ( this.#tableData.length / this.#pageSize )
	}
	
	/**
	 * These accessors allows for moving (managing) through the different table pages to 
	 * visusalise.
	 * 
	 * As usually, this is a page index, ie, it ranges from 0 to the pages count - 1.
	 * 
	 * In Knetminer, page switching is done by the {@link setupTableScroller scroll event handler}.
	 * 
	 */
	getPage () {
		this.#validateTableData ()
		return this.#page
	}

	/**
	 * @see getPage
	 * 
	 * This raises an error if the parameter doesn't fall within 
	 * 0 and {@link getPagesCount getPagesCount() - 1}
	 */
	setPage ( page )
	{
		this.#validateTableData ()
		const pagesCt =  this.getPagesCount ()
		const tableId = this.getTableId ()
		if ( page >= pagesCt && pagesCt  ) throw new RangeError ( 
			`Invalid page value #${page} for table '${tableId}', which has ${pagesCt} page(s)` 
		)
		
		this.#page = page
	}

	/**
	 * Based on the current table, tells, if there is still one more page after the current one.
	 */
	hasNextPage () {
		this.#validateTableData ()
		return ( this.#page + 1 ) < this.getPagesCount ()
	}

	/**
	 * Helper that uses {@link setPage} to advance from the current page to the next.
	 * 
	 * Which implies it raises an exception if you're already at the last page.
	 */
	goNextPage ()
	{
		this.#validateTableData ()
		this.setPage ( this.#page + 1 )
		return this.getPage ()
	}

	/**
	 * The table row index at which the {@link getPage current page} starts. 
	 *  
	 * As usually for indices, this starts at 0.
	 * 
	 */
	getPageStart ()
	{
		this.#validateTableData ()
		return this.#page * this.#pageSize
	}

	/**
	 * The table row *limit* at which the {@link getPage current page} ends. 
	 *  
	 * As usually for indices, this is the index of the last row in the page *plus* 1. This 
	 * inclusive/exclusive range ease the use of these methods in loops and the like.
	 */	
	getPageEnd ()
	{
		this.#validateTableData ()
		
		const result = ( this.#page + 1 ) * this.#pageSize
		return Math.min ( result, this.#tableData.length ) 
	}
	
	/**
	 * Deploys the table scroll event handler that is used to rendere one more page each time the 
	 * table's scroll bar reaches the bottom. 
	 * 
	 * This uses {@link #tableId} and  {@link #tableBodyGenerator} to manipulate the current table,
	 * and the paging-related methods to establing when new rows need to be displayed and how many.
	 */
	setupScrollHandler ()
	{
		this.#validateTableData ()
		
		const jqTable = $(`#${ this.#tableId }` )
		var timer = null
		
		// Else, they're not visible below
		// #tableData also requires dynamic access, for it might change (eg, via filtering) after
		// the hereby scroll handler has been already set and the timer below launched.
		const tableId = this.#tableId
		const tableDataAccessor = () => this.#tableData
		const tableBodyGenerator = this.#tableBodyGenerator
		
		jqTable.scroll ( () => {
			// Clear/set used to throttle the scroll event firing:
			// https://stackoverflow.com/a/29654601/529286
			// The scroll event clears any previous timeout for a while, nothing happens until the 
			// delayed timeout handler below fires too.
			//
			clearTimeout ( timer )
			
			timer = setTimeout ( () => 
			{
				// TODO: can't we use jqTable here?
				const tableElem = document.getElementById ( tableId ); 
				const needsMoreRows = tableElem.scrollTop + tableElem.offsetHeight >= tableElem.scrollHeight
				if ( !needsMoreRows ) return
				if ( !this.hasNextPage () ) return
				
				this.goNextPage ()
				tableBodyGenerator ( tableDataAccessor(), true )
			}, 300 ) // setTimeout
		}) // scroll()
	} // scrollHandler ()
}

/**
 * As said above, we have specific subclasses and singletons for the gene table and 
 * the evidence table.
 */
class GenesTableScroller extends InfiniteScrollManager
{
	constructor () {
		super ( 'geneViewTable', createGeneTableBody )
	}
}

/**
 * As said above, we have specific subclasses and singletons for the gene table and 
 * the evidence table.
 */
class EvidenceTableScroller extends InfiniteScrollManager
{
	constructor () {
		super ( 'evidenceViewTable', createEvidenceTableBody )
	}
}

/**
 * As said above, we have specific subclasses and singletons for the gene table and 
 * the evidence table.
 */
const genesTableScroller = Object.freeze ( new GenesTableScroller () )
const evidenceTableScroller = Object.freeze ( new EvidenceTableScroller () )


/** 
 * TODO: I wrote this to run them manually, needs to be rewritten for Jasmine and integrated 
 * into Maven with the Jasmine plug-in
 *  
 */
if ( TEST_MODE )
{
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
