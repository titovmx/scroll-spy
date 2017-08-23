export default class SpyListItemDirective {
  constructor($parse) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
	this.bindToController = true;
	this.$parse = $parse;
  }

  link(scope, elem, attrs, ctrl) {
	ctrl.setListItem(attrs.target, ctrl.getAnchors(attrs.spyListItem));
	ctrl.setAnchor(attrs.target, elem);
	if (attrs.spyItemTitle) {
	  ctrl.setTitle(attrs.target, () => this.$parse(attrs.spyItemTitle)(scope)
		|| attrs.spyItemTitle);
	}
	elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }

  static createInstance($parse) {
	return new SpyListItemDirective($parse);
  }
}

SpyListItemDirective.createInstance.$inject = ['$parse'];

