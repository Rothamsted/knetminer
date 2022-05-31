package rres.knetminer.datasource.server.graphinfo;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;

/**
 * API to query graph and graph elements details.
 * 
 * TODO: all these mappings that depend on the data-source should be checked for a real DS, at the moment
 * we have services for which any DS is accepted, which doesn't make much sense. DS is needed everywhere in 
 * our APIs, @see KnetminerDataSource#getDataSourceNames() for details. 
 * 
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>14 Mar 2022</dd></dl>
 *
 */
@RestController
@RequestMapping ( "/{ds}/graphinfo" )
@CrossOrigin
public class GraphInfoService
{
	/**
	 * @param filterAccessionsFromNames filter accessions from names, see {@link ConceptInfo}
	 */
	@RequestMapping ( path = "/concept-info", method = { RequestMethod.GET, RequestMethod.POST } )
	public Set<ConceptInfo> concetpsInfo ( 
		@RequestParam Set<Integer> ids,
		@RequestParam( required = false, defaultValue = "false" ) boolean filterAccessionsFromNames
	)
	{
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		var dataService = ondexServiceProvider.getDataService ();
		var graph = dataService.getGraph ();

		Set<ConceptInfo> result = ids.stream ()
			.map( graph::getConcept )
			.filter ( Objects::nonNull )
			.map( c -> new ConceptInfo ( c, filterAccessionsFromNames ) )
			.collect ( Collectors.toSet () );

		return result;
	}
}