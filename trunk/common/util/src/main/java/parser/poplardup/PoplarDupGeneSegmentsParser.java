package parser.poplardup;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

/**
 * 
 * The entrance point of parsing
 * File format : FASTA
 * File Source : JGI
 * @author huf
 * @date 03-03-2010
 * 
 */

public class PoplarDupGeneSegmentsParser {

	private String baseMapFileName;
	private String dupSegmentFileName;

	public String getBaseMapFileName() {
		return baseMapFileName;
	}

	public void setBaseMapFileName(String baseMapFileName) {
		this.baseMapFileName = baseMapFileName;
	}

	public String getDupSegmentFileName() {
		return dupSegmentFileName;
	}

	public void setDupSegmentFileName(String dupSegmentFileName) {
		this.dupSegmentFileName = dupSegmentFileName;
	}

	public static void main(String[] args) throws FileNotFoundException,
			IOException, NullPointerException {

		PoplarDupGeneSegmentsParser pdgsParser = new PoplarDupGeneSegmentsParser();
		pdgsParser.setBaseMapFileName("D:\\GViewer\\Poplar_v2_basemap_template.xml");
		pdgsParser.setDupSegmentFileName("D:\\GViewer\\allPoplarSegments.seg");

		PoplarDupGeneSegmentsBuilder psBuilder = new PoplarDupGeneSegmentsBuilder();

		ArrayList<PoplarDupGeneSegment> bandingPattern = psBuilder.createPoplarDupGeneSegments(pdgsParser.getDupSegmentFileName());
		
		if (bandingPattern.isEmpty()) {
			System.out.println("No valid duplicate segment(s)");
			return;
		}

		PoplarBaseMapBuilder pbBuilder = new PoplarBaseMapBuilder();
		pbBuilder.createPoplarBaseMap(pdgsParser.getBaseMapFileName(), bandingPattern);

		// Print test statement
		// System.out.println(psBuilder.getPoplarDupGeneSegmentsList().size());

	}

}
