package rres.knetminer.datasource.server.graphinfo;

import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.google.common.collect.Comparators;

import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.util.GraphLabelsUtils;

public class ConceptInfo 
{
	public ConceptInfo ( ONDEXConcept concept )
	{
		this ( concept, false );
	}
	
	public ConceptInfo ( ONDEXConcept concept, boolean filterAccessionsFromNames ) 
	{
		this.id = concept.getId();
		
		this.accessions = concept.getConceptAccessions ()
			.stream ()
			.map ( AccessionInfo::new )
			// Avoid to return them in random order
			.collect ( Collectors.toCollection( () -> new TreeSet<> (
				Comparator.comparing ( AccessionInfo::getAccession )
				.thenComparing ( Comparator.comparing ( AccessionInfo::getDataSource ) )
			)));
		
		this.conceptType = concept.getOfType().getId();

		Stream<ConceptName> namesStream = GraphLabelsUtils.filterAccessionsFromNamesAsStream ( concept );
		this.names = namesStream == null 
			? Set.of() 
			: namesStream.map( NameInfo::new )
					// Same as above
					.collect ( Collectors.toCollection( () -> new TreeSet<> (
						Comparator.comparing ( NameInfo::isPreferred )
						.reversed ()
						.thenComparing ( Comparator.comparing ( NameInfo::getName ) )
					)));
		
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