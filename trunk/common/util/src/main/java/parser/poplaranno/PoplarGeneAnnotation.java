/**
 * 
 */
package parser.poplaranno;

/**
 * @author huf
 * @date 05-03-2010
 *
 */
public class PoplarGeneAnnotation implements Comparable<Object> {
	
	private String chromosome;
	private int start;
	private int end;
	
	public PoplarGeneAnnotation (String chromosome, int start, int end){
		
		this.chromosome = chromosome;
		this.start = start;
		this.end = end;
	}
	
	public String getChromosome() {
		return chromosome;
	}



	public void setChromosome(String chromosome) {
		this.chromosome = chromosome;
	}



	public int getStart() {
		return start;
	}



	public void setStart(int start) {
		this.start = start;
	}



	public int getEnd() {
		return end;
	}



	public void setEnd(int end) {
		this.end = end;
	}



	@Override
	public int compareTo(Object arg0) {
		// TODO Auto-generated method stub
		return 0;
	}
	
	

}
