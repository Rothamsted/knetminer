/**
 * Components to manage users, their roles, permissions and the like.
 * 
 * This modules also interacts with KnetSpace, to get information about the current user.
 */

/**
 * Handles user roles.
 * 
 * DO NOT instantiate this class directly, use it as an enum, see the constructor for details.
 * 
 */
class UserRole
{
  static GUEST = new UserRole ( 1000, 'GUEST' )
  static FREE = new UserRole ( 500, 'FREE' )
  static PRO = new UserRole ( 100, 'PRO' )
  /** Not an actual role available on KnetSpace, used for debugging */
  static _SUPER = new UserRole ( 50, '_SUPER' )

  #level = null
  #name = null

	/**
	 * DO NOT USE IT DIRECTLY, use it only for the predefined role constants (as above), and then
	 * either use such constants or get ( <string> ) below. 
	 */
  constructor ( level, name ) {
    this.#level = level;
    this.#name = name;
  }

	/** 
	 * Compare by level, returns -1 | 0  | 1, ie, negative means this role is more
	 * powerful than the other.
	 */
  compare ( otherRole )
  {
		if ( !otherRole ) return -1
		if ( typeof otherRole == "string" ) otherRole = UserRole.get ( otherRole )
		
		if ( ! ( otherRole instanceof UserRole ) ) 
		  throw new TypeError ( "compare() needs a UserRole parameter" )
		
		return this.#level - otherRole.#level
  }   
  
	/** 
	 * True if the role parameter has the same or higher power of this role.
	 * Param can be a UserRole or a string.
	 */
	can ( role ) {
		return this.compare ( role ) <= 0
	}
	
	/** 
	 * The role name, mainly used for debugging purposes
	 */
	getName ()
	{
		return this.#name
	}

	toString ()
	{
		return `UserRole{ name: ${this.#name}, level: ${this.#level} }`
	}

	/**
	 * Get role by string, case-insensitive
	 */
  static get ( roleStr )
  {
    if ( typeof roleStr != 'string' ) 
      throw new TypeError ( "get() requires a non-null string" )
      
    roleStr = roleStr.toUpperCase ()
    
    // This is an alias coming from the API
    if ( roleStr == "REGISTERED" ) roleStr = "FREE"
    
    
    let result = UserRole [ roleStr ]
    if ( !result ) throw new TypeError ( `Invalid user role ${roleStr}` )
    
    return result
  }
}


/**
 *  Used to manage the current user and its application permissions.
 * 
 *  DO NOT instantiated this class, use the userAccessManager singleton, defined below.
 */
class UserAccessManager
{
   #currentRole = UserRole.GUEST;

	/**
	 * TODO: remove
	 */
  #defaultGeneLimit = 20; 
  #defaultKnetViewLimit = 10; 
  #isGeneLimitEnforced = true;


  constructor(){
  }

	/**
	 * Setup the current user properties based on the KnetSpace API, checking the logged-in user.
	 */
  initFromKnetSpace ()
  {
    fetch ( knetspace_api_host + "/api/v1/me", 
    {
        credentials: 'include'
    })
    .then ( async (response) => 
    {
			// TODO: error management
      const data = await response.json()
      const userPlan = data.plan?.name.toLowerCase()
      
      if(userPlan?.length)
      {
				this.#setCurrentRole ( userPlan );
        // TODO: this.setGeneSearchLimit();
      }
    })
  }
  
  #setCurrentRole ( userRole )
  {
		this.#currentRole = UserRole.get ( userRole );
	}
  
  getCurrentRole () {
		return this.#currentRole
	}
  
  /** 
	 * A wrapper of getCurrentRole().can(), ie, tells if the current user has the required
	 * role or higher.
	 */ 
  can ( requiredRole ) {
		return this.getCurrentRole ().can ( requiredRole )
	}


	/**
	 * The max number of input genes that the current user (role) can specify for a gene search.
	 * 
	 * Returns Number.MAX_SAFE_INTEGER if no such limit is enforced to the current role.
	 * 
	 */
	getGeneSearchLimit ()
	{
		if ( this.can ( UserRole.PRO ) ) return Number.MAX_SAFE_INTEGER
		if ( this.can ( UserRole.FREE ) ) return 100
		return 20 // guest/anonymous
	}

	/**
	 * The max number of genes that the current user/role can select and use for showing the gene network 
	 * view (the knowledge graphs related to the genes).
	 * 
	 * Returns Number.MAX_SAFE_INTEGER if the current role has no such limit.
	 * TODO: currently there isn't any role that is so powerful, PRO, the most privileged one, 
	 * has 20 for this value. Isn't it an error? To be clarified.
	 * 
	 */
	getNetworkViewLimit ()
	{
		if ( this.can ( UserRole.PRO ) ) return 20
		return 10
	}
  
}

const userAccessMgr = new UserAccessManager()


// UserRole, usage examples.
/** 
console.log ( "All the roles:", Object.keys ( UserRole ) ) 

console.assert ( !UserRole.GUEST.can ( UserRole.FREE ), "can() on ANON/FREE doesn't work!" )
console.assert ( UserRole.FREE.can ( UserRole.GUEST ), "can() on FREE/ANON doesn't work!" )
console.assert ( UserRole.PRO.can ( UserRole.PRO ), "can() on PREMIUM/PREMIUM doesn't work!" )
console.assert ( UserRole.PRO.can ( "free" ), "can(<string>) on PRO/FREE doesn't work!" )

let strRole = UserRole.get ( "pro" )
console.assert ( 
	strRole === UserRole.PRO,
	`string-based fetching doesn't work, value is ${strRole}!`
)
console.assert ( strRole == UserRole.PRO, "Role matching doesn't work when using '=='!" )
**/