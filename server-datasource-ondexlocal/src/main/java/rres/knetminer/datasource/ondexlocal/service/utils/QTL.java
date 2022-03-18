package rres.knetminer.datasource.ondexlocal.service.utils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Represents a QTL in a structured form.
 * 
 * TODO: Future versions should incorporate additional elements of the QTL concept into the toString and
 * fromString methods.
 * 
 * @author holland
 *
 */
public class QTL {
	public String type;
	public String chromosome;
	public int start;
	public int end;
	public String label;
	public String significance;
	public float pValue;
	public String trait;
	public String taxID;

	public QTL() {
		
	}
	
	public QTL(String chromosome, String type, int start, int end, String label, String significance, float pValue,
			String trait, String taxID) {
		this.setChromosome(chromosome);
		this.setType(type);
		this.setStart(start);
		this.setEnd(end);
		this.setLabel(label);
		this.setSignificance(significance);
		this.setpValue(pValue);
		this.setTrait(trait);
		this.setTaxID(taxID);
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

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getSignificance() {
		return significance;
	}

	public void setSignificance(String significance) {
		this.significance = significance;
	}

	public float getpValue() {
		return pValue;
	}

	public void setpValue(float pValue) {
		this.pValue = pValue;
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

	public String toString() {
		String qtlStr = this.getChromosome() + ":" + this.getStart() + ":" + this.getEnd();
		String qtlLabel = this.getLabel();
		if (qtlLabel != null && !qtlLabel.equals("")) {
			qtlStr += ":" + qtlLabel;
		}
		return qtlStr;
	}

	/**
	 * Parse a chromosome region, as it comes from the client, qtl param, ie, 
	 * 
	 * "qtl1=4:9920000:10180000:Petal size" 
	 * 
	 * which means: random ID = chromosome no.:start:end:optional label
	 * 
	 * 
	 */
	public static QTL fromString(String qtlStr) throws IllegalArgumentException {
		String[] r = qtlStr.split(":");
		if (r.length == 3 || r.length == 4) {
			String chrName = r[0].split("=")[1], label = "";
			Integer start = Integer.parseInt(r[1]), end = Integer.parseInt(r[2]);
			if (r.length == 4) {
				label = r[3];
			}
			if (start < end) {
				return new QTL(chrName, null, start, end, label, "significant", 0, label, null);
				// set "trait" equal to "label"
			}
		}
		throw new IllegalArgumentException(qtlStr + " not valid qtl region");
	}
	
	public static List<QTL> fromStringList ( List<String> qtlStrings )
	{
		if ( qtlStrings == null ) qtlStrings = List.of (); 
		return qtlStrings.stream ()
		.map ( QTL::fromString )
		.collect ( Collectors.toList () );
	}
	
}
