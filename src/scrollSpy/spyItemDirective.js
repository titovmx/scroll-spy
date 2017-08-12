const _parse = new WeakMap();

export default class SpyItemDirective {
  constructor($parse) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    _parse.set(this, $parse);
  }

  link(scope, elem, attrs, ctrl) {
    ctrl.setAnchor(attrs.target, elem);
    if (attrs.spyItemTitle) {
      ctrl.setTitle(attrs.target, () => _parse.get(this)(attrs.spyItemTitle)(scope)
        || attrs.spyItemTitle);
    }
    elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }

  static createInstance($parse) {
    SpyItemDirective.instance = new SpyItemDirective($parse);
    return SpyItemDirective.instance;
  }
}

SpyItemDirective.createInstance.$inject = ['$parse'];
