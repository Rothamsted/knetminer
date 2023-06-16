
/*
 * Function to escape special characters from a string for use in jquery selector
 */
function escapeJquerySelectors(exp) {
    return exp.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}


// to be replaced by javscript trim() in coming request
function trim(text) {
    return text.replace(/^\s+|\s+$/g, "");
}


/*
 * Function to check the brackets in a string are balanced
 *
 */
function bracketsAreBalanced(str) {
    var count = 0;
    for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (ch == '(') {
            count++;
        } else if (ch == ')') {
            count--;
            if (count < 0) return false;
        }
    }
    return true;
}

// function to take word and capitalise first letter in a word
function capitaliseFirstLetter(word){
    let spacedWord = word.replace(/[A-Z]/g, ' $&').trim() 
    let speciesKey = spacedWord[0].toUpperCase() + spacedWord.substring(1); 
    return speciesKey; 
}

/** 
 * Do some cleaning on the user-provided gene list, by
 * doing common tasks like removing empty lined and space trimming.
 */
function cleanGeneList ( geneList )
{
	return geneList
		.filter ( s => s.trim () )
		.map ( s => s.trim () );
}

/* TODO: (optional) marginally useful, possibly remove it. 
   The current version doesn't work, see below. 
   If it's to be kept, a shorter name
   like isNumber( value ) is maybe preferrable.
*/
/**
 * function checks if input is of type number
 */
function isParameterNumber(input){
	  /* TODO this DOES NOT WORK with findChromosomeGenes() see there */
    return (typeof input == 'number'); 
}





