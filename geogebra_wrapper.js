
function geogebra_wrapper(mode, width, height) {
	this.el = build("div", "geogebra_wrapper");
	this.el.id = random_string();
	this.mode = mode || "editor";
	this._width = width || 800;
	this._height = height || 600;
	this.applet = undefined;
	this.mark = "ᐧ";

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

	this.get_construction = function() {
		var doc = xml_to_doc(this.applet.getAppletObject().getXML());
		var elc = doc.getElementsByTagName("construction")[0];
		var xml = "";
		for (var i = 0; i < elc.children.length; i++) {
			xml += doc_to_xml(elc.children[i]);
		}
		return xml;
	}.bind(this);

	this.add_marked_elements = function(constructor_inner_xml) {
		var xml = this.applet.getAppletObject().getXML();
		xml = xml.replace("</geogebra>", "<constructor_add>" + constructor_inner_xml + "</constructor_add></geogebra>");
		var doc = xml_to_doc(xml);

		var el_const = doc.getElementsByTagName("construction")[0];
		var el_add = doc.getElementsByTagName("constructor_add")[0];

		while(el_add.children.length > 0) {
			var el = el_add.children[0];
			el.setAttribute("ggbw_marked", "true");

			if (el.hasAttribute("label")) el.setAttribute("label", el.getAttribute("label") + this.mark);

			var el_cols = el.getElementsByTagName("objColor");
			if (el_cols.length > 0) {
				var el_col = el_cols[0];
				el_col.setAttribute("r", 255);
				el_col.setAttribute("g", 0);
				el_col.setAttribute("b", 0);
				//el_col.setAttribute("alpha", 1);
			}

			var el_inputs = el.getElementsByTagName("input");
			if (el_inputs.length > 0) {
				var el_input = el_inputs[0];
				for (var i = 0; i < el_input.attributes.length; i++) {
					var attr = el_input.attributes[i].name;
					el_input.setAttribute(attr, el_input.getAttribute(attr) + this.mark);
				}
			}

			var el_outputs = el.getElementsByTagName("output");
			if (el_outputs.length > 0) {
				var el_output = el_outputs[0];
				for (var i = 0; i < el_output.attributes.length; i++) {
					var attr = el_output.attributes[i].name;
					el_output.setAttribute(attr, el_output.getAttribute(attr) + this.mark);
				}
			}

			el_add.removeChild(el);
			el_const.appendChild(el);
		}
		el_add.parentElement.removeChild(el_add);

		this.applet.getAppletObject().setXML(doc_to_xml(doc));		
	}.bind(this);

	this.remove_marked_elements = function() {
		var doc = xml_to_doc(this.applet.getAppletObject().getXML());
		var el_const = doc.getElementsByTagName("construction")[0];
		var remove = [];
		for (var i = 0; i < el_const.children.length; i++) {
			var el = el_const.children[i];
			if (el.hasAttribute("label")) {
				if (el.getAttribute("label").indexOf(this.mark) !== -1) remove.push(el);
			} else {
				var outputs = el.getElementsByTagName("output");
				if (outputs.length > 0) {
					if (outputs[0].getAttribute(outputs[0].attributes[0].name).indexOf(this.mark) !== -1) {
						remove.push(el);
					}
				}
			}
		}
		while (remove.length > 0) el_const.removeChild(remove.pop());
		this.applet.getAppletObject().setXML(doc_to_xml(doc));
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
