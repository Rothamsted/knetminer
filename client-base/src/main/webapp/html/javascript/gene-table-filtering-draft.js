/**
 * An outline of how to re-arrange the gene table filters.
 * 
 * WARNING!!! THIS IS NOT VALID Javascript code, but Js-like pseudo-code!
 * DO NOT INCLUDE IT ANYWHERE
 * 
 * TODO: Remove after use 
 */


/**
 * The abstract filter. All the filters should comply with this class. The filter consumer 
 * (ie, GeneTableFilterManager below) should see these methods only and never attempt to access
 * details in the subclasses below
 * 
 * See here about emulating abstract classes and methods in Js:
 *   https://stackoverflow.com/a/48428063/529286 
 */
abstract class GeneTableFilter
{
	// This is available to the subclasses, but not to the outside
	#geneTable = []
	
	// See below, this is also available to all subclasses
	#containerId 
	
	GeneTableFilter ( containerId )
	{
		this.#containerId = containerId
	}
	
	// Gets the 
	setGeneTable ( geneTableData ):
	  this.#geneTable = geneTableData 
	  
	// To be used for identifying UI elements related to a filter type (see below).
	getId()
	
	// Does everything that concerns drawing the UI component to be used to set filter parameters.
	// 
	// This includes filter-specific buttons, such as the type buttons in the types filter, or 
	// 'Apply' in the score slider.
	//
	// All those buttons should have something like: `onclick = ${containerId}.applyFilters()`
  //
	renderUI ()

  // Draws a filter switch button, eg, [KnetScore Filter] This should have:
  //   `onclick = ${containerId}.toggleFilterUI ( '${this.getId()}' )`
  //
  renderSwitchUI ()
  
	
	// Determines how a filter selects a row, using parameters it got from the element generated
	// by renderUI()
	boolean isRowSelected ( geneRow )
}

class KnetScoreFilter extends GeneTableFilter
{
	getId ():
	  return "scoreGeneFilter"
	
	renderUI ():
	  // Draw the slider for the score filter. If needed, define and use private methods
	  // in this class to deal with the specifics of this filter, eg, #getScoreRange()
	  
	  // As said above, DO NOT make the manager depend on anything specific of a subclass
	  
  renderSwitchUI ():
    // specific code to render the score button.
  
	boolean isRowSelected ( geneRow ):
	  // uses the currently-selected range in the slider and check if the current gene row's score
	  // matches.    
}

class GraphDistanceFilter extends GeneTableFilter
{
	getId ():
	  return "distanceGeneFilter"
	
	renderUI ():
	  // Draw the distance selector, defining whatever private stuff you need in this class 
	  // As said above, DO NOT make the manager depend on anything specific of a subclass
	  
	renderSwitchUI(): 
	  // As above  
	  
	boolean isRowSelected ( geneRow ):
	  // uses the currently-selected distance and compares it to the distances in geneRow
}

...

class GeneTableFilterManager
{	
	#filters = []
	#geneTable
	
	GeneTableFilterManager():
	   // initialises all the filters we manage
	   myid = this.getId ()
	   this.#filters = [ new KnetScoreFilter( myid ), GraphDistanceFilter( myid ), ... ]
	
	// Used to identify the UI components that correspond to this
	getId ():
	  return "geneTableFilterMgr"	
	
	setGeneTable ( geneTableData ):
	  this.#geneTable = geneTableData
	  for filter in filters:
	    filter.setGeneTable ( geneTableData )
	
	renderUI ():
	  // Do: render filters container opening for all the filters, eg, <div>
	  for each filter in filters:
	    // Do: render the filter-specific container, use filter.getId()
	     
	    // Do: Somewhere in a container HTML element, invoke:
	    filter.renderSwitchUI()
	    // Do: do the same for this:
	    filter.renderUI ()	    
	  }
	  // Do: render filters container closure if needed, eg, </div>
	  
	  // Switch to the first filter (if needed)
	  toggleFilterUI ( filter [ 0 ].getId () )
	  
	toggleFilterUI ( filterId )
		// Do: Based on how the canvas in renderUI() are built, 
		// uses filterId to switch the UI to given filter, eg, 
		// changes a CSS 'display' field for the container "filterContainer" + filterId
	  
	// Applies all the filters in #filters to a given row
	boolean isRowSelected ( geneRow ):
	  for each filter in filters:
	    if !filter.isSelected ( geneRow ): return false
	  return true 
  
  // Filters the input table (or the table set via setGeneTable() if no param is given)
  // by using isRowSelected() for each row
  // This DOES NOT deal with any UI filter application button, keeping the two seaparated
  filterTable ( geneTable = this.geneTable ):
    return geneTable.filter ( isSelected )

  // Manages the filter application execution, this is the onClick handler in the UI buttons 
  // (see GeneTableFilter.renderUI()) 
  applyFilters ():
    this.setGeneTable ( filterTable () ) // no param, uses the current table
    this.renderUI()
    // Do: re-render the gene table using this.#geneTable, have a single method for this 
    // outside here and call it
}


/* 

Note: you might want a different behaviour: every filter application reset everything to the
original table and always applies to it.
  
If that's the case, change outlined manager this way:
  
1) turn #filters into a dictionary of id => filter. Use the constructor for doing this:

filter = [ new KnetScoreFilter( myid ), GraphDistanceFilter( myid ), ... ]
this.#filters = filters.map ( f => { f.getId(): f } )   

2) Introduce #currentFilterId

3) toggleFilterUI() updates 2)

4) isRowSelected uses #filters [ #currentFilterId ] only and starts from the original table.

5) applyFilters() doesn't do this.setGeneTable ( filterTable () ), but it still triggers the
   gene table re-rendering.

*/