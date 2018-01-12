var build = function(tag_name, class_name, parent, inner_html) {
	var el = document.createElement(tag_name);
	if (class_name !== undefined) el.className = class_name;
	if (parent !== undefined) parent.appendChild(el);
	if (inner_html !== undefined) el.innerHTML = inner_html;
	return el;
};

build_radio_menu = function(choices, default_choice, callback) {
	var name = random_string();
	var div = build("div", "radio_menu");
	div.setAttribute("data-selected", "");
	for (var i = 0; i < choices.length; i++) {
		var label = build("label", undefined, div, choices[i]);
		var radio = build("input", undefined, label);
		radio.type = "radio";
		radio.value = choices[i];
		radio.name = name;
		if (default_choice !== undefined && default_choice == choices[i]) {
			radio.setAttribute("checked", "");
			div.setAttribute("data-selected", choices[i]);
		}
		radio.addEventListener("click", (function(choice) { return function(e) { div.setAttribute("data-selected", choice); callback(choice); } })(choices[i]));
	}
	return div;
};

function stop_propagation(e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
}


var random_string = function(n) {
	n = n || 10;
	var palette = "abcdefghijklmnopqrstuvwxyzABCDEFGhIJKLMNOPQRSTuVWXYZ0123456789";
	var s = "";
	for (var i = 0; i < n; i++) {
		var sel = Math.floor(Math.random() * palette.length);
		s += palette[sel];
	}
	return s;
};

find_root_element = function(el) {
	while (el.parentElement !== null) el = el.parentElement;
	return el;
}

var h5p_get_data_obj = function(s) {
	if (s === undefined) return undefined;
	if (s.length > 0 && (s[0] == "[" || s[0] == "{")) {
		return h5p_get_data_obj_v0(s);
	}

	if (s.length >= 3 && s.substring(0, 3) == "v1_") {
		return h5p_get_data_obj_v1(s);
	}

	console.log("Corrputed or unknown data format");
	return undefined;
};



var h5p_get_data_str = function(o) {
	return h5p_get_data_str_v1(o);
}

var h5p_get_data_obj_v1 = function(s) {
	return JSON.parse(atob(s.substring(3)));
}

var h5p_get_data_str_v1 = function(o) {
	if (o === undefined) return undefined;
	return "v1_" + btoa(JSON.stringify(o));
};


//	for historic reference
var h5p_get_data_obj_v0 = function(s) {
	s = s.replace(new RegExp(/&quot;/, 'g'), "\"");
	s = s.replace(new RegExp(/&lt;/, 'g'), "<");
	s = s.replace(new RegExp(/&gt;/, 'g'), ">");
	console.log(s);
	return JSON.parse(s);
}

var h5p_get_data_str_v0 = function(o) {
	if (o === undefined) return undefined;
	return JSON.stringify(o);
}


//	xml help

function xml_to_doc(xml) {
	return (new DOMParser()).parseFromString(xml, "application/xml");
}

function doc_to_xml(doc) {
	return (new XMLSerializer()).serializeToString(doc);
}














