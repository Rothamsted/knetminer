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

<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>

<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <meta name="keywords" content="${keywords}" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
        <!-- favicon added -->
        <link rel="shortcut icon" href="html/image/favicon.ico" >

        <link rel="stylesheet" type="text/css" href="html/css/style.css"/> <!-- common style.css -->
        <!-- GeneMap -->
        <link rel="stylesheet" type="text/css" href="html/GeneMap/dist/styles/genemap-lib.css"/>
        <link rel="stylesheet" type="text/css" href="html/GeneMap/dist/styles/genemap.css"/>
        <!-- KnetMaps -->
        <link rel="stylesheet" type="text/css" href="html/KnetMaps/dist/css/knetmaps.css"/>

        <link href="https://fonts.googleapis.com/css?family=Kanit|Play" rel="stylesheet">

        <!-- GeneMap -->
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap-lib.js"></script>
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap.js"></script>

        <!-- KnetMaps -->
        <script type="text/javascript" src="html/KnetMaps/dist/js/knetmaps-lib-nojquery.js"></script>
        <script type="text/javascript" src="html/KnetMaps/dist/js/knetmaps.js"></script>

        
        <script type="text/javascript" src="html/javascript/utils-config.js"></script>
        <script type="text/javascript" src="html/GeneView/summariseLegend.js"></script> <!-- interactive summary Legend for Gene View -->
        <script type="text/javascript" src="html/javascript/utils.js"></script>
      	<script type="text/javascript" src="html/javascript/jquery.tablesorter.js"></script>

        <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" integrity="sha384-kW+oWsYx3YpxvjtZjFXqazFpA7UP/MbiY4jvs+RWZo2+N94PFZ36T6TFkc9O3qoB" crossorigin="anonymous"></script>

        <jsp:invoke fragment="extraHeader"/>
        
        <!-- Google Analytics -->
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                
            ga('create', 'UA-88753233-1', 'auto');
            ga('send', 'pageview');
        </script>
        <!-- end Google Analytics -->
    </head>
    <body>
        <!-- Main -->
        <div id="wrapper">
        	<layout:header />
 			<layout:content chromosomes="${chromosomes}"  assembly="${assembly}"/>
            <layout:footer/>
        </div>
        <jsp:invoke fragment="extraBottom"/>
    </body>
</html>
