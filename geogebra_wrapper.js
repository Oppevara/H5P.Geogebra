
function geogebra_wrapper(mode, width, height) {
	this.el = build("div", "geogebra_wrapper");
	this.el.id = random_string();
	this.mode = mode || "editor";
	this._width = width || 800;
	this._height = height || 600;
	this.applet = undefined;
	this.mark = "ᐧ";
	this.ready = 0;

	this.inject = function(params, callback_done) {
		if (!GGB_READY || find_root_element(this.el).tagName !== "HTML") return schedule_recall(arguments, this);
		GGB_READY = 0;

		this.applet = new GGBApplet(params);
		this.applet.inject(this.el);
		this._sync_size();

		//	wait for it
		var lazy_check = function() {
			if (this.applet.getAppletObject === undefined || this.applet.getAppletObject() === undefined || this.applet.getAppletObject().debug === undefined) return schedule_recall(arguments, this);
			GGB_READY = 1;
			this.ready = 1;
			window.appl = this.applet;
			if (callback_done !== undefined) callback_done();
			console.log("GGB id: " + this.el.id + " finished loading");
		}.bind(this);
		lazy_check();
	}.bind(this);

	this.inject_editor = function(callback_done) {
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
			"scale":1,
			"language":"et"
		}, callback_done);
	}.bind(this);

	this.inject_viewer = function(callback_done) {
		//	temporary fix, inspired by Pjotr's savage idea
		this.el.style.opacity = 0;
		this.inject_editor(function() {
			setTimeout(function() {
				var ao = this.applet.getAppletObject();
				ao.showToolBar(false);
				ao.showMenuBar(false);
				ao.showAlgebraInput(false);
				ao.setPerspective("G");

				var style_bar = this.el.querySelector(".TitleBarPanel");
				if (style_bar !== null) style_bar.style.display = "none";
				this.el.style.opacity = 1;
			}.bind(this), 100);

			if (callback_done !== undefined) callback_done();
		}.bind(this));


		return;
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
			"scale":1,
			"language":"et"
		}, callback_done);
	}.bind(this);

	this.get_construction = function() {
		if (!this.ready) throw("geogebra_wrapper: applet not yet loaded");

		var doc = xml_to_doc(this.applet.getAppletObject().getXML());
		var elc = doc.getElementsByTagName("construction")[0];
		var xml = "";
		for (var i = 0; i < elc.childNodes.length; i++) {
			var el = elc.childNodes[i];
			if (el.nodeType !== 1/*Node.ELEMENT_NODE*/) continue;
			xml += doc_to_xml(el);
		}
		return xml;
	}.bind(this);

	this.is_ie_or_edge = function() {
		return document.documentMode || /Edge/.test(navigator.userAgent);
	};

	// IE and Edge sort attributes in reverse, this breaks vectors in GeoGebra
	// Example: <input a0="A" a1="B"/> produces Vector(A,B)
	// <input a1="B" a0="A"/> produces Vector(B,A)
	// Although the difference is in position of attributes only
	this._fix_xml = function(el_const, doc_xml) {
		var fixes = [];

		for (var i = 0; i < el_const.childNodes.length; i++) {
			var el = el_const.childNodes[i];
			if (el.nodeType !== 1/*Node.ELEMENT_NODE*/) continue;

			var el_inputs = el.getElementsByTagName("input");
			if (el_inputs.length > 0) {
				var el_input = el_inputs[0];

				if (el_input.attributes.length > 1) {
					var attributes = [];
					for (var j = 0; j < el_input.attributes.length; j++) {
						var attr = el_input.attributes[j].name;
						attributes.push({
							'name': attr,
							'value': el_input.getAttribute(attr),
							'string': attr + '="' + el_input.getAttribute(attr) + '"'
						});
					}
					var fix = {};
					fix.from = attributes.map(function(attribute) {
						return attribute.string;
					});
					fix.from = fix.from.join(' ');
					attributes.sort(function(a, b) {
						if (a.name === b.name) {
							return 0;
						}

						return a.name > b.name ? 1 : -1;
					});
					fix.to = attributes.map(function(attribute) {
						return attribute.string;
					});
					fix.to = fix.to.join(' ');
					fixes.push(fix);
				}
			}
		}

		if (fixes.length > 0) {
			fixes.forEach(function(fix) {
				doc_xml = doc_xml.replace(fix.from, fix.to);
			});
		}

		return doc_xml;
	};

	// Fixes empty xmlns attributes added in Safari
	this._fix_empty_xmlns = function(doc_xml) {
		return doc_xml.replace(/xmlns=\"\"\s?/g, '');
	};

	this.add_marked_elements = function(constructor_inner_xml) {
		if (!this.ready) return schedule_recall(arguments, this);

		var xml = this.applet.getAppletObject().getXML();
		xml = xml.replace("</geogebra>", "<constructor_add>" + constructor_inner_xml + "</constructor_add></geogebra>");
		var doc = xml_to_doc(xml);

		var el_const = doc.getElementsByTagName("construction")[0];
		var el_add = doc.getElementsByTagName("constructor_add")[0];

		while(el_add.firstElementChild !== null) {
			var el = el_add.firstElementChild;
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

			// NB! This solution prevents types with complex expressions from failing,
			// though it does not change the names and could lead to issues with same variable name being used more than once
			var skip_inputs_processing = el.nodeName === 'command' && (el.getAttribute('name') === 'Integral' || el.getAttribute('name') === 'IntegralBetween');
			var el_inputs = el.getElementsByTagName("input");
			if (el_inputs.length > 0 && !skip_inputs_processing) {
				var el_input = el_inputs[0];
				for (var i = 0; i < el_input.attributes.length; i++) {
					var attr = el_input.attributes[i].name;
					var attrval = el_input.getAttribute(attr);
					if (attrval !== 'xAxis' && attrval !== 'yAxis' && attrval !== 'zAxis' && !/^\d+$/.test(attrval)) {
						el_input.setAttribute(attr, el_input.getAttribute(attr) + this.mark);
					}
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

			var el_start_points = el.getElementsByTagName('startPoint');
			if (el_start_points.length > 0) {
				var el_start_point = el_start_points[0];
				for (var i = 0; i < el_start_point.attributes.length; i++) {
					var attr = el_start_point.attributes[i].name;
					el_start_point.setAttribute(attr, el_start_point.getAttribute(attr) + this.mark);
				}
			}

			var el_linked_geos = el.getElementsByTagName('linkedGeo');
			if (el_linked_geos.length > 0) {
				var el_linked_geo = el_linked_geos[0];
				if (el_linked_geo.hasAttribute('exp')) {
					el_linked_geo.setAttribute('exp', el_linked_geo.getAttribute('exp') + this.mark);
				}
			}

			el_add.removeChild(el);
			el_const.appendChild(el);
		}
		doc.getElementsByTagName("geogebra")[0].removeChild(el_add);

		var doc_xml = doc_to_xml(doc);
		if (this.is_ie_or_edge()) {
			doc_xml = this._fix_xml(el_const, doc_xml);
		}

		doc_xml = this._fix_empty_xmlns(doc_xml);

		this.applet.getAppletObject().setXML(doc_xml);
	}.bind(this);

	this.remove_marked_elements = function() {
		if (!this.ready) return schedule_recall(arguments, this);

		var doc = xml_to_doc(this.applet.getAppletObject().getXML());
		var el_const = doc.getElementsByTagName("construction")[0];
		var remove = [];
		for (var i = 0; i < el_const.childNodes.length; i++) {
			var el = el_const.childNodes[i];
			if (el.nodeType !== 1/*Node.ELEMENT_NODE*/) continue;
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

		var doc_xml = doc_to_xml(doc);
		if (this.is_ie_or_edge()) {
			doc_xml = this._fix_xml(el_const, doc_xml);
		}

		doc_xml = this._fix_empty_xmlns(doc_xml);

		// NB! <cascell> element will not be removed
		this.applet.getAppletObject().setXML(doc_xml);
	}.bind(this);


	this._sync_size = function(w, h) {
		this.el.style.with = this._width + "px";
		this.el.style.height = this._height + "px";
		//window.top.dispatchEvent(new Event('resize'));
		h5p_resize_all_instances();
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
			if (!this.ready) throw("geogebra_wrapper: applet not yet loaded");
			return this.applet.getAppletObject().getBase64();
		}.bind(this),
		'set' : function(v) {
			if (!this.ready) return schedule_recall(arguments, this);
			if (v === undefined) return;
			this.applet.getAppletObject().setBase64(v);
		}.bind(this)
	});

	this._sync_size();

	if (this.mode == "editor") {
		this.inject_editor();
	} else {
		this.inject_viewer();
	}
}
