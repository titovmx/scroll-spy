ScrollSpyAreaDirective.$inject = ['$window'];

class ScrollSpyAreaDirective {
  controller($window) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
	this.$window = $window;
  }

  link(scope, elem, attrs, ctrl) {

	const offset = parseInt(attrs.spyOffset);
	scope.$watch(() => this.$window.getComputedStyle(elem[0]).overflowY, (value) => {
	  if (value !== 'hidden') {
		ctrl.activate(elem, offset);
	  } else {
		ctrl.deactivate(elem);
	  }
	});

	scope.$watch(() => elem[0].offsetHeight, (value) => {
	  const overflowY = this.$window.getComputedStyle(elem[0]).overflowY;
	  if (overflowY !== 'hidden') {
		ctrl.update();
	  }
	});
  }
}

export {ScrollSpyAreaDirective};
