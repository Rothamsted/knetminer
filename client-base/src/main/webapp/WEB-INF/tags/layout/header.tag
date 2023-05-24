<%@ tag description="Header" %>

<div id="header">
	<nav id="navbar" class="navbar navbar-default navbar-fixed-top" role="navigation">
		<div class="bottom-nav">
			<ul class="logo-items">
				<a  target="_blank" href="https://knetminer.com/products" title="KnetMiner Home"><img class="logo-top" src="html/image/logo.svg" alt="Logo" style="height:32px;margin-right:1rem">
				</a>

				<div id="species_header">
					<div class="navbarselect-container">
						<select onchange="speciesSelector.changeSpecies(this)" class="navbar-select"></select>
					</div>
					
					<div id="release_icon" onclick="fetchStats()">
						<lord-icon
							src="https://cdn.lordicon.com/nocovwne.json"
							trigger="loop"
							delay="2000"
							colors="primary:#6f7f8f,secondary:#51ce7b"
							stroke="25"
							style="width:42px;height:42px">
						</lord-icon>
					</div>
				</div>
			</ul>
			<ul class="navbar-items">
				<div class="product_links">
					<a  href='https://knetminer.com/tutorial' target="_blank" title="Access Tutorial" class="nav-links">Tutorial</a>	
					<a href='https://knetminer.com/knetminer-citation/how-to-cite.html' target="_blank" title="KnetMiner Citation" class="nav-links" id="citeus">Cite Us</a>	
				</div>

				<div class="auth_container">
					<a id="login_icon" title="Sign In" class="nav-links"></a>
				<a href='https://knetminer.com/beta/knetspace/sign-up/' class="ctaButton" id="signup" title="Sign Up">Sign Up</a>
				</div>
			</ul>
		</div>
	</nav>
</div>
