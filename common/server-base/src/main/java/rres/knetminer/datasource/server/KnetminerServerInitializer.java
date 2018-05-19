package rres.knetminer.datasource.server;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

public class KnetminerServerInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {
	@Override
	protected Class<?>[] getRootConfigClasses() {
		return new Class[] { KnetminerServerConfiguration.class };
	}

	@Override
	protected Class<?>[] getServletConfigClasses() {
		return null;
	}

	@Override
	protected String[] getServletMappings() {
		return new String[] { "/*" };
	}
}