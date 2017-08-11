scrollSpyAreaDirective.$inject = ['$window'];

class scrollSpyAreaDirective {
  controller($window) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
  }

  link(scope, elem, attrs, ctrl) {

	const offset = parseInt(attrs.spyOffset);
	scope.$watch(function () {
	  return $window.getComputedStyle(elem[0]).overflowY;
	}, function (value) {
	  if (value !== 'hidden') {
		ctrl.activate(elem, offset);
	  } else {
		ctrl.deactivate(elem);
	  }
	});

	scope.$watch(function () {
	  return elem[0].offsetHeight;
	}, function (value) {
	  const overflowY = $window.getComputedStyle(elem[0]).overflowY;
	  if (overflowY !== 'hidden') {
		ctrl.update();
	  }
	});
  }
}

export {scrollSpyAreaDirective};
