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

	function scrollSpyController ($timeout, $document, $window) {
		var self = this;

		// div elements associated by target id
		this.groups = {};
		// anchor elements associated by target id
		this.anchors = {};
		// list item element contained more than one anchor
		this.listItems = {};

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
			return scrollableElement.prop('scrollHeight') || Math.max($document[0].body.scrollHeight, $document[0].scrollHeight);
		};

		var refresh = function () {

			offsets = [];
			targets = [];
			activeTarget = null;
			initScrollHeight = getScrollHeight();

			console.log('--- In Refresh ---');
			console.log(self.groups);
			console.log('--- ^ self.groups ---');

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
			console.log('--- In activateItem ---');
			console.log(target);
			console.log('--- ^ target ---');
			if (!target) {
				return;
			}
			activeTarget = target;
			clear();

			if (self.listItems[target]) {
				getParentListItem(self.listItems[target]).addClass('active');
			}
			if (self.anchors[target]) {
				getParentListItem(self.anchors[target]).addClass('active');
			}

			self.groups[target].addClass('active');
		};

		var clear = function () {
			mapValues(self.listItems)
				.forEach(function (li) {
					getParentListItem(li).removeClass('active');
				});

			mapValues(self.anchors)
				.forEach(function(anchor) {
					getParentListItem(anchor).removeClass('active');
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
			console.log('--- In Update ---');
			if (activeTargetUpdated) {
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
				if (!activeTarget) {
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

	function spyItemDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				console.log('--- In spy item ---');
				ctrl.anchors[attrs.target] = elem;
				elem.bind('click', function () {
					ctrl.activateItemOnClick(attrs.target);
				});
			}
		}
	}

	function spyListItemDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.listItems[attrs.target] = ctrl.anchors[attrs.spyListItem];
				ctrl.anchors[attrs.target] = elem;
				elem.bind('click', function () {
					ctrl.activateItemOnClick(attrs.target);
				})
			}
		}
	}

	function spyGroupDirective () {
		return {
			restrict: 'A',
			require: '^scrollSpy',
			link: function (scope, elem, attrs, ctrl) {
				console.log('--- In spy group ---');
				ctrl.groups[attrs.id] = elem;

				ctrl.refresh();
				ctrl.update();
			}
		}
	}
})(angular);
