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
                                    <!-- Sample Queries -->
                                    <div id="info" class="details">
                                        <div id="info-text">
                                            <div style="height: 10px;"><h3>Example queries</h3>
                                                <a class="close" href="#info" title="close"><img src="html/image/close_button.png"/></a>
                                            </div>
                                            <div id="eg_queries"></div>
                                        </div>
                                    </div>
                                    
                                    <div id="keyword_search">
						<ul>
							<li><input id="keywords" name="keywords" type="text" placeholder="Search Knetminer for traits, genes, pathways, ..." />
							<span style="vertical-align:middle;">
							<input style="position:relative; right:41px; top:7px; width:30px;height:30px;" type="image" id="keywordsSubmit" src="html/image/search_button.jpg" alt="Submit" class="button" disabled/>
						<!--	<input style="position:relative; right:41px; top:7px; width:30px;height:30px;" type="image" id="keywordsSubmit" src="html/image/search_button.jpg" alt="Submit" class="button" onclick="searchKeyword();"/> -->
							</span></li>
							<li><div id="loadingDiv"></div></li>
						</ul>
						<div id="matchesResultDiv"></div>
					    <!-- <div id="eg_keywords_hidden" style="display:none;">
							${eg_keywords}
						</div> -->
						
					</div>
				<li>
					<b><img id="suggestor_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Query Suggestor</b>
						<span id="suggestor_invite"></span>
						<hr width="45%" align="left">
					<div id="suggestor_search">
						<div id="suggestor_search_area" style="display:none; width:70%;">
							<div id="suggestor_terms"> </div>
							<div id="suggestor_tables">You must perform a search for having the suggested terms related with your query</div>
						</div>
					</div>
				</li>
				<li id="genomeorqtlsearchbox" style="display:none; width:70%;">
				<br />
				<b><img id="region_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Genome or QTL Search</b>
					<hr width="45%" align="left">
					<div id="region_search_area" style="display:none;">
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
						<div class="rightnav">				
							<input type="radio" name="search_mode" value="genome" checked="checked">whole-genome
							<input type="radio" name="search_mode" value="qtl">within region<br>
						</div>
					</div>
				</li>
				<li style="padding-top:20px; width:70%;">
					<b><img id="advanced_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Gene List</b>
						<hr width="45%" align="left">
					<div id="list_search">
						<div id="advanced_search_area" style="display:none;">
							<textarea id="list_of_genes" cols="50" rows="7"></textarea>
							<div class="rightnav_genelist" style="display:none">
								<input type="radio" name="list_mode" value="GLrestrict">Intersection								
								<input type="radio" name="list_mode" value="GL" checked="checked">Union </br>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</form>
	</div>
	
	<div id="pGViewer_title"></div>
	<div id="tabviewer">

    	<div id="tabviewer_buttons">
        	<div class="menu_button button_off" id="resultsTable_button"><a href="javascript:;" onclick="activateButton('resultsTable');">Gene View</a> </div>
        <!--	<div class="menu_button button_off" id="pGViewer_button"><a href="javascript:;" onclick="activateButton('pGViewer');">Map View</a></div> -->
		<div class="menu_button button_on" id="genemap-tab_button"><a href="javascript:;" onclick="activateButton('genemap-tab');">Map View</a></div>
        	<div class="menu_button button_on" id="evidenceTable_button"><a href="javascript:;" onclick="activateButton('evidenceTable');">Evidence View</a> </div>
        	<div class="menu_button button_on" id="NetworkCanvas_button"><a href="javascript:;" onclick="activateButton('NetworkCanvas');">Network View</a> </div>
        
        </div>
        <div id="tabviewer_content">
            <div id="resultsTable" class="resultViewer"></div>
            <!-- new GeneoMaps.js -->
	    <div id="genemap-tab" class="resultViewer" style="display:none;" >
                <div id="genemap" class="bootstrap"> </div>
	    </div>
            <div id="evidenceTable" class="resultViewer" style="display:none;" ></div>
            <!-- new KnetMaps.js -->
            <div id="NetworkCanvas" class="resultViewer" style="display:none;">
                    <!-- KnetMaps -->
                    <div id="knet-maps" style="display:none;">
                        <div id="knetmaps-menu"></div> <!-- KnetMaps Menubar -->
                        <div id="itemInfo" class="infoDiv" style="display:none;"> <!-- Item Info pane -->
                            <table id="itemInfo_Table" class="infoTable" cellspacing=1>
                                <thead><th>Info box:</th>
                                   <!-- <th><button id="btnCloseItemInfoPane" onclick="closeItemInfoPane();">Close</button></th> -->
                                    <th><input type="image" id="btnCloseItemInfoPane" src="html/KnetMaps/image/close-icon.png" onclick="closeItemInfoPane();"></th>
                                </thead><tbody></tbody></table>
                        </div>
                        <!-- The core cytoscapeJS container -->
                        <div id="cy"></div>
                        <!-- interactive, dynamic Legend to show all concept of a particular type -->
                        <div id="knetLegend" title="Hover over icons to see corresponding Concept type & click an icon to show all such Concepts connected to visible Concepts in this network"><span>Concepts:</span></div>
                        <!-- dynamically updated Legend to show number of shown/ hidden concepts -->
                        <div id="statsLegend" style="width: 350px; margin: auto;"><span>KnetMaps</span></div>
                        <div id="infoDialog"></div> <!-- popup dialog -->
                    </div>
            </div>
        </div>
        </div>  <!-- tabviewer -->
    </div>  <!-- content -->
</div>
