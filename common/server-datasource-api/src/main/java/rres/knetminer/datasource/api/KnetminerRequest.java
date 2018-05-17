package rres.knetminer.datasource.api;

import java.util.List;

public class KnetminerRequest {
	private List<QTL> qtls;
	private String keyword;
	private List<String> list;
	private String listMode;

	public List<QTL> getQtls() {
		return qtls;
	}

	public void setQtls(List<QTL> qtls) {
		this.qtls = qtls;
	}

	public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

	public List<String> getList() {
		return list;
	}

	public void setList(List<String> list) {
		this.list = list;
	}

	public String getListMode() {
		return listMode;
	}

	public void setListMode(String listMode) {
		this.listMode = listMode;
	}

}
