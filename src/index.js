import {
	scrollSpyDirective,
	scrollSpyAreaDirective,
	spyItemDirective,
	spyListItemDirective,
	spyGroupDirective
} from './scroll-spy';

module.exports = angular.module('scroll-spy', [])
	.directive('scrollSpy', scrollSpyDirective)
	.directive('scrollSpyArea', scrollSpyAreaDirective)
	.directive('spyItem', spyItemDirective)
	.directive('spyListItem', spyListItemDirective)
	.directive('spyGroup', spyGroupDirective);
