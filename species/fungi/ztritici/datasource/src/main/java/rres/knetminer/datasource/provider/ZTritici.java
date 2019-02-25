package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

public class ZTritici extends OndexLocalDataSource {

	public ZTritici() {
		super("ztritici", "config.xml", "SemanticMotifs.txt");
	}

}
