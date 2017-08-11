spyListItemDirective.$inject = ['$parse'];

class spyListItemDirective {
  constructor($parse) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
  }

  link(scope, elem, attrs, ctrl) {
	ctrl.listItems[attrs.target] = ctrl.anchors[attrs.spyListItem];
	ctrl.anchors[attrs.target] = elem;
	if (attrs.spyItemTitle) {
	  ctrl.titles[attrs.target] = $parse(attrs.spyItemTitle)(scope) || attrs.spyItemTitle;
	}
	elem.bind('click', function () {
	  ctrl.activateItemOnClick(attrs.target);
	});
  }
}

export {spyListItemDirective};
