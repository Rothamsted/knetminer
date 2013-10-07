/**
 * 
 */
package parser.poplaranno;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

/**
 * 
 * The entrance point of parsing
 * File format : GFF3
 * File Source : JGI
 * 
 * @author huf
 * 
 */
public class PoplarGeneAnnotationParser {

	/**
	 * @param fileName
	 */
	private String annoGeneFileName; // The file from JGI
	private String annoDataPlainFileName;
	private String annoDataXMLFileName;

	public String getAnnoGeneFileName() {
		return annoGeneFileName;
	}

	public void setAnnoGeneFileName(String annoGeneFileName) {
		this.annoGeneFileName = annoGeneFileName;
	}

	public String getAnnoDataPlainFileName() {
		return annoDataPlainFileName;
	}

	public void setAnnoDataPlainFileName(String annoDataPlainFileName) {
		this.annoDataPlainFileName = annoDataPlainFileName;
	}

	public String getAnnoDataXMLFileName() {
		return annoDataXMLFileName;
	}

	public void setAnnoDataXMLFileName(String annoDataXMLFileName) {
		this.annoDataXMLFileName = annoDataXMLFileName;
	}

	public static void main(String[] args) throws FileNotFoundException,
			NullPointerException, IOException {

		PoplarGeneAnnotationParser pgaParser = new PoplarGeneAnnotationParser();

		pgaParser
				.setAnnoGeneFileName(".\\data\\annotation.Ptrichocarpa_129_gene.gff3.gz");
		pgaParser
				.setAnnoDataPlainFileName(".\\data\\annotation.Poplar_v2_gene.txt");
		pgaParser
				.setAnnoDataXMLFileName(".\\data\\Poplar_v2_annotation_template.xml");

		PoplarGeneAnnotationBuilder pgaBuilder = new PoplarGeneAnnotationBuilder();

		ArrayList<PoplarGeneAnnotation> poplarGeneAnnotationList = pgaBuilder.createPoplarGeneAnnotation(pgaParser.getAnnoGeneFileName());
		
		if (poplarGeneAnnotationList.isEmpty()) {
			System.out.println("No valid gene annotation");
			return;
		}
		
		PoplarAnnotationDataBuilder padBuilder = new PoplarAnnotationDataBuilder();
		padBuilder.createPlainAnnotationData(pgaParser.getAnnoDataPlainFileName(), poplarGeneAnnotationList);

	}

}
