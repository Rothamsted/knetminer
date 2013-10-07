/**
 * 
 */
package parser.poplardup;

/**
 * @author huf, keywan
 * @date 03-03-2010
 * 
 */
public class PoplarDupGeneSegment implements Comparable<PoplarDupGeneSegment>{
	
	private String segment;
	private String chromA;
	private int startA;
	private int endA;
	private String chromB;
	private int startB;
	private int endB;
	
	public PoplarDupGeneSegment(String segment, String chromA, int startA, int endA, String chromB, int startB, int endB) {
		this.segment = segment;
		this.chromA = chromA;
		this.startA = startA;
		this.endA = endA;
		this.chromB = chromB;
		this.startB = startB;
		this.endB = endB;
	}
	public String getSegment() {
		return segment;
	}
	public void setSegment(String segment) {
		this.segment = segment;
	}
	public String getChromA() {
		return chromA;
	}
	public void setChromA(String chromA) {
		this.chromA = chromA;
	}
	public int getStartA() {
		return startA;
	}
	public void setStartA(int startA) {
		this.startA = startA;
	}
	public int getEndA() {
		return endA;
	}
	public void setEndA(int endA) {
		this.endA = endA;
	}
	public String getChromB() {
		return chromB;
	}
	public void setChromB(String chromB) {
		this.chromB = chromB;
	}
	public int getStartB() {
		return startB;
	}
	public void setStartB(int startB) {
		this.startB = startB;
	}
	public int getEndB() {
		return endB;
	}
	public void setEndB(int endB) {
		this.endB = endB;
	}
	@Override
	public int compareTo(PoplarDupGeneSegment o) {
		//compare by length of segments
		int length1 = Math.max(Math.abs(endA - startA), Math.abs(endB - startB));
		int length2 = Math.max(Math.abs(o.endA - o.startA), Math.abs(o.endB - o.startB));
		
		return length2 - length1;
	}
}
