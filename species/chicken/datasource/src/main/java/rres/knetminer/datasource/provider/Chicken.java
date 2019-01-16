package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Chicken extends OndexLocalDataSource {

	public Chicken() {
		super("chicken", "config.xml", "SemanticMotifs.txt");
	}

}
