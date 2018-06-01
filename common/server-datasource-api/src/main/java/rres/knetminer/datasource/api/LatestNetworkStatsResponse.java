package rres.knetminer.datasource.api;

public class LatestNetworkStatsResponse extends KnetminerResponse {
	public String stats;
	
	public void setStats(String stats) {
		this.stats = stats;
	}
	
	public String getStats() {
		return this.stats;
	}
}
