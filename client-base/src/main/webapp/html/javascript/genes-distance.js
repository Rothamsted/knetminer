
// houses knetscore slider type filter internal functionalities
const knetscoreFilter = function(){

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

    // Append Filters
    function appendFilterToUi(){

        const popup = $(`
        <div id='knetscore-view' class='view'>

            <form id="knetScore-Form">
                <div class='distance-unit'>

                <div class='score-range-container'>

                    <div class='score-class'>
                        <div class="range-slider">
                            <span class="range-selected"></span>
                        </div>

                        <div class='slider-container'>
                        <input oninput='knetscoreFilter.handleLeftThumb(this)' data-direction='left' class='score-range' id='score-min' type='range' step='0.01'/>
                        <input data-direction='right' oninput='knetscoreFilter.handleRightThumb(this)' class='score-range' id='score-max' type='range' step='0.01'/>                      
                        </div>

                    </div>

                    <div class='score-value-container'>
                        <input id='minValue' type='number' readonly/>
                        <input id='maxValue' type='number' readonly/>
                    </div>

                </div>
                </div>

                <div class='distance-unit distance-buttons'>
                    <button onclick="geneTableFilterMgr.filterByKnetScore(event)" class='filter-button'>Apply</button>
                </div>

            </form>

        </div>`);

        $('#filters').append(popup); 
    }

    return{
        detectScoreRange:detectScoreRange,
        appendFilterToUi:appendFilterToUi,
        handleLeftThumb:handleLeftThumb,
        handleRightThumb:handleRightThumb,
    }

}()

// Handles evidence and knetscore filters 
const geneTableFilterMgr = function() {

    let tableData = null

   return { 
        // saves geneview table
        saveTableData:function(data){
                tableData = data;
                knetscoreFilter.detectScoreRange(data); 
        },
        renderFilteredTable: function (table){
            genesTableScroller.setTableData (table)
            createGeneTableBody(table) 
        },
        // hnadles knetscore filtering
        filterByKnetScore: function (event)
        {

            event.preventDefault();

            const scoreMin = Number($('#score-min').val()); 

            const scoreMax = Number($('#score-max').val()); 


            let filteredData = []

            // Filter through data 
            for(let genes of tableData ){
                const score = Number(genes.score).toFixed(2);

                    // Checks if the gene's score falls within the selected range (inclusive of the range boundaries)
                    const isScoreInRange = ((score >= scoreMin ) && (score <= scoreMax) )

                    if(isScoreInRange) filteredData.push(genes)
            }

            if(filteredData.length) geneTableFilterMgr.renderFilteredTable(filteredData)

            if(!filteredData.length)$('#filterMessage').text('Your filter is returning no results')
            $('#filterMessage').toggleClass('show-block',!filteredData.length); 
            $('#geneTableBody').toggleClass('hide',!filteredData.length);
        
        },
        // handles graph distance filtering
        filterByGraphDistance: function()
        {
            const distance = $('#select-distance option:selected').val()
            const filteredData = []
            const data = [...tableData]
        
            data.forEach(genes => {
        
                let concepts = genes.conceptEvidences
        
                for(let concept in concepts ){
                    
                    let evidence = concepts[concept].conceptEvidences;
                    evidence = evidence.filter( item => item.graphDistance > distance)
        
                    if(!evidence.length){
                        const newObject = Object.assign({},concepts)
                        delete newObject[concept]; 
                        concepts = newObject;
                    } 
                }
                // checks if object.Keys has length
                const isConceptEmpty = Object.keys(concepts).length
                if(isConceptEmpty > 0 ) filteredData.push(genes)
                
            })
        
            if(filteredData.length) geneTableFilterMgr.renderFilteredTable(filteredData)
        
            $('#filterMessage').text('Your filter is returning no results');
            $('#filterMessage').toggleClass('show-block',!filteredData.length); 
            $('#tablesorter').toggleClass('hide',!filteredData.length);
        }
    }
}()
