export default class SpyGroupDirective {
  constructor() {
    this.restrict = 'A';
    this.require = '^scrollSpy';
    this.bindToController = true;
  }

  link(scope, elem, attrs, ctrl) {
    ctrl.setGroup(attrs.id, elem);

    ctrl.refresh();
    ctrl.update();
  }

  static createInstance() {
    SpyGroupDirective.instance = new SpyGroupDirective();
    return SpyGroupDirective.instance;
  }
}
