package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Cow extends OndexLocalDataSource {

	public Cow() {
		super("cow", "config.xml", "SemanticMotifs.txt");
	}

}
