
function geogebra_wrapper(mode, width, height) {
	this.el = build("div", "geogebra_wrapper");
	this.el.id = random_string();
	this.mode = mode || "editor";
	this._width = width || 800;
	this._height = height || 600;
	this.applet = undefined;

	this.inject = function(params, callback_done) {
		if (typeof GGBApplet === "undefined" || GGB_BUSY || find_root_element(this.el).tagName !== "HTML") return setTimeout(function() { this.inject(params); }.bind(this), 100);
		GGB_BUSY = true;
		this.applet = new GGBApplet(params);
		this.applet.inject(this.el);
		if (callback_done !== undefined) callback_done();
		this._sync_size();
		GGB_BUSY = false;
	}.bind(this);

	this.inject_editor = function() {
		this.inject({
			"id":this.el.id + "applet",
			"height":this._height,
			"width":this.width,
			"showToolBar":true,
			"borderColor":null,
			"showMenuBar":true,
			"allowStyleBar":true,
			"showAlgebraInput":true,
			"enableLabelDrags":false,
			"enableShiftDragZoom":true,
			"capturingThreshold":null,
			"showToolBarHelp":false,
			"errorDialogsActive":true,
			"showTutorialLink":true,
			"showLogging":false,
			"useBrowserForJS":false,
			"perspective":"AG",
			"allowUpscale":false,
			"scale":1
		});
	}.bind(this);

	this.inject_viewer = function() {
		this.inject({
			"id":this.el.id + "applet",
			"height":this._height,
			"width":this.width,
			"showToolBar":false,
			"borderColor":null,
			"showMenuBar":false,
			"allowStyleBar":false,
			"showAlgebraInput":false,
			"showLogging":false,
			"allowUpscale":false,
			"scale":1
		});
	}.bind(this);

	this.get_elements = function() {
		var xml = this.applet.getAppletObject().getXML();
		var elements = [];
		var el_start = 0;
		var el_end = 0;
		while (true) {
			el_start = xml.indexOf("<element", el_start);
			if (el_start === -1) break;
			el_end = xml.indexOf("</element>", el_start);
			if (el_end === -1) break;
			elements.push(xml.substring(el_start, el_end + 10));
			el_start++;
		}
		return elements;
	}.bind(this);

	this.set_elements = function(elements) {
		var boiler = this.applet.getAppletObject().getXML();
		var el_start = boiler.indexOf("<construction");
		if (el_start === -1) return;
		el_start = boiler.indexOf(">", el_start);
		if (el_start === -1) return;
		var el_end = boiler.indexOf("</construction>", el_start);
		if (el_end === -1) return;
		var boiler_start = boiler.substring(0, el_start + 1);
		var boiler_end = boiler.substring(el_end);

		var xml = "";
		for (var i = 0; i < elements.length; i++) {
			xml += elements[i];
		}
		this.applet.getAppletObject().setXML(boiler_start + xml + boiler_end);
	}.bind(this);

	this.mark_element_label = function(element) {
		var i1 = element.indexOf("label=");
		if (i1 === -1) return;
		i1 += 7;
		var i2 = element.indexOf("\"", i1);
		if (i2 === -1) return;

		var pre = element.substring(0, i1);
		var post = element.substring(i2);
		var label = element.substring(i1, i2);

		if (label.indexOf("*") === -1) label = label + "*";
		return pre + label + post;
	}.bind(this);

	this.mark_element_color = function(element) {
		var i1 = element.indexOf("<objColor");
		if (i1 === -1) return;
		i1 += 10;
		var i2 = element.indexOf("/>", i1);
		if (i2 === -1) return;

		var pre = element.substring(0, i1);
		var post = element.substring(i2);

		var color = ' r="255" g="0" b="0" alpha="0" ';
		return pre + color + post;
	}.bind(this);

	this.concat_marked = function(existing, marked_original) {
		var marked = marked_original.slice();
		for (var i = 0; i < marked.length; i++) {
			marked[i] = this.mark_element_label(marked[i]);
			marked[i] = this.mark_element_color(marked[i]);
		}
		return existing.concat(marked);
	}.bind(this);

	this.is_marked = function(element) {
		var i1 = element.indexOf("label=");
		if (i1 === -1) return;
		i1 += 7;
		var i2 = element.indexOf("\"", i1);
		if (i2 === -1) return;

		var label = element.substring(i1, i2);
		return label.indexOf("*") !== -1;
	}.bind(this);

	this.remove_marked_elements = function(elements) {
		var ret = [];
		for (var i = 0; i < elements.length; i++) {
			if (!this.is_marked(elements[i])) ret.push(elements[i]);
		}
		return ret;	
	}.bind(this);

	this._sync_size = function(w, h) {
		this.el.style.with = this._width + "px";
		this.el.style.height = this._height + "px";
		window.top.dispatchEvent(new Event('resize'));
	}.bind(this);

	Object.defineProperty(this, "width", {
		'get' : function() {
			return this._width;
		}.bind(this),
		'set' : function(v) {
			this._width = v;
			this._sync_size();
		}.bind(this)
	}); 

	Object.defineProperty(this, "height", {
		'get' : function() {
			return this._height;
		}.bind(this),
		'set' : function(v) {
			this._height = v;
			this._sync_size();
		}.bind(this)
	});

	Object.defineProperty(this, "data", {
		'get' : function() {
			return this.applet.getAppletObject().getBase64();
		}.bind(this),
		'set' : function(v) {
			if (v === undefined) return;
			try {
				this.applet.getAppletObject().setBase64(v);
			} catch(ex) {
				setTimeout(function() {this.data = v;}.bind(this), 100);
			}
		}.bind(this)
	});

	this._sync_size();

	if (this.mode == "editor") {
		this.inject_editor();
	} else {
		this.inject_viewer();
	}
}
