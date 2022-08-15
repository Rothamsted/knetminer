<%@ tag description="Header" %>

<div id="header">
	<nav class="navbar navbar-default navbar-fixed-top" role="navigation">

		<ul class="logo-items">
			<a href="/" title="KnetMiner Home"><img class="logo-top" src="html/image/logo.svg" alt="Logo" style="height:32px;margin-right:0.5rem">
			</a>

			<div id="species_header">
				<select onchange="changeSpecies(this)" class="navbar-select"></select>
				<a id="release_icon" target="_blank" href="" title="Release Notes">
					<lord-icon
						src="https://cdn.lordicon.com/nocovwne.json"
						trigger="loop"
						delay="2000"
						colors="primary:#6f7f8f,secondary:#51ce7b"
						stroke="25"
						style="width:42px;height:42px">
					</lord-icon>
				</a>
			</div>
		</ul>
    	
		<ul class="navbar-items">

				<div class="product_links">
					<a  href='https://knetminer.com/tutorial' target="_blank" title="Access tutorials" class="nav-links">Tutorial</a>	
					<a href='https://knetminer.com/knetminer-citation/how-to-cite.html' target="_blank" title="include our work" class="nav-links">Cite Us</a>	
				</div>

				<div class="auth_container">
					<a id="login_icon" title="Sign In" class="nav-links"></a>
				<a href='https://knetminer.com/beta/knetspace/sign-up/' id="signup" title="Sign Up">Sign Up</a>
				</div>
				
				
		</ul>
	</nav>
</div>
