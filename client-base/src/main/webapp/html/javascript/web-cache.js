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
class WebCacheWrapper
{
    #cacheName = null
    #requestUrl = null
  
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
 
   constructor(cacheName, requestUrl){
     this.#cacheName = cacheName
     this.#requestUrl = requestUrl
   }
    
    // Method checks request url to determine if it's cached from previous API call.
    async get(){
      var response = await caches.match(this.#requestUrl)
    
        if(!response){
            return this.#apihandler()
        }

        // if request is cached, cached data is returned
        var data = await response.json(); 
        return data;
    }
    
    // Method puts cached data in browser API
    #cacheRequest(url,data){
      caches.open(this.#cacheName).then((cache) => {

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
        // We need to clone the request since a request can only be used once
        cache.put(url, new Response(JSON.stringify(data), {
            headers: {'Content-Type': 'application/json'}
        }));
  
      });
    }


/* TODO: see the above notes on how to rewrite the class so that it can deal with requests
   as a get() parameter */

    // Method handles get request for url passed to constructor during initialisation.
    #apihandler()
    {
      const data = $.get({ url:this.#requestUrl, data: '', timeout: 100000 })
      .done( rdata => {
/* TODO: as said above, I don't see the need to do this in a separated method, instead of 
   directly down here */		  
        this.#cacheRequest ( this.#requestUrl, rdata )
      })
      .fail(function (xhr, status, errolog) {
        jboxNotice('An error occured, kindly try again', 'red', 300, 2000);
        return null
      })
      
      return data; 
    }
  
  }