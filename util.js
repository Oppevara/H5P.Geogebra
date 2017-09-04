var build = function(tag_name, class_name, parent, inner_html) {
	var el = document.createElement(tag_name);
	if (class_name !== undefined) el.className = class_name;
	if (parent !== undefined) parent.appendChild(el);
	if (inner_html !== undefined) el.innerHTML = inner_html;
	return el;
};

build_radio_menu = function(choices, default_choice) {
	var name = random_string();
	var div = build("div");
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
		label.addEventListener("click", (function(choice) { return function() { div.setAttribute("data-selected", choice); } })(choices[i]));
	}
	return div;
};

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

var h5p_get_data_obj = function(s) {
	if (s === undefined) return undefined;
	s = s.replace(new RegExp(/&quot;/, 'g'), "\"");
	s = s.replace(new RegExp(/&lt;/, 'g'), "<");
	s = s.replace(new RegExp(/&gt;/, 'g'), ">");
	return JSON.parse(s);
};

var h5p_get_data_str = function(o) {
	if (o === undefined) return undefined;
	return JSON.stringify(o);
};