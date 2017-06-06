package rres.ondex.server;

public class QTL {
	public String type;
	public String chromosome;
	public Integer start;
	public Integer end;
	public String label;
	public String significance;
	public Float pValue;
	public String trait;
        public String taxID;
	
	public QTL(String chromosome, String type, Integer start, Integer end, String label, String significance, Float pValue, String trait, String taxID) {
		this.type = type;
		this.chromosome = chromosome;
		this.start = start;
		this.end = end;
		this.label = label;
		this.significance = significance;
		this.pValue = pValue;
		this.trait = trait;
                this.taxID= taxID;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getChromosome() {
		return chromosome;
	}

	public void setChromosome(String chromosome) {
		this.chromosome = chromosome;
	}

	public Float getpValue() {
		return pValue;
	}

	public void setpValue(Float pValue) {
		this.pValue = pValue;
	}
	
	public Integer getStart(){
		return start;
	}
	public void setStart(Integer start){
		this.start =  start;
	}
	public Integer getEnd(){
		return end;
	}
	public void setEnd(Integer end){
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
	public String getTrait() {
		return trait;
	}
	public void setTrait(String trait) {
		this.trait = trait;
	}

	public String getTaxID() {
		return taxID;
	}

	public void setTaxID(String taxID) {
		this.taxID = taxID;
	}

}
