/* 
 * Functions for logging into KnetSpace using the jBox libs
 * Author: hearnshawj, singha
 */

/*
 * This will get the the API url asynchronously 
 * @returns {unresolved promise}
 */
async function getKsAPI() {
    const response = await fetch(api_url + '/ksHost')
            .then((r) => r.json())
            .then((rData) => {
                return rData.ksHostUrl; 
                });
    return response;
}

//knetspace_address= 'http://babvs72.rothamsted.ac.uk:8000' // Update accordingly - hardcoded if necessary

/* 
 * Awaits for a promise to be completed first, useful for cross-server communication where delays may exist.
 * @param {type} time
 * @returns {Promise}
 */
let sleep = time => new Promise((resolve) => setTimeout(resolve, time));

/*Function to create a jboxNotice - note that ypos is best left at 50 in my tests
 * 
 * @param {type} content
 * @param {type} colour
 * @param {type} yPos
 * @returns {jBoxNotice}
 */
function jboxNotice(content, colour, yPos, autoclose) {
    new jBox('Notice', {
        content: content,
        color: colour,
        autoClose: autoclose,
        position: {
            x: 0,
            y: yPos
        }
    });
}


   
/* 
 * Check if User is logged in or not
 * @returns {Boolean}
 */
function isLoggedIn(){
   var value = getKsAPI().then(function (ksAddress) {
        const knetspace_address = ksAddress;
       const bool = fetch(knetspace_address + '/api/v1/me', {
            credentials: 'include'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.log("Non HTTP 200 status response code returned by KnetSpace Host");
            }
        }).then((myJson) => {
            if (typeof (myJson.username) === 'undefined' || myJson.username == '' || typeof(myJson.username) === null) {
                return false;
            } else {
                return true;
            }
        });
            return bool;
    });
    return value;
}

function userPlan() {
       var value = getKsAPI().then(function (ksAddress) {
        const knetspace_address = ksAddress;
       const bool = fetch(knetspace_address + '/api/v1/me', {
            credentials: 'include'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.log("Non HTTP 200 status response code returned by KnetSpace Host");
            }
        }).then((myJson) => {
            if (myJson.plan.name === 'Pro') {
                return false;
            } else {
                return true;
            }
        });
            return bool;
    });
    return value;
}

function returnJson() {
    var jsonVal = getKsAPI().then(function (ksAddress) {
        const knetspace_address = ksAddress;
        const jsonVal = fetch(knetspace_address + '/api/v1/me', {
            credentials: 'include'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.log("Non HTTP 200 status response code returned by KnetSpace Host");
            }
        }).then((myJson) => {
            return myJson;
        });
        return jsonVal;
    });
    console.log(jsonVal.username);
    return jsonVal;
}

/*
 * add new document.ready event to initalise login (to decouple login from utils.js completely)
 * author: singha
 */
$(document).ready(
    function () {
        $('#login_icon').text("Sign in");
        $('#login_icon').css('textDecoration','none');
        fetchCredentials(null);
        // Initalize login Modal
        loginModalToggle();        
    });

/* 
 * initialize  loginModal
 * @returns {loginModal}
 */
function loginModalInit() {
    getKsAPI().then(function (ksAddress) {
        const knetspace_address = ksAddress;
        var loginHtml = "<form class='form' method='post' action='#'>"
                + "<label>Username or Email</label>"
                + "<input type='text' name='demail' id='email'>"
                + "<p></p>"
                + "<label>Password</label>"
                + "<input type='password' name='password' id='password'>"
                + "<p></p>"
                + "<input type='button' name='KnetSpacelogin' id='KnetSpacelogin' value='Sign in'>"
                + "<p></p>"
                + "<a href='" + knetspace_address + "/password-reset' style='text-decoration: none'>Forgot your password?</a>"
                + "<p></p>"
                + "<a href='" + knetspace_address + "/sign-up' style='text-decoration: none'>Create an account</a>"
                + "</form>"

        var loginModal = new jBox('Modal', {
            id: 'loginBox',
            animation: 'pulse',
            title: '<font size="5"><font color="white">Sign in to </font><font color="#51CE7B">Knet</font><font size="5"><font color="white">Miner</font>',
            content: loginHtml,
            cancelButton: 'Exit',
            draggable: 'title',
            attributes: {
                x: 'right',
                y: 'top'
            },
            delayOpen: 50
        });
        loginModal.open(); // New instance of modal (Not ideal)
        // Checking for blank fields on clicking login
        $('#KnetSpacelogin').on('click', function () {
            fetchCredentials(loginModal);
            loginHandler(loginModal, knetspace_address);
            // jBox modal - tasks completed.
            loginModal.destroy(); // destroy jBox modal when done - then remove it completely if logged in to prevent duplicates
            isLoggedIn().then(function (bool) {
                if (bool) {
                    $('#loginBox').remove();
                }
            });
        });
    });
}

/* 
 * Function to toggle the login modal
 */
function loginModalToggle() {
    isLoggedIn().then(function (bool) {
        if (!bool) {
            console.log("User isn't logged in, initalizing login Modal");
            // If the user isn't logged in then we return undiefined so we can initalize the login button.
            $('#login_icon').click(function (e) {
                loginModalInit();

            });
            return false;
        }
    });

}

/* Handles the logging in event for KnetSpace
 * 
 * @param {type} loginModal
 * @param {type} knetspace_address
 */
