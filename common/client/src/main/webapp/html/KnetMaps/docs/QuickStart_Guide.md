# QuickStart Guide

**KnetMaps** is a web application that uses cytoscapeJS, jQuery and other javascript libraries to visualize network graphs and allow users to interact with them.

All KnetMaps requires is a JSON dataset (in a nested JSON format) as input and it then visualizes it within an embedded container on your web page.

### Getting started with KnetMaps:

Follow the 6 simple steps below to try out **KnetMaps** out-of-the-box in a static web page:
- Use a JSON network dataset, containing information about the nodes and edges in a network and (optional) visual attributes for them, in your html page by including it in `<head>`:
```
<head>
        <link href="css/index-style.css" rel="stylesheet" /> <!-- page stylesheet -->
        <link href="css/knet-style.css" rel="stylesheet" /> <!-- Network Viewer stylesheet -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/qtip2/2.2.0/jquery.qtip.min.css" rel="stylesheet" type="text/css" />
        <link href="css/maskloader.css" rel="stylesheet">

        <meta charset=utf-8 />
        <script src="libs/jquery-1.11.2.min.js"></script>
        <script src="libs/cytoscapejs_2.4.0/cytoscape.min.js"></script>
        <script src="libs/jquery-ui.js"></script>
        <script src="libs/cytoscape-cxtmenu.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qtip2/2.2.0/jquery.qtip.min.js"></script>
        <script src="libs/cytoscape-qtip.js"></script>
        <script src="libs/jquery.maskloader.js"></script>
        <!-- Layouts -->
        <script src="libs/cose_bilkent/cytoscape-cose-bilkent.js"></script>
        <script src="libs/ngraph_forceLayout/cytoscape-ngraph.forcelayout.js"></script>

        <!-- URL mappings config file used for generating url's in Item Info -->
        <script type="text/javascript" src="config/url_mappings.json"></script>

        <!-- JSON dataset for static example -->
        <script src="sampleFiles/ara2.json"></script>

        <!-- KnetMaps code -->
        <script src="javascript/knet-maskLoader.js"></script>
        <script src="javascript/knet-layouts-defaultParams.js"></script>
        <script src="javascript/knet-layouts.js"></script>
        <script src="javascript/knet-menu.js"></script> <!-- KnetMaps menubar -->
        <script src="javascript/knet-counts-legend.js"></script>
        <script src="javascript/knet-container.js"></script>
        <script src="javascript/knet-toggleFullScreen.js"></script>
        <script src="javascript/knet-itemInfo.js"></script>
        <script src="javascript/knet-generator.js"></script>

        <!-- test page js -->
        <script src="js/launchNetwork.js"></script>

        <title>KnetMaps.js demo</title>
    </head>
```

- Here, we use the example dataset `ara2.json` provided in the `sampleFiles/` folder.

- Include **KnetMaps** in your web page's `<body>` as shown below:
```
<!-- KnetMaps -->
   <body> <!-- KnetMaps -->
            <div id="knet-maps">
				<div id="itemInfo" class="infoDiv" style="display:none;"><!-- Item Info pane -->
                    <table id="itemInfo_Table" class="infoTable" cellspacing=1>
                        <thead><th>Item Info:</th>
				    <th><button id="btnCloseItemInfoPane" onclick="closeItemInfoPane();">Close</button></th>
                        </thead><tbody></tbody></table>
                </div>
                <!-- KnetMaps Menubar -->
                <div id="knetmaps-menu"></div>
                <!-- The core cytoscapeJS container -->
                <div id="cy"></div><br/>
                <!-- dynamically updated Legend to show number of shown/ hidden concepts; and by type -->
			    <div id="countsLegend"><span>KnetMaps</span></div>
                <!-- popup dialog -->
                <div id="infoDialog"></div>
            </div>
    </body>
```

**Note:** KnetMaps, by default, uses a percentage of the size of it's parent container, in this case, `<body>` and uses the code in `css/knet-style.css` for various rendering and style attributes.

- Now simply copy the javascript, css, libs, sampleFiles, image (for KnetMaps menu), js and config (for **ItemInfo**) folders in your web page's root directory.

- Bear in mind, by default the code in `javascript/knet-generator.js` works to include datasets at runtime using jQuery and a callback function. You will need to disable it for a static demo (i.e., when using a dataset and html page on your local hard drive) as `getScript` is blocked on most browsers when accessing local drives due to security concerns. You can disable it by simply commenting out the `.getScript()` function call but include the methods within it, as shown below:
```
//jQuery.getScript(json_File, function() {
     // Initialize the cytoscapeJS container for Network View.
     initializeNetworkView();

     // Highlight nodes with hidden, connected nodes using Shadowing.
     blurNodesWithHiddenNeighborhood();

     // update "cy" legend with some stats.
     updateCyLegend();
  // });
```

- Now, simply open your html web page in any browser to visualize the network.
