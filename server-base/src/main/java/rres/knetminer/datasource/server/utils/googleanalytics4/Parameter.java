package rres.knetminer.datasource.server.utils.googleanalytics4;

import java.util.Optional;

/**
 * Parameters you can attach to an {@link Event}.
 * 
 * The concrete extensions of this class correspond to what GA4/MP supports (as far as we know).
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>27 May 2023</dd></dl>
 *
 */
public abstract class Parameter<T>
{
	private String name;
	private T value;

	/**
	 * The name is validated via {@link GoogleAnalyticsUtils#validateGAName(String)}, to ensure
	 * GA accepts it. You can use {@link GoogleAnalyticsUtils#normalizeGAName(String)} to tame
	 * possibly invalid names.
	 * 
	 * TODO: the values are restricted too, validation to be added.
	 */
	public Parameter ( String name, T value )
	{
		GoogleAnalyticsUtils.validateGAName ( name );
		this.name = name;
		setValue ( value );
	}

	private void setValue ( T value ) {
		this.value = value;
	}
	
	public T getValue () {
		return this.value;
	}
	
	public String getString ()
	{
		return Optional.ofNullable ( value )
			.map ( Object::toString )
			.orElse ( null );
	}
	
	public String getName ()
	{
		return name;
	}

	@Override
	public String toString ()
	{
		String vstr = Optional.ofNullable ( this.value )
			.map ( Object::toString )
			.orElse ( "<null>" );
				
		return String.format ( "Parameter{name: %s, value: %s}", name, vstr );
	}

}