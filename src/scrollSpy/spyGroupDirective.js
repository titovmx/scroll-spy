class SpyGroupDirective {
  controller() {
	this.restrict = 'A';
	this.require = '^scrollSpy';
  }

  link(scope, elem, attrs, ctrl) {
	ctrl.groups[attrs.id] = elem;

	ctrl.refresh();
	ctrl.update();
  }
}

export {SpyGroupDirective};
