package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Barley extends OndexLocalDataSource {

	public Barley() {
		super("barley", "config.xml", "SemanticMotifs.txt");
	}

}
