function geogebra_exercise(mode) {
	this.el = build("div", "geogebra_exercise");
	this.el.id = random_string();
	this.mode = mode || "editor";
	this.applet = undefined;

	Object.defineProperty(this, "data", {
		'get' : function() {
			if (this.mode == "viewer") {
				return this._data;
			}
			if (this.mode == "editor") {
				var ret = {};
				ret.data = this.applet.data;
				ret.mode = this.sel_mode;
				ret.elements = this.applet.get_elements();
				ret.description = this.description_box.value;
				return ret;
			}
		}.bind(this),
		'set' : function(v) {
			if (typeof v === "undefined") v = {};
			if (typeof v.data === "undefined") v.data = undefined;
			if (typeof v.mode === "undefined") v.mode = "Figure";
			if (typeof v.elements === "undefined") v.elements = "";
			if (typeof v.description === "undefined") v.description = "";


			this.el.innerHTML = "";
			if (this.mode == "viewer") {
				this._data = v;
				if (v.mode == "Figure") this.build_figure(v.data, v.description);
				if (v.mode == "Match") this.build_match(v.elements, v.description);
			}
			if (this.mode == "editor") {
				this.build_editor(v.data, v.mode, v.description);
			}
		}.bind(this)
	});

	//	hack for firefox to fix height in column
	this.fix_height = function() {
		var rect = this.el.getBoundingClientRect();
		if (rect.height === 0) {
			setTimeout(this.fix_height, 100);
			return;
		}
		this.el.style.height = rect.height + "px";
		window.top.dispatchEvent(new Event('resize'));
	}.bind(this);

	this.build_figure = function(ggb64, description) {
		this.description_box = build("div", "description_box", this.el, description);
		this.applet = new geogebra_wrapper("viewer", 688, 600);
		this.el.appendChild(this.applet.el);
		this.applet.data = ggb64;
	}.bind(this);

	this.build_match = function(match_elements, description) {
		this.match_elements = match_elements;

		this.description_box = build("div", "description_box", this.el, description);
		var menu = build_radio_menu(["Hide Match", "Show Match"], "Hide Match", function(choice) {
			if (choice == "Hide Match") {
				var elements = this.applet.remove_marked_elements(this.applet.get_elements());
          		this.applet.set_elements(elements);
			} else {
				var elements = this.applet.concat_marked(this.applet.get_elements(), this.match_elements);
          		this.applet.set_elements(elements);
			}
		}.bind(this));
		this.el.appendChild(menu);

		this.applet = new geogebra_wrapper("editor", 688, 600);
		this.el.appendChild(this.applet.el);
		this.fix_height();
	}.bind(this);

	this.build_editor = function(ggb64, mode, description) {
		var description_description = build("div", undefined, this.el, "Exercise description:");
		this.description_box = build("textarea", undefined, this.el);
		this.description_box.height = 300;	
		this.description_box.value = description;

		this.sel_mode = mode;
		var mode_title = this.sel_mode == "Figure" ? "Static figure" : "Match with original";
		var menu = build_radio_menu(["Static figure", "Match with original"], mode_title, function(choice) {
			this.sel_mode = choice == "Static figure" ? "Figure" : "Match";
		}.bind(this));
		this.el.appendChild(menu);

		this.applet = new geogebra_wrapper("editor", 876, 600);
		this.applet.data = ggb64;
		this.el.appendChild(this.applet.el);
	}.bind(this);
}