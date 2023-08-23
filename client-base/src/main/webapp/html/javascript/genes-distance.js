
// houses knetscore slider type filter internal functionalities
const knetscoreFilter = function(){

    let minScore, maxScore; 

    // Function detects min and max knetscore values from genetable data
    function detectScoreRange(tableData){

        // gets data from parent element

				// TODO: use map() for mapping arrays.
        const scoreArry = []; 
        tableData.forEach(genes => {
						// TODO: what's the point with rounding them here, rather than upon visualisation?
						// Also, it's already a number, use Math.round()
            const score = Number(genes.score).toFixed(2); 
            scoreArry.push(score) 
        })

        /* TODO: remove, come on!
        
        const minValue = Math.min(...scoreArry);
        const maxValue = Math.max(...scoreArry); 
        minScore = minValue
        maxScore = maxValue;
        */
			 
        minScore = Math.min(...scoreArry)
        maxScore = Math.max(...scoreArry); 


				/*
				 * TODO: separation of concerns, don't keep computations together with UI tasks
				 * Move this to some other function like updateSliderRange( min, max )
				 * 
				 * Also, rename detectScoreRange(), you're not detecting anything here, you're 
				 * computing/finding extremes in a list.
				 * 
				 * Possible new names/arrangement: 
				 *  
				 * setupSlider ( tableData ):
				 *   // in place of this detectScoreRange()
				 *   // calls #getScoreRange() and then #updateSliderRange() 
				 * 
				 * #getScoreRange ( tableData ):
				 *   computes min/max
				 * #updateSliderRange ( min, max ):
				 *   // calls setRangeInputValues() like here below
				 *   // possible new name for setRangeInputValues: #updateSliderPosition()
				 */ 

        // sets defaults values for min and max range inputs
        setRangeInputValues(minScore, 'min')
        setRangeInputValues(maxScore, 'max')
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

		/* TODO: why these funny names, rather than something like 
     * onChangeLeftSlider(), onChangeRightSlider()
		 */
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

		/**
		 * TODO: why are you calling $('#maxValue').val(inputValue.toFixed(2)) separately, 
		 * instead of doing it inside this method?
		 * 
		 * TODO: in setRangeInputValues() you named it 'type', here, you name it 'direction', 
		 * let's have some consistency (eg, direction, or sliderType)
		 * 
		 * TODO: probably something like moveSlider ( v, type ) would be a better name
		 */

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




// TO REFINE OBJECT LITERAL IN COMING DAYS
// Handles evidence and knetscore filters 
const geneTableFilterMgr = function() {

    let tableData = null
    let filteredData = []; 

   return { 
				/*
				 * TODO: Where are you saving it? On a disk? This is a method to hand the class 
				 * a value, which is then kept in its state. Methods like this are usually named 
				 * like setTableData()
				 */  		 
        // saves geneview table
        saveTableData:function(data){
                tableData = data;
                knetscoreFilter.detectScoreRange(data); 
        },
        renderFilteredTable: function (table){
            genesTableScroller.setTableData (table)
            createGeneTableBody(table) 
        },
        
        // handles knetscore filtering
        filterByKnetScore: function (event)
        {

            event.preventDefault();

            const scoreMin = Number($('#score-min').val()); 

            const scoreMax = Number($('#score-max').val()); 

            let knetScoreFilteredData = []
	
            // Filter through data
            // TODO: use .map()
            
            /* TODO: why are you naming it genes, if it's one gene only per row?! And it's not even
               a gene, cause it's a geneRow! Don't name things lazily, they might become very misleading and
               damaging when someone has to understand the code, including you in a few weeks.
             */
              
            for(let genes of tableData ){
                const score = Number(genes.score).toFixed(2);

                    // Checks if the gene's score falls within the selected range (inclusive of the range boundaries)
                    const isScoreInRange = ((score >= scoreMin ) && (score <= scoreMax) )

                    if(isScoreInRange) knetScoreFilteredData.push(genes)
            }

            if(knetScoreFilteredData.length){
                geneTableFilterMgr.renderFilteredTable(knetScoreFilteredData)
            }

            geneTableFilterMgr.toggleTableState(knetScoreFilteredData.length)
   
        },
        
        
        /**
				 * TODO: filterByKnetScore() is receiving an event, then this is receiving an element.
				 * Why aren't they consistent?!
				 *  
				 */
        
        // handles graph distance filtering
        filterByGraphDistance: function(element)
        {
            toggleDistanceFilter(element)
            const distance = $('#select-distance option:selected').val()
            const distanceFilteredData = []
            const data = [...tableData]
        
        		/*
        		 * TODO: as above, use a better name and use .map()
        		*/
            data.forEach(genes => {
        
                let concepts = genes.conceptEvidences
        
                for(let concept in concepts ){
                    
                    let evidence = concepts[concept].conceptEvidences;

                    evidence = evidence.filter( item => item.graphDistance <= distance)
        
                    if(!evidence.length){
                        const newObject = Object.assign({},concepts)
                        delete newObject[concept]; 
                        concepts = newObject;
                    } 
                }
                // checks if object.Keys has length
                const isConceptEmpty = Object.keys(concepts).length
                if(isConceptEmpty > 0 ) distanceFilteredData.push(genes)
                
            })
            
            if(distanceFilteredData.length){
                geneTableFilterMgr.renderFilteredTable(distanceFilteredData); 
                
                /* 
                 * TODO: What's the point of doing it here?! Why isn't dealt with by 
								 * renderFilteredTable(), and is it at all necessary?!
								 * 
								 * Why isn' filterByKnetScore() working the same, given that, after filtering, 
								 * they do the same thing?!
                 * 
								 * DAMN IT! Let's code with some more attention and consistency!
                */
                filteredData = distanceFilteredData
            }

            geneTableFilterMgr.toggleTableState(distanceFilteredData.length)
        },
        // sets filtered data as table data when user switch filter view
        setFilteredData:function(){
            tableData = filteredData.length ? filteredData : tableData
        }, 
        // toggle table state when filtered data length is equal to zero. 
        toggleTableState:function(dataLength){
            if(dataLength <= 0)$('#filterMessage').text('Your filter is returning no results');

            $('#filterMessage').toggleClass('show-block',dataLength <= 0); 
            $('#geneTableBody').toggleClass('hide',dataLength <= 0);
        } 
    }
}()
