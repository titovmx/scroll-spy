import ScrollSpyController from './scrollSpyController';

export default class ScrollSpyDirective {
  constructor() {
    this.restrict = 'A';
    this.controller = ScrollSpyController;
    this.bindToController = true;
  }

  static createInstance() {
    return new ScrollSpyDirective();
  }
};
