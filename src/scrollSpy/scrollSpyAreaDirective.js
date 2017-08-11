class ScrollSpyAreaDirective {
  controller($window) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    // this.$window = $window;
  }

  link(scope, elem, attrs, ctrl) {

    const offset = parseInt(attrs.spyOffset);
    scope.$watch(() => $window.getComputedStyle(elem[0]).overflowY, (value) => {
      if (value !== 'hidden') {
        ctrl.activate(elem, offset);
      } else {
        ctrl.deactivate(elem);
      }
    });

    scope.$watch(() => elem[0].offsetHeight, (value) => {
      const overflowY = $window.getComputedStyle(elem[0]).overflowY;
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

// ScrollSpyAreaDirective.$inject = ['$window'];
ScrollSpyAreaDirective.createInstance.$inject = ['$window'];

export {ScrollSpyAreaDirective};

// module.exports = ScrollSpyAreaDirective;
