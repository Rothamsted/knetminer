package rres.knetminer.datasource.server.graphinfo;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;

/**
 * A small API to get details about a set of ONDEXConcept(s) in the ONDEXGraph managed 
 * by the KnetMiner application, given concept's numerical IDs..
 * 
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>14 Mar 2022</dd></dl>
 *
 */
@RestController ()
@RequestMapping ( "/graphinfo" )
public class GraphInfoService
{
	@RequestMapping ( path = "/concept-info", method = { RequestMethod.GET, RequestMethod.POST } )
	public Set<ConceptInfo> concetpsInfo ( @RequestParam( required = true ) Set<Integer> ids )
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