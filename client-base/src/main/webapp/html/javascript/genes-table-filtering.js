/**
 * UI filters for the gene table.
 * 
 * The code in this file is documented here:
 * https://github.com/Rothamsted/knetminer/wiki/%5BDevDoc%5D-Details-about-the-implementation-of-Gene-Evidence-table-UI-filters
 * 
 * Please, keep the two aligned.
 */

// Knetscore Filter Element
let  knetScoreFilter = {

    // Function detects min and max knetscore values from genetable data
    detectRange (tableData){

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
        this.setRangevalue(minValue, 'min')
        this.setRangevalue(maxValue, 'max')
    },
    // Function set input values for range input type called in (detectScoreRange)
    setRangevalue(value, rangeType){

        $('#'+rangeType+'Value').val(value); 

        $('#score-'+rangeType).attr({
            'min':minScore,
            'max':maxScore,
            'value': value,
        })

    },

    // Gets the left range input value when an onchange event event is triggered.
    // Set style direction in percentage
    handleLeftThumb(minElement){ 
        let inputValue = parseFloat($(minElement).val());
        const rightValue = parseFloat($('#score-max').val());

        // Check if left thumb is crossing the right thumb
        if(inputValue >= rightValue){
            inputValue = rightValue - 0.01;
            $(minElement).val(inputValue.toFixed(2));
        }

        $('#minValue').val(inputValue.toFixed(2));

        this.setScorePosition(inputValue, 'min');
    },

    // Handles onchange event for the right thumb 
    handleRightThumb(maxElement){
        let inputValue = parseFloat($(maxElement).val());
        const leftValue = parseFloat($('#score-min').val());

        // Check if right thumb is crossing the left thumb
        if(inputValue <= leftValue){
            inputValue = leftValue + 0.01;
            $(maxElement).val(inputValue.toFixed(2));
        }

        $('#maxValue').val(inputValue.toFixed(2));

        this.setScorePosition(inputValue, 'max');
    },

    // Adds CSS style position and coverage percentage to range slider
    setScorePosition (inputValue, direction){

        const percentage = ((inputValue - minScore) / (maxScore - minScore)) * 100;

        if(direction === 'min') {
            $('.range-selected').css('left', percentage + '%');
        } else if(direction === 'max') {
            $('.range-selected').css('right', (100 - percentage) + '%');
        }
    },

    // Renders knetscore filter Ui
    renderUi(){

        const popup = $(`
        <div data-id="knetscore" onclick="toggleFilterIcons(this)" class="knetscore-view-overlay"></div>
        <div class='knetscore-view'>

            <form id="knetScore-Form">
                <div class='distance-unit'>

                <div class='score-range-container'>

                    <div class='score-class'>
                        <div class="range-slider">
                            <span class="range-selected"></span>
                        </div>

                        <div class='slider-container'>
                        <input oninput='knetScoreFilter.handleLeftThumb(this)' data-direction='left' class='score-range' id='score-min' type='range' step='0.01'/>
                        <input data-direction='right' oninput='knetScoreFilter.handleRightThumb(this)' class='score-range' id='score-max' type='range' step='0.01'/>                      
                        </div>

                    </div>

                    <div class='score-value-container'>
                        <input id='minValue' type='number' readonly/>
                        <input id='maxValue' type='number' readonly/>
                    </div>

                </div>
                </div>
            </form>


            <div class='filter-footer'>
            <span onclick="resetTable()">Reset</span>
            <button data-id="knetscore" onclick="geneTableFilterMgr.filterByDistanceAndScore(event)" class='knetscore-button'>Apply</button>
            </div>

        </div>`);

        $('#knetscore-filter').append(popup); 
    }
}

