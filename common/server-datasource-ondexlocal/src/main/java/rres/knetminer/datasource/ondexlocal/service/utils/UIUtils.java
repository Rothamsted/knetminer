package rres.knetminer.datasource.ondexlocal.service.utils;

import java.util.stream.Stream;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
public class UIUtils
{
	private static final Logger log = LogManager.getLogger ( UIUtils.class );

	private UIUtils ()
	{
	}

  /**
   * remove any pre-existing, visible, size and flagged attributes from
   * concepts and relations 29-07-2019
   */
  public static void removeOldGraphAttributes ( ONDEXGraph graph ) 
  {
  	try
  	{
      log.debug ( "Remove old 'visible' attributes from all concepts and relations..." );
      
      Stream.of ( "visible", "size", "flagged" )
      .forEach ( attrId -> ONDEXGraphUtils.removeConceptAttribute ( graph, attrId ) );

      Stream.of ( "visible", "size" )
      .forEach ( attrId -> ONDEXGraphUtils.removeRelationAttribute ( graph, attrId ) );
  	}
  	catch (Exception ex)
  	{
      log.warn("Failed to remove pre-existing attributes from graph: {}", ex.getMessage());
      log.trace("Failed to remove pre-existing attributes from graph, details: ", ex );
    }
  }	
}
