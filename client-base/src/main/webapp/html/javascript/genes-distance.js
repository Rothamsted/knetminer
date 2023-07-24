
const geneDistance = function(){

    let table = null, minScore, maxScore; 


    // Function detects min and max knetscore values from genetable data
    function detectScoreRange(tableData){

        table = tableData

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
        const positionInPercentage = (inputValue / maxScore) * 100 + '%';  

        setScorePosition(element, inputValue, 'min');
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

        const positionInPercentage = 100 - (inputValue / maxScore) * 100 + '%';
        $('#maxValue').val(inputValue.toFixed(2));

        setScorePosition(element, inputValue, 'max');
    }

    // Adds CSS style position and coverage percentage to range slider
    function setScorePosition(element, inputValue, direction){
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
        <div id='filter-popup' class='filter-popup'>

            <form id="knetScore-Form">
                <div class='distance-unit'>

                <div class='score-range-container'>

                    <div class='score-class'>
                        <span>KnetScore:</span>
                        <div class="range-slider">
                            <span class="range-selected"></span>
                        </div>

                        <div class='slider-container'>
                        <input oninput='geneDistance.handleLeftThumb(this)' data-direction='left' class='score-range' id='score-min' type='range' step='0.01'/>
                        <input data-direction='right' oninput='geneDistance.handleRightThumb(this)' class='score-range' id='score-max' type='range' step='0.01'/>                      
                        </div>

                    </div>

                    <div class='score-value-container'>
                        <input id='minValue' type='number' readonly/>
                        <input id='maxValue' type='number' readonly/>
                    </div>

                </div>
                </div>

                <div class='distance-unit distance-buttons'>
                    <button onclick='geneDistance.resetFilter(event)'  class='no-border filter-button'>Clear All</button>
                    <button onclick="geneDistance.filterGenesByScore(event)" class='filter-button'>Apply</button>
                </div>

            </form>

        </div>`);

        $('#knetscore-container').append(popup)
    }

    // Shows filter
    function showFilter(){
        $('#filter-popup').show()
        $('.filter-overlay').show()
    }

    // Closes filter
    function closeFilter(){
        $('#filter-popup').hide();
        $('.filter-overlay').hide();
    }

    // Resets filter back to API endpoint maximum and minimum knetscore value
    function resetFilter(event){
        event.preventDefault(); 

        $('#minValue').val(minScore); 
        $('#maxValue').val(maxScore);

        $('#score-min').val(minScore)
        $('#score-max').val(maxScore)


        $('.range-selected').css({
            left:'0%', 
            right:'0%'
        })

        createGenesTable(table)
    }

    // Function  filteres genetable by checking for genes that falls within a specific knetscore range.
    function filterGenesByScore(event)
    {

        event.preventDefault();

        const scoreMin = Number($('#score-min').val()); 

        const scoreMax = Number($('#score-max').val()); 


        let filteredData = []

        // Filter through data 
        for(let genes of table ){
            const score = Number(genes.score).toFixed(2);

                // Checks if the gene's score falls within the selected range (inclusive of the range boundaries)
                const isScoreInRange = ((score >= scoreMin ) && (score <= scoreMax) )

                if(isScoreInRange) filteredData.push(genes)
        }

        if(filteredData.length) createGenesTable(filteredData)

        if(!filteredData.length){

            $('#filterMessage').text('Your filter is returning no results')
            $('#filterMessage').toggleClass('show-block'); 
            $('#tablesorter').toggleClass('hide');
        }
      

    }

    // Creates Genes Table 
    function createGenesTable(data){
        genesTableScroller.setTableData ( data )
        createGeneTableBody( data ) 
        closeFilter()
    }


    return{
        showFilter:showFilter,
        detectScoreRange:detectScoreRange,
        filterGenesByScore:filterGenesByScore,
        closeFilter:closeFilter, 
        resetFilter:resetFilter,
        appendFilterToUi:appendFilterToUi,
        handleLeftThumb:handleLeftThumb,
        handleRightThumb:handleRightThumb
    }

}()
