/**
 * 
 * Build Poplar Basemap XML based on synteny duplication segments
 * 	
 * Step 1 - read Poplar_v2_basemap_template.xml
 * Step 2 - write to template.xml by reading oplarDupGeneSegmentsList
 * 
 */

package parser.poplardup;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;


/**
 * @author huf, keywan
 * @date 04-03-2010
 * 
 */
public class PoplarBaseMapBuilder {

	public void createPoplarBaseMap(String baseMapFileName, ArrayList<PoplarDupGeneSegment> poplarDupGeneSegmentList) {
		
		Document originalDoc = ParsingXML(baseMapFileName);
		Document modifiedDoc = ModifyingXML(originalDoc, poplarDupGeneSegmentList);
		OutputtingXML(modifiedDoc, baseMapFileName);
		
//		if (doc == null) return 
	}
	

	private Document ParsingXML(String baseMapFileName){
		
		DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder docBuilder = docBuilderFactory.newDocumentBuilder();
			Document doc = docBuilder.parse (new File(baseMapFileName));
			
			return doc;
          
			//System.out.println(listOfChromosomes.item(0).getAttributes().item(0).getTextContent());
		} catch (ParserConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
		
	}
	
	private Document ModifyingXML(Document doc, ArrayList<PoplarDupGeneSegment> poplarDupGeneSegmentList){
		
		System.out.println("Number of segments: "+poplarDupGeneSegmentList.size());
		int maxColors = 50;
		NodeList listOfChromosomes = doc.getElementsByTagName("chromosome");
		
		// Band index counters for 19 chromosomes
		int[] bandIndexCounters = new int[19];
		
		HashMap<String, Color> colormap= computeColorTable(poplarDupGeneSegmentList, maxColors);
		
		int count = 0;
		for (PoplarDupGeneSegment seg : poplarDupGeneSegmentList){
			count++;
			Color color = colormap.get(seg.getSegment());
			if(count >= maxColors)
				color = Color.GRAY;
			int idxA = Integer.valueOf(seg.getChromA().split("_")[1]).intValue();
			String startA = Integer.toString(seg.getStartA());
			String endA = Integer.toString(seg.getEndA());
			int idxB = Integer.valueOf(seg.getChromB().split("_")[1]).intValue();
			String startB = Integer.toString(seg.getStartB());
			String endB = Integer.toString(seg.getEndB());
			
			// Make the first band
			Node bandANode = doc.createElement("band");
			NamedNodeMap bandAttributesA = bandANode.getAttributes();
			Attr indexA = doc.createAttribute("index");
			indexA.setValue(Integer.valueOf(++bandIndexCounters[idxA-1]).toString());
			bandAttributesA.setNamedItem(indexA);
			
			Node startANode = doc.createElement("start");
			startANode.setTextContent(startA);
			bandANode.appendChild(startANode);

			Node endANode = doc.createElement("end");
			endANode.setTextContent(endA);
			bandANode.appendChild(endANode);
			
			String hexColor = "0x" + Integer.toHexString( color.getRGB() & 0x00ffffff );
			
			Node colorANode = doc.createElement("color");
			colorANode.setTextContent(hexColor);
			bandANode.appendChild(colorANode);
			
			listOfChromosomes.item(idxA-1).appendChild(bandANode);
			
			// Make the second band
			Node bandBNode = doc.createElement("band");
			NamedNodeMap bandAttributesB = bandBNode.getAttributes();
			Attr indexB = doc.createAttribute("index");
			indexB.setValue(Integer.valueOf(++bandIndexCounters[idxB-1]).toString());
			bandAttributesB.setNamedItem(indexB);
			
			Node startBNode = doc.createElement("start");
			startBNode.setTextContent(startB);
			bandBNode.appendChild(startBNode);

			Node endBNode = doc.createElement("end");
			endBNode.setTextContent(endB);
			bandBNode.appendChild(endBNode);
			
			Node colorBNode = doc.createElement("color");
			colorBNode.setTextContent(hexColor);
			bandBNode.appendChild(colorBNode);
			
			listOfChromosomes.item(idxB-1).appendChild(bandBNode);
		}
		
		System.out.println("Number of segments used: "+count);
		return doc;
		
	}
	
