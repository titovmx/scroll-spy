import {scrollSpyController} from './scrollSpyController';

class scrollSpyDirective {
  constructor() {
	this.restrict = 'A';
	this.controller = scrollSpyController;
  }
}

export {scrollSpyDirective};
