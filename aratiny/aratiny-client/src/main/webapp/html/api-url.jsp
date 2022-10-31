<%@page import="rres.knetminer.client.KnetminerClientUtils"%>
<%--
  *** Returns the Knetminer API base URL. See all the details in outputApiUrl() ***
--%>
<%
	KnetminerClientUtils.outputApiUrl ( request, response, out, "/html/api-url.jsp" );
%>

