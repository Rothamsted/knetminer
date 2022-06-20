<%@ tag description="Header" %>

<div id="header">
	<nav class="navbar navbar-default navbar-fixed-top" role="navigation">	
    	<a href="/" title="KnetMiner Home"><img class="logo-top" src="html/image/KnetMiner_green_white.svg" alt="Logo" height="45" style="padding-top:3px; padding-bottom:2px; padding-left:12px;"></a>
 	<ul class="navbar-items">
		<a id="release_icon" target="_blank" href="" title="Release Notes"><i class="fa fa-pie-chart" aria-hidden="true"></i></a>
		<div id="species_header">
			<select onchange="changeSpecies(this)" class="navbar-select"></select>
		</div>
		<div class="login_container">
			<a id="login_icon" title="Sign in"></a>
        	<a id="profile_icon" title="Profile"><i class="fa fa-user" aria-hidden="true"></i></a>
		</div>
	 </ul>
	</nav>
</div>
