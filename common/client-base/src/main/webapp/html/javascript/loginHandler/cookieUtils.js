/* 
 * Utils to obtain cookies, get them, and erase them. Used in utils.js when adding clickevent to the profile button.
 * Author: hearnshawj
 */

/** Functions to get and erase cookies **/
function getCookie(cookieName) {
    var updatedCookieName = cookieName + "=";
    var cookie = document.cookie.split(';'); // Obtain the cookie
    for (var i = 0; i < cookie.length; i++) {
        var co = cookie[i];
        while (co.charAt(0) == ' ')
            co = co.substring(1, co.length);
        if (co.indexOf(updatedCookieName) == 0)
            return co.substring(updatedCookieName.length, co.length);
    }
    // If there's no cookie, then the length is 0 so return null.
    return null;
}

function eraseCookie(cookieName) {
    document.cookie = cookieName + '=; Max-Age=-99999999;';
}



