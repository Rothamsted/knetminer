<!DOCTYPE html>

<%@ tag description="Page layout" %>

<%@ attribute name="title"       required="true" description="Page title" %>
<%@ attribute name="keywords"    required="true" description="Page keywords to improve SEO" %>
<%@ attribute name="description" required="true" description="Page description" %>
<%@ attribute name="extraHeader" fragment="true" description="Extra code to put before head" %>
<%@ attribute name="extraBottom" fragment="true" description="Extra code to put before body" %>
<%@ attribute name="chromosomes" fragment="false" description="Chromosomes" %>
<%@ attribute name="bgcolor" fragment="false" description="Background color" %>
<%@ attribute name="assembly" fragment="false" description="Genome assembly" %>
<%@ attribute name="embeddable" type="java.lang.Boolean" description="Is embedded view enabled" %>

<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
    <c:if test="${!embeddable}">
        <meta name="keywords" content="${keywords}" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
        <!-- favicon added -->
        <link rel="shortcut icon" href="html/image/KnetMiner200.png" />

        <!-- Google Analytics -->
        <!-- end Google Analytics -->
        <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-88753233-1', 'auto');
        ga('send', 'pageview');
        </script>
    </c:if>
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
	<!--	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> -->
		<!-- font-awesome css -->
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
	<!--	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> -->

        <!-- Genomaps.js -->
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap-lib.js"></script>
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap.js"></script>

        <!-- jBox modal popup js -->
      	<script type="text/javascript" src="html/javascript/jBox.all.min.js"></script>
        
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
        <!-- KnetMaps - js utils to save knet to knetspace -->
        <script type="text/javascript" src="html/javascript/saveKnetwork/save-knet.js"></script>
        <script type="text/javascript" src="html/javascript/utils.js"></script>
      	<script type="text/javascript" src="html/javascript/jquery.tablesorter.js"></script>
        <!-- loader/spinner -->
        <script type="text/javascript" src="html/javascript/maskloader-spinner.js"></script>
		<!-- interactJS; DISABLED -->
	<!--	<script src="https://unpkg.com/interactjs@1.3/dist/interact.min.js"></script> -->
		
        <!-- bootstrap js -->
	<!-- 	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script> -->
		<!-- font-awesome js -->
        <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" integrity="sha384-kW+oWsYx3YpxvjtZjFXqazFpA7UP/MbiY4jvs+RWZo2+N94PFZ36T6TFkc9O3qoB" crossorigin="anonymous"></script>

        <jsp:invoke fragment="extraHeader"/>
    </head>
    <body class="${embeddable ? "embeddable" : ""}">
        <!-- Main -->
        <div id="wrapper">
            <c:choose>
                <c:when test="${!embeddable}">
                    <layout:header />
                </c:when>
                <c:otherwise>
                    <c:if test="${embeddable}">
                        <div class="logo_embedded"><img src="html/image/KnetMiner_green_white.svg" alt="Logo" height="45" /></div>
                    </c:if>
                </c:otherwise>
            </c:choose>
 			<layout:content chromosomes="${chromosomes}"  assembly="${assembly}" embeddable="${embeddable}"/>
         <!--   <c:if test="${!embeddable}">
                <layout:footer />
            </c:if> -->
        </div>
        <jsp:invoke fragment="extraBottom"/>
    </body>
</html>
