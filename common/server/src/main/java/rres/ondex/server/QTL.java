package rres.ondex.server;

public class QTL {
	
	public int chrIndex;
	public String chrName;
	public String start;
	public String end;
	public String label;
	public String significance;
	//test3
	public QTL(int chrIndex, String chrName, String start, String end, String label, String significance) {
		this.chrIndex = chrIndex;
		this.chrName = chrName;
		this.start = start;
		this.end = end;
		this.label = label;
		this.significance = significance;
	}
	public int getChrIndex(){
		return chrIndex;
	}
	public void setChrIndex(int chrIndex){
		this.chrIndex = chrIndex;
	}
	public String getChrName(){
		return chrName;
	}
	public void setChrName(String chrName){
		this.chrName = chrName;
	}
	public String getStart(){
		return start;
	}
	public void setStart(String start){
		this.start =  start;
	}
	public String getEnd(){
		return end;
	}
	public void setEnd(String end){
		this.end = end;
	}
	public String getLabel(){
		return label;
	}
	public void setLabel(String label){
		this.label = label;
	}
	public boolean isValid(){
		//TODO
		return true;
	}
	public String getSignificance() {
		return significance;
	}
	public void setSignificance(String significance) {
		this.significance = significance;
	}
}
