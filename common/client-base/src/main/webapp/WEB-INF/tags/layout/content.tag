<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="chromosomes" required="false" description="list of chromosomes" %>
<%@ attribute name="assembly" required="false" description="genome assembly" %>

<div id="content">
	<div id="search">
		<form id="gviewerForm" name="gviewerForm" action="javascript:searchKeyword()" accept-charset="UTF-8">
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
                    <!-- Keyword search -->
                    <div id="keyword_search">
                    <ul>
                        <li>
                            <p id="explainer" title="You can just search with keyword or gene list, or combine both.">
							Search the knowledge network with keywords, gene list and genomic regions:</p>
                        </li>
						<br><br>
                            <li>
							    <b><img id="kwd_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;">Keyword Search</b>
								<hr width="45%" align="left">
                                <input id="keywords" name="keywords" type="text" placeholder="Search Knetminer for traits, genes, pathways, ..." style="display:none;"/>
                            </li>
                    </ul>
				<!--	</div>-->
					<div id="matchesResultDiv"></div>
                </li>
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
				<li style="padding-top:20px; width:70%;">
					<b><img id="advanced_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Gene List</b>
					<hr width="45%" align="left">
					<div id="list_search">
						<div id="advanced_search_area" style="display:none;">
							<textarea id="list_of_genes" cols="50" rows="7" placeholder="gene_id&#10;gene_name"></textarea>
							<!-- <div class="rightnav_genelist" style="display:none">
								<input type="radio" name="list_mode" value="GLrestrict">Intersection
								<input type="radio" name="list_mode" value="GL" checked="checked">Union </br>
							</div> -->
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
                                    <input id="removeRow" value="remove" type="button" class="button_link" /> region.
                                </td>
                            </tr>
                        </table>
                        <div class="rightnav">
                            <input type="radio" name="search_mode" value="genome" checked="checked">whole-genome
                            <input type="radio" name="search_mode" value="qtl">within region<br>
                        </div>
                    </div>
				</li>
				<br>
				<li>
				<!--    <input class="keywordsSubmit knet_button button" type="button" value="Search Network" onclick="searchKeyword();" title="Search the KnetMiner knowledge network"/> -->
					<button class="btn keywordsSubmit knet_button" onclick="searchKeyword();" title="Search the KnetMiner knowledge network">Search <i class="fa fa-search"></i></button>
					<br>
				    <div class="loadingDiv" style="margin-left: 0px;top:7px;"></div>
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
				<div id="genemap" class="bootstrap"></div>
			</div>
			<div id="evidenceTable" class="resultViewer" style="display:none;" ></div>
			<!-- new KnetMaps.js -->
			<div id="NetworkCanvas" class="resultViewer" style="display:none;">
			<!-- KnetMaps -->
				<div id="knet-maps" style="display:none;"></div>
			</div>
		</div>
	</div>  <!-- tabviewer -->
</div>  <!-- content -->
</div>
