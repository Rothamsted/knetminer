package rres.knetminer.datasource.server.utils.googleanalytics4;

import java.util.Optional;

public abstract class Parameter<T>
{
	private String name;
	private T value;

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