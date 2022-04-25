package rres.knetminer.datasource.server.graphinfo;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;

/**
 * A small API to get details about a set of ONDEXConcept(s) in the ONDEXGraph managed 
 * by the KnetMiner application, given concept's numerical IDs.
 * 
 * 
 * TODO: all these mappings that depend on the data-source should be checked for a real DS, at the moment
 * we have services for which any DS is accepted, which doesn't make much sense. DS is needed everywhere in 
 * our APIs, @see KnetminerDataSource#getDataSourceNames() for details. 
 * 
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>14 Mar 2022</dd></dl>
 *
 */
@RestController ()
@RequestMapping ( "/{ds}/graphinfo" )
@CrossOrigin
public class GraphInfoService
{
	@RequestMapping ( path = "/concept-info", method = { RequestMethod.GET, RequestMethod.POST } )
	public Set<ConceptInfo> concetpsInfo ( 
		@RequestParam Set<Integer> ids,
		@RequestParam( required = false, defaultValue = "false" ) boolean filterAccessionsFromNames
	)
	{
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		var dataService = ondexServiceProvider.getDataService ();
		var graph = dataService.getGraph ();

		Set<ConceptInfo> result = ids.stream ().map( graph::getConcept )
			.filter ( Objects::nonNull ).map( ConceptInfo::new )
			.collect ( Collectors.toSet () );

		return result;
	}
}