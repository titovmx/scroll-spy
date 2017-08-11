SpyItemDirective.$inject = ['$parse'];

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
}

export {SpyItemDirective};
