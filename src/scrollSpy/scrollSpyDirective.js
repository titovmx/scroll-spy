import {ScrollSpyController} from './scrollSpyController';

class ScrollSpyDirective {
  constructor() {
    this.restrict = 'A';
    this.controller = ScrollSpyController;
  }

  static createInstance() {
    ScrollSpyDirective.instance = new ScrollSpyDirective();
    return ScrollSpyDirective.instance;
  }
}

export {ScrollSpyDirective};

// module.exports = ScrollSpyDirective;
