<%@ tag description="Page layout" %>

<%@ attribute name="title"       required="true" description="Page title" %>
<%@ attribute name="keywords"    required="true" description="Page keywords to improve SEO" %>
<%@ attribute name="description" required="true" description="Page description" %>
<%@ attribute name="extraHeader" fragment="true" description="Extra code to put before head" %>
<%@ attribute name="extraBottom" fragment="true" description="Extra code to put before body" %>
<%@ attribute name="species" fragment="false" description="Species" %>
<%@ attribute name="image" fragment="false" description="Image" %>
<%@ attribute name="eg_keywords" fragment="false" description="e.g. keywords" %>
<%@ attribute name="chromosomes" fragment="false" description="Chromosomes" %>
<%@ attribute name="bgcolor" fragment="false" description="Background color" %>
<%@ attribute name="assembly" fragment="false" description="Genome assembly" %>

<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <meta name="keywords" content="${keywords}" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
        <link rel="stylesheet" type="text/css" href="html/css/style.css"/>
        <!-- <link rel="stylesheet" type="text/css" href="html/css/style.css"/> -->
        
        <!-- GeneMap -->
        <link rel="stylesheet" type="text/css" href="html/GeneMap/dist/styles/genemap.css"/>
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap-lib.js"></script>
        <script type="text/javascript" src="html/GeneMap/dist/js/genemap.js"></script>

        <script type="text/javascript" src="html/javascript/utils-config.js"></script>
        <script type="text/javascript" src="html/javascript/utils.js"></script>
    <!--    <script type="text/javascript" src="html/GViewer/javascript/JavaScriptFlashGateway.js"></script> -->
      	<script type="text/javascript" src="html/javascript/jquery.tablesorter.js"></script>
       	<script type="text/javascript" src="html/javascript/dtjava.js"></script>

        <jsp:invoke fragment="extraHeader"/>
    </head>
    <body>
        <!-- Main -->
        <div id="wrapper">
        	<layout:header species="${species}" />
 			<layout:content eg_keywords="${eg_keywords}" chromosomes="${chromosomes}"  assembly="${assembly}"/>
            <layout:footer/>
        </div>
        <jsp:invoke fragment="extraBottom"/>
    </body>
</html>
