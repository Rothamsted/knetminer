/**
 * Manages user access to resources based on user plan tier
 * 
 */
class UserAccessManager{
		/* 
		 * TODO: rename into something like #currentRole
		 * 
		 * Also, consider to set this to the object, rather than keeping the bare string:
		 * 
		 * this.#currentRole = UserRole.get ( <string from KnetSpace> )
		 *
		 * Should make things slightly more efficient.
		 * 
		 */
    #defaultGeneLimit = 20; 
    #defaultKnetViewLimit = 10; 
    #isGeneLimitEnforced = true; 

    constructor(){
      UserRole.setUserRole('guest'); 
    }


    // Calls knetspace API endpoint and returns user current plan (free or pro) as a string. 
    setUserPlan()
    {
      fetch(knetspace_api_host + "/api/v1/me", {
          credentials: 'include'
      }).then(async (response)=> {
        const data = await response.json();
          const userPlan = data.plan?.name.toLowerCase()
          if(userPlan?.length){
             UserRole.setUserRole(userPlan); 
            this.setGeneSearchLimit();
          }

      })
    }

    // Sets geneslist search limit based on current user plan.
    // 20 for guest, 100 for free and unlimited for pro users.
    setGeneSearchLimit()
    {
			  /* 
			   * TODO: this is logically wrong. Once you've introduced roles as 
				 * abstract objects, you must be consistent with them vision and 
				 * do these checkings in this way:
				 * 
				 * if ( this.#currentRole.can ( UserRole.PRO )))
				 *   ...
				 * else if ( this.#currentRole.can ( UserRole.FREE )) )
				 *   ...
				 * else
				 *   // minimal role
				 * 
				 * You need to check things in priority/power order, since you need to apply the 
				 * highest permissions the user has
				 * 
				 * Also, you need can(), you can't use '==', since a role grants access to its own 
				 * permisssions plus the permissions of roles with lower power.
				 * 
				 * For instance with the current wrong code, an ADMIN role would be treated like 
				 * a guest. 
				 *  
				 */
			  
        if(this.requires('free')) this.#defaultGeneLimit = 100;  
        
        if(this.requires('pro')){
            this.#isGeneLimitEnforced = false;
            this.#defaultKnetViewLimit = 20
        } 
    }

    // returns genelist search Limit 
    getGeneSearchLimit(){
      return this.#defaultGeneLimit
    }

    getGeneKnetLimit(){
      return this.#defaultKnetViewLimit
    }

    // Checks if genes list limit is enforced or not. 
    // Returns a boolean value to validate example queries restriction. 
    // Primarily used to check if a user on a free or pro plan.
    isLimitEnforced(){
      return this.#isGeneLimitEnforced
    }

		/**
		 * TODO: no, this isn't about the genes list limit, it is about checking what the current
		 * user can do. 
		 * 
		 * It doesn't matter if you wrote this for the genes list thing, it is not what it's doing,
		 * don't write misleading comments or names.
		 * 
		 * Also, use a better name, such as can ( role )
		 * 
		 */
    // Gets geneslist search limit
    // Checks if query restriction should be added to example queries.
    // Method compare user current role to the roles specified for each example queries. 
    requires(queryRole){
			/* 
			   TODO: This should be this.#currentRole.can ( queryRole )
			   
			   See above about #current, and see below about can()
			 */
      return  UserRole.can(queryRole); 
    }


}

/**
 * Handles user role by specifying a level for each user plan.
 */
class UserRole {
    #level = null
    userLevel = null; 

    static GUEST = new UserRole ( 1000 )
    static REGISTERED = new UserRole ( 500 )
    // TODO: How is it that there are two roles with the same level?!
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
    static compare(queryRole){

        if ( !this.userLevel) return -1
        let queryLevel = UserRole.get ( queryRole )
        return  queryLevel - this.userLevel
           
    }   
    
    /* TODO: this is poor. Initially, it was designed as an object method, not a static one, 
		 * see examples below. The idea is that you ask a role object what its powers are.
		 * 
		 * Asking this to string pairs is less readable.
		 * 
		 * For instance: 
		 * 
		 * currentRole = UserRole.get ( "registered" )
		 * if ( !currentRole.can ( "pro" ) )
		 *   <you aren't as powerful as a pro, you can't do this>
		 * if ( currentRole.can ( "free" ) )
		 *   <as registered, you can do free user stuff too>
		 * 
		 * 
		 */
		
      /**
			 * 
   * True if the role parameter has the same or higher power of this role.
	 * Param can be a UserRole or a string.
   */
    static can (queryRole )
  {  
    return  UserRole.compare(queryRole) >= 0;
  }

  /**
   * Get role by string, case-insensitive
   */
    static get(roleStr) {
      if (typeof roleStr !== 'string') 
          throw new TypeError("get() requires a non-null string");
          
      roleStr = roleStr.toUpperCase();

      // Check if the role exists in the UserRole class
      if (!UserRole[roleStr]) {
          throw new TypeError(`Invalid user role '${roleStr}'`);
      }

			/*
			   TODO: this is wrong. get( str ) must return a UserRole INSTANCE, NOT
			   its numeric level, see the description in #768 
			 */ 

      const result = UserRole[roleStr].#level;
      if (!result) {
          throw new TypeError(`Unable to retrieve level for role '${roleStr}'`);
      }
      return result;
  }

	/*
	   TODO: this is TOTALLY wrong. The business of UserRole IS NOT keeping track of the current
	   user, for it should only be an immutable object, representing a role.
	   
	   The place for the current user is UserAccessManager, as it was initially done.
	*/
  static setUserRole(roleStr){
    const userLevel = UserRole.get(roleStr)
    this.userLevel = userLevel
  }
}

const userAccessMgr = new UserAccessManager()


// Usage examples
// console.assert ( !UserRole.GUEST.can ( UserRole.FREE ), "can() on ANON/FREE doesn't work!" )
// console.assert ( UserRole.PREMIUM.can ( UserRole.PREMIUM ), "can() on PREMIUM/PREMIUM doesn't work!" )

// console.log ( Object.keys ( UserRole ) ) // All the roles
// console.assert ( UserRole.get ( "premium" ) === UserRole.PREMIUM, "string-based fetching doesn't work!" )