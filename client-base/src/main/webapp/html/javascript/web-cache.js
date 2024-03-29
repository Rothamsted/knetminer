/**
 * ===> TODO:
 * - CLEAN IT, it has a lot of old comments and web-cache-new.js is still around.
 * 
 * - It looks like it hasn't yet reworked as outlined in web-cache-new. We can't 
 *   release 5.7 with this mess.
 * 
 */



/** 
 * TODO: THIS HAS BECOME WRONG IN UNINMAGINABLE WAYS!!! 
 * 
 * See web-cache-new.js, study that code, replace this mess here with that (ie, copy-paste here), use it for the
 * evidence table (ie, use get() and assume it always return a result), test it, and eventually commit 
 * (and also remove the -new file).
 * 
 * ==> I'm not 100% sure that code is correct and corresponds to what you're trying to do, please DO 
 * understand it before use and come back to me if you need clarifications.
 * 
 */

/**
 * Manages the caching for web requests, with a specific new entry handler that 
 * make URL calls and deals with possible errors.
 * 
 * Currently used for openGeneListPopup() in evidence-table.js
 * 
 * TODO: this is too poor see TODO comments below and in the class code.
 * For the moment, it's doesn't do much damage, cause it's used in one place only, but
 * its usage can't be extended in the current form. 
 * 
 * ===> Let's have a call/chat on this, before going on with the described changes. 
 * 
 */

/* TODO: You're instantiating a whole WebCacheWrapper to cache ONE conceptID specific URL
   like: api_url+'/genome?keyword=ConceptID:'+ conceptId
 
   A cache is an object that has multiple KEYS, every time you ask a key, the cache
   decides if to return data which it has in store for that key or do something else
   (get data or return null).
   
   This does none of that and it's just confusing, rather than this implementation, you might
   as well use the caches object directly.
   
   Since you're now managing the call failure, I propose a read-through approach
   (https://hazelcast.com/blog/a-hitchhikers-guide-to-caching-patterns):
   
   constructor ( cacheName ):
     The URL varies at each request, can't be part of the object!
     
   get ( request, options ):
     returns the cached Response, if any, else invokes the request.
     options is set to headers: {'Content-Type': 'application/json'} ONLY if 
     it's not explicitly set
     
   #apiHandler ( request, options ):
     does what the current apihandler() method is doing, but working on the 
     request that is received each time.
     
     get() should call this if the request's response isn't already in the cache.
     ===>It should save the Request object that comes from the API call, not a newly
     created one, see below for details.
     
     #apiHandler() isn't too much needed, its code could be written directly
     inside get (), but have it if you prefer so. I see even less the need for 
     #cacheRequest() below.
*/


  /* TODO: this is too specific, what if we need different options? What if we need to cache 
      * a format other than JSON? That's why I'm proposing 'options' as an optional parameter
      * of get().
      * 
      * TODO: (not urgent?) does this mean that every time a cached object is fetched from the cache, there 
      * is some overhead to rebuild the JSON object? If yes, let's try to improve this:
      * can't we save the response straight from $.get()? Like in: 
      * 
      * $.get ( { url: ... })
      * .done ( data => cache.put ( request, data, options ) )
      * 
      * Or, if that's not possible (why?) can't we build the Response without stringify()?, Like in:
      * 
      * cache.put(url, new Response(data) )
      * 
      * TODO: (not urgent, optional) since the data we are have been caching so far are only gene accessions, 
      * we might want an extension of this WebCacheWrapper (eg, EvidenceAccessionCache extends WebCacheWrapper), 
      * which specifically turns the API response into the corresponding table (array of arrays), once for all  
      * in the API handler. Namely:
      * 
      * get ( keyword, conceptId ) 
      *   Overrides get ( req, opts ), builds the URL using the specific params
      * 
      * #apiHandler ( request, options )
      *   Instead of saving the API raw data, turns them into array of array and then saves this
      *   inside a Response:
      * 
      *   $.get ( { url: ... })
      *   .done ( data => { 
      *     accessionsTable = // transformed data, via the usual split("\n"), split(",") 
      *     cache.put ( request, new Response (accessionTable), options ) 
      *   })    
      *  
      */

  class WebCacheWrapper
  {
      #cacheName = null
    
      constructor(cacheName){
        this.#cacheName = cacheName
      }

      // Method checks request url to determine if it's cached from previous API call.
      async get ( requestUrl, options = { data: '', timeout: 100000 } )
      {
        let result = await caches.match ( requestUrl, options )
        if ( result ) return result.json ()
        
        result = await this._apiHandler ( requestUrl, options );
        
        caches.open ( this.#cacheName ).then ( (cache) => 
        {
          // TODO: do we need to serialize/unserialize JSON, can't we just store and return 'result'?
          //   
          cache.put ( requestUrl, new Response ( JSON.stringify ( result ), options ) )
        })
        
        return result
      }

      // Method puts cached data in browser API
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

  // Extended class caters solely for AccessionTable Popup, called in evidence-table(openGeneListPopup())
  class EvidenceAccessionCache extends WebCacheWrapper
  {

    // gets cached data and calls for API endpoint when cache request is not 
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
      if ( !result ) return result;
      let geneTable = formatJsonToTsv(result.geneTable)
      geneTable = geneTable.split("\n")
      
      return geneTable
    }

  }
