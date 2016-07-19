(function (angular) {
	'use strict';

	angular.module('scrollSpy', [])
		.directive('scrollSpy', scrollSpyDirective)
		.directive('scrollSpyArea', scrollSpyAreaDirective)
		.directive('spyItem', spyItemDirective)
		.directive('spyGroup', spyGroupDirective);

	scrollSpyController.$inject = ['$element', '$timeout', '$document', '$window', '$anchorScroll'];

	function scrollSpyController ($element, $timeout, $document, $window, $anchorScroll) {
		var self = this;

		// div elements associated by target id
		this.groups = {};
		// anchor elements associated by target id
		this.anchors = {};

		var scrollableElement = null,
			defaultOffset = 10,
			offsets = [],
			targets = [],
			activeTarget = null,
			initScrollHeight = 0;

		var mapValues = function (obj) {
			return Object.keys(obj)
				.map(function (key) {
					return obj[key];
				});
		};

		var getScrollHeight = function () {
			return scrollableElement.prop('scrollHeight') || Math.max($document[0].body.scrollHeight, $document[0].scrollHeight);
		};

		var refresh = function () {

			offsets = [];
			targets = [];
			activeTarget = null;
			initScrollHeight = getScrollHeight();

			Object.keys(self.groups)
				.map(function (groupTarget) {
					var groupElement = self.groups[groupTarget];
					if (groupElement.css('visibility') !== 'hidden') {
						return {
							offset: groupElement.prop('offsetTop'),
							target: groupTarget
						}
					}
				})
				.sort(function (a, b) {
					return a.offset - b.offset
				})
				.forEach(function (mappedObj) {
					offsets.push(mappedObj.offset);
					targets.push(mappedObj.target);
				});
		};

		var activateItem = function (target) {
			activeTarget = target;
			clear();

			self.anchors[target].parent().addClass('active');

			self.groups[target].addClass('active');
		};

		var clear = function () {
			mapValues(self.anchors)
				.forEach(function(anchor) {
					anchor.parent().removeClass('active');
				});

			mapValues(self.groups)
				.forEach(function(group) {
					group.removeClass('active');
				});
		};

		var scrollTopWithinGroup = function (scrollTop, groupIndex) {
			return activeTarget !== targets[groupIndex]
				&& scrollTop >= offsets[groupIndex] - defaultOffset
				&& (offsets[groupIndex + 1] === undefined || scrollTop < offsets[groupIndex + 1] - defaultOffset);
		};

		var scrollTopOnScreen = function (scrollTop, groupIndex) {
			return scrollTop <= offsets[groupIndex] - defaultOffset
				&& offsets[groupIndex] < scrollTop + scrollableElement.prop('offsetHeight') - defaultOffset
		};

		this.update = function () {
			var scrollTop = scrollableElement.prop('scrollTop') + defaultOffset;
			var scrollHeight = getScrollHeight();
			var maxScroll = defaultOffset + scrollHeight - scrollableElement.prop('offsetHeight');

			if (scrollHeight !== initScrollHeight) {
				refresh();
			}

			if (scrollTop > maxScroll) {
				var item = scrollTop === defaultOffset ? targets[0] : targets[targets.length - 1];
				if (activeTarget !== item) {
					activateItem(item);
				}
				return;
			}

			if (activeTarget && scrollTop < offsets[0]) {
				activeTarget = null;
				clear();
				return;
			}

			// var activeTargetIndex = targets.indexOf(activeTarget);
			// if (scrollTopOnScreen(scrollTop, activeTargetIndex))
			// 	return;

			for (var i = 0; i < offsets.length; i++) {
				if (scrollTopWithinGroup(scrollTop, i)) {
					activateItem(targets[i]);
					return;
				}
			}
		};

		this.activate = function (element, offset) {
			scrollableElement = element;
			defaultOffset = offset;

			element.bind('scroll', self.update);
			var window = angular.element($window);
			window.bind('resize', function () {
				$timeout(self.update, 100);
			});

			refresh();
			self.update();
		};

		this.deactivate = function (element) {
			element.unbind('scroll');
		};

		this.activateItemOnClick = function (target) {
			var scrollTop = scrollableElement.prop('scrollTop') + defaultOffset;
			var targetIndex = targets.indexOf(target);
			if (scrollTopOnScreen(scrollTop, targetIndex)) {
				activateItem(target);
			} else {
				$anchorScroll(target);
				$timeout(function () {
					if (target !== activeTarget) {
						activateItem(target);
					}
				}, 0);
			}
		};

		this.invalidate = function() {
			$element.css('position', 'static');
			$timeout(function () {
				$element.css('position', 'relative');
			}, 0);
		};
	}

	function scrollSpyDirective () {
		return {
			restrict: 'A',
			controller: scrollSpyController,
			link: function (scope, elem, attrs, ctrl) {	}
		};
	}

	function scrollSpyAreaDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				// ToDo: find solution to get calculated overflowY without jQuery
				var $elem = $(elem);

				var offset = parseInt(attrs.spyOffset);
				scope.$watch(function () {
					return $elem.css('overflow-y');
				}, function (value) {
					if (value !== 'hidden') {
						ctrl.activate(elem, offset);
					} else {
						ctrl.deactivate(elem);
						ctrl.invalidate();
					}
				});

				scope.$watch(function () {
					return elem[0].offsetHeight;
				}, function (value) {
					if ($elem.css('overflow-y') !== 'hidden') {
						ctrl.update();
					}
				});
			}
		}
	};

	function spyItemDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.anchors[attrs.target] = elem;
				elem.bind('click', function () {
					ctrl.activateItemOnClick(attrs.target);
				});
			}
		}
	}

	function spyGroupDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.groups[attrs.id] = elem;
			}
		}
	}
})(angular);
