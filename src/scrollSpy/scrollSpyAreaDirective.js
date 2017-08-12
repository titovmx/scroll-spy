const _window = new WeakMap();

export default class ScrollSpyAreaDirective {
  controller($window) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    _window.set(this, $window);
  }

  link(scope, elem, attrs, ctrl) {

    const offset = parseInt(attrs.spyOffset);
    scope.$watch(() => _window.get(this).getComputedStyle(elem[0]).overflowY, (value) => {
      if (value !== 'hidden') {
        ctrl.activate(elem, offset);
      } else {
        ctrl.deactivate(elem);
      }
    });

    scope.$watch(() => elem[0].offsetHeight, (value) => {
      const overflowY = _window.get(this).getComputedStyle(elem[0]).overflowY;
      if (overflowY !== 'hidden') {
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
