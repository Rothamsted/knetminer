<!DOCTYPE html>

<%@ tag description="Page layout" %>
<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>

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
        <link rel="shortcut icon" href="html/image/KnetMiner200.png" />

        <!--JBox (managed by update-js.sh) -->
        <link rel="stylesheet" type="text/css" href="html/lib/jbox/jBox.all.min.css"/>

        <!-- KnetMiner button css -->
        <link rel="stylesheet" type="text/css" href="html/css/button.css"/>

        <!-- genes distance css -->
        <link rel="stylesheet" type="text/css" href="html/css/genes-distance.css"/>

         <!-- KnetMiner common style.css -->
        <link rel="stylesheet" type="text/css" href="html/css/style.css"/>

        <!-- Login css -->
        <link rel="stylesheet" type="text/css" href="html/css/loginStyle.css"/>
        <!-- loader/spinner css -->
        <link rel="stylesheet" type="text/css" href="html/css/maskloader-spinner.css"/>

        <!-- 
        	Genomaps.js CSS
        	 
        	TODO: We're taking jquery from this distro, maybe it's not what we want.
        -->
        <link rel="stylesheet" type="text/css" href="html/lib/genomaps/css/jquery-bstrap.min.css"/>
        <link rel="stylesheet" type="text/css" href="html/lib/genomaps/css/genomap.min.css"/>
        
        <!-- KnetMaps.js CSS -->
        <link rel="stylesheet" type="text/css" href="html/lib/knetmaps/css/knetmaps.css"/>

        <!-- DISABLED (140520): <link href="https://fonts.googleapis.com/css?family=Kanit|Play" rel="stylesheet"> -->
		
				<!-- bootstrap css -->
				<!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> -->
				<!-- font-awesome css -->
				<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

        <!-- 
        	Genomaps.js
        	
        	TODO: We're taking jquery from this distro, maybe it's not what we want.
        -->
        <script type="text/javascript" src="html/lib/genomaps/js/jquery-bstrap.min.js"></script>
        
        <!-- 
        	TODO: this should be part of knetmaps.js, see update-js.sh.
        	TODO: Do we need html/lib/jquery-ui/jquery-ui.css too? 
        -->
        <script type="text/javascript" src="html/lib/jquery-ui/jquery-ui.min.js"></script>
        
        <script type="text/javascript" src="html/lib/genomaps/js/genomap-lib.min.js"></script>
        <script type="text/javascript" src="html/lib/genomaps/js/genomap.min.js"></script>

        <!--JBox (managed by update-js.sh) -->
      	<script type="text/javascript" src="html/lib/jbox/jBox.all.min.js"></script>

        <!--Particle-->
        <!--  
        	TODO: Should we use update-js.sh and download all the 3rd-party dependency, rather 
        	than linking them? Certainly, the links should mention a version.
       	-->
        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
        
        <!-- KnetMaps.js -->
        <script type="text/javascript" src="html/lib/knetmaps/js/knetmaps-lib-nojquery.min.js"></script>
        <script type="text/javascript" src="html/lib/knetmaps/js/knetmaps.min.js"></script>

        <script type="text/javascript" src="html/javascript/utils-config.js"></script>
        <!-- interactive summary Legend for Gene View -->
        <script type="text/javascript" src="html/GeneView/summary-legend.js"></script>
        <!-- interactive Legend for Evidence View -->
        <script type="text/javascript" src="html/javascript/evidence-legend.js"></script>
        
        <script type="text/javascript" src="html/javascript/loginHandler/cookieUtils.js"></script>
        <script type="text/javascript" src="html/javascript/loginHandler/loginUtils.js"></script>
        <script type="text/javascript" src="html/javascript/filter-knetwork.js"></script>
        <!-- KnetMaps - js utils to save knet to knetspace -->
        <script type="text/javascript" src="html/javascript/saveKnetwork/save-knet.js"></script>
        
        <!-- KnetMaps - js utils to export a local download of the KnetMaps knetwork to user PC -->
        <script type="text/javascript" src="html/javascript/exportKnetwork/download-knet.js"></script>
        
        <!-- utils -->
        <script type="text/javascript" src="html/javascript/utils.js"></script>

           <!-- tooltips data -->
        <script type="text/javascript" src="html/javascript/tooltips-data.js"></script>

          <!-- string loadtimes files -->
        <script type="text/javascript" src="html/javascript/loadtimes-popup.js"></script>

              <!-- species selector file -->
        <script type="text/javascript" src="html/javascript/user-access.js"></script>

        <!-- init utils -->
        <script type="text/javascript" src="html/javascript/init-utils.js"></script>
         
      	<script type="text/javascript" src="html/lib/jquery-tablesorter/js/jquery.tablesorter.min.js"></script>
        
        <!-- query suggestor -->
        <script type="text/javascript" src="html/javascript/query-suggester.js"></script>

        <!-- species selector file -->
        <script type="text/javascript" src="html/javascript/species-selector.js"></script>

        <!-- species selector file -->
        <script type="text/javascript" src="html/javascript/genes-distance.js"></script>

        <!-- multi species file -->
        <script type="text/javascript" src="html/javascript/knet-widget.js"></script>

       
        
        <!-- gene table -->
        <script type="text/javascript" src="html/javascript/gene-table.js"></script>
        
        <!-- evidence table -->
        <script type="text/javascript" src="html/javascript/evidence-table.js"></script>

        <!-- Web cache -->
        <script type="text/javascript" src="html/javascript/web-cache.js"></script>
        
        <!-- Chromosome region-->
        <script type="text/javascript" src="html/javascript/chromosome-region.js"></script>


        <!-- UI utils  -->
        <script type="text/javascript" src="html/javascript/ui-utils.js"></script>

        <!-- Example Queries -->
        <script type="text/javascript" src="html/javascript/example-queries.js"></script>

        <!-- table-handler -->
        <script type="text/javascript" src="html/javascript/table-scrolling.js"></script>

        <!-- ajax data Utils-->
        <script type="text/javascript" src="html/javascript/data-utils.js"></script>

        <!-- string data Utils-->
        <script type="text/javascript" src="html/javascript/string-utils.js"></script>
      
        <!-- google analytics-->
        <script type="text/javascript" src="html/javascript/google-analytics.js"></script>

        <script type="text/javascript" src="html/javascript/releaseNotes/showNetworkStats.js"></script>
        
        <!-- interactJS; DISABLED -->
        <!--	<script src="https://unpkg.com/interactjs@1.3/dist/interact.min.js"></script> -->

        <!-- bootstrap js TODO: REMOVE! JQuery is taken from genomaps distro files and needs to be an older version -->
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
        <%-- We used to have a footer
          TODO: to be removed? If yes, remove footer.tag too
        <layout:footer />
        --%>
      </div>
    </body>
</html>
