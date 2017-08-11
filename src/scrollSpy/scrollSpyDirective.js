import {scrollSpyController} from './scrollSpyController';

function scrollSpyDirective() {
  return {
	restrict: 'A',
	controller: scrollSpyController
  };
}

export {scrollSpyDirective};
