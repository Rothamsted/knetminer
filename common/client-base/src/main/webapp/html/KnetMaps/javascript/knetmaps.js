var KNETMAPS = KNETMAPS || {};

KNETMAPS.KnetMaps = function() {

	var maskloader = KNETMAPS.MaskLoader();
	var generator = KNETMAPS.Generator();
	
	var drawDiv = function(target) {
		$(target).html("<div id='knetmaps-menu'>"
				+ "<input type='submit' id='maximizeOverlay' class='max unhover' value='' title='Toggle full screen' onclick='KNETMAPS.Menu().OnMaximizeClick();' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='submit' id='showAll' value='' class='unhover' onclick='KNETMAPS.Menu().showAll();' title='Show all the concept & relations in the Network' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='submit' id='openItemInfoBtn' value='' class='unhover' onclick='KNETMAPS.Menu().popupItemInfo();' title='Show Info box' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='submit' id='relayoutNetwork' value='' class='unhover' onclick='KNETMAPS.Menu().rerunLayout();' title='Re-run the Layout' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<span class='knet-dropdowns'>"
				+ "<select id='layouts_dropdown' class='knet-dropdowns' onChange='KNETMAPS.Menu().rerunLayout();' title='Select network layout'>"
				+ "<option value='cose_layout' selected='selected' title='using CoSE layout algorithm (useful for larger networks with clustering)'>CoSE layout</option>"
				+ "<option value='ngraph_force_layout' title='using ngraph_force layout (works well on planar graphs)'>Force layout</option>"
				+ "<option value='circle_layout'>Circular layout</option>"
				+ "<option value='concentric_layout'>Concentric layout</option>"
				+ "<option value='coseBilkent_layout' title='using CoSE-Bilkent layout (with node clustering, but performance-intensive for larger networks)'>CoSE-Bilkent layout</option>"
				+
				/*
				 * "<option value='euler_layout'>Euler layout</option>"+ "<option
				 * value='random_layout'>Random layout</option>"+
				 */
				"</select>"
				+ "<select id='changeLabelVisibility' class='knet-dropdowns' onChange='KNETMAPS.Menu().showHideLabels(this.value);' title='Select label visibility'>"
				+ "<option value='None' selected='selected'>Labels: None</option>"
				+ "<option value='Concepts'>Labels: Concepts</option>"
				+ "<option value='Relations'>Labels: Relations</option>"
				+ "<option value='Both'>Labels: Both</option>"
				+ "</select>"
				+ "<select id='changeLabelFont' class='knet-dropdowns' onChange='KNETMAPS.Menu().changeLabelFontSize(this.value);' title='Select label font size'>"
				+ "<option value='8'>Label size: 8px</option>"
				+ "<option value='12'>Label size: 12px</option>"
				+ "<option value='16' selected='selected'>Label size: 16px</option>"
				+ "<option value='20'>Label size: 20px</option>"
				+ "<option value='24'>Label size: 24px</option>"
				+ "<option value='28'>Label size: 28px</option>"
				+ "<option value='32'>Label size: 32px</option>"
				+ "<option value='36'>Label size: 36px</option>"
				+ "<option value='40'>Label size: 40px</option>"
				+ "</select>"
				+ "</span>"
				+ "<input type='submit' id='resetNetwork' value='' class='unhover' onclick='KNETMAPS.Menu().resetGraph();' title='Reposition (reset and re-fit) the graph' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='submit' id='saveJSON' value='' class='unhover' onclick='KNETMAPS.Menu().exportAsJson();' title='Save the knetwork to knetspace' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
			/*	+ "<input type='submit' id='openJSON' value='' class='unhover' onclick='KNETMAPS.Menu().importJson();' title='Import a kNetwork json' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>" */
				+ "<input type='submit' id='savePNG' value='' class='unhover' onclick='KNETMAPS.Menu().exportAsImage();' title='Export the network as a .png image' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='submit' id='helpURL' value='' class='unhover' onclick='KNETMAPS.Menu().openKnetHelpPage();' title='Go to help documentation' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));'>"
				+ "<input type='file' accept='.json,.cyjs.json,.cyjs,.cx' id='openNetworkFile' style='display:none' onchange='KNETMAPS.Menu().OpenKnetFile(event);' >"
				+ "</div> <!-- KnetMaps Menubar -->"
				+ "<div id='itemInfo' class='infoDiv' style='display:none;'> <!-- Item Info pane -->"
				+ "<table id='itemInfo_Table' class='infoTable' cellspacing=1>"
				+ "<thead><th>Info box:</th>"
				+ "<th><input type='submit' id='btnCloseItemInfoPane' value='' onclick='KNETMAPS.ItemInfo().closeItemInfoPane();'></th>"
				+ "</thead><tbody></tbody></table>"
				+ "</div>"
				+ "<!-- The core cytoscapeJS container -->"
				+ "<div id='cy'></div>"
				+ "<!-- interactive, dynamic Legend to show all concept of a particular type -->"
				+ "<div id='knetLegend' title='Hover over icons to see corresponding Concept type & click an icon to show all such Concepts connected to visible Concepts in this network'><span>Concepts:</span></div>"
				+ "<!-- dynamically updated Legend to show number of shown/ hidden concepts -->"
				+ "<div id='statsLegend' style='width: 350px; margin: auto;'><span>KnetMaps</span></div>"
				+ "<div id='infoDialog'></div> <!-- popup dialog -->"
				);
	};

	var showDiv = function(target) {
		$(target).css("display", "block"); // show the KnetMaps block
	};

	var my = function() {};

	// Exposed API

	my.drawRaw = function(target, graph) {
		drawDiv(target);
		showDiv(target);
		maskloader.showNetworkLoader(target);
		generator.generateNetworkGraphRaw(graph);
		maskloader.removeNetworkLoader(target);
	};

	my.draw = function(target, eles_jsons, metadata_json, eles_styles) {
		drawDiv(target);
		showDiv(target);
		maskloader.showNetworkLoader(target);
		generator.generateNetworkGraph(eles_jsons, metadata_json, eles_styles);
		maskloader.removeNetworkLoader(target);
	};

	return my;
};
