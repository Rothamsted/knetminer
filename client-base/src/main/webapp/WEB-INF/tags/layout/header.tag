<%@ tag description="Header" %>

<div id="header">
	<nav class="navbar navbar-default navbar-fixed-top" role="navigation">

		<ul class="logo-items">
			<a href="/" title="KnetMiner Home"><img class="logo-top" src="html/image/logo.svg" alt="Logo" style="height:32px;margin-right:0.5rem">
			</a>

			<div id="species_header">
				<a id="release_icon" target="_blank" href="" title="Release Notes"><i class="fa fa-pie-chart" aria-hidden="true"></i></a>
				<select onchange="changeSpecies(this)" class="navbar-select"></select>
			</div>
		</ul>
    	
		<ul class="navbar-items">
				<a id="login_icon" title="Sign In" style="text-decoration: none;color: #6F7F8F;"></a>
				<a href='https://knetminer.com/beta/knetspace/sign-up/' id="signup" title="Sign Up">Sign Up</a>
		</ul>
	</nav>
</div>
