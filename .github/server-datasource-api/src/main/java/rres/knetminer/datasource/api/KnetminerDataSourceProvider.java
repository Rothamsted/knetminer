package rres.knetminer.datasource.api;

import java.lang.annotation.Inherited;

import org.springframework.stereotype.Component;

/**
 * Any class annotated with this annotation, as long as it is also in the package rres.knetminer.datasource,
 * even if in another JAR, will be picked up by the KnetminerServer autowiring and added as a data source.
 * 
 * @author holland
 *
 * NOTE: Since Spring 5, you need @Component on the implementing subclasses.
 * 
 *
 */
@Component
@Inherited
public @interface KnetminerDataSourceProvider {

}
