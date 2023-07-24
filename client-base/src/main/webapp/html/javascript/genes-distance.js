
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


        // TO VERIFY IF THIS NEEDED WITH ARNE
        // I noticed there is a glitch in the positioning and functionality of both range inputs when the gap betweeen max and min score is less than 3 
        // if gap between min and max range type is less or equals to 3, knetscore filter button is not shown
        const rangeDifference =  Math.round(maxValue - minValue ); 
        $('.legends-filter-button').toggleClass('hide', rangeDifference <= 3); 


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

        const inputValue = $(element).val()
        $('#minValue').val(inputValue);

       const positionInPercentage = Number(inputValue)/maxScore * 100 + '%';
       setScorePosition(element, positionInPercentage);

    }

    // Handles onchange event for the right thumb 
    function handleRightThumb(element){

        const inputValue = $(element).val(); 
        $('#maxValue').val(inputValue);

       const positionInPercentage = 100 - (Number(inputValue)/maxScore) * 100 + '%';
       setScorePosition(element ,positionInPercentage);

    }

    // Adds CSS style position and coverage percentage to range slider
    function setScorePosition(element,rangePosition){
            const position = $(element).attr('data-direction')
            $('.range-selected').css(position,rangePosition);
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
                            <input onchange='geneDistance.handleLeftThumb(this)' data-direction='left' class='score-range' id='score-min' type='range'/>
                            <input data-direction='right' onchange='geneDistance.handleRightThumb(this)' class='score-range' id='score-max' type='range'/>
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

        // filter through data 
        for(let genes of table ){
            const score = Number(genes.score).toFixed(2);

            // check number that is not higher than max and not lesser than the min.
                const isScoreInRange = ((score > scoreMin ) && (score < scoreMax) )

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
