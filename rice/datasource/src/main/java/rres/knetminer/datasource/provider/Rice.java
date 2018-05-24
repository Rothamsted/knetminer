package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Rice extends OndexLocalDataSource {

	public Rice() {
		super("rice", "config.xml", "SemanticMotifs.txt");
	}

}
