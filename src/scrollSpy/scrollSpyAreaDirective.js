export default class ScrollSpyAreaDirective {
  constructor($window) {
	this.restrict = 'A';
	this.require = '^scrollSpy';
	this.$window = $window;
  }

  link(scope, elem, attrs, ctrl) {
	const offset = parseInt(attrs.spyOffset);

	elem[0].style.position = 'relative';

	scope.$watch(() => this.$window.getComputedStyle(elem[0]).overflowY, (value) => {
	  if (value !== 'hidden') {
		ctrl.activate(elem, offset);
	  } else {
		ctrl.deactivate(elem);
	  }
	});
	scope.$watch(() => elem[0].offsetHeight, () => {
	  if (this.$window.getComputedStyle(elem[0]).overflowY !== 'hidden') {
		ctrl.update();
	  }
	});
  }

  static createInstance($window) {
	ScrollSpyAreaDirective.instance = new ScrollSpyAreaDirective($window);
	return ScrollSpyAreaDirective.instance;
  }
}

ScrollSpyAreaDirective.createInstance.$inject = ['$window'];
