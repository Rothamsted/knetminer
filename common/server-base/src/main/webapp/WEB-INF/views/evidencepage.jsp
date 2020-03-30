<%
// added to overcome double quotes issue
String keywords="";
if(request.getParameter("keyword")!=null) {
keywords = request.getParameter("keyword");
keywords = keywords.replace("\"", "###");
}
// added to display evidencepage API - query summary above rendered network
String datasetDescription= "Discover the KnetMiner knowledge network for the top <span style='color:darkOrange'>genes</span> linked to your <span style='color:darkOrange'>evidence</span> term. <i><u>Tip:</u> Right-click-hold on nodes to add labels or to show their properties. Use the Interactive Legend to add (single-click) or hide (double-click) other types of information to/from the network.</i>";
%>
<html>
<head>
<link rel="stylesheet" type="text/css" href="https://knetminer.rothamsted.ac.uk/KnetMaps/css_demo/index-style.css">
<link rel="stylesheet" type="text/css" href="https://knetminer.rothamsted.ac.uk/KnetMaps/dist/css/knetmaps.css"/>
<!-- font-awesome css -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">

<script type="text/javascript" src="https://knetminer.rothamsted.ac.uk/KnetMaps/dist/js/knetmaps-lib.min.js"></script>
<script type="text/javascript" src="https://knetminer.rothamsted.ac.uk/KnetMaps/dist/js/knetmaps.min.js"></script>
<!-- font-awesome js -->
<script defer="" src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" integrity="sha384-kW+oWsYx3YpxvjtZjFXqazFpA7UP/MbiY4jvs+RWZo2+N94PFZ36T6TFkc9O3qoB" crossorigin="anonymous"></script>

<jsp:include page="../../js_css_loader.jsp" />
<title>KnetMiner network</title>
</head>
<body>
   <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
	   <a target="_blank" href="https://knetminer.org"><img class="logo-top" src="https://knetminer.rothamsted.ac.uk/KnetMaps/image/logo-regular.png" height="48" alt="Logo"></a>   
       <ul class="nav navbar-nav" id="top">
          <li>
              <a target="_blank" href="https://pub.uni-bielefeld.de/publication/2915227">Cite Us</a>
              <a id="release_icon" target="_blank" href="http://knetminer.rothamsted.ac.uk/KnetMiner/KnetMiner_Tutorial-v3.1.pdf">User Guide</a>
              <a target="_blank" href="https://github.com/Rothamsted/KnetMiner/issues">Report Issues</a>
              <a id="login_icon" title="Sign in" style="padding-top:0;">Sign in</a>
              <a id="profile_icon" title="Profile" style="padding-top:0;"><i class="fa fa-user" aria-hidden="true"></i></a>
          </li>
    </ul>
 	</nav>  <!-- end navbar -->
 
<div id="content">
    <div id="dataset-description"><p id="dataset-desc"><%=datasetDescription%></p></div><br/>
    <div id="NetworkCanvas">
        <div id="knetSaveButton" style="width:101%; margin-top:7px;"></div>
        <!-- KnetMaps -->
        <div id="knetmap"></div>
    </div>
</div>  <!-- content -->

       <div class="contact-footer">
	      <ul style="overflow:hidden;margin-bottom: 0px;">
		     <li class="left-footer">
			   <a target="_blank" title="Rothamsted Research" href="http://www.rothamsted.ac.uk/" class="logos"><img src="https://knetminer.rothamsted.ac.uk/KnetMaps/image/rothamsted_logo.png" width="80" height="80"/></a>
			   <a target="_blank" title="BBSRC" href="http://www.bbsrc.ac.uk/" class="logos"><img class="bbsrc-logo" src="https://knetminer.rothamsted.ac.uk/KnetMaps/image/bbsrc_logo.png"/></a>
			 </li>
		     <li class="center-footer">
			   <a target="_blank" title="KnetMiner" href="https://knetminer.org" class="logos"><img src="https://knetminer.rothamsted.ac.uk/KnetMaps/image/logo-regular.png" height="90"/></a>
			 </li>
			 <li class="right-footer">
			   <ul class="nav navbar-nav" id="bottom">
			     <li>
				   <p id="footer-text">Powered by <a target="_blank" href="https://f1000research.com/articles/7-1651/v1" style="color:darkOrange">KnetMaps.js</a></p>
				   <a target="_blank" href="https://www.npmjs.com/package/knetmaps">NPM</a>
				   <a target="_blank" href="https://github.com/Rothamsted/knetmaps.js/blob/master/LICENSE">License</a>
				   <a target="_blank" href="https://twitter.com/knetminer">Twitter</a>
				 </li>
			   </ul>
			 </li>
		  </ul>
       </div>

	<script type="text/javascript">
          /*  var this_url= window.location.href;
            var api_url= this_url.substring(0, this_url.search("genepage")); */
            var request_url= "<%=request.getRequestURL().toString()%>";
            var request_context_path= "<%=request.getContextPath()%>";
            var request_ds_uri= "<%=request.getAttribute("javax.servlet.forward.request_uri")%>";
            var api_url= request_url.substring(0, request_url.search(request_context_path)) + request_ds_uri.substring(0, request_ds_uri.search("evidencepage")); // global
            $.ajax({
            url: "evidencePath",
            type: "post",
            headers: {
                "Accept": "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            },
            dataType: "json",
            data: JSON.stringify({
                keyword: "<%=keywords%>",
                list: ${list}
            })
        }).success(function (data) {
            // new Save button in Network View - intialise a click-to-save button with networkId (null when inside knetminer)
            var networkId= null;
            var requestParams= { keyword: "<%=keywords%>", list: ${list} };
            console.log("evidence_page: api_url: "+ api_url); // test
            $('#knetSaveButton').html("<button id='saveJSON' class='btn knet_button' style='float:right;width:115px;' onclick='exportAsJson("+networkId+","+JSON.stringify(requestParams)+");' title='Save the knetwork to knetspace'>Save</button>");
                                        
            if(data.graph.includes("var graphJSON=")) { // for old/current json that contains 2 JS vars
               KNETMAPS.KnetMaps().drawRaw('#knetmap', data.graph/*, networkId*/);
              }
            else { // response contents (pure JSON).
                var eles_jsons= data.graph.graphJSON.elements;
                var eles_styles= data.graph.graphJSON.style;
                var metadata_json= data.graph.allGraphData;
                KNETMAPS.KnetMaps().draw('#knetmap', eles_jsons, metadata_json, eles_styles/*, networkId*/);
               }
        });
		</script>
</body>
</html>
