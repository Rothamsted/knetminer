package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class Boleracea extends OndexLocalDataSource {

	public Boleracea() {
		super("boleracea", "config.xml", "SemanticMotifs.txt");
	}

}
