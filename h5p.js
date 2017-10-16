var H5P = H5P || {};

H5P.Geogebra = (function ($) {
  function C(options, id) {
    this.$ = $(this);
    this.options = $.extend(true, {}, {}, options);
    this.id = id;
    this.applet = undefined;
    this.data = h5p_get_data_obj(this.options.data);
  };
 

  C.prototype.attach = function ($container) {
    this.applet = new geogebra_exercise("viewer", 876, 630);
    this.applet.data = this.data;
    $container.append(this.applet.el);
  }

 
  return C;
})(H5P.jQuery);