	private void OutputtingXML(Document doc, String baseMapFileName){
		
		try {
			Source source = new DOMSource(doc);
			// Prepare the output file 
			File file = new File("..\\GViewerClient\\WebContent\\html\\GViewer\\data\\basemap\\Poplar_basemap.xml"); 
			Result result = new StreamResult(file); 
			// Write the DOM document to the file 
			Transformer xformer = TransformerFactory.newInstance().newTransformer();
			xformer.setOutputProperty(OutputKeys.INDENT, "yes");
			xformer.transform(source, result);
		} catch (TransformerConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TransformerFactoryConfigurationError e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TransformerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	//==============================COLOR=====================================
	
    /**
     * a table linking values to colors.
     */
    private HashMap<String, Color> colortable;
    
    
    /**
     * computes the color table. max is equivalent to the the number of
     * colores to be produced.
     */
    private HashMap<String, Color> computeColorTable(ArrayList<PoplarDupGeneSegment> bands, int max) {
        colortable = new HashMap<String, Color>();
        double l = (double) bands.size();
        if(max < bands.size())
        	l = (double) max;
        double resolution = 1.0 / l;
        double hue = 0.0;
        
        int c = 0;
        for(PoplarDupGeneSegment band : bands){
	
        	if(++c >= max) {
        		break;
        	}
        	
            colortable.put(band.getSegment(), new Color(hueToRGB(hue)));
            hue += resolution;

        }

        return colortable;
    }
    
    /**
     * creates an rgb int for the given hue.
     *
     * @param h
     * @return
     */
    private int hueToRGB(double h) {
        return HSVtoRGB((float) h, 1.0f, 1.0f);
    }
    

    /**
     * converts a HSV color representation into an rgb encoded integer.
     *
     * @param h hue
     * @param s saturation
     * @param v value
     * @return
     */
    private int HSVtoRGB(float h, float s, float v) {
        h *= 6;
        // H is given on [0->6] or -1. S and V are given on [0->1].
        // RGB are each returned on [0->1].

        float m, n, f;
        int i;

        float[] hsv = new float[3];
        float[] rgb = new float[3];

        hsv[0] = h;
        hsv[1] = s;
        hsv[2] = v;

        if (hsv[0] == -1) {
            rgb[0] = rgb[1] = rgb[2] = hsv[2];
        } else {
            i = (int) (Math.floor(hsv[0]));
            f = hsv[0] - i;
            if (i % 2 == 0)
                f = 1 - f; // if i is even
            m = hsv[2] * (1 - hsv[1]);
            n = hsv[2] * (1 - hsv[1] * f);
            switch (i) {
                case 6:
                case 0:
                    rgb[0] = hsv[2];
                    rgb[1] = n;
                    rgb[2] = m;
                    break;
                case 1:
                    rgb[0] = n;
                    rgb[1] = hsv[2];
                    rgb[2] = m;
                    break;
                case 2:
                    rgb[0] = m;
                    rgb[1] = hsv[2];
                    rgb[2] = n;
                    break;
                case 3:
                    rgb[0] = m;
                    rgb[1] = n;
                    rgb[2] = hsv[2];
                    break;
                case 4:
                    rgb[0] = n;
                    rgb[1] = m;
                    rgb[2] = hsv[2];
                    break;
                case 5:
                    rgb[0] = hsv[2];
                    rgb[1] = m;
                    rgb[2] = n;
                    break;
            }
        }

        int r = (int) (rgb[0] * 255.0f);
        int g = (int) (rgb[1] * 255.0f);
        int b = (int) (rgb[2] * 255.0f);

        int out = 0;
        out += r << 16;
        out += g << 8;
        out += b;

        return out;

    }

}
