package utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Transforms a GFF3 file into a GViewer annotation file
 * 
 * @author keywan
 *
 */
public class GviewerConverter {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		
		if (args.length < 1)
			System.out.println("Usage: java utils.GviewerConverter [.gff3 file]");
		
		String gffFile = args[0]; //"D:\\GViewer\\PigQTLdb.gff3";
		System.out.println("Create GViewer annotation file from "+gffFile);
		
		BufferedReader input = new BufferedReader(new FileReader(gffFile));
		BufferedWriter output = new BufferedWriter(new FileWriter(gffFile+".GViewer"));
		
		Pattern pTrait = Pattern.compile("Trait=(.+?);.*PubMed_ID=(\\d+)");

	    int id = 0;
		String inputLine = input.readLine();
		inputLine = input.readLine(); // skip header
		
		output.write("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
		output.write("<genome>\n");
		
		HashSet<String> parsed = new HashSet<String>();
		
		while (inputLine != null) {
			
            String[] col = inputLine.split("\t");
            String chrom = col[0].trim().split("\\.")[1];
            String beg = col[3].trim().replaceAll("\\.\\d+", "");
            String end = col[4].trim().replaceAll("\\.\\d+", "");
            String desc = col[8].trim();
            
            String trait = "";
            String pmid = "";
            Matcher m = pTrait.matcher(desc);
            if(m.find()){
            	trait = m.group(1);
            	pmid = m.group(2);
            }
//            System.out.println(chrom+" "+beg+" "+end+" "+trait+" "+pmid);
           
            int begNum = Integer.parseInt(beg);
            int endNum = Integer.parseInt(end);
            
            if(begNum > endNum){
            	int temp = begNum;
            	begNum = endNum;
            	endNum = temp;
            }
            	
            
            
            if(trait.contains("backfat") && (endNum != 0) && (endNum - begNum <= 10000000)){
            
	            output.write("<feature id=\"" + ++id + "\">\n");
	            output.write("<chromosome>" + chrom + "</chromosome>\n");
	            output.write("<start>" + begNum + "</start>\n");
	            output.write("<end>" + endNum + "</end>\n");
	            output.write("<type>qtl</type>\n");
	            output.write("<label>" + trait + "</label>\n");
	            output.write("<link>http://www.ncbi.nlm.nih.gov/pubmed/" + pmid + "</link>\n");
	            output.write("</feature>\n");
	            
	            parsed.add(chrom+"_"+begNum+"_"+endNum);
            
            }
            
            inputLine = input.readLine();
            
		}   
            
		output.write("</genome>\n");
		output.close();
		
		System.out.println("Created "+id+" QTL.");

	}

}
