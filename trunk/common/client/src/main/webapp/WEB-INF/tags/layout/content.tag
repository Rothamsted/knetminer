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
							<li id="eg_keywords"> 
								<span id="hint"> <img id="hintEgKeywords" src="html/image/hint.png" alt="hint" /></span>
							</li>
							<li><div id="loadingDiv"></div></li>									
							<div id="eg_keywords_hidden" style="display:none;">
								${eg_keywords}
							</div>
											
						</ul>
						<div id="matchesResultDiv">Please, start typing your query</div>
					</div>
				</li>
				<li>
				<br />
				<b><img id="region_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Genome or QTL Search</b>
					<span id="hint"><img id="hintSearchQtlGenome" src="html/image/hint.png" alt="hint" /></span>
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
						<span id="hint">
							<img id="hintEnterGenes" src="html/image/hint.png" />
						</span>
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
				<li>						
					<b><img id="suggestor_search" src="html/image/expand.gif" style="padding-right:5px;cursor:pointer;"/>Query Suggestor</b>
						<span id="hint">
							<img id="hintQuerySuggestor" src="html/image/hint.png" />
						</span>
						<span id="suggestor_invite"></span>
						<hr />								
					<div id="suggestor_search">	
						<div id="suggestor_search_area" style="display:none;">
							<div id="suggestor_terms"> </div>
							<div id="suggestor_tables">You must perform a search for having the suggested terms related with your query</div>							
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
        	<div class="menu_button button_off" id="pGViewer_button"><a href="javascript:;" onclick="activateButton('pGViewer');">Map View</a></div>
        	<div class="menu_button button_on" id="resultsTable_button"><a href="javascript:;" onclick="activateButton('resultsTable');">Gene View</a> </div>
        	<div class="menu_button button_on" id="evidenceTable_button"><a href="javascript:;" onclick="activateButton('evidenceTable');">Evidence View</a> </div>
        	<div class="menu_button button_on" id="NetworkCanvas_button"><a href="javascript:;" onclick="activateButton('NetworkCanvas');">Network View</a> </div>			
        	<div class="button_filler"></div>
        </div>
        <div id="tabviewer_content">
            <div id="pGViewer" class="resultViewer">				
                <center>
                    <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="600" height="600" id="GViewer2" align="middle">
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
            <div id="resultsTable" class="resultViewer" style="display:none;" ></div>
            <div id="NetworkCanvas" class="resultViewer" style="display:none;position:relative;top:38px;padding-bottom:60px">
            	<iframe id="Network_frame" name="Network_frame" width="760" height="800" style="border:none"></iframe>
            </div>
			<div id="evidenceTable" class="resultViewer" style="display:none;" ></div>
        </div>        
	</div>
</div>
