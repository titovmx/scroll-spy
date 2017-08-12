const _parse = new WeakMap();

export default class SpyListItemDirective {
  constructor($parse) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    _parse.set(this, $parse);
  }

  link(scope, elem, attrs, ctrl) {
    ctrl.listItems[attrs.target] = ctrl.anchors[attrs.spyListItem];
    ctrl.anchors[attrs.target] = elem;
    if (attrs.spyItemTitle) {
      ctrl.titles[attrs.target] = _parse.get(this)(attrs.spyItemTitle)(scope)
        || attrs.spyItemTitle;
    }
    elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }

  static createInstance($parse) {
    SpyListItemDirective.instance = new SpyListItemDirective($parse);
    return SpyListItemDirective.instance;
  }
}

// SpyListItemDirective.$inject = ['$parse'];
SpyListItemDirective.createInstance.$inject = ['$parse'];

