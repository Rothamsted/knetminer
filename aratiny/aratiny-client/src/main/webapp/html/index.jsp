<%@ taglib tagdir="/WEB-INF/tags/layout" prefix="layout" %>

<!-- TODO:newConfig 
  embeddable, enableGA, ga_id still to be migrated
-->
<layout:page 
	title="TODO:newConfig"
	description="TODO:newConfig"
	keywords="TODO:newConfig"
	chromosomes="TODO:newConfig, no longer used, probably to be removed"
	embeddable="false"
        enableGA = "${knetminer.enableAnalytics}"
        ga_id = "${knetminer.gaIdUi}"
>
    <jsp:attribute name="extraHeader">
    </jsp:attribute>
    <jsp:attribute name="extraBottom">
    </jsp:attribute>
</layout:page>
