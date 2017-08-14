const _timeout = new WeakMap(),
  _document = new WeakMap(),
  _window = new WeakMap();
let self = {},
  offsets = [],
  targets = [],
  defaultOffset = 10,
  initScrollHeight = 0,
  scrollableElement = null,
  activeTarget = null,
  activeTargetUpdated = false;

export default class ScrollSpyController {
  constructor($document, $window, $timeout) {
    _timeout.set(this, $timeout);
    _document.set(this, $document);
    _window.set(this, $window);
    self = this;

    // div elements associated by target id
    self.groups = new Map();
    // anchor elements associated by target id
    self.anchors = new Map();
    // list item element contained more than one anchor
    self.listItems = new Map();
    // anchor elements titles associated by target id
    self.titles = new Map();

  }

  getAnchors() {
    return self.anchors;
  };

  setAnchor(name, item) {
    self.anchors.set(name, item);
  };

  setGroup(name, item) {
    self.groups.set(name, item);
  };

  setTitle(name, item) {
    self.titles.set(name, item);
  };

  setListItem(name, item) {
    self.listItems.set(name, item);
  };

  getScrollHeight() {
    const elementScroll = scrollableElement && scrollableElement[0].scrollHeight ? scrollableElement[0].scrollHeight : 0;
    const doc = _document.get(self)[0];
    const bodyScroll = _document.has(self) && doc.body && doc.body.scrollHeight ? doc.body.scrollHeight : 0;
    const documentScroll = _document.has(self) && doc.scrollHeight ? doc.scrollHeight : 0;
    return elementScroll || Math.max(bodyScroll, documentScroll);
  };

  refresh() {

    offsets = [];
    targets = [];
    activeTarget = null;
    initScrollHeight = self.getScrollHeight();
    const offsets_targets = [];

    for (let [key, value] of self.groups.entries()) {
      if (value.css('visibility') !== 'hidden') {
        offsets_targets.push({
          offset: value.prop('offsetTop'),
          target: key
        });
      }
    }

    const sorted = offsets_targets.sort((a, b) => a.offset - b.offset);
    for (let item of sorted) {
      offsets.push(item.offset);
      targets.push(item.target);
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
    activeTarget = target;
    self.clear();

    if (self.listItems.has(target)) {
      const listItem = self.listItems.get(target);
      this.getParentListItem(listItem).addClass('active');
      if (self.titles.has(target)) {
        const title = self.titles.get(target);
        listItem.text(title);
      }
    }

    if (self.anchors.has(target)) {
      const anchor = self.anchors.get(target);
      self.getParentListItem(anchor).addClass('active');
      if (self.titles.has(target)) {
        const title = self.titles.get(target);
        anchor.text(title);
      }
    }

    self.groups.get(target).addClass('active');
  };

  clear() {
    for (let value of self.listItems.values()) {
      self.getParentListItem(value).removeClass('active')
    }

    for (let [key, value] of self.anchors.entries()) {
      this.getParentListItem(value).removeClass('active');
      if (self.titles.has(key)) {
        const title = self.titles.get(key);
        value.text(title);
      }
    }

    for (let value of self.groups.values()) {
      value.removeClass('active');
    }
  };

  scrollTopWithinGroup(scrollTop, groupIndex) {
    return activeTarget !== targets[groupIndex]
      && scrollTop >= offsets[groupIndex] - defaultOffset
      && (offsets[groupIndex + 1] === undefined || scrollTop < offsets[groupIndex + 1] - defaultOffset);
  };

  update() {
    if (!scrollableElement || activeTargetUpdated) {
      return;
    }
    const scrollTop = scrollableElement.prop('scrollTop') + defaultOffset;
    const scrollHeight = self.getScrollHeight();
    const maxScroll = defaultOffset + scrollHeight - scrollableElement.prop('offsetHeight');

    if (scrollHeight !== initScrollHeight) {
      self.refresh();
    }

    if (scrollTop >= maxScroll) {
      const item = scrollTop === defaultOffset ? targets[0] : targets[targets.length - 1];
      if (activeTarget !== item) {
        self.activateItem(item);
      }
      return;
    }

    if (activeTarget && scrollTop < offsets[0] - defaultOffset) {
      activeTarget = null;
      self.clear();
      return;
    }

    for (let i = 0, length = offsets.length; i < length; i++) {
      if (this.scrollTopWithinGroup(scrollTop, i)) {
        self.activateItem(targets[i]);
        return;
      }
    }
  };

  activate(element, offset) {
    scrollableElement = element;
    defaultOffset = offset;

    element.bind('scroll', self.update.bind(self));
    angular.element(_window.get(self))
      .bind('resize', () => _timeout.get(self)(self.update.bind(self), 100));

    self.refresh();
    self.update();
  };

  deactivate(element) {
    element.unbind('scroll');
  };

  activateItemOnClick(target) {
    activeTargetUpdated = true;
    this.activateItem(target);
    scrollableElement[0].scrollTop = self.groups.get(target).prop('offsetTop');
    _timeout.get(self)(() => {
      activeTargetUpdated = false;
    }, 100);
  };
}

ScrollSpyController.$inject = ['$document', '$window', '$timeout'];
