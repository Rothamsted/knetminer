<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="chromosomes" required="false" description="list of chromosomes" %>
<%@ attribute name="assembly" required="false" description="genome assembly" %>
<%@ attribute name="embeddable" type="java.lang.Boolean" description="Is embedded view enabled" %>

<div id="content">
	<div id="search">
		<form id="gviewerForm" name="gviewerForm" action="javascript:searchKeyword()" accept-charset="UTF-8">
			<ul id="main_list">
				<li style="position: relative;">

                    <!-- Sample Queries -->
                    <div id="info" class="details">
                        <c:if test="${embeddable}"><div class="species_header"></div></c:if>
                        <div id="info-text">
                            <div><h3  style="margin:10px 0; class="query_title">Example queries</h3>
                                <span style="display:flex;" class="close" onclick="queryToggle($('#eg_queries'),$('.query_title'),this)" title="close"><img class="close"  src="html/image/close_button.png"><img class="close" style="display:none;" src="html/image/drop-down.png"/></span></div>
                            <div id="eg_queries"></div>
                        </div>
                    </div>
				</li>
				<li style="height: 35px;padding-bottom: 10px;">
				    <p id="explainer" title="You can just search with keyword or gene list, or combine both.">
					Search KnetMiner with keywords, gene lists or genomic regions:</p>
				</li>

				<li style="width: 80%;"> <!-- Keyword search -->
				    <b><img id="kwd_search" src="html/image/collapse.gif" style="padding-right:5px;cursor:pointer;">Keyword Search</b>
					<hr width="85%" align="left">
					<div id="keyword_search">
					     <input id="keywords" name="keywords" type="text" placeholder="Search for traits, diseases, pathways, molecules, ..." style="display: inline-block;">

						 <span style="vertical-align:middle">
						      <img id="suggestor_search" src="html/image/qs_expand.png" alt="suggestions" title="Concept Selector " style="cursor:pointer; position:relative; right:41px; top:0; width:28px; height:28px; display:none;">
						 </span>

						 <div class="counttext" id="matchesResultDiv" style="display: block;">Please, start typing your query</div>

						 <!-- query suggestor -->
						 
						 	<div id="suggestor_search_div" style="border-radius:4px; /*touch-action:none; cursor:move;*/">
								<div id="suggestor_search_area" style="width: 70%; display: none;">
									<div id="suggestor_terms"> </div>
									<div id="suggestor_tables">No suggestions found</div>
								</div>
						 	</div>

					</div>
				</li>

			<!--	<li style="width: 70%;">
				  <div id="draggable-suggestor" style="border-radius:4px; touch-action:none; cursor:move;">
					<b><img id="suggestor_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;">Query Suggestor</b>
                    <span id="suggestor_invite"></span>
                    <hr width="45%" align="left">
					<div id="suggestor_search">
						<div id="suggestor_search_area" style="width: 70%; display: none;">
							<div id="suggestor_terms"> </div>
							<div id="suggestor_tables">No suggestions found</div>
						</div>
					</div>
				  </div>
				</li> -->
				<li style="padding-top:20px; width:70%;">
					<b><img id="advanced_search" src="html/image/collapse.gif" style="padding-right:5px;cursor:pointer;">Gene List Search</b>
					<hr width="45%" align="left">
					<div id="list_search">
						<div id="advanced_search_area" style="display: block;">
							<textarea id="list_of_genes" cols="50" rows="7" placeholder="Search for gene id/name (one per line)"></textarea>
							<div class='counttext' id="geneResultDiv" style="display: block;"></div>
							<!-- <div class="rightnav_genelist" style="display:none">
								<input type="radio" name="list_mode" value="GLrestrict">Intersection
								<input type="radio" name="list_mode" value="GL" checked="checked">Union </br>
							</div> -->
						</div>
					</div>
				</li>
				<li id="genomeorqtlsearchbox" style="width: 70%;padding-bottom: 20px;">
    				<br>
				    <b><img id="region_search" src="html/image/collapse.gif" style="padding-right:5px;cursor:pointer;">Genome Region Search</b>
                    <hr width="60%" align="left">
                    <div id="region_search_area">
                        <table id="regions_table">
                            <tbody><tr>
                                <td><label>Chromosome</label></td>
                                <td><label>Start</label></td>
                                <td><label>End</label></td>
                                <td><label>Label</label></td>
                                <td><label>Genes</label></td>
                            </tr>
                            <tr>
								<td>
									<select id="chr1" onChange="findGenes('genes1', $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())" >
										<!-- 
											TODO: variable doesn't exist anymore (comes from the API) try replacing this with a foo constant.
											It should work, since the actual values are updated dynamically from the API, upon specie selection.
										 -->
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
                                    <input id="addRow" value="Add" type="button" class="button_link"> or
                                    <input id="removeRow" value="remove" type="button" class="button_link"> region.
                                </td>
                            </tr>
                        </tbody></table>
                    <!--    <div class="rightnav">
                            <input type="radio" name="search_mode" value="genome" checked="checked">whole-genome
                            <input type="radio" name="search_mode" value="qtl">within region<br>
                        </div> -->
                    </div>
				</li>
				<li class='knetbtns'>
					
				<div class="msg-placement">
						<span id="pGViewer_title"></span>
						<button id="searchBtn" class="btn keywordsSubmit knet_button" type="submit" title="Search the KnetMiner knowledge network"><i class="fa fa-search" aria-hidden="true"></i> Search</button>
				</div>

				<button type="sumbit" title="Click to clear all search fields" class="resetknet" id="resetknet"> <i class="fa fa-times reseticon" aria-hidden="true"></i>Clear Search Fields</button>
				<br>
				<div class="loadingDiv"></div>

				</li>
			</ul>
		</form>
	</div>
	<div id="pGSearch_title"></div>

	<div id="tabviewer" style="display: none;">

    	<div id="tabviewer_buttons">
        	<div class="button_off" id="resultsTable_button"><a href="javascript:;" onclick="activateButton('resultsTable');">Gene View</a> </div>
        <!--	<div class="menu_button button_off" id="pGViewer_button"><a href="javascript:;" onclick="activateButton('pGViewer');">Map View</a></div> -->
		<div class="menu_button button_on" id="evidenceTable_button"><a href="javascript:;" onclick="activateButton('evidenceTable');">Evidence View</a> </div>
			<div class="button_on" id="genemap-tab_button"><a href="javascript:;" onclick="activateButton('genemap-tab');">Map View</a></div>
        	<div class="button_on network-default" id="NetworkCanvas_button"><a href="javascript:;" onclick="activateButton('NetworkCanvas');">Network View</a> </div>
        </div>
		
        <div id="tabviewer_content">
            <div id="resultsTable" class="resultViewer"></div>
            <!-- new genomaps.js -->
            <div id="genemap-tab" class="resultViewer" style="display: none;">
                <div id="genemap" class="bootstrap"></div>
            </div>
            <div id="evidenceTable" class="resultViewer" style="display:none;"></div>
            <!-- Network View tab -->
            <div id="NetworkCanvas" class="resultViewer" style="display: none;">

				<div id="export-menu">
				   	<div id="knetGeneExport" class="export_border" style="border-bottom: .3px solid silver"></div>
					<div id="visibleGraphExport" class="export_border"></div>
				</div>

                <div id="knetSaveButton" style="margin-top:7px;float:right;"></div>

                <div style="margin-top:7px;float:right;margin-right:10px;">
					<button class="network_button" id="exportBtns">
					<img src="html/image/Knetdownload.png" alt="export menu" width="20"/>
					</button>
				</div>

                <!-- KnetMaps.js -->
                <div id="knet-maps" style="display:none;"></div>

            </div>
        </div>
    </div>  <!-- tabviewer -->
</div>
