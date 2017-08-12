import ScrollSpyController from './scrollSpyController';

export default class ScrollSpyDirective {
  constructor() {
    this.restrict = 'A';
    this.controller = ScrollSpyController;
  }

  static createInstance() {
    ScrollSpyDirective.instance = new ScrollSpyDirective();
    return ScrollSpyDirective.instance;
  }
};
