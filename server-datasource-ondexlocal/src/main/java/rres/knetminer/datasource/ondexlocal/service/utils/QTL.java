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
 * @author Marco Brandizi
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
	 * The "qtl1=" part is optional so this is equivalent: "4:9920000:10180000:Petal size"
	 * TODO: to be removed? It was here in the past, now it doesn't seem to be in use anymore.
	 * 
	 */
	public static QTL fromString(String qtlStr) throws IllegalArgumentException
	{
		String[] frags = qtlStr.split ( ":" );

		if ( ! ( frags.length == 3 || frags.length == 4 ) )
			throw new IllegalArgumentException ( qtlStr + " not valid qtl region" );

		
		String chrName = frags [ 0 ];
		// 2022-05-25: I'm making 'qtl1=' optional, as said above
		if ( frags [ 0 ].contains ( "=" ) ) 
			chrName = chrName.split ( "=" ) [ 1 ];
				
		int start = Integer.parseInt ( frags[ 1 ] );
		int end = Integer.parseInt ( frags[ 2 ] );
		String label = frags.length == 4 ? frags[ 3 ] : ""; 
		
		// set "trait" equal to "label"
		if (start < end) 
			return new QTL ( chrName, null, start, end, label, "significant", 0, label, null );
		
		throw new IllegalArgumentException ( qtlStr + " not valid qtl region (start >= end)" );
	}
	
	/**
	 * Converts the format required by the countLoci() API into the one supported by 
	 * {@link #fromString(String)}. 
	 * 
	 * TODO: we should harmonise the two at some point, we use this workaround for the moment.
	 * 
	 */
	public static String countLoci2regionStr ( String countLociStr )
	{
		String[] frags = countLociStr.split ( "-" );
		
		if ( frags.length < 1  )
			throw new IllegalArgumentException ( countLociStr + " not valid qtl region" );

		String chr = frags [ 0 ];
		int start = frags.length > 1 ? Integer.parseInt ( frags [ 1 ] ) : 0;
		int end = frags.length > 2 ? Integer.parseInt ( frags [ 2 ] ) : 0;
		
		return chr + ":" + start + ":" + end;
	}
	
	public static List<QTL> fromStringList ( List<String> qtlStrings )
	{
		if ( qtlStrings == null ) qtlStrings = List.of (); 
		return qtlStrings.stream ()
		.map ( QTL::fromString )
		.collect ( Collectors.toList () );
	}
	
}
