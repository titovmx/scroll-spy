class SpyItemDirective {
  constructor($parse) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
	this.$parse = $parse;
  }

  link(scope, elem, attrs, ctrl) {
	ctrl.anchors[attrs.target] = elem;
	if (attrs.spyItemTitle) {
	  ctrl.titles[attrs.target] = this.$parse(attrs.spyItemTitle)(scope) || attrs.spyItemTitle;
	}
	elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }
  static createInstance($parse) {
	SpyItemDirective.instance =  new SpyItemDirective($parse);
	return SpyItemDirective.instance;
  }
}

SpyItemDirective.$inject = ['$parse'];
SpyItemDirective.createInstance.$inject = ['$parse'];

export {SpyItemDirective};
