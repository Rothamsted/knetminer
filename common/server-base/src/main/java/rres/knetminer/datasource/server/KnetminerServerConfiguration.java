package rres.knetminer.datasource.server;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import rres.knetminer.datasource.api.KnetminerDataSourceProvider;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "rres.knetminer.datasource" }, includeFilters = @ComponentScan.Filter(KnetminerDataSourceProvider.class))
public class KnetminerServerConfiguration {

}
