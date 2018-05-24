package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Pig extends OndexLocalDataSource {

	public Pig() {
		super("pig", "config.xml", "SemanticMotifs.txt");
	}

}
