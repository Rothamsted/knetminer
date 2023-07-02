
<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div id="NetworkCanvas" class="result_viewer" style="display: none;">

				<div id="export-menu" onmouseleave="hidePopupOnLeave('#export-menu')">
				   	<div id="knetGeneExport" class="export_border" style="border-bottom: .3px solid silver"></div>
					<div id="visibleGraphExport" class="export_border"></div>
				</div>

                <div id="knetSaveButton" style="margin-top:7px;float:right;"></div>

                <div style="margin-top:7px;float:right;margin-right:10px;">
					<button onmouseenter="showPopupOnHover('#export-menu')" class="network_button" id="exportBtns">
					<img src="html/image/Knetdownload.png" alt="export menu" width="20"/>
					</button>
				</div>

                <!-- KnetMaps.js -->
                <div id="knet-maps" style="display:none;"></div>
</div>
			