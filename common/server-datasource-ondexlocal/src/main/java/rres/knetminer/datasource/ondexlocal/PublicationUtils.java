package rres.knetminer.datasource.ondexlocal;

import java.util.Calendar;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ONDEXConcept;

public class PublicationUtils {
	
	/**
	 * Sort publications by year and remove first n publications
	 * 
	 * @param setPub
	 * @param attYear
	 * @param skip
	 * @return
	 */
	public static List<Integer> oldPubsByNumber(Set<ONDEXConcept> setPub, AttributeName attYear, Integer skip) {
		
			List<Integer> oldPubsIds = setPub.parallelStream ()
				// - is to sort from the most recent (highest) year
				.sorted ( (pub1, pub2) -> - Integer.compare ( getComparableYear(pub1, attYear), getComparableYear(pub2, attYear) ) )
				.skip ( skip )
				.map ( ONDEXConcept::getId ).collect(Collectors.toList());

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
	public static List<Integer> oldPubsByYear(Set<ONDEXConcept> setPub, AttributeName attYear) {
		
			final int currentYear = Calendar.getInstance().get ( Calendar.YEAR );
			
			List<Integer> oldPubsIds = setPub.parallelStream ()
				// Filter articles published before this year
				.filter ( pub -> getComparableYear(pub, attYear) >= currentYear - 5 )
				// - is to sort from the most recent (highest) year
				.sorted ( (pub1, pub2) -> - Integer.compare (getComparableYear(pub1, attYear), getComparableYear(pub2, attYear) ) )
				.map ( ONDEXConcept::getId )
			    .collect(Collectors.toList());
			
			return oldPubsIds;
	}
	
	/**
	 * Sort and limit publications by year
	 * @param setPub
	 * @param attYear
	 * @param limit
	 * @return list of n most recent publication concepts
	 */
	public static List<Integer> newPubsByNumber(Set<ONDEXConcept> setPub, AttributeName attYear, Integer limit){

		List<Integer> sortedAndLimitedPubs = setPub.parallelStream()
				// - is to sort from the most recent (highest) year
				.sorted((pub1, pub2) -> - Integer.compare (getComparableYear(pub1, attYear), getComparableYear(pub2, attYear) ) )
				.limit(limit)
				.map(ONDEXConcept::getId)
				.collect(Collectors.toList());
		
		return sortedAndLimitedPubs;
		
	}
	
	public static int getComparableYear(ONDEXConcept pubConcept, AttributeName attYear) {
		
		if(pubConcept.getAttribute(attYear) == null)
			return -1;
		Object year = pubConcept.getAttribute(attYear).getValue();
		if (year instanceof Number)
			return ((Number) year).intValue();
		// must be a string
		String syear = (String) year;
		if ("".equals(syear))
			return -1;
		try {
			return Integer.valueOf((String) year);
		} catch (NumberFormatException ex) {
			return -1;
		}
	}

}
