(function(){
	if (window.GGB_LOADED === true) return;
	window.GGB_LOADED = true;
	var script = document.createElement("script");
	script.src = "https://cdn.geogebra.org/apps/deployggb.js";
	document.head.appendChild(script);
})();