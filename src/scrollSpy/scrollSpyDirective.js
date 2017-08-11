import {scrollSpyController} from './scrollSpyController';

export function scrollSpyDirective() {
  return {
	restrict: 'A',
	controller: scrollSpyController
  };
}
