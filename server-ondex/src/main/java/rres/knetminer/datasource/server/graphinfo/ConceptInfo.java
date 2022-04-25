package rres.knetminer.datasource.server.graphinfo;

import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.util.GraphLabelsUtils;

public class ConceptInfo 
{
	private int id; 
	private String	conceptType;
	private Set<NameInfo> names;
	private Set<AccessionInfo> accessions;
	private String description;
	private String dataSource;
	
	/**
	 * Defaults to filterAccessionsFromNames = false
	 */
	public ConceptInfo ( ONDEXConcept concept )
	{
		this ( concept, false );
	}

	/**
	 * @param filterAccessionsFromNames without this, names are reflected on 
	 *   {@link NameInfo} as-is, if it's true, name strings that exists in the
	 *   accession strings are removed from the result. This is useful in some
	 *   UI visualisations. 
	 *   
	 */
	public ConceptInfo ( ONDEXConcept concept, boolean filterAccessionsFromNames ) 
	{
		this.id = concept.getId();
		this.conceptType = concept.getOfType().getId();
		
		this.accessions = concept.getConceptAccessions ()
			.stream ()
			.map ( AccessionInfo::new )
			// Avoid to return them in random order
			.collect ( Collectors.toCollection( () -> new TreeSet<> (
				Comparator.comparing ( AccessionInfo::getAccession )
				.thenComparing ( Comparator.comparing ( AccessionInfo::getDataSource ) )
			)));
		
		Stream<ConceptName> namesStream = filterAccessionsFromNames
			? GraphLabelsUtils.filterAccessionsFromNamesAsStream ( concept )
			: concept.getConceptNames ().stream ();
		
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
	
	/**
	 * They're sorted first by giving priority to {@link ConceptName#isPreferred() preferred names} and 
	 * then alphabetically. 
	 */
	public Set<NameInfo> getNames () {
		return names;
	}
	public void setNames ( Set<NameInfo> names ) {
		this.names = names;
	}
	
	/**
	 * Similarly to {@link #getNames()}, it sorts first by {@link ConceptAccession#getAccession() accession string}
	 * and then by {@link ConceptAccession#getElementOf() accession source}.
	 */
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