/**
 * Manages user access to resources based on user plan tier
 */
class UserAccessManager{

    #current = 'guest'; 
    #defaultGeneLimit = 20; 
    #isGeneLimitEnforced = true; 

    constructor(){
        let userPlan = this.getUserPlan(); 
        if(userPlan)this.#current = userPlan; 
        this.#setGeneSearchLimit(this.#current);
    }

    // Calls knetspace API endpoint and returns user current plan (free or pro) as a string. 
    getUserPlan()
    {
        var login_check_url = knetspace_api_host + "/api/v1/me";

        $.ajax({
          type: 'GET', url: login_check_url, xhrFields: { withCredentials: true }, dataType: "json",
          timeout: 1000000, cache: false,
          headers: { "Accept": "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" },
          success: function (data) {
            if( ! typeof data.id == 'undefined') return (data.plan.name).toLowerCase(); 
            return null
          },
      
        });
            
    }

    // Sets geneslist search limit based on current user plan.
    // 20 for guest, 100 for registered and unlimited for pro users.
    #setGeneSearchLimit(current)
    {
        if( current === 'free' ) 
        {
          this.#defaultGeneLimit = 100
        }else if(current === 'pro'){
            this.#isGeneLimitEnforced = false; 
        } 
    }

    // Checks if genes list limit is enforced or not. 
    // Returns a boolean value to validate example queries restriction. 
    // Primarily used to check if a user on a free or pro plan.
    isLimitEnforced(){
      return this.#isGeneLimitEnforced
    }

    // Gets geneslist search limit
    getGenesListLimit(){
        return this.#defaultGeneLimit
    }

    // Checks if query restriction should be added to example queries.
    // Method compare user current role to the roles specified for each example queries. 
    requires(queryRole){
      return  UserRole.can( this.#current, queryRole); 
    }


}

/**
 * Handles user role by specifying a level for each user plan.
 */
class UserRole {
    #level = null

    static GUEST = new UserRole ( 1000 )
    static FREE = new UserRole ( 500 )
    static PRO = new UserRole ( 100 )

    constructor(level){
        this.#level = level;
    }

    getLevel(){
        return this.#level;
    }

     /** 
   * Compare by level, returns -1 | 0  | 1, ie, negative means this role is more
   * powerful than the other.
   */
    static compare(role,queryRole){

        if ( !role) return -1
        let userLevel = UserRole.get(role)
        let queryLevel = UserRole.get ( queryRole )
        return  queryLevel - userLevel
           
    }   
    
      /**
   * True if the role parameter has the same or higher power of this role.
	 * Param can be a UserRole or a string.
   */
    static can ( role,queryRole )
  {  
    return  UserRole.compare(role,queryRole) >= 0;
  }

  /**
   * Get role by string, case-insensitive
   */
    static get ( roleStr )
    {
      if ( typeof roleStr != 'string' ) 
        throw new TypeError ( "get() requires a non-null string" );
        roleStr = roleStr.toUpperCase()
        const result = UserRole[ roleStr ].#level
        if ( !result ) throw new TypeError ( `Invalid user role ${roleStr}` )
        return result
    }
}


// Usage examples
// console.assert ( !UserRole.GUEST.can ( UserRole.FREE ), "can() on ANON/FREE doesn't work!" )
// console.assert ( UserRole.PREMIUM.can ( UserRole.PREMIUM ), "can() on PREMIUM/PREMIUM doesn't work!" )

// console.log ( Object.keys ( UserRole ) ) // All the roles
// console.assert ( UserRole.get ( "premium" ) === UserRole.PREMIUM, "string-based fetching doesn't work!" )