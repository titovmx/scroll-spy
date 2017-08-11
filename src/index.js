import {
  ScrollSpyDirective,
  ScrollSpyAreaDirective,
  SpyItemDirective,
  SpyListItemDirective,
  SpyGroupDirective
} from './scrollSpy';

module.exports = angular.module('scroll-spy', [])
  .directive('scrollSpy', ScrollSpyDirective.createInstance)
  .directive('scrollSpyArea', ScrollSpyAreaDirective.createInstance)
  .directive('spyItem', SpyItemDirective.createInstance)
  .directive('spyListItem', SpyListItemDirective.createInstance)
  .directive('spyGroup', SpyGroupDirective.createInstance);
