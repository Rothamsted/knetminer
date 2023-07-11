/**
 * Manages the caching for web requests, with a specific new entry handler that 
 * make URL calls and deals with possible errors.
 * 
 * Currently, we're only using the subclass EvidenceAccessionCache in openGeneListPopup()/evidence-table.js
 * 
 */
class WebCacheWrapper
{
  #cacheName = null
  
  constructor ( cacheName ) {
    this.#cacheName = cacheName
  }


	/**
	 * Entry getter that uses the cache-through approach, ie, if the entry is already cached, 
	 * returns it, if not, uses #apiHandler() to get data, caches the result and then return them.
	 * 
	 * This is the main method to access the cache, it is used like:
	 * 
	 * let data = cacheWrapper.get ( "http://foo.url?param=" + param ) // options can be omitted
	 * let data = cacheWrapper.get ( "http://foo.url?param=" + param, { timeout: 1000 } )
	 * 
	 * <use data> 
	 * 
	 * ==> Note that, due to the cache-through behaviour, you DO NOT need to call the URL yourself, 
	 * cause the method already takes care of that if the call output isn't already in the cache, 
	 * and you should assume some data always come out of this method (else, there's an error, or 
	 * there might be an empty result). 
	 * 
	 */
  async get ( requestUrl, options = { data: '', timeout: 100000 } )
  {
		let result = await caches.match ( request, options )
		if ( result ) return result.json ()
		
		result = await this._apiHandler ( requestUrl, options );
		
		caches.open ( this.#cacheName ).then ( (cache) => 
		{
			// TODO: do we need to serialize/unserialize JSON, can't we just store and return 'result'?
			//   
      cache.put ( request, new Response ( JSON.stringify ( result ), options ) )
    })
    
    return result
  }
    
    
  /**
	 * Calls our API with the given request and options. It takes care of options and possible API call 
	 * errors.
	 * 
	 * Used by get(), when an entry isn't already cached
	 *
	 * Note that this IS NOT USED to save data in the cache, this is the job of get().
	 * It's named with '_', cause it is a PROTECTED method and MUST NOT call it outside of 
	 * its class or its extensions. 
	 * 
	 */
  async _apiHandler ( requestUrl, options )
  {
		try {
			const result = await $.get( { url:requestUrl, ...options } )
			return result
		}
		catch ( err )
		{
			// TODO: report the error
			jboxNotice ( 'An error occured, kindly try again', 'red',  300, 2000 );
			return null
		}
  }
      
}

/** 
 * Extended class caters solely for AccessionTable Popup, called in evidence-table(openGeneListPopup())
 * 
 */
 
class EvidenceAccessionCache extends WebCacheWrapper
{
  async get ( conceptId )
  {
		return super.get ( 
			api_url + '/genome?keyword=ConceptID:' + conceptId,
			{ data: '', timeout: 100000, headers: { 'Content-Type': 'text/plain' } }
		)
  }

  async _apiHandler ( requestUrl, options )
	{
		let result = await super._apiHandler ( requestUrl, options )
		if ( !result ) return result
		
		// TODO: WILL BE REMOVED IN COMING DAYS
    let geneTable = formatJsonToTsv(response.geneTable)
    geneTable = geneTable.split("\n")
    
    return geneTable
	}
}	
