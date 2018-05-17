package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Arabidopsis extends OndexLocalDataSource {

	public Arabidopsis() {
		super(new String[]{"arabidopsis"}, "config.xml", "SemanticMotifs.txt");
	}

}
