package rres.knetminer.datasource.server.graphinfo;

import java.util.Set;
import java.util.stream.Collectors;

import net.sourceforge.ondex.core.ONDEXConcept;

public class ConceptInfo 
{
	public ConceptInfo ( ONDEXConcept concept ) {
		this.id = concept.getId();
		this.accessions = concept.getConceptAccessions ().stream ()
														 .map ( AccessionInfo::new )
														 .collect ( Collectors.toSet() );
		this.conceptType = concept.getOfType().getId();
		this.names = concept.getConceptNames ().stream ()
											   .map( NameInfo::new )
											   .collect( Collectors.toSet() );
		this.description = concept.getDescription();
		this.dataSource = concept.getElementOf().getId();
	}
	
	int id; 
	
	String	conceptType;
	
	Set<NameInfo> names;
	
	Set<AccessionInfo> accessions;
	
	String description;
	
	String dataSource;
	
	public int getId () {
		return id;
	}
	public void setId ( int id ) {
		this.id = id;
	}
	public String getConceptType() {
		return conceptType;
	}
	public void setConceptType(String conceptType) {
		this.conceptType = conceptType;
	}
	public Set<NameInfo> getNames () {
		return names;
	}
	public void setNames ( Set<NameInfo> names ) {
		this.names = names;
	}
	public Set<AccessionInfo> getAccessions () {
		return accessions;
	}
	public void setAccessions ( Set<AccessionInfo> accessions ) {
		this.accessions = accessions;
	}
	public String getDescription () {
		return description;
	}
	public void setDescription ( String description ) {
		this.description = description;
	}
	public String getDataSource () {
		return dataSource;
	}
	public void setDataSource ( String dataSource ) {
		this.dataSource = dataSource;
	}
}