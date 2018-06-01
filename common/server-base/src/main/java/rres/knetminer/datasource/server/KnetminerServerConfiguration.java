package rres.knetminer.datasource.server;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import rres.knetminer.datasource.api.KnetminerDataSourceProvider;

/**
 * This class is a placeholder that Spring auto-detects and auto-loads. The annotations on it set up the
 * default Spring web application environment. The ComponentScan annotation picks out all
 * KnetminerDataSourceProvider classes in any JAR files on the classpath (e.g. in the WAR's lib/ folder of a
 * deployed server) and automatically adds them to the autowired element in KnetminerServer, from where
 * they are made available to the user via dedicated subpaths on the root URL. The detected classes will only
 * be found if they are in the package rres.knetminer.datasource.
 * @author holland
 */
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "rres.knetminer.datasource" }, includeFilters = @ComponentScan.Filter(KnetminerDataSourceProvider.class))
public class KnetminerServerConfiguration {
}
