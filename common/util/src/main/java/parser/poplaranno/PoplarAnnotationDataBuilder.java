/**
 * 
 */
package parser.poplaranno;

import java.io.*;
import java.util.ArrayList;

/**
 * @author huf
 * @date 05-03-2010
 * 
 */
public class PoplarAnnotationDataBuilder {

	public void createPlainAnnotationData(String annoDataPlainFileName,
			ArrayList<PoplarGeneAnnotation> poplarGeneAnnotationList)
			throws FileNotFoundException, IOException {

		File annoDataPlainFile = new File(annoDataPlainFileName);

		if (annoDataPlainFile == null) {
			throw new IllegalArgumentException("File should not be null.");
		}
		if (!annoDataPlainFile.exists()) {
			throw new FileNotFoundException("File does not exist: "
					+ annoDataPlainFile);
		}
		if (!annoDataPlainFile.isFile()) {
			throw new IllegalArgumentException("Should not be a directory: "
					+ annoDataPlainFile);
		}
		if (!annoDataPlainFile.canWrite()) {
			throw new IllegalArgumentException("File cannot be written: "
					+ annoDataPlainFile);
		}

		// use buffering
		Writer output = new BufferedWriter(new FileWriter(annoDataPlainFile));
		try {

			for (PoplarGeneAnnotation aPoplarGeneAnnotation : poplarGeneAnnotationList) {
				String lineContent = new StringBuffer().append(
						aPoplarGeneAnnotation.getChromosome()).append("\t")
						.append(aPoplarGeneAnnotation.getStart()).append("\t")
						.append(aPoplarGeneAnnotation.getEnd()).append("\n").toString();

				// FileWriter always assumes default encoding is OK!
				output.write(lineContent);
			}

		} finally {
			output.close();
		}

	}

	public void toXMLAnnotationData() {

	}

}
