export default class ScrollSpyController {
  constructor($document, $window, $timeout) {
	this.$timeout = $timeout;
	this.$document = $document;
	this.$window = $window;

	// div elements associated by target id
	this.groups = new Map();
	// anchor elements associated by target id
	this.anchors = new Map();
	// list item element contained more than one anchor
	this.listItems = new Map();
	// anchor elements titles associated by target id
	this.titles = new Map();
	this.offsets = [];
	this.targets = [];
	this.defaultOffset = 10;
	this.initScrollHeight = 0;
	this.scrollableElement = null;
	this.activeTarget = null;
	this.activeTargetUpdated = false;
  }

  getAnchors() {
	return this.anchors;
  };

  setAnchor(name, item) {
	this.anchors.set(name, item);
  };

  setGroup(name, item) {
	this.groups.set(name, item);
  };

  setTitle(name, item) {
	this.titles.set(name, item);
  };

  setListItem(name, item) {
	this.listItems.set(name, item);
  };

  getScrollHeight() {
	const elementScroll = this.scrollableElement && this.scrollableElement[0].scrollHeight ? this.scrollableElement[0].scrollHeight : 0;
	const doc = this.$document[0];
	const bodyScroll = this.$document && doc.body && doc.body.scrollHeight ? doc.body.scrollHeight : 0;
	const documentScroll = this.$document && doc.scrollHeight ? doc.scrollHeight : 0;
	return elementScroll || Math.max(bodyScroll, documentScroll);
  };

  refresh() {

	this.offsets = [];
	this.targets = [];
	this.activeTarget = null;
	this.initScrollHeight = this.getScrollHeight();
	const offsets_targets = [];

	for (let [key, value] of this.groups.entries()) {
	  if (value.css('visibility') !== 'hidden') {
		offsets_targets.push({
		  offset: value.prop('offsetTop'),
		  target: key
		});
	  }
	}

	const sorted = offsets_targets.sort((a, b) => a.offset - b.offset);
	for (let item of sorted) {
	  this.offsets.push(item.offset);
	  this.targets.push(item.target);
	}
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

	if (this.listItems.has(target)) {
	  const listItem = this.listItems.get(target);
	  this.getParentListItem(listItem).addClass('active');
	  if (this.titles.has(target)) {
		const title = this.titles.get(target);
		listItem.text(title);
	  }
	}

	if (this.anchors.has(target)) {
	  const anchor = this.anchors.get(target);
	  this.getParentListItem(anchor).addClass('active');
	  if (this.titles.has(target)) {
		const title = this.titles.get(target);
		anchor.text(title);
	  }
	}

	this.groups.get(target).addClass('active');
  };

  clear() {
	for (let value of this.listItems.values()) {
	  this.getParentListItem(value).removeClass('active');
	}

	for (let [key, value] of this.anchors.entries()) {
	  this.getParentListItem(value).removeClass('active');
	  if (this.titles.has(key)) {
		const title = this.titles.get(key);
		value.text(title);
	  }
	}

	for (let value of this.groups.values()) {
	  value.removeClass('active');
	}
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
	const scrollHeight = this.getScrollHeight() || 0;
	const maxScroll = this.defaultOffset + scrollHeight - this.scrollableElement.prop('offsetHeight');

	if (scrollHeight !== this.initScrollHeight) {
	  this.refresh();
	}

	if (scrollTop >= maxScroll) {
	  const item = scrollTop === this.defaultOffset ? this.targets[0] : this.targets[this.targets.length - 1];
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

	element.on('scroll', this.update);
	angular.element(this.$window)
	  .on('resize', () => this.$timeout(this.update, 100));

	this.refresh();
	this.update();
  };

  deactivate(element) {
	element.off('scroll');
  };

  activateItemOnClick(target) {
	this.activeTargetUpdated = true;
	this.activateItem(target);
	this.scrollableElement[0].scrollTop = this.groups.get(target).prop('offsetTop');
	this.$timeout(() => {
	  this.activeTargetUpdated = false;
	}, 100);
  };
}

ScrollSpyController.$inject = ['$document', '$window', '$timeout'];
