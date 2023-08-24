// Houses knetscore slider type filter internal functionalities
const knetscoreFilterHandlers = function(){

    let minScore, maxScore; 

    // Function detects min and max knetscore values from genetable data
    function detectScoreRange(tableData){

        // gets data from parent element

        const scoreArry = []; 
        tableData.forEach(genes => {
            const score = Number(genes.score).toFixed(2); 
            scoreArry.push(score) 
        })

        // uses Math min and max method to get min and max values from genetable score property. 
        const minValue = Math.min(...scoreArry);
        const maxValue = Math.max(...scoreArry); 
        minScore = minValue
        maxScore = maxValue; 

        // sets defaults values for min and max range inputs
        setRangeInputValues(minValue, 'min')
        setRangeInputValues(maxValue, 'max')
    }
    // Function set input values for range input type called in (detectScoreRange)
    function setRangeInputValues(value, rangeType){

        $('#'+rangeType+'Value').val(value); 

        $('#score-'+rangeType).attr({
            'min':minScore,
            'max':maxScore,
            'value': value,
        })

    }

    // Gets the left range input value when an onchange event event is triggered.
    // Set style direction in percentage
    function handleLeftThumb(element){ 
        let inputValue = parseFloat($(element).val());
        const rightValue = parseFloat($('#score-max').val());

        // Check if left thumb is crossing the right thumb
        if(inputValue >= rightValue){
            inputValue = rightValue - 0.01;
            $(element).val(inputValue.toFixed(2));
        }

        $('#minValue').val(inputValue.toFixed(2));

        setScorePosition(inputValue, 'min');
    }

    // Handles onchange event for the right thumb 
    function handleRightThumb(element){
        let inputValue = parseFloat($(element).val());
        const leftValue = parseFloat($('#score-min').val());

        // Check if right thumb is crossing the left thumb
        if(inputValue <= leftValue){
            inputValue = leftValue + 0.01;
            $(element).val(inputValue.toFixed(2));
        }

        $('#maxValue').val(inputValue.toFixed(2));

        setScorePosition(inputValue, 'max');
    }

    // Adds CSS style position and coverage percentage to range slider
    function setScorePosition(inputValue, direction){
        const percentage = ((inputValue - minScore) / (maxScore - minScore)) * 100;

        if(direction === 'min') {
            $('.range-selected').css('left', percentage + '%');
        } else if(direction === 'max') {
            $('.range-selected').css('right', (100 - percentage) + '%');
        }
    }



    return{
        detectScoreRange:detectScoreRange,
        handleLeftThumb:handleLeftThumb,
        handleRightThumb:handleRightThumb,
    }

}()

// Handles creation and adding knetscore and genes distance filter modal to UI.
const geneTableFilterUi = function(){

    // Append knetscore filter to Ui
    function knetScoreFilterHtml(){

        const popup = $(`
        <div class='knetscore-view'>

            <form id="knetScore-Form">
                <div class='distance-unit'>

                <div class='score-range-container'>

                    <div class='score-class'>
                        <div class="range-slider">
                            <span class="range-selected"></span>
                        </div>

                        <div class='slider-container'>
                        <input oninput='knetscoreFilterHandlers.handleLeftThumb(this)' data-direction='left' class='score-range' id='score-min' type='range' step='0.01'/>
                        <input data-direction='right' oninput='knetscoreFilterHandlers.handleRightThumb(this)' class='score-range' id='score-max' type='range' step='0.01'/>                      
                        </div>

                    </div>

                    <div class='score-value-container'>
                        <input id='minValue' type='number' readonly/>
                        <input id='maxValue' type='number' readonly/>
                    </div>

                </div>
                </div>
            </form>


            <div class='distance-unit distance-button'>
            <button data-id="knetscore" onclick="geneTableFilterMgr.filterByDistanceAndScore(event)" class='knetscore-button'>Apply</button>
            </div>

        </div>`);

        $('#knetscore-filter').append(popup); 
    }

    // Function appends graph distance filter HTML element
    function graphDistanceFilterHtml(){

        const distanceLimit = 8  // number could be dynamic 

        let ui = `<div class="distance-view"><div class="filter-header" >
                <label>Distance:</label>
                    <select id="select-distance">`
        for(let index = 0; index < distanceLimit; index++){
            ui += `<option value='${index + 1}' ${index === 7 ? 'selected': ''}>${index + 1}</option>`
        }
        ui += `</select></div>
                <div class="filter-footer">
                <span onclick="resetTable()">Reset</span>
                <button data-id="distance" onclick="geneTableFilterMgr.filterByDistanceAndScore(event)" type="button">Apply</button>
                </div></div>`;

        $("#evidence-filter").append(ui)
    }

    // Renders genetable Ui filter function
    function renderFilterUis(){
        graphDistanceFilterHtml()
        knetScoreFilterHtml()
    }

    return {
        renderFilterUis:renderFilterUis
    }
    
}()


// Handles genes distance and knetscore filters 
const geneTableFilterMgr = function() {

    let tableData = null
    let scoreMin = null; 
    let scoreMax = null; 
    let distance = null;

   return { 
        // saves geneview table
        saveTableData:function(data){
                tableData = data;
                knetscoreFilterHandlers.detectScoreRange(data); 
        },
        renderFilteredTable: function (table){
            genesTableScroller.setTableData (table)
            createGeneTableBody(table) 
        },
        // handles knetscore filtering
        filterByDistanceAndScore: function (event)
        {   
            const element = event.target;
            const data = [...tableData];
        
            event.preventDefault();
            toggleFilterIcons(element); 
        
            distance = $('#select-distance option:selected').val();
            scoreMin = Number($('#score-min').val()); 
            scoreMax = Number($('#score-max').val()); 
        
            let filteredData = [];
        
            // Filter through data 
            for(let gene of data ){
                // Deep clone the gene object to ensure we don't modify the original data
                let geneClone = JSON.parse(JSON.stringify(gene));
        
                const score = Number(geneClone.score).toFixed(2);
        
                // Checks if the gene's score falls within the selected range (inclusive of the range boundaries)
                const isScoreInRange = ((score >= scoreMin ) && (score <= scoreMax) );
        
                let concepts = geneClone.conceptEvidences;
        
                for(let concept in concepts ){
                    
                    let evidence = concepts[concept].conceptEvidences;
        
                    evidence = evidence.filter( item => item.graphDistance <= distance);
        
                    // Update the evidence list for the concept
                    concepts[concept].conceptEvidences = evidence;
                    
                    if(!evidence.length){
                        delete concepts[concept]; 
                    } 
                }
                // checks if object.Keys has length
                const isConceptEmpty = Object.keys(concepts).length;
                if(isConceptEmpty > 0 && isScoreInRange) {
                    filteredData.push(geneClone);
                }
            }
        
            if(filteredData.length){
                geneTableFilterMgr.renderFilteredTable(filteredData);
            }
        
            geneTableFilterMgr.toggleTableState(filteredData.length);
        },
        // toggle table state when filtered data length is equal to zero. 
        toggleTableState:function(dataLength){
            if(dataLength <= 0)$('#filterMessage').text('Your filter is returning no results');

            $('#filterMessage').toggleClass('show-block',dataLength <= 0); 
            $('#geneTableBody').toggleClass('hide',dataLength <= 0);
        } 
    }
}()
