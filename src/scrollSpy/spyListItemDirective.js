const _parse = new WeakMap();

export default class SpyListItemDirective {
  constructor($parse) {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    _parse.set(this, $parse);
  }

  link(scope, elem, attrs, ctrl) {
    ctrl.setListItem(attrs.target, ctrl.getAnchors(attrs.spyListItem));
    ctrl.setAnchor(attrs.target, elem);
    if (attrs.spyItemTitle) {
      ctrl.setTitle(attrs.target, () => _parse.get(this)(attrs.spyItemTitle)(scope)
        || attrs.spyItemTitle);
    }
    elem.bind('click', () => ctrl.activateItemOnClick(attrs.target));
  }

  static createInstance($parse) {
    SpyListItemDirective.instance = new SpyListItemDirective($parse);
    return SpyListItemDirective.instance;
  }
}

SpyListItemDirective.createInstance.$inject = ['$parse'];

