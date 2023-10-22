
# Genetable filter doc

This documentation aims to show you how Knetminer genes table filters work. It showcases the code structure in `gene-table-filter.js`. 

## Genes-table-filtering.js 
This file contains the JavaScript scripts that handle the knetscore and graph distance filters present in the knetminer's gene view. It houses three Objects: `knetscoreFilter`, `graphDistanceFilter` and `geneTableFilterMgr`, and can be found [here][10]

KnetScoreFilter object handles the functionalities associated with gene view knetscore filter.
```
// Detects min and max knetscore values from genetable data.
detectRange (tableData)
{
    ...
}

// Sets min & max range values after both values are detected in detectRange() above.
setRangeValue(value, rangeType)
{
    ...
}

// Handles on change event triggered when left thumb of gene view slider is triggered.
// Takes min input HTML object as paramter
handleLeftThumb(minElement)
{
    ...
}

// Handles on change event triggered when right thumb of gene view slider is triggered.
handleRightThumb(maxElement)
{
    ...
}

//Method takes input value and direction (max or min) to show slider coverage.
setScorePosition (inputValue, direction)
{
    ...
}

// Renders knetscore slider to knetminer UI.
renderUi()
{
    ...
};
```

graphDistanceFilter object houses methods handling functionalities associated with gene view graph distance filter.
```
    // MaxNumber property used for comparison reasons to check for maximum distance within genetable data.
    maxNumber : -Infinity

    // Sets the maximum graph distance value from genetable data.
    detectRange(tableData)
    {
        ...
    }
    // Creates HTML select element based maximum graph distance.
    createSelectElement(){
        ...
    }
    // Renders graph distance drop-down element to knetminer UI.
    renderUi()
    {
        ...
    }

```

geneTableFilterMgr object handles management of graph-distance and knetscore filters. 
```
// TableData property used to store the genetable data.
tableData:[]

// Saves table data
setup(data)
{
    ...
}
// Method renders graph-distance and knetscore filters to UI and called in setup() above.
renderFiltersToUi()
{
    ...
}

// Method handle events triggered by change to graph distance and Knetscore input values. 
filterByDistanceAndScore(event)
{
    ...
}

// Method renders filtered table, called above.
renderFilteredTable(table)
{
    ...
}

// Toggle visibility of gene view table body based on length filtered table 
// When the filtered table length is less than one, the table body is not visible.
// Called in filterByDistanceAndScore().
toggleTableState(dataLength){
    ...
}
```

[10]: https://github.com/Rothamsted/knetminer/blob/master/client-base/src/main/webapp/html/javascript/genes-table-filtering.js#L133

