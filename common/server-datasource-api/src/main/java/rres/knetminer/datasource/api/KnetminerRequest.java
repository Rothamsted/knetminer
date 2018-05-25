package rres.knetminer.datasource.api;

import java.util.ArrayList;
import java.util.List;

public class KnetminerRequest {
	private List<String> qtl = new ArrayList<String>();
	private String keyword = "";
	private List<String> list = new ArrayList<String>();
	private String listMode = "";

	public KnetminerRequest() {

	}

	public List<String> getQtl() {
		return qtl;
	}

	public void setQtl(List<String> qtl) {
		this.qtl = qtl;
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
