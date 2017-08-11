scrollSpyController.$inject = ['$timeout', '$document', '$window'];

class scrollSpyController {
  controller($timeout, $document, $window) {
	// div elements associated by target id
	this.groups = {};
	// anchor elements associated by target id
	this.anchors = {};
	// list item element contained more than one anchor
	this.listItems = {};
	// anchor elements titles associated by target id
	this.titles = {};
	this.scrollableElement = null;
	this.defaultOffset = 10;
	this.offsets = [];
	this.targets = [];
	this.activeTarget = null;
	this.initScrollHeight = 0;
	this.activeTargetUpdated = false;
  }

  mapValues(obj) {
	return Object.keys(obj)
	  .map(function (key) {
		return obj[key];
	  });
  };

  getScrollHeight() {
	return this.scrollableElement && this.scrollableElement.prop('scrollHeight') || Math.max($document[0].body.scrollHeight, $document[0].scrollHeight);
  };

  refresh() {

	this.offsets = [];
	this.targets = [];
	this.activeTarget = null;
	this.initScrollHeight = this.getScrollHeight();

	Object.keys(this.groups)
	  .map(function (groupTarget) {
		const groupElement = this.groups[groupTarget];
		if (groupElement.css('visibility') !== 'hidden') {
		  return {
			offset: groupElement.prop('offsetTop'),
			target: groupTarget
		  };
		}
	  })
	  .sort(function (a, b) {
		return a.offset - b.offset;
	  })
	  .forEach(function (mappedObj) {
		this.offsets.push(mappedObj.offset);
		this.targets.push(mappedObj.target);
	  });
  };

  getParentListItem(current) {
	let parent = current.parent();
	while (parent[0] && parent[0].tagName !== 'LI') {
	  parent = parent.parent();
	}
	return parent;
  };

  activateItem(target) {
	if (!target) {
	  return;
	}
	this.activeTarget = target;
	this.clear();

	const listItem = this.listItems[target];
	if (listItem) {
	  this.getParentListItem(listItem).addClass('active');
	  const title = this.titles[target];
	  if (title) {
		listItem.text(title);
	  }
	}

	const anchor = this.anchors[target];
	if (anchor) {
	  this.getParentListItem(anchor).addClass('active');
	  const title = this.titles[target];
	  if (title) {
		anchor.text(title);
	  }
	}

	this.groups[target].addClass('active');
  };

  clear() {
	this.mapValues(this.listItems)
	  .forEach(function (li) {
		this.getParentListItem(li).removeClass('active');
	  });

	Object.keys(this.anchors)
	  .forEach(function (key) {
		const anchor = this.anchors[key];
		if (!anchor) return;
		this.getParentListItem(anchor).removeClass('active');
		const title = this.titles[key];
		if (title) {
		  anchor.text(title);
		}
	  });

	this.mapValues(this.groups)
	  .forEach(function (group) {
		group.removeClass('active');
	  });
  };

  scrollTopWithinGroup(scrollTop, groupIndex) {
	return this.activeTarget !== this.targets[groupIndex]
	  && scrollTop >= this.offsets[groupIndex] - this.defaultOffset
	  && (this.offsets[groupIndex + 1] === undefined || scrollTop < this.offsets[groupIndex + 1] - this.defaultOffset);
  };

  update() {
	if (!this.scrollableElement || this.activeTargetUpdated) {
	  return;
	}
	const scrollTop = this.scrollableElement.prop('scrollTop') + this.defaultOffset;
	const scrollHeight = this.getScrollHeight();
	const maxScroll = this.defaultOffset + scrollHeight - this.scrollableElement.prop('offsetHeight');

	if (scrollHeight !== this.initScrollHeight) {
	  this.refresh();
	}

	if (scrollTop >= maxScroll) {
	  const item = scrollTop === this.defaultOffset ? this.targets[0] : this.targets[targets.length - 1];
	  if (this.activeTarget !== item) {
		this.activateItem(item);
	  }
	  return;
	}

	if (this.activeTarget && scrollTop < this.offsets[0] - this.defaultOffset) {
	  this.activeTarget = null;
	  this.clear();
	  return;
	}

	for (let i = 0, length = this.offsets.length; i < length; i++) {
	  if (this.scrollTopWithinGroup(scrollTop, i)) {
		this.activateItem(this.targets[i]);
		return;
	  }
	}
  };

  activate(element, offset) {
	this.scrollableElement = element;
	this.defaultOffset = offset;

	element.bind('scroll', this.update);
	const window = angular.element($window);
	window.bind('resize', function () {
	  this.$timeout(this.update, 100);
	});

	this.refresh();
	this.update();
  };

  deactivate(element) {
	element.unbind('scroll');
  };

  activateItemOnClick(target) {
	this.activeTargetUpdated = true;
	this.activateItem(target);
	this.scrollableElement[0].scrollTop = this.groups[target].prop('offsetTop');
	this.$timeout(() => {
	  this.activeTargetUpdated = false;
	}, 100);
  };
}

export {scrollSpyController};
