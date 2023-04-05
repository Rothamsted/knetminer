package rres.knetminer.datasource.api;

import java.util.ArrayList;
import java.util.List;

/**
 * All possible inputs to a Knetminer server request, with appropriate defaults set for all. This is the 
 * set of all possible inputs for all possible 'mode's.
 * 
 * @author holland
 *
 */
public class KnetminerRequest {
	private List<String> qtl = new ArrayList<String>();
	private String keyword = "";
	private List<String> list = new ArrayList<String>();
	private String listMode = "";
	private String taxId = "";
	
	

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

	public String getTaxId() {
		return taxId;
	}

	public void setTaxId(String taxId) {
		this.taxId = taxId;
	}

	@Override
	public String toString ()
	{
		return String.format ( 
			"KnetminerRequest{qtl: %s, keyword: %s, list: %s, listMode: %s, taxId: %s}",
			qtl, keyword, list, listMode, taxId 
		);
	}
}
