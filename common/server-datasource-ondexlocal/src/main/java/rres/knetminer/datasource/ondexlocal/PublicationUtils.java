package rres.knetminer.datasource.ondexlocal;

import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import net.sourceforge.ondex.core.Attribute;
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
		
		// First, we need a year converter to int
		// -1 is a fallback case, which will push all invalid years down
		Function<ONDEXConcept, Integer> conceptYear = 
			c -> Optional.ofNullable ( c.getAttribute ( attYear ) )
			.map ( Attribute::getValue ) 
			.map ( year -> { // We come up here only when attribute+value != null			
				if ( year instanceof Number ) return ((Number) year).intValue ();
				// must be a string, then, if it's something else it's an error
				String syear = (String) year;
				if ( "".equals ( syear ) ) return -1;
				try {
					return Integer.valueOf ( syear );
				}
				catch ( NumberFormatException ex ) {
					return -1;
				}
			})
			.orElse ( -1 ); // if either the attribute or its value is null
			
			List<Integer> oldPubsIds = setPub.parallelStream ()
				// - is to sort from the most recent (highest) year
				.sorted ( (pub1, pub2) -> - Integer.compare ( conceptYear.apply ( pub1 ), conceptYear.apply ( pub2 ) ) )
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
		
		// First, we need a year converter to int
		// -1 is a fallback case, which will push all invalid years down
		Function<ONDEXConcept, Integer> conceptYear = 
			c -> Optional.ofNullable ( c.getAttribute ( attYear ) )
			.map ( Attribute::getValue ) 
			.map ( year -> { // We come up here only when attribute+value != null			
				if ( year instanceof Number ) return ((Number) year).intValue ();
				// must be a string, then, if it's something else it's an error
				String syear = (String) year;
				if ( "".equals ( syear ) ) return -1;
				try {
					return Integer.valueOf ( syear );
				}
				catch ( NumberFormatException ex ) {
					return -1;
				}
			})
			.orElse ( -1 ); // if either the attribute or its value is null
			


			// Use this version for oldPubsIds if you prefer to limit by year
			final int currentYear = Calendar.getInstance().get ( Calendar.YEAR );
			
			List<Integer> oldPubsIds = setPub.parallelStream ()
				// Filter articles published before this year
				.filter ( pub -> conceptYear.apply ( pub ) >= currentYear - 5 )
				.sorted ( (pub1, pub2) -> - Integer.compare ( conceptYear.apply ( pub1 ), conceptYear.apply ( pub2 ) ) )
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
		
		Function<ONDEXConcept, Integer> conceptYear = c -> Optional.ofNullable(c.getAttribute(attYear))
				.map(Attribute::getValue).map(year -> { 
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
				}).orElse(-1);

		// Now, let's sort using streams
		List<Integer> sortedAndLimitedPubs = setPub.parallelStream()
				// - is to sort from the most recent (highest) year
				.sorted((pub1, pub2) -> -Integer.compare(conceptYear.apply(pub1), conceptYear.apply(pub2)))
				.limit(20)
				.map(ONDEXConcept::getId)
				.collect(Collectors.toList());
		
		return sortedAndLimitedPubs;
		
		
	}

}
