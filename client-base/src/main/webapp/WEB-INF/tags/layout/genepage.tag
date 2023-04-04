<!DOCTYPE html>

<%@ tag description="Page layout" %>
<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html>
 <head>
        <meta charset="UTF-8">
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        
        <!-- 
          TODO: schema.org, annotations from the the graph metadata descriptor
          For the moment, these values are taken from the blog.
         -->
        <title>KnetMiner - Knowledge Graph based tools and resources for Life Sciences</title>
        <meta name="keywords" content="knetminer, plant biology, plant genetics, gene discovery, agronomy, life science knowledge graphs" />
        <meta name="description" content="KnetMiner is a unique discovery platform that helps scientists search large volumes of scientific literature and Life Science data to unveil links between the genetic and biological properties of complex, polygenic traits and diseases." />
        
        <!-- favicon -->
        <link rel="shortcut icon" href="image/KnetMiner200.png" />


        <!-- KnetMiner common style.css -->
        <link rel="stylesheet" type="text/css" href="css/style.css"/>
        <link rel="stylesheet" type="text/css" href="css/genepage.css"/>

        <!--JBox (managed by update-js.sh) -->
        <link rel="stylesheet" type="text/css" href="lib/jbox/jBox.all.min.css"/>


        <!-- KnetMiner button css -->
        <link rel="stylesheet" type="text/css" href="css/button.css"/>
        <!-- Login css -->
        <link rel="stylesheet" type="text/css" href="css/loginStyle.css"/>
        <!-- loader/spinner css -->
        <link rel="stylesheet" type="text/css" href="css/maskloader-spinner.css"/>
        
        <!-- 
        	This is available from the genomap package.
        	 
        	TODO: see notes in page.tag
        -->
        <link rel="stylesheet" type="text/css" href="lib/genomaps/css/jquery-bstrap.css"/>
        
        <!-- KnetMaps.js CSS -->
        <link rel="stylesheet" type="text/css" href="lib/knetmaps/css/knetmaps.css"/>

		
				<!-- bootstrap css -->
				<!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> -->
				<!-- font-awesome css -->
				<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

        <script type="text/javascript" src="lib/genomaps/js/jquery-bstrap.min.js"></script>
        <script type="text/javascript" src="lib/jquery-ui/jquery-ui.min.js"></script>

        <!--JBox (managed by update-js.sh) -->
      	<script type="text/javascript" src="lib/jbox/jBox.all.min.js"></script>

        
        <!-- KnetMaps.js -->
        <script type="text/javascript" src="lib/knetmaps/js/knetmaps-lib-nojquery.min.js"></script>
        <script type="text/javascript" src="lib/knetmaps/js/knetmaps.min.js"></script>

        <script type="text/javascript" src="javascript/utils-config.js"></script>
        <!-- interactive summary Legend for Gene View -->
        <script type="text/javascript" src="GeneView/summary-legend.js"></script>
        <!-- interactive Legend for Evidence View -->
        <script type="text/javascript" src="javascript/evidence-legend.js"></script>
        
        <script type="text/javascript" src="javascript/loginHandler/cookieUtils.js"></script>
        <script type="text/javascript" src="javascript/loginHandler/loginUtils.js"></script>
        <script type="text/javascript" src="javascript/filter-knetwork.js"></script>
        <!-- KnetMaps - js utils to save knet to knetspace -->
        <script type="text/javascript" src="javascript/saveKnetwork/save-knet.js"></script>
        
        <!-- KnetMaps - js utils to export a local download of the KnetMaps knetwork to user PC -->
        <script type="text/javascript" src="javascript/exportKnetwork/download-knet.js"></script>
          <!-- genepage utils -->
         <script type="text/javascript" src="javascript/ui-utils.js"></script>

       
        
        <!-- genepage utils -->
        <script type="text/javascript" src="javascript/genepage.js"></script>

        <!-- init utils -->
        <script type="text/javascript" src="javascript/init-utils.js"></script>
        
        <!-- gene table -->
        <script type="text/javascript" src="javascript/gene-table.js"></script>

        <!-- string data Utils-->
        <script type="text/javascript" src="javascript/string-utils.js"></script>

        <!-- google analytics-->
        <script type="text/javascript" src="javascript/google-analytics.js"></script>

        <script type="text/javascript" src="javascript/releaseNotes/showNetworkStats.js"></script>
        
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
      <div id="network_description">
              <div>
                <h4 class="search-key">Selected gene(s):</h4>
                <span style="display:flex; flex-wrap:wrap; margin-bottom:8px;"  id="search-gene"></span>
              </div>
              <div style="margin-top:1rem;" id="keyword-section">
                <h4 class="search-key">Keywords:</h4>
                <div style="display:flex; flex-wrap:wrap;" id="search-keyword"></div>
              </div>
      </div>
    </div>

    <div id="tabviewer">
        <!-- place dynamic content with text here -->
        <div id="tabviewer_content">
             <layout:network-view />
        </div>
    </div>
    </div>
  </div>

</body>
</html>