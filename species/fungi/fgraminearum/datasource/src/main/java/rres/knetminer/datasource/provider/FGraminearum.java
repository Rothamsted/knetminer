package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class FGraminearum extends OndexLocalDataSource {

	public FGraminearum() {
		super("fgraminearum", "config.xml", "SemanticMotifs.txt");
	}

}
