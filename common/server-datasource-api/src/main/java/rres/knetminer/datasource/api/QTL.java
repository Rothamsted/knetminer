package rres.knetminer.datasource.api;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonDeserialize(using = QTL.QTLDeserializer.class)
@JsonSerialize(using = QTL.QTLSerializer.class)
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

	public QTL(String type, String chromosome, int start, int end, String label, String significance, float pValue,
			String trait, String taxID) {
		this.setType(type);
		this.setChromosome(chromosome);
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

	public static QTL fromString(String qtlStr) throws IllegalArgumentException {
		String[] r = qtlStr.split(":");
		if (r.length == 3 || r.length == 4) {
			String chrName = r[0], label = "";
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

	class QTLDeserializer extends JsonDeserializer<QTL> {
		@Override
		public QTL deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
				throws IOException, JsonProcessingException {

			String qtlStr = jsonParser.getText();
			return QTL.fromString(qtlStr);
		}
	}

	class QTLSerializer extends JsonSerializer<QTL> {
		@Override
		public void serialize(QTL qtl, JsonGenerator jsonGenerator, SerializerProvider serializerProvider)
				throws IOException, JsonProcessingException {
			jsonGenerator.writeObject(qtl.toString());
		}
	}
}
