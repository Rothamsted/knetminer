<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="eg_keywords" required="false" description="e.g. keywords" %>
<%@ attribute name="chromosomes" required="false" description="list of chromosomes" %>
<%@ attribute name="assembly" required="false" description="genome assembly" %>

<div id="content">
	<div id="search">
		<form id="gviewerForm" name="gviewerForm" action="javascript:searchKeyword()">
			<ul id="main_list">
				<li>
					<div id="keyword_search">
						<ul>
							<li><input id="keywords" name="keywords" type="text" /></li>
							<li><input type="submit" id="keywordsSubmit" value="Search" class="button" disabled/></li>
							<li><div id="loadingDiv"></div></li>
							<li><span id="hintEgKeywords" class="hint hint-small"></span></li>
							<div id="eg_keywords_hidden" style="display:none;">
								${eg_keywords}
							</div>

						</ul>
						<div id="matchesResultDiv">Please, start typing your query</div>
					</div>
				</li>
				<li>
					<b><img id="suggestor_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Query Suggestor</b>
						<span id="hintQuerySuggestor" class="hint hint-small"></span>
						<span id="suggestor_invite"></span>
						<hr />
					<div id="suggestor_search">
						<div id="suggestor_search_area" style="display:none;">
							<div id="suggestor_terms"> </div>
							<div id="suggestor_tables">You must perform a search for having the suggested terms related with your query</div>
						</div>
					</div>
				</li>
				<li id="genomeorqtlsearchbox" style="display:none;">
				<br />
				<b><img id="region_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Genome or QTL Search</b>
					<span id="hintSearchQtlGenome" class="hint hint-small"></span>
					<hr />
					<div id="region_search_area" style="display:none;">
						<div class="rightnav">
							Search:<br />
							<input type="radio" name="search_mode" value="genome" checked="checked" />whole-genome<br />
							<input type="radio" name="search_mode" value="qtl" />within region<br />
						</div>
						<table id="regions_table">
							<tr>
								<td><label>Chromosome</label></td>
								<td><label>Start</label></td>
								<td><label>End</label></td>
								<td><label>Label</label></td>
								<td><label>Genes</label></td>
							</tr>
							<tr>
								<td>
									<select id="chr1" onChange="findGenes('genes1', $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())" >
										<c:forTokens items="${chromosomes}" delims="," var="item" varStatus="status">
       									<option value="${item}">${item}</option>
    									</c:forTokens>
									</select>
								</td>
								<td><input id="start1" name="start" type="text" onKeyup="findGenes('genes1', $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())" /></td>
								<td><input id="end1" name="end" type="text" onKeyup="findGenes('genes1', $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())" /></td>
								<td><input id="label1" name="label" type="text" /></td>
								<td><input id="genes1" name="label" type="text" readonly="readonly" onfocus="findGenes(this.id, $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())" /></td>
							</tr>
							<tr>
								<td colspan="5">
									<input id="addRow" value ="Add" type="button" class="button_link" /> or
									<input id="removeRow" value="remove" type="button" disabled class="button_link" /> region.
								</td>
							</tr>
						</table>
					</div>
				</li>
				<li>
					<b><img id="advanced_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Gene List</b>
						<span id="hintEnterGenes" class="hint hint-small"></span>
						<hr />
					<div id="list_search">
						<div id="advanced_search_area" style="display:none;">
							<div class="rightnav_genelist">
								<input type="radio" name="list_mode" value="GLrestrict" checked="checked" />
								<span class="textBlock">
									Map gene list to results of keywords and Genome/QTL Search<br />
								</span>
								<input type="radio" name="list_mode" value="GL" />
								<span class="textBlock">
									Map gene list without restrictions
								</span>
							</div>
							<textarea id="list_of_genes" cols="30" rows="7"></textarea>
						</div>
					</div>
				</li>
			</ul>
		</form>
	</div>
	<div id="pGViewer_title"></div>
	<div id = "assembly">${assembly}</div>
	<div id="tabviewer">

    	<div id="tabviewer_buttons">
        	<div class="menu_button button_off" id="resultsTable_button"><a href="javascript:;" onclick="activateButton('resultsTable');">Gene View</a> </div>
        <!--	<div class="menu_button button_off" id="pGViewer_button"><a href="javascript:;" onclick="activateButton('pGViewer');">Map View</a></div> -->
		<div class="menu_button button_on" id="genemap-tab_button"><a href="javascript:;" onclick="activateButton('genemap-tab');">Map View</a></div>
        	<div class="menu_button button_on" id="evidenceTable_button"><a href="javascript:;" onclick="activateButton('evidenceTable');">Evidence View</a> </div>
        	<div class="menu_button button_on" id="NetworkCanvas_button"><a href="javascript:;" onclick="activateButton('NetworkCanvas');">Network View</a> </div>
        	<div class="button_filler"></div>
        </div>
        <div id="tabviewer_content">
            <div id="resultsTable" class="resultViewer"></div>
            <!--<div id="pGViewer" class="resultViewer">
                <center>
                    <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="600" height="600" id="GViewer2" align="middle">
                        <param name="allowScriptAccess" value="sameDomain" />
                        <param name="movie" value="html/GViewer/GViewer2.swf" />
                        <param name="quality" value="high" />
                        <param name="bgcolor" value="#FFFFFF" />
                        <param name="wmode" value="transparent">
                        <param name="FlashVars" value="&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL=html/data/annotation.xml&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&titleBarText=&browserURL=OndexServlet?position=Chr&featureLinkTarget=network&" />
                        <embed style="width:700px; height:550px;" id="embed" src="html/GViewer/GViewer2.swf" quality="high"
                            bgcolor="#FFFFFF" width="600" height="600" name="GViewer2"
                            align="middle" allowScriptAccess="sameDomain"
                            type="application/x-shockwave-flash"
                            FlashVars="&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL=html/data/annotation.xml&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&titleBarText=&browserURL=OndexServlet?position=Chr&featureLinkTarget=network&"
                            pluginspage="http://www.macromedia.com/go/getflashplayer" />
                    </object>
                </center>
            </div>
	    <div id="genemap-tab" class="resultViewer" style="display:none;" > -->
            <!-- new GeneMap -->
	    <div id="genemap-tab" class="resultViewer" style="display:none;" >
                <div id="genemap" class="bootstrap"> </div>
	    </div>
            <div id="evidenceTable" class="resultViewer" style="display:none;" ></div>
        <!--    <div id="NetworkCanvas" class="resultViewer" style="display:none;">
            	<iframe id="Network_frame" name="Network_frame" width="760" height="800" style="border:none"></iframe>
            </div> -->
            <!-- new Network Viewer -->
            <div id="NetworkCanvas" class="resultViewer" style="display:none;">
                    <div id="knet-viewer" style="display:none;">
                        <!-- Item Info pane -->
                        <div id="itemInfo" class="infoDiv" style="display:none;">
                            <table id="itemInfo_Table" class="infoTable" cellspacing=1>
                                <thead>
                                    <th>Item Info:</th>
                                    <th><button id="btnCloseItemInfoPane" onclick="closeItemInfoPane();">Close</button></th>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        <!-- KNETviewer Menubar -->
                        <div id="knetviewer-menu">
                            <input type="image" id="maximizeOverlay" src="html/KNETviewer/image/maximizeOverlay.png" title="Toggle full screen" onclick="OnMaximizeClick();" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <input type="image" id="showAll" src="html/KNETviewer/image/showAll.png" onclick="showAll();" title="Show all the concept & relations in the Network" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <input type="image" id="relayoutNetwork" src="html/KNETviewer/image/relayoutNetwork.png" onclick="rerunLayout();" title="Re-run the Layout" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <span class="knet-dropdowns">
                                <select id="layouts_dropdown" class="knet-dropdowns" onChange="rerunLayout();" title="Select network layout">
                                    <option value="Cose_layout" selected="selected" title="using CoSE layout algorithm (useful for larger networks with clustering)">CoSE layout</option>
                                    <option value="ngraph_force_layout" title="using ngraph_force layout (works well on planar graphs)">Force layout</option>
                                    <option value="Circle_layout">Circular layout</option>
                                    <option value="Concentric_layout">Concentric layout</option>
                                    <option value="Cose_Bilkent_layout" title="using CoSE-Bilkent layout (with node clustering, but performance-intensive for larger networks)">CoSE-Bilkent layout</option>
                                </select>
                                <!--Animation:<input type="checkbox" name="layoutAnimation_Chkbx" id="animateLayout" value="Enable Layout Animation" onclick="setLayoutAnimationSetting();" checked title="Check to enable layout Animation and uncheck to disable."> -->
                                <select id="changeLabelVisibility" class="knet-dropdowns" onChange="showHideLabels(this.value);" title="Select label visibility">
                                    <option value="None" selected="selected">Labels: None</option>
                                    <option value="Concepts">Labels: Concepts</option>
                                    <option value="Relations">Labels: Relations</option>
                                    <option value="Both">Labels: Both</option>
                                </select>
                                <select id="changeLabelFont" class="knet-dropdowns" onChange="changeLabelFontSize(this.value);" title="Select label font size">
                                    <option value="8">Label size: 8px</option>
                                    <option value="12">Label size: 12px</option>
                                    <option value="16" selected="selected">Label size: 16px</option>
                                    <option value="20">Label size: 20px</option>
                                    <option value="24">Label size: 24px</option>
                                    <option value="28">Label size: 28px</option>
                                    <option value="32">Label size: 32px</option>
                                    <option value="36">Label size: 36px</option>
                                    <option value="40">Label size: 40px</option>
                                </select>
			    </span>
                            <input type="image" id="resetNetwork" src="html/KNETviewer/image/resetNetwork.png" onclick="resetGraph();" title="Reposition (reset and re-fit) the graph" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <input type="image" id="savePNG" src="html/KNETviewer/image/savePNG.png" onclick="exportAsImage();" title="Export the network as a .png image" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <!-- <input type="text" id="knet_txtSearch" class="knet-dropdowns" placeholder="Search..." /> <input type="image" id="searchNetwork" value="Search" src="html/KNETviewer/image/searchNetwork.png" value="Search" onclick="findConcept($('#knet_txtSearch').val());" title="Search for concept by name" onmouseover="onHover($(this));" onmouseout="offHover($(this));"> -->
                            <input type="image" id="saveJSON" src="html/KNETviewer/image/saveJSON.png" onclick="exportAsJson();" title="Export the network in JSON format" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
                            <input type="image" id="helpURL" src="html/KNETviewer/image/help.png" onclick="openKnetHelpPage();" title="Go to help documentation" onmouseover="onHover($(this));" onmouseout="offHover($(this));">
			    <!-- Button to launch advanced menu -->
                            <!-- <input type="image" id="knetAdvancedMenu" src="html/KNETviewer/image/gearAdvanced.png" onclick="$('.knet-advanced-menu').modalPopover('toggle');" title="Open advanced menu" onmouseover="onHover($(this));" onmouseout="offHover($(this));"> -->
                        </div>
                        <!-- The core cytoscapeJS container -->
                        <div id="cy"></div>
                        <br/>
                        <!-- dynamically updated Legend to show number of shown/ hidden concepts; and by type -->
			<div id="countsLegend"><span>KNETviewer</span></div>
                        <!-- popup dialog -->
                        <div id="infoDialog"></div>
                    </div>
                    
                    <!-- Legend -->
                    <div id="legend_container">
                        <table id="legend_frame" cellspacing=1>
                            <tr><td align=center><img src="html/KNETviewer/image/Gene.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Protein.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Pathway.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Compound.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Enzyme.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Reaction.png"></td>
                                <td align=center><img src="html/KNETviewer/image/QTL.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Publication.png"></td>
                            </tr><tr>
                                <td align=center><font size=1.8px>Gene</font></td>
                                <td align=center><font size=1.8px>Protein</font></td>
                                <td align=center><font size=1.8px>Pathway</font></td>
                                <td align=center><font size=1.8px>SNP</font></td>
                                <td align=center><font size=1.8px>Enzyme</font></td>
                                <td align=center><font size=1.8px>Reaction</font></td>
                                <td align=center><font size=1.8px>QTL</font></td>
                                <td align=center><font size=1.8px>Publication</font></td>
                            </tr><tr>
                                <td align=center></td></tr><tr>
                                <td align=center><img src="html/KNETviewer/image/Phenotype.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Biological_process.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Cellular_component.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Protein_domain.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Trait_ontology.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Molecular_function.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Trait.png"></td>
                                <td align=center><img src="html/KNETviewer/image/Enzyme_classification.png"></td>
                            </tr><tr>
                                <td align=center><font size=1.8px>Phenotype</font></td>
                                <td align=center><font size=1.8px>Biol. Process</font></td>
                                <td align=center><font size=1.8px>Cell. Component</font></td>
                                <td align=center><font size=1.8px>Protein Domain</font></td>
                                <td align=center><font size=1.8px>Trait Ontology</font></td>
                                <td align=center><font size=1.8px>Mol. Function</font></td>
                                <td align=center><font size=1.8px>Trait</font></td>
                                <td align=center><font size=1.8px>Enzyme Classification</font></td>
                            </tr>
                        </table>
                    </div>
            </div>
        </div>
	</div>
</div>
