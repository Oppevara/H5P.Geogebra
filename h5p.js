var H5P = H5P || {};

H5P.Geogebra = (function ($) {
  function C(options, id) {
    this.$ = $(this);
    this.options = $.extend(true, {}, {}, options);
    this.id = id;
    this.geogebra = undefined;
    this.data = h5p_get_data_obj(this.options.data);
  };
 

  C.prototype.attach = function ($container) {
    var el = build("div", "geogebra_wrapper");
    $container.append(el);
    var el_applet_container = build("div", undefined, el);
    el_applet_container.id = random_string();

    if (this.data.mode == "Figure") {
      this.geogebra = new geogebra_wrapper(el_applet_container, "viewer");
      this.geogebra.data = this.data.data;
    } else {
      this.geogebra = new geogebra_wrapper(el_applet_container, "editor");
      var menu = build_radio_menu(["Show", "Hide"], "Hide");

      menu.addEventListener("click", function() {
        if (menu.getAttribute("data-selected") == "Show") {
          var elements = this.geogebra.concat_marked(this.geogebra.get_elements(), this.data.elements);
          this.geogebra.set_elements(elements);
        } else {
          var elements = this.geogebra.remove_marked_elements(this.geogebra.get_elements());
          this.geogebra.set_elements(elements);
        }
      }.bind(this));
    }

    el.appendChild(menu);

  }

 
  return C;
})(H5P.jQuery);

