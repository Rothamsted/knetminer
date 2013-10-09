/**
 * 
 */
package parser.poplaranno;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

/**
 * @author huf
 * @date 05-03-2010
 * 
 */
public class PoplarGeneAnnotationBuilder  {

	public ArrayList<PoplarGeneAnnotation> createPoplarGeneAnnotation(
			String annoGeneFileName) throws IOException, FileNotFoundException,
			NullPointerException {
		
		ArrayList<PoplarGeneAnnotation> poplarGeneAnnotationList = new ArrayList<PoplarGeneAnnotation>();

		String line;

		GZipFileHandler gzHandler = new GZipFileHandler();
		BufferedReader bReader = gzHandler.ReadingGZipFile(annoGeneFileName);

		while ((line = bReader.readLine()) != null) {
			//Each line looks like:
			//scaffold_1	Ptrichocarpav2_0	gene	12632	13612	.	+	.	ID=POPTR_0001s00200;Name=POPTR_0001s00200
			String[] gff3Info = line.split("\t");
    
			String chromosome = gff3Info[0];
			int start = Integer.valueOf(gff3Info[3]).intValue();
			int end = Integer.valueOf(gff3Info[4]).intValue();

			PoplarGeneAnnotation gene;
			
			if (gff3Info[2].equals("gene") && isValidChromosome(chromosome)) {

				if (start < end) {
					gene = new PoplarGeneAnnotation(
							chromosome, start, end);

				} else {
					// else it's on the reverse strand and we invert the start
					// and stops
					gene = new PoplarGeneAnnotation(
							chromosome, end, start);

				}
				poplarGeneAnnotationList.add(gene);
				// System.out.println();
			} // else
			// System.out.println();
		}

		return poplarGeneAnnotationList;
	}

	private boolean isValidChromosome(String chromosome){
		try {
			if (chromosome.split("_")[1].equals(""))
				return false;
		} catch (Exception e) {
			e.printStackTrace();
		}

		int x = Integer.valueOf(chromosome.split("_")[1]);

		if (x <= 19)
			return true;
		else
			return false;
	}
}
