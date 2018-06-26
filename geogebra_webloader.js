(function(){
	if (window.GGB_READY !== undefined) return;
	window.GGB_READY = 0;

	var el_script = build("script");
	el_script.src = "https://cdn.geogebra.org/apps/deployggb.js";
	document.head.appendChild(el_script);
	console.log(el_script);

	var lazy_check = function() {
		if (!("GGBApplet" in window)) return schedule_recall(arguments, this);
		GGB_READY = 1;
		console.log("GGB webloader finished");
	}
	lazy_check();

	var css_fixer = function() {
		//	can appear any time, leave it running
		schedule_recall(arguments, this);
		var bad_css = document.head.querySelector("style.ggw_resource");
		if (bad_css === null) return;
		bad_css.innerHTML = bad_css.innerHTML.replace("}.toolbar{", "}.geogebra_wrapper .toolbar{");
	}
	css_fixer();
	
})();