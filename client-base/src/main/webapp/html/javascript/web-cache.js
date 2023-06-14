

// object literal manages caching for API request
// currently only works for GET calls in (openGeneListPopup() in evidence-table.js)
/** 
 * TODO:
 * - This name is misleading. This is not to cache any object, but to cache web requests/data only,
 *   based on browser facilities. Choose a better name, eg, webCacheWrapper.
 * 
 * - (not urgent). Having it as a singleton is dirty, cause it doesn't allow fo reusing the same 
 *   code for multiple caches, should the need arise (of which I'm not sure, but still...). A better
 *   approach would be that the methods before are class methods (eg, WebCacheManager) and 
 *   this variable here is an instance of it. WebCacheManager would be initialised with the
 *   cache name, eg, const cacheManager = new WebCacheManager ( "my-cache" )
 * 
 * - (not urgent, can remain like this) This design is named cache-aside, see 
 *   https://hazelcast.com/blog/a-hitchhikers-guide-to-caching-patterns/
 *   I'm not a great fan of it, the read-through approach (see the same link) is usually cleaner when 
 *   used with functional programming (to set the function that fetch new cache entries).
 * 
 *   In this case, it seems that the cache fetch/update handler would vary too much, so it might be
 *   difficult to define a new entry handler.  Maybe, a mix between the two approaches would 
 *   be an improvement:
 *    
 *   // invocation, more readable than data = cache.get(), if ( data ) else ()
 *   let data = cacheMgr.get ( request, r => await $.get (...) )
 *   ...
 *   
 *   get() would be in place of getCachedData() and would be like (in pseudo-code):
 * 
 *   // implementation
 *   function cacheManager.get ( request, newEntryFetcher )
 *   {
 *     if request is already cached => return cached value
 *     value = newEntryFetcher ( request )
 *     save value in the cache
 *     return value
 *   }
 */


// webCache manager handling caching for API request
class WebCacheWrapper {

    #cacheName = null
    #requestUrl = null
  
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
        // We need to clone the request since a request can only be used once
        cache.put(url, new Response(JSON.stringify(data), {
            headers: {'Content-Type': 'application/json'}
        }));
  
      });
    }

    // Method handles get request for url passed to constructor during initialisation.
    #apihandler(){

        const data = $.get({ url:this.#requestUrl, data: '', timeout: 100000 })
        .done( rdata => {
              this.#cacheRequest ( this.#requestUrl, rdata )
          })
          .fail(function (xhr, status, errolog) {
          jboxNotice('An error occured, kindly try again', 'red', 300, 2000);
          return null
        })
        
        return data; 
    }
  
  }