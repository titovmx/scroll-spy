import {ScrollSpyDirective} from './scrollSpy/scrollSpyDirective';
import {ScrollSpyAreaDirective} from './scrollSpy/scrollSpyAreaDirective';
import {SpyItemDirective} from './scrollSpy/spyItemDirective';
import {SpyListItemDirective} from './scrollSpy/spyListItemDirective';
import {SpyGroupDirective} from './scrollSpy/spyGroupDirective';

module.exports = angular.module('scroll-spy', [])
  .directive('scrollSpy', ScrollSpyDirective)
  .directive('scrollSpyArea', ScrollSpyAreaDirective)
  .directive('spyItem', SpyItemDirective)
  .directive('spyListItem', SpyListItemDirective)
  .directive('spyGroup', SpyGroupDirective);
