package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Potato extends OndexLocalDataSource {

	public Potato() {
		super("potato", "config.xml", "SemanticMotifs.txt");
	}

}
