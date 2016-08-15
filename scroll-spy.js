(function (angular) {
	'use strict';

	angular.module('scroll-spy', [])
		.directive('scrollSpy', scrollSpyDirective)
		.directive('scrollSpyArea', scrollSpyAreaDirective)
		.directive('spyItem', spyItemDirective)
		.directive('spyListItem', spyListItemDirective)
		.directive('spyGroup', spyGroupDirective);

	scrollSpyController.$inject = ['$timeout', '$document', '$window'];
	scrollSpyAreaDirective.$inject = ['$window'];
	spyListItemDirective.$inject = ['$parse'];
	spyItemDirective.$inject = ['$parse'];

	function scrollSpyController ($timeout, $document, $window) {
		var self = this;

		// div elements associated by target id
		this.groups = {};
		// anchor elements associated by target id
		this.anchors = {};
		// list item element contained more than one anchor
		this.listItems = {};
		// anchor elements titles associated by target id
		this.titles = {};

		var scrollableElement = null,
			defaultOffset = 10,
			offsets = [],
			targets = [],
			activeTarget = null,
			initScrollHeight = 0,
			activeTargetUpdated = false;

		var mapValues = function (obj) {
			return Object.keys(obj)
				.map(function (key) {
					return obj[key];
				});
		};

		var getScrollHeight = function () {
			return scrollableElement && scrollableElement.prop('scrollHeight') || Math.max($document[0].body.scrollHeight, $document[0].scrollHeight);
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

		var getParentListItem = function (current) {
			var parent = current.parent();
			while (parent[0] && parent[0].tagName !== 'LI') {
				parent = parent.parent();
			}
			return parent;
		};

		var activateItem = function (target) {
			if (!target) {
				return;
			}
			activeTarget = target;
			clear();

			var listItem = self.listItems[target];
			if (listItem) {
				getParentListItem(listItem).addClass('active');
				var title = self.titles[target];
				if (title) {
					listItem.text(title);
				}
			}

			var anchor = self.anchors[target];
			if (anchor) {
				getParentListItem(anchor).addClass('active');
				var title = self.titles[target];
				if (title) {
					anchor.text(title);
				}
			}

			self.groups[target].addClass('active');
		};

		var clear = function () {
			mapValues(self.listItems)
				.forEach(function (li) {
					getParentListItem(li).removeClass('active');
				});

			Object.keys(self.anchors)
				.forEach(function (key) {
					var anchor = self.anchors[key];
					if (!anchor) return;
					getParentListItem(anchor).removeClass('active');
					var title = self.titles[key];
					if (title) {
						anchor.text(title);
					}
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

		this.refresh = refresh;

		this.update = function () {
			if (!scrollableElement || activeTargetUpdated) {
				return;
			}
			var scrollTop = scrollableElement.prop('scrollTop') + defaultOffset;
			var scrollHeight = getScrollHeight();
			var maxScroll = defaultOffset + scrollHeight - scrollableElement.prop('offsetHeight');

			if (scrollHeight !== initScrollHeight) {
				refresh();
			}

			if (scrollTop >= maxScroll) {
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
			activeTargetUpdated = true;
			activateItem(target);
			scrollableElement[0].scrollTop = self.groups[target].prop('offsetTop');
			$timeout(function () {
				activeTargetUpdated = false;
			}, 100);
		};
	}

	function scrollSpyDirective () {
		return {
			restrict: 'A',
			controller: scrollSpyController,
			link: function (scope, elem, attrs, ctrl) {	}
		};
	}

	function scrollSpyAreaDirective ($window) {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {

				var offset = parseInt(attrs.spyOffset);
				scope.$watch(function () {
					return $window.getComputedStyle(elem[0]).overflowY;
				}, function (value) {
					if (value !== 'hidden') {
						ctrl.activate(elem, offset);
					} else {
						ctrl.deactivate(elem);
					}
				});

				scope.$watch(function () {
					return elem[0].offsetHeight;
				}, function (value) {
					var overflowY = $window.getComputedStyle(elem[0]).overflowY;
					if (overflowY !== 'hidden') {
						ctrl.update();
					}
				});
			}
		}
	};

	function spyItemDirective ($parse) {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.anchors[attrs.target] = elem;
				if (attrs.spyItemTitle) {
					ctrl.titles[attrs.target] = $parse(attrs.spyItemTitle)(scope) || attrs.spyItemTitle;
				}
				elem.bind('click', function () {
					ctrl.activateItemOnClick(attrs.target);
				});
			}
		}
	}

	function spyListItemDirective ($parse) {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.listItems[attrs.target] = ctrl.anchors[attrs.spyListItem];
				ctrl.anchors[attrs.target] = elem;
				if (attrs.spyItemTitle) {
					ctrl.titles[attrs.target] = $parse(attrs.spyItemTitle)(scope) || attrs.spyItemTitle;
				}
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

				ctrl.refresh();
				ctrl.update();
			}
		}
	}
})(angular);
