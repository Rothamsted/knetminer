package rres.knetminer.datasource.server;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.KnetminerResponse;
import rres.knetminer.datasource.api.QTL;

@RestController
@RequestMapping("/")
public class KnetminerServer {

	@Autowired
	private List<KnetminerDataSource> dataSources;

	private Map<String, KnetminerDataSource> dataSourceCache;

	private void buildDataSourceCache() {
		this.dataSourceCache = new HashMap<String, KnetminerDataSource>();
		for (KnetminerDataSource dataSource : this.dataSources) {
			for (String ds : dataSource.getDataSourceNames()) {
				this.dataSourceCache.put(ds, dataSource);
			}
		}
	}

	@GetMapping("/{ds}/{mode}")
	public ResponseEntity<KnetminerResponse> handle(@PathVariable String ds, @PathVariable String mode,
			@RequestParam(required = false) List<String> qtl,
			@RequestParam(required = false, defaultValue = "") String keyword,
			@RequestParam(required = false) List<String> list,
			@RequestParam(required = false, defaultValue = "") String listMode) {
		if (qtl == null) {
			qtl = Collections.emptyList();
		}
		if (list == null) {
			list = Collections.emptyList();
		}
		KnetminerRequest request = new KnetminerRequest();
		request.setKeyword(keyword);
		request.setListMode(listMode);
		request.setList(list);
		List<QTL> qtls = new ArrayList<QTL>();
		try {
			for (String qtlStr : qtl) {
				qtls.add(QTL.fromString(qtlStr));
			}
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.BAD_REQUEST);
		}
		request.setQtls(qtls);
		return this._handle(ds, mode, request);
	}

	@PostMapping("/{ds}/{mode}")
	public ResponseEntity<KnetminerResponse> handle(@PathVariable String ds, @PathVariable String mode,
			@RequestBody KnetminerRequest request) {
		return this._handle(ds, mode, request);
	}

	private ResponseEntity<KnetminerResponse> _handle(String ds, String mode, KnetminerRequest request) {
		if (this.dataSourceCache == null) {
			this.buildDataSourceCache();
		}
		KnetminerDataSource dataSource = this.dataSourceCache.get(ds);
		if (dataSource == null) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.NOT_FOUND);
		}
		try {
			KnetminerResponse response;
			Method method = dataSource.getClass().getMethod(mode, String.class, KnetminerRequest.class);
			response = (KnetminerResponse) method.invoke(dataSource, ds, request);
			return new ResponseEntity<KnetminerResponse>(response, HttpStatus.OK);
		} catch (NoSuchMethodException e) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.NOT_FOUND);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.BAD_REQUEST);
		} catch (Error e) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
