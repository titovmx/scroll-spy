scrollSpyAreaDirective.$inject = ['$window'];
spyListItemDirective.$inject = ['$parse'];
spyItemDirective.$inject = ['$parse'];


export function scrollSpyAreaDirective($window) {
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
  };
};

export function spyItemDirective($parse) {
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
  };
}

export function spyListItemDirective($parse) {
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
  };
}

export function spyGroupDirective() {
  return {
	restrict: 'A',
	require: '^scrollSpy',
	link: function (scope, elem, attrs, ctrl) {
	  ctrl.groups[attrs.id] = elem;

	  ctrl.refresh();
	  ctrl.update();
	}
  };
}
