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
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>14 Mar 2022</dd></dl>
 *
 */
@RestController
//We have made the DS optional, see #753
@RequestMapping ( { "/{ds}/graphinfo", "/graphinfo" } )
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