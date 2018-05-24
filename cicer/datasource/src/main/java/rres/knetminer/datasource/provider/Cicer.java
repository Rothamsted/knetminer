package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Cicer extends OndexLocalDataSource {

	public Cicer() {
		super("cicer", "config.xml", "SemanticMotifs.txt");
	}

}
