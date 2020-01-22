/* 
 * See index.html
 */

const cydebugBaseUrl = api_base_url + "/cydebug";


/**
 *  Invoked to track the server status, keep checking the server for completion of
 *  the traversal, updates the UI status and stops when the server returns an ending status
 *  (including cancellation or alike).
 *  
 */
function updateStatus ()
{
	const pollingTime = 1000 * 10;
	
	fetch ( cydebugBaseUrl + "/traverser/report" )
		.then ( resp => resp.text () )
		.then ( text =>
		{
			if ( text.startsWith ( "Pending." ) ) 
			{
				let percent = text.replace ( /Pending. ([0-9]+)\%.*/, "$1" );
				displayPending ( percent );
				console.log ( "updateStatus(): pending" );
				updateStatus.timeoutHandler = setTimeout( updateStatus, pollingTime );
				return;
			}
			
			if ( text.startsWith ( "Was cancelled. Abort operation still pending" ) ) {
				displayAbortPending ( "Traversal was cancelled. Waiting for the abort operations to complete..." );
				console.log ( "updateStatus(): cancellation pending" );
				updateStatus.timeoutHandler = setTimeout( updateStatus, pollingTime );
				return;
			}
			
			if ( text.startsWith ( "Was cancelled" ) ) {
				displayAborted ( "Traversal was cancelled." );
				console.log ( "updateStatus(): cancelled" );
			}
			else if ( text.startsWith ( "Wasn't invoked" ) ) {
				displayEdit ();
				console.log ( "updateStatus(): wasn't invoked" );
			}
			// we got a result, show it.
			else {
				displayFinished ( text || "Empty Report!" );
				console.log ( "updateStatus(): finished with " + (text || "").substring (0, 15) );
			}
			if ( updateStatus.timeoutHandler ) clearTimeout ( updateStatus.timeoutHandler );
		})
		.catch ( err => {
			alert ( "Error with API call /traverser/report: " + err.message );
			console.log ( "Error with API call /traverser/report", err );
		});
	// fetch()
}


function pageInitHandler ()
{
	displayEdit (); // Redundant, updateStatus() calls it, but just in case
	updateStatus ();
	getServerQueries ();
}


function startTraverserHandler ()
{
	let queries = document.getElementById ( "queries" ).value;
	let traverseUrl = cydebugBaseUrl + "/traverse";
	let httpHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
	let httpQueryStr = "queries=" + encodeURIComponent ( queries );
	
	fetch ( traverseUrl, { method: 'POST', headers: httpHeaders, body: httpQueryStr } )
	.then ( resp => resp.text () )
	.then ( text => {
		if ( text.startsWith ( "Started." ) ) updateStatus ();
	})
	.catch ( err => {
		alert ( "Error with API call /traverse: " + err.message );
		console.log ( "Error with API call /traverse", err );
	});
	
	console.log ( "startTraverserHandler() invoked" );
}



function traverserCancelHandler ()
{
	fetch ( cydebugBaseUrl + "/traverser/cancel" )
	.then ( resp => {
		updateStatus ();
		return resp.text ();
	})
	.then ( text => console.log ( "Response from /traverser/cancel: " + text ) )
	.catch ( err => {
		alert ( "Error with API call /traverser/cancel: " + err.message );
		console.log ( "Error with API call /traverser/cancel", err );
	});
}



/**
 * Updates the queries textarea with the current server queries.
 */
function getServerQueries ()
{
	var queriesEl = document.getElementById ( "queries" );
	if ( queriesEl.disabled ) return;
	
	fetch ( cydebugBaseUrl + "/traverser/queries" )
	.then ( resp => resp.text () )
	.then ( queries => { queriesEl.value = queries;	})
	.catch ( err => {
		alert ( "Error with API call /traverser/queries: " + err.message );
		console.log ( "Error with API call /traverser/queries", err );
	});		
}



/** Query edit enabled, results disabled */
function displayEdit ()
{
	document.getElementById ( "status" ).innerHTML = "";
	document.getElementById ( "queries" ).disabled = false;
	document.getElementById ( "queryEditButtons" ).style.display = "block";
	document.getElementById ( "results" ).style.display = "none"
}

/** Query edit disabled, results hidden, pending status */
function displayPending ( percent )
{
	document.getElementById ( "queries" ).disabled = true;
	document.getElementById ( "queryEditButtons" ).style.display = "false";

	document.getElementById ( "results" ).style.display = "none";
	document.getElementById ( "report" ).style.display = "none"

	
	let pendingHTML = "Traverser running, " + percent + "% completed... ";
	pendingHTML += "<a href = '' onclick = 'traverserCancelHandler (); return false;'>Cancel</a>";	

	document.getElementById ( "status" ).innerHTML = pendingHTML;
}

/** Query edit disabled, results visible, redo button, finished status */
function displayFinished ( reportText )
{
	document.getElementById ( "queries" ).disabled = true;
	document.getElementById ( "queryEditButtons" ).style.display = "none";
	
	let reportEl = document.getElementById ( "report" );
	reportEl.value = reportText;
	reportEl.style.display = "block"

	var downEl = document.getElementById ( "download" );
	downEl.setAttribute ( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( reportText ) );
	downEl.style.display = 'inline';

	document.getElementById ( "results" ).style.display = 'block';
	
	document.getElementById ( "status" ).innerHTML = "Traversal finished, see results below";
}

/** Query edit disabled, results hidden, redo button, aborted status */
function displayAborted ( statusText )
{
	document.getElementById ( "queries" ).disabled = true;
	document.getElementById ( "queryEditButtons" ).style.display = "none";
	document.getElementById ( "report" ).style.display = "none";
	document.getElementById ( "download" ).style.display = "none";
	document.getElementById ( "results" ).style.display = "block";
	document.getElementById ( "redo" ).style.display = "block";

	
	document.getElementById ( "status" ).innerHTML = statusText;	
}

/** Like displayAborted(), but "redo" button is off, cause it has to complete the abortion op. */
function displayAbortPending ( statusText )
{
	displayAborted ( statusText );
	document.getElementById ( "redo" ).style.display = "none";
}

