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

        <!-- DISABLED (140520): <link href="https://fonts.googleapis.com/css?family=Kanit|Play" rel="stylesheet"> -->
		
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
        
        <!-- utils -->
        <script type="text/javascript" src="html/javascript/utils.js"></script>

       

        <!-- init utils -->
        <script type="text/javascript" src="html/javascript/init-utils.js"></script>
         
      	<script type="text/javascript" src="html/javascript/jquery.tablesorter.js"></script>
        
        <!-- query suggestor -->
        <script type="text/javascript" src="html/javascript/query-suggester.js"></script>
        
        <!-- gene table -->
        <script type="text/javascript" src="html/javascript/gene-table.js"></script>
        
        <!-- evidence table -->
        <script type="text/javascript" src="html/javascript/evidence-table.js"></script>

        <!-- multi species file -->
        <script type="text/javascript" src="html/javascript/multispecies.js"></script>

        <!-- UI utils  -->
        <script type="text/javascript" src="html/javascript/ui-utils.js"></script>

        <!-- ajax data Utils-->
        <script type="text/javascript" src="html/javascript/data-utils.js"></script>
        
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
      <div id="wrapper">
        <layout:header />
        <layout:content />
        
      </div>
    </body>
       
</html>
