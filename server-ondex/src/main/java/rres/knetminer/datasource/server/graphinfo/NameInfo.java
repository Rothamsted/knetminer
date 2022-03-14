package rres.knetminer.datasource.server.graphinfo;

import net.sourceforge.ondex.core.ConceptName;

public class NameInfo
{
	public NameInfo ( ConceptName name )
	{
		this.name = name.getName();
		this.preferred = name.isPreferred();
	}
	
	String name;
	
	boolean preferred;
	
	public String getName () {
		return name;
	}

	public void setName ( String name ) {
		this.name = name;
	}

	public boolean isPreferred () {
		return preferred;
	}

	public void setPreferred ( boolean preferred ) {
		this.preferred = preferred;
	}
	
}