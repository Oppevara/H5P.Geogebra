var H5P = H5P || {};

H5P.Geogebra = (function ($) {
  function C(options, id) {
    this.$ = $(this);
    this.options = $.extend(true, {}, {}, options);
    this.id = id;
    this.applet = undefined;
    this.data = h5p_get_data_obj(this.options.data);
  }


  C.prototype.attach = function ($container) {
    console.log("loaded " + this.libraryInfo.versionedName);

    var lazy_load = function() {
      if (!GGB_READY) return schedule_recall(arguments, this);
      this.applet = new geogebra_exercise("viewer", 876, 630);
      this.applet.data = this.data;
      $container.append(this.applet.el);
    }.bind(this);

    lazy_load();
  };


  return C;
})(H5P.jQuery);
