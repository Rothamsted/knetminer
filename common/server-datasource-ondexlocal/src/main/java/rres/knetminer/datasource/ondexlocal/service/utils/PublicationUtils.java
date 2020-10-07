package rres.knetminer.datasource.ondexlocal.service.utils;

import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;

/**
 * 
 * TODO: to be merged with a class of ONDEX graph utility functions 
 *
 */
public class PublicationUtils
{

	/**
	 * Sort publications by year and remove first n publications
	 * 
	 * @param setPub
	 * @param attYear
	 * @param skip
	 * @return
	 */
	public static List<Integer> oldPubsByNumber ( Set<ONDEXConcept> setPub, AttributeName attYear, Integer skip )
	{

		List<Integer> oldPubsIds = setPub.parallelStream ()
			// - is to sort from the most recent (highest) year
			.sorted ( ( pub1,
					pub2 ) -> -Integer.compare ( getPubYear ( pub1, attYear ), getPubYear ( pub2, attYear ) ) )
			.skip ( skip ).map ( ONDEXConcept::getId ).collect ( Collectors.toList () );

		return oldPubsIds;
	}

	/**
	 * Sort publications by year and return publications older than 5 years
	 * 
	 * @param setPub
	 * @param attYear
	 * @param skip
	 * @return
	 */
	public static List<Integer> oldPubsByYear ( Set<ONDEXConcept> setPub, AttributeName attYear )
	{
		final int currentYear = Calendar.getInstance ().get ( Calendar.YEAR );
		
		List<Integer> oldPubsIds = setPub.parallelStream ()
			.filter ( pub -> getPubYear ( pub, attYear ) >= currentYear - 5 )
			.sorted ( getPubMostRecentComparator ( attYear ) )
			.map ( ONDEXConcept::getId )
			.collect ( Collectors.toList () );

		return oldPubsIds;
	}

	/**
	 * Sort and limit publications by year
	 * 
	 * @param pubs
	 * @param attYear
	 * @param limit if -1, an arbitrary limit will be chosen.
	 * @return list of n most recent publication concepts
	 */
	public static List<Integer> newPubsByNumber ( Set<ONDEXConcept> pubs, AttributeName attYear, int limit )
	{	
		// TODO: this is an arbitrary default limit, which before was completely missing
		if ( limit == -1 ) limit = 20;
		
		List<Integer> sortedAndLimitedPubs = pubs.parallelStream ()
			.sorted ( getPubMostRecentComparator ( attYear ) )
			.limit ( limit )
			.map ( ONDEXConcept::getId )
			.collect ( Collectors.toList () );

		return sortedAndLimitedPubs;

	}

	public static int getPubYear ( ONDEXConcept pubConcept, AttributeName attYear )
	{
		return Optional.ofNullable ( ONDEXGraphUtils.getAttrValueAsDouble ( pubConcept, attYear, false ) )
			.map ( Double::intValue )
			.orElse ( -1 );
	}
	
	public static Comparator<ONDEXConcept> getPubMostRecentComparator ( AttributeName attYearName )
	{
		return Collections.reverseOrder ( Comparator.comparingInt ( pub -> getPubYear ( pub, attYearName ) ) );
	}

}
