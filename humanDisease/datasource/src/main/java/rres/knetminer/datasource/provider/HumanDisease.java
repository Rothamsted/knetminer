package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class HumanDisease extends OndexLocalDataSource {

	public HumanDisease() {
		super("humanDisease", "config.xml", "SemanticMotifs.txt");
	}

}
