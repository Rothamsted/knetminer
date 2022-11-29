
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

function removeSpaceFromList(geneList){
    var list = geneList
    for (var i = 0; i < list.length; i++) { // remove empty lines
        if (!list[i].trim()) {
            list.splice(i, 1);
            i--;
        }
    }
    
    // remove spaces in each geneList entry
    list= list.map(s => s.trim());
    return list; 
}





