package rres.knetminer.datasource.ondexlocal.pojo;

public class Concept {
	
	public Concept(String label, String score, String distance, String pValue) {
		super();
		this.label = label;
		this.score = score;
		this.distance = distance;
		this.pValue = pValue;
	}

	String label;
	String score;
	String distance;
	String pValue;

	public String getLabel () {
		return label;
	}

	public void setLabel ( String label ) {
		this.label = label;
	}

	public String getScore() {
		return score;
	}

	public void setScore(String score) {
		this.score = score;
	}

	public String getDistance() {
		return distance;
	}

	public void setDistance(String distance) {
		this.distance = distance;
	}

	public String getpValue() {
		return pValue;
	}

	public void setpValue(String pValue) {
		this.pValue = pValue;
	}
}
