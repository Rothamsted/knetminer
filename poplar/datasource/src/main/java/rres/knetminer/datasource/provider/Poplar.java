package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Poplar extends OndexLocalDataSource {

	public Poplar() {
		super("poplar", "config.xml", "SemanticMotifs.txt");
	}

}
