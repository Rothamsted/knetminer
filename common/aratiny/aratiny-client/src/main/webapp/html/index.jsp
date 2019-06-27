<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>

<layout:page 
	title="${knetminer.specieName}"
	description="${knetminer.appDescription}"
	keywords="${knetminer.appKeywords}"
	chromosomes="${knetminer.chromosomeList}"
	embeddable="${knetminer.ui.embeddableLayout}"
>
    <jsp:attribute name="extraHeader">
    </jsp:attribute>
    <jsp:attribute name="extraBottom">
    </jsp:attribute>
</layout:page>
