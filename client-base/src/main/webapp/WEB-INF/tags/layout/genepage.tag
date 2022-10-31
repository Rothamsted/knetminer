<!DOCTYPE html>

<%@ tag description="Page layout" %>
<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html>
 <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        
        <!-- 
          TODO: schema.org, annotations from the the graph metadata descriptor
          For the moment, these values are taken from the blog.
         -->
        <title>KnetMiner - Knowledge Graph based tools and resources for Life Sciences</title>
        <meta name="keywords" content="knetminer, plant biology, plant genetics, gene discovery, agronomy, life science knowledge graphs" />
        <meta name="description" content="KnetMiner is a unique discovery platform that helps scientists search large volumes of scientific literature and Life Science data to unveil links between the genetic and biological properties of complex, polygenic traits and diseases." />
        
        <!-- favicon -->
        <link rel="shortcut icon" href="html/image/KnetMiner200.png" />


        <!-- KnetMiner common style.css -->
        <link rel="stylesheet" type="text/css" href="html/css/style.css"/>
        <link rel="stylesheet" type="text/css" href="html/css/genepage.css"/>
        <!-- jBox modal popup css -->
        <link rel="stylesheet" type="text/css" href="html/css/jBox.all.min.css"/>
        <!-- KnetMiner button css -->
        <link rel="stylesheet" type="text/css" href="html/css/button.css"/>
        <!-- Login css -->
        <link rel="stylesheet" type="text/css" href="html/css/loginStyle.css"/>
        <!-- loader/spinner css -->
        <link rel="stylesheet" type="text/css" href="html/css/maskloader-spinner.css"/>
        <!-- Genomaps.js css -->
        <link rel="stylesheet" type="text/css" href="html/GeneMap/dist/styles/genemap-lib.css"/>
        <link rel="stylesheet" type="text/css" href="html/GeneMap/dist/styles/genemap.css"/>
        
        <!-- KnetMaps.js css -->
        <link rel="stylesheet" type="text/css" href="html/KnetMaps/dist/css/knetmaps.css"/>

		
				<!-- bootstrap css -->
				<!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> -->
				<!-- font-awesome css -->
				<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

        <!-- Genomaps.js -->
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap-lib.js"></script>
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap.js"></script>

        <!--JBox-->
      	<script type="text/javascript" src="html/javascript/jBox.all.min.js"></script>

        <!--Particle-->
        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
        
        <!-- KnetMaps.js -->
        <script type="text/javascript" src="html/KnetMaps/dist/js/knetmaps-lib-nojquery.js"></script>
        <script type="text/javascript" src="html/KnetMaps/dist/js/knetmaps.js"></script>

        <script type="text/javascript" src="html/javascript/utils-config.js"></script>
        <!-- interactive summary Legend for Gene View -->
        <script type="text/javascript" src="html/GeneView/summariseLegend.js"></script>
        <!-- interactive Legend for Evidence View -->
        <script type="text/javascript" src="html/javascript/evidence_legend.js"></script>
        
        <script type="text/javascript" src="html/javascript/loginHandler/cookieUtils.js"></script>
        <script type="text/javascript" src="html/javascript/loginHandler/loginUtils.js"></script>
        <script type="text/javascript" src="html/javascript/filter-knetwork.js"></script>
        <!-- KnetMaps - js utils to save knet to knetspace -->
        <script type="text/javascript" src="html/javascript/saveKnetwork/save-knet.js"></script>
        
        <!-- KnetMaps - js utils to export a local download of the KnetMaps knetwork to user PC -->
        <script type="text/javascript" src="html/javascript/exportKnetwork/download-knet.js"></script>
        
        <!-- genepage utils -->
        <script type="text/javascript" src="html/javascript/genepage/index.js"></script>

       

        <!-- init utils -->
        <script type="text/javascript" src="html/javascript/init-utils.js"></script>

           <script type="text/javascript" src="html/javascript/ui-utils.js"></script>
         

        
        <!-- gene table -->
        <script type="text/javascript" src="html/javascript/gene-table.js"></script>
        

        <!-- multi species file -->
        <script type="text/javascript" src="html/javascript/multispecies.js"></script>

        <!-- string data Utils-->
        <script type="text/javascript" src="html/javascript/string-utils.js"></script>

        <!-- google analytics-->
        <script type="text/javascript" src="html/javascript/google-analytics.js"></script>

        <script type="text/javascript" src="html/javascript/releaseNotes/showNetworkStats.js"></script>
        
        <!-- interactJS; DISABLED -->
        <!--	<script src="https://unpkg.com/interactjs@1.3/dist/interact.min.js"></script> -->

        <!-- bootstrap js -->
        <!-- 	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script> -->
        
        <!-- font-awesome js -->
        <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" integrity="sha384-kW+oWsYx3YpxvjtZjFXqazFpA7UP/MbiY4jvs+RWZo2+N94PFZ36T6TFkc9O3qoB" crossorigin="anonymous"></script>

        <!-- release note animation-->
        <script src="https://cdn.lordicon.com/xdjxvujz.js"></script>
    </head>
<body>

  <layout:header />
  <div id="genomaps-container">

    <div id="network_content">
    <div id="dataset-description">
      <div id="network_description">
              <div>
                <h4 class="search-key">Selected KnetGraph:</h4>
                <span id="search-taxid">Triticum Aestivum</span>
              </div>
              <div>
                <h4 class="search-key">Selected gene(s)</h4>
                <span  id="search-gene"></span>
              </div>
              <div>
                <h4 class="search-key">Edges with</h4>
                <span id="search-keyword"></span>
              </div>
      </div>
          <div id="instructions">
              <h4 id="instruction-title">How to use</h4>
              <p>You can use the Interactive Legend to add (single-click) or hide (double-click) information types from the network,<br> 
                First time using KnetMiner? Learn more with our <a href="https://knetminer.com/tutorial">Tutorial.</a></p>
          </div>
      </div>
    </div>

    <div id="tabviewer">
    <!-- place dynamic content with text here -->
        <div id="tabviewer_content">

          <div id="NetworkCanvas" class="result_viewer">

            <div id="export-menu">
                <div id="knetGeneExport" class="export_border" style="border-bottom: .3px solid silver"></div>
                <div id="visibleGraphExport" class="export_border"></div>
            </div>

            <div id="knetSaveButton" style="margin-top:7px;float:right;"></div>

            <div style="margin-top:7px;float:right;margin-right:10px;">
                <button class="network_button" id="exportBtns">
                <img id='exportImg' src="html/image/Knetdownload.png" alt="export menu" width="20"/>
                </button>
            </div>

            <!-- KnetMaps.js -->
            <div id="knet-maps" style="display:none;"></div>

          </div>
        </div>
    </div>
 </div>

  </div>

</body>
</html>