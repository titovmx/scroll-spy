spyItemDirective.$inject = ['$parse'];

function spyItemDirective($parse) {
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

export {spyItemDirective};
