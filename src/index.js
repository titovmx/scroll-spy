import * as ScrollSpyDirective from './scrollSpy/scrollSpyDirective';
import * as ScrollSpyAreaDirective from './scrollSpy/scrollSpyAreaDirective';
import * as SpyItemDirective from './scrollSpy/spyItemDirective';
import * as SpyListItemDirective from './scrollSpy/spyListItemDirective';
import * as SpyGroupDirective from './scrollSpy/spyGroupDirective';

angular.module('scroll-spy', [])
  .directive('scrollSpy', ScrollSpyDirective.createInstance)
  .directive('scrollSpyArea', ScrollSpyAreaDirective.createInstance)
  .directive('spyItem', SpyItemDirective.createInstance)
  .directive('spyListItem', SpyListItemDirective.createInstance)
  .directive('spyGroup', SpyGroupDirective.createInstance);
