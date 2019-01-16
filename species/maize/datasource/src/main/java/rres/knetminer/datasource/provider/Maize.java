package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Maize extends OndexLocalDataSource {

	public Maize() {
		super("maize", "config.xml", "SemanticMotifs.txt");
	}

}
