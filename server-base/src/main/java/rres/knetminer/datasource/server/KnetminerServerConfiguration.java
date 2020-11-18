package rres.knetminer.datasource.server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;

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
@ComponentScan( 
	basePackages = { "rres.knetminer.datasource" },
	includeFilters = @ComponentScan.Filter( KnetminerDataSourceProvider.class )
)
public class KnetminerServerConfiguration implements WebMvcConfigurer {
    
        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            // Register resource handler for CSS and JS
            registry.addResourceHandler("/static/**").addResourceLocations("/static/", "classpath:/static/");
        }

	@Bean
	public InternalResourceViewResolver resolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setViewClass(JstlView.class);
		resolver.setPrefix("/WEB-INF/views/");
		resolver.setSuffix(".jsp");
		return resolver;
	}
}
