  /**
 * 
 */
package parser.poplardup;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;


/**
 * @author huf
 * @date 03-03-2010
 * 
 */
public class PoplarDupGeneSegmentsBuilder {
	
	private ArrayList<PoplarDupGeneSegment> poplarDupGeneSegmentsList = new ArrayList<PoplarDupGeneSegment>();;

	public ArrayList<PoplarDupGeneSegment> getPoplarDupGeneSegmentsList() {
		return poplarDupGeneSegmentsList;
	}

	public void setPoplarDupGeneSegmentsList(
			ArrayList<PoplarDupGeneSegment> poplarDupGeneSegmentsList) {
		this.poplarDupGeneSegmentsList = poplarDupGeneSegmentsList;
	}

	public ArrayList<PoplarDupGeneSegment> createPoplarDupGeneSegments(String fileName)
			throws IOException, FileNotFoundException, NullPointerException {

		String line;
		
		//Plain text file reading
		BufferedReader input = new BufferedReader(new FileReader(fileName));

		while ((line = input.readLine()) != null) {
			String[] segInfo = line.split("\t");

			// Check if ChromA or ChromB is larger than 19, the total number in
			// poplar
			if (isValidSegment(segInfo[1], segInfo[4])) {

				PoplarDupGeneSegment seg = new PoplarDupGeneSegment(segInfo[0],
						segInfo[1], Integer.valueOf(segInfo[2]).intValue(),
						Integer.valueOf(segInfo[3]).intValue(), segInfo[4],
						Integer.valueOf(segInfo[5]).intValue(), Integer
								.valueOf(segInfo[6]).intValue());
				// System.out.println(Integer.valueOf(segInfo[2]).intValue());
				this.poplarDupGeneSegmentsList.add(seg);
				//System.out.println("No invalid segment(s)");
			} 
//			else
//				System.out.println("Skip invalid segment: " + segInfo[0] + "\t" + segInfo[1] + "\t" + segInfo[4]);
		}
		
        Collections.sort(poplarDupGeneSegmentsList);
        
		return poplarDupGeneSegmentsList;
	}

	private boolean isValidSegment(String ChromA, String ChromB) {

		try {
			if (ChromA.split("_")[1].equals("")
					|| ChromB.split("_")[1].equals(""))
				return false;
		} catch (Exception e) {
			e.printStackTrace();
		}

		int x = Integer.valueOf(ChromA.split("_")[1]);

		int y = Integer.valueOf(ChromB.split("_")[1]);

		if (x <= 19 && y <= 19)
			return true;
		else
			return false;
	}

}
