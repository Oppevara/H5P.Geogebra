(function(){
	if (window.GGB_LOADED === true) return;
	window.GGB_LOADED = true;
	var script = document.createElement("script");
	script.src = "https://cdn.geogebra.org/apps/deployggb.js";
	document.head.appendChild(script);

	var fix_func = function() {
		var offender = document.head.querySelector("style.ggw_resource");
		if (offender == null) {
			setTimeout(fix_func, 100);
			return;
		}
		offender.innerHTML = offender.innerHTML.replace("}.toolbar{", "}.geogebra_wrapper .toolbar{");
		
	};
	fix_func();



})();