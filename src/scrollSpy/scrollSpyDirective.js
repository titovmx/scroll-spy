import {ScrollSpyController} from './scrollSpyController';

class ScrollSpyDirective {
  constructor() {
	this.restrict = 'A';
	this.controller = ScrollSpyController;
  }
}

export {ScrollSpyDirective};
