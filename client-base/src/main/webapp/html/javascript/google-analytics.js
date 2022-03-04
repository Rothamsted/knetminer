
/*
 * general page analytics, not the tracking ga_id one
 */
function generalPageAnalytics(){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-26111300-1']);
    _gaq.push(['_trackPageview']);
}

function createAnalyticsTag() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
}