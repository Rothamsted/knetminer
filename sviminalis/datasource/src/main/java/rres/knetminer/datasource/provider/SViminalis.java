package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class SViminalis extends OndexLocalDataSource {

	public SViminalis() {
		super("sviminalis", "config.xml", "SemanticMotifs.txt");
	}

}
