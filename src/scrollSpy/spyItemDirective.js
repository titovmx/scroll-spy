export default class SpyItemDirective {
  constructor($parse) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
	this.bindToController = true;
	this.$parse = $parse;
  }

  link(scope, elem, attrs, ctrl) {
	ctrl.setAnchor(attrs.target, elem);
	if (attrs.spyItemTitle) {
	  ctrl.setTitle(attrs.target, () => this.$parse(attrs.spyItemTitle)(scope)
		|| attrs.spyItemTitle);
	}
	elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }

  static createInstance($parse) {
	return new SpyItemDirective($parse);
  }
}

SpyItemDirective.createInstance.$inject = ['$parse'];
