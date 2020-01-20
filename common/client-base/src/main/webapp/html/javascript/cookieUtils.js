/* 
 * Utils to obtain cookies, get them, and erase them. Used in utils.js when adding clickevent to the profile button.
 * Author: hearnshawj
 */

export function setCookie(cookieName, cookieValue, days) {
    var expirationDate = "";
    if (days) {
        var cookieDate = new Date();
        cookieDate.setTime(cookieDate.getTime() + (days * 24 * 60 * 60 * 1000));
        expirationDate = "; expires=" + cookieDate.toUTCString();
    }
    // Create the cookie which will expire in X days
    document.cookie = cookieName + "=" + (cookieValue || "") + expirationDate + "; path=/";
}
export function getCookie(cookieName) {
    console.log("Raiding the cookie jar now!");
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
export function eraseCookie(cookieName) {
    document.cookie = cookieName + '=; Max-Age=-99999999;';
}


