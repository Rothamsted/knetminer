package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Tomato extends OndexLocalDataSource {

	public Tomato() {
		super("tomato", "config.xml", "SemanticMotifs.txt");
	}

}
