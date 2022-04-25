package rres.knetminer.datasource.server.graphinfo;

import net.sourceforge.ondex.core.ConceptName;

public class NameInfo
{
	private String name;
	private boolean preferred;

	public NameInfo ( ConceptName name )
	{
		this.name = name.getName();
		this.preferred = name.isPreferred();
	}
	
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