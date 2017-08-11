function spyGroupDirective() {
  return {
	restrict: 'A',
	require: '^scrollSpy',
	link: function (scope, elem, attrs, ctrl) {
	  ctrl.groups[attrs.id] = elem;

	  ctrl.refresh();
	  ctrl.update();
	}
  };
}

export {spyGroupDirective};