// Renders Ui and detects graph distance maximum number
let graphDistanceFilter = {
    maxNumber:-Infinity,
    //Detects the max distance from tabledata
    detectRange(tableData){

    for(let data of tableData){
        let concepts = data.conceptEvidences

        for(let concept in concepts){
            let evidences = concepts[concept].conceptEvidences;
            evidences.forEach((evidence)=> {
                if(evidence.graphDistance > this.maxNumber){
                    this.maxNumber = evidence.graphDistance;
                }
            })
        }
    }
    // Creates HTML select options not more than max graph distance .
    this.createSelectElement()
    },
    //Creates a select element to match distance limit
    createSelectElement(){
        let selectElement =   `<select id="select-distance" style="margin:0px;">`

        for(let index = 0; index <= this.maxNumber; index++){
            selectElement += `<option value='${index + 1}' ${index === this.maxNumber ? 'selected': ''}>${index + 1}</option>`
        }

        selectElement += `</select>`;

        $('.filter-header').append(selectElement)
    },
    // renders graph distance filter Ui
    renderUi(){
        let ui = `
            <div data-id="distance" onclick="toggleFilterIcons(this)" class="distance-view-overlay"></div>
            <div class="distance-view"><div class="filter-header" >
                        <label>Distance:</label></div>
                        <div class="filter-footer">
                            <span onclick="resetTable()">Reset</span>
                            <button data-id="distance" onclick="geneTableFilterMgr.filterByDistanceAndScore(event)" type="button">Apply</button>
                        </div>
            </div>`;

        $("#evidence-filter").append(ui)
    }
}

// Handles genes distance and knetscore filters 
const geneTableFilterMgr = {

    tableData:[],
    // Saves genetable data to tableData property and c
    setup(data){
            this.tableData = data;
            this.renderFiltersToUi(data)
    },
    // Renders graphdistance and knetscore filters to UI.
    renderFiltersToUi(data){
        let filters = [graphDistanceFilter,knetScoreFilter]

        for(let filter of filters){
            filter.renderUi();
            filter.detectRange(data)
        }
    },
    // Handles knetscore filtering
    filterByDistanceAndScore(event = null) { 

        // Sets Tabledata either from table parameter or state saved tableData.
            let data = [...this.tableData]


        // Checks if evidence concepts are in active states to filter table data by selected concept
        if(event){
            const element = event.target;
            event.preventDefault();
            toggleFilterIcons(element); 
            conceptFilter.filtered = true
        }
    
    
        const distance = $('#select-distance option:selected').val();
        const scoreMin = Number($('#score-min').val()); 
        const scoreMax = Number($('#score-max').val()); 
    
        let filteredData = [];

        
        // Filter through data 
        for(let genes of data) {
            // Deep clone the gene object to ensure we don't modify the original data
            let geneClone = JSON.parse(JSON.stringify(genes));
            
            const score = Number(geneClone.score).toFixed(2);
    
            // Checks if the gene's score falls within the selected range (inclusive of the range boundaries)
            const isScoreInRange = ((score >= scoreMin ) && (score <= scoreMax) );
            let concepts = geneClone.conceptEvidences;
    
            for(let concept in concepts) {
                let evidence = concepts[concept].conceptEvidences;
                evidence = evidence.filter(item => item.graphDistance <= distance);
                
                if(!evidence.length){
                    delete concepts[concept]; 
                } else {
                    concepts[concept].conceptEvidences = evidence;
                }
            }


            let keys = Object.keys( concepts)
            const isConceptEmpty = keys.length;

            if(isConceptEmpty > 0 && isScoreInRange){
                filteredData.push(geneClone);
            }
        }

        geneTableFilterMgr.toggleTableState(filteredData.length);
    
        if(filteredData.length) {
            geneTableFilterMgr.renderFilteredTable(filteredData);
        };
    },
    renderFilteredTable(table){
    
        const isConceptActive = $('.evidenceSummaryItem').hasClass("active-legend"); 

        genesTableScroller.setTableData (table); 

        if(isConceptActive){
            geneViewConceptFilter.filterbySelectedConcept(table);
        }else{
            createGeneTableBody(table)
        }
    },
    toggleTableState(filteredTableLength){

        if(!filteredTableLength)$('#filterMessage').text('Your filter is returning no results');

        $('#filterMessage').toggleClass('show-block',filteredTableLength <= 0); 
        $('#geneTableBody').toggleClass('hide',filteredTableLength <= 0);
    }
}