function loginHandler(loginModal, knetspace_address) {
    var email, password;
    email = $("#email").val();
    password = $("#password").val();
    // Check user credentials are given and not false
    if (email == 'undefined' && password !== 'undefined' || email == '' && password !== '') {
        jboxNotice("You haven't given an email!", 'red', 60, 1000);
    } else if (password == 'undefined' && email !== 'undefined' || password == '' && email !== '') {
        jboxNotice("You haven't given a password!", red, 60, 1000);
    } else if (email == '' && password == '' || email == 'undefined' || password == 'undefined') {
        jboxNotice("You haven't given an email and password!", 'red', 60, 1000);
    } else {
        // Send to KnetSpace - check if there's a returned JSON and add to the user login details, if successful alert user
        $.ajax({
            type: "POST",
            url: knetspace_address + '/auth/jwt/',
            xhrFields: {
                withCredentials: true
            },
            data: {
                username_or_email: email,
                password: password
            },
        }).success(function (data) {
            // process result
            fetchCredentials(null);
            loginModal.toggle();
        }).fail(function () {
            jboxNotice("Incorrect credentials given", 'red', 60, 1000);
        });
    }
    email = "", password = ""; // Reset password and email - Note that instantiation of the modal needs to be in HTML body to ensure this as modals are not destroyed - coupled to the main DOM
}

/** Function to log out - Note that profile icon css needs changing to white (TODO)
 * 
 * @param {type} knetspace_address
 */
function logOut(knetspace_address) {
    fetch(knetspace_address + '/api/v1/logout', {
        credentials: 'include'
    }).then((response) => {
        return response.json();
    }).then((myJson) => {
        console.log("Logged out, response is: " + myJson);
    });
    var cookie = getCookie("knetspace_token");
    eraseCookie(cookie);
    $('#login_icon').attr("title", "Sign in"); // insert new link
    $('#login_icon').text("Sign in");
    //$('#login_icon').on('click');
    //$('#login_icon').css("color", "white");
}

/** Fetches user credentials 
 * 
 * @param {type} loginModal
 */
function fetchCredentials(loginModal) {

    getKsAPI().then(function (ksAddress) {
        const knetspace_address = ksAddress;
        isLoggedIn().then(function (bool) {
            if (bool) {
//                if (!Boolean(loginModal) || loginModal === 'undefined') {
//                    console.log(loginModal);
//                    loginModal.destroy();
//                }
                returnJson().then(function (myJson) {
                    let content = "Welcome, " + myJson.username; // Welcome the user
                    jboxNotice(content, 'blue', 60, 1000);
                    // Update the login icon & name
                    $('#login_icon').attr("title", "More"); // insert new link
                    $('#login_icon').attr("target", "");
                    $('#login_icon').attr("title", "");
                    $('#profile_icon').attr("title", "");
                    $('#login_icon').text(" " + myJson.username);
                    $('#login_icon').off('click');
                    $('#text').text("");

                    $('#login_icon').click(function () {
                        // move block outside if logged in then do this

                        var firstName = myJson.first_name,
                                lastName = myJson.last_name, // Not yet using the lastName, may be used in future.
                                organisation = myJson.organisation,
                                email = myJson.email;

                        if (organisation === "null" || typeof organisation == "object") {
                            organisation = "Not given";
                        }
                        if (email === "null" || typeof email == "object") {
                            email = "Not given";
                        }
                        // If the user doesn't give their first name, we should use the username instead.
                        if (firstName !== "null" || typeof firstName == "object") {
                            var profileTitle = '<font size="5"><font color="white">Welcome, </font><font color="#51CE7B">' + firstName + '</font>';
                        } else {
                            var profileTitle = '<font size="5"><font color="white">Welcome, </font><font color="#51CE7B">' + myJson.username + '</font>';
                        }

                        var profile_menu_html = "<font size='4'><a href='" + knetspace_address + "/profile' target='_blank' style='text-decoration:none' class='profileClass'>My Profile</a>"
                                + "<hr>"
                                + "<a href='" + knetspace_address + "/network' target='_blank' style='text-decoration:none' class='profileClass'>My Knetworks</a>"
                                + "<hr></font>"
                                + "<font size='2'><label><b>Email</b></label>"
                                + "<p></p>"
                                + email
                                + "<p></p>"
                                + "<label><b>Organisation</b></label>"
                                + "<p></p>"
                                + organisation
                                + "<hr>"
                                + "<input type='button' name='KnetlogOut' id='logOutButton' value='Sign out' class='knetButton'>";

                        // Profile modal box
                        var profileModal = new jBox('Modal', {
                            animation: 'pulse', title: profileTitle, content: profile_menu_html, cancelButton: 'Exit', draggable: 'title',
                            target: $('#release_icon'), width: 350, offset: {x: 100, y: 200}, delayOpen: 100
                        });
                        profileModal.open();
                        // Sign out button logic, perform api request for logging out
                        $('#logOutButton.knetButton').on('click', function () {
                            console.log("logout clicked...");
                            profileModal.destroy(); // destroy modal
                            logOut(knetspace_address);
                            $('#login_icon').unbind('click');
                            var cookie = getCookie("knetspace_token");
                            if (cookie === 'undefined' || cookie === null) {
                                sleep(150).then(() => {
                                    //loginModalToggle(); // Currently delaying this to ensure both servers perform their respective HTTP requests before performing the next method
                                    window.location.reload();
                                });
                            }
                        });
                    });
                });
            }
        });
  });
}
