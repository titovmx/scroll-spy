import {scrollSpyDirective} from './scrollSpy/scrollSpyDirective';
import {scrollSpyAreaDirective} from './scrollSpy/scrollSpyAreaDirective';
import {spyItemDirective} from './scrollSpy/spyItemDirective';
import {spyListItemDirective} from './scrollSpy/spyListItemDirective';
import {spyGroupDirective} from './scrollSpy/spyGroupDirective';

module.exports = angular.module('scroll-spy', [])
  .directive('scrollSpy', scrollSpyDirective)
  .directive('scrollSpyArea', scrollSpyAreaDirective)
  .directive('spyItem', spyItemDirective)
  .directive('spyListItem', spyListItemDirective)
  .directive('spyGroup', spyGroupDirective);
