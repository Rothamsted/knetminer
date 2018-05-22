package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Drosophilla extends OndexLocalDataSource {

	public Drosophilla() {
		super("drosophilla", "config.xml", "SemanticMotifs.txt");
	}

}
