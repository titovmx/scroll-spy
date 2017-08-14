const _window = new WeakMap();

export default class ScrollSpyAreaDirective {
  constructor($window) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    _window.set(this, $window);
  }

  link(scope, elem, attrs, ctrl) {
    const offset = parseInt(attrs.spyOffset);
    let overflowY = _window.get(this).getComputedStyle(elem[0]).overflowY;

    elem[0].style.position = 'relative';

    scope.$watch(() => overflowY, (value) => {
      alert(value);
      if (value !== 'hidden') {
        ctrl.activate(elem, offset);
      } else {
        ctrl.deactivate(elem);
      }
    });
    scope.$watch(elem[0].offsetHeight, () => {
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
