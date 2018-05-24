package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Wheat extends OndexLocalDataSource {

	public Wheat() {
		super("wheat", "config.xml", "SemanticMotifs.txt");
	}

}
