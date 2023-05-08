const knetWidgets = function() 
{

    function getList(){
        var getTaxIdFrag = knetSelector.getTaxId();
        $.get(api_url + '/dataset-info/chromosome-ids' + getTaxIdFrag ,'').done( function(chromosomes){
            for(let i=0; i < chromosomes.length; i++){
                var chr1Options = '<option value='+chromosomes[i]+'>'+ chromosomes[i]+'</option>';
                $('#chr1').append(chr1Options);
            }  
        }).fail(function (xhr,status,errorlog){
            errorComponent('.nav',xhr,status,errorlog);
        });
    }

    function renderHtml(species){
        document.title = species.title; 
        document.querySelector('meta[name="description"]').content = species.description;
        document.querySelector('meta[name="keywords"]').content = species.keywords;
    }

    function drawMap(basemapString,data){  
        var getTaxIdFrag = knetSelector.getTaxId();
        var taxIdBaseXmlUrl = api_url + '/dataset-info/basemap.xml'+ getTaxIdFrag; 
            if(basemapString === 'draw'){
                genemap.draw('#genemap',taxIdBaseXmlUrl, data)
            }else{
                genemap.drawFromRawAnnotationXML('#genemap',taxIdBaseXmlUrl,data);
            }
    
    }

    return {
        getList:getList,
        html:renderHtml,
        drawMap:drawMap
    }


}()