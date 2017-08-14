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

    // div elements associated by target id
    this.groups = new Map();
    // anchor elements associated by target id
    this.anchors = new Map();
    // list item element contained more than one anchor
    this.listItems = new Map();
    // anchor elements titles associated by target id
    this.titles = new Map();
    // this.activate = this.activate.bind(this);
    self = this;
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
    const elementScroll = scrollableElement && scrollableElement[0].scrollHeight ? scrollableElement[0].scrollHeight : 0;
    const doc = _document.get(this)[0];
    const bodyScroll = _document.has(this) && doc.body && doc.body.scrollHeight ? doc.body.scrollHeight : 0;
    const documentScroll = _document.has(this) && doc.scrollHeight ? doc.scrollHeight : 0;
    return elementScroll || Math.max(bodyScroll, documentScroll);
  };

  refresh() {

    offsets = [];
    targets = [];
    activeTarget = null;
    initScrollHeight = this.getScrollHeight();
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
    this.clear();

    const listItem = this.listItems.get(target);
    if (listItem) {
      this.getParentListItem(listItem).addClass('active');
      const title = this.titles.get(target);
      if (title) {
        listItem.text(title);
      }
    }

    const anchor = this.anchors.get(target);
    if (anchor) {
      this.getParentListItem(anchor).addClass('active');
      const title = this.titles.get(target);
      if (title) {
        anchor.text(title);
      }
    }

    this.groups.get(target).addClass('active');
  };

  clear() {
    for (let value of this.listItems.values()) {
      this.getParentListItem(value).removeClass('active')
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
    return activeTarget !== targets[groupIndex]
      && scrollTop >= offsets[groupIndex] - defaultOffset
      && (offsets[groupIndex + 1] === undefined || scrollTop < offsets[groupIndex + 1] - defaultOffset);
  };

  update() {
    if (!scrollableElement || activeTargetUpdated) {
      return;
    }
    const scrollTop = scrollableElement.prop('scrollTop') + defaultOffset;
    const scrollHeight = this.getScrollHeight();
    const maxScroll = defaultOffset + scrollHeight - scrollableElement.prop('offsetHeight');

    if (scrollHeight !== initScrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      const item = scrollTop === defaultOffset ? targets[0] : targets[targets.length - 1];
      if (activeTarget !== item) {
        this.activateItem(item);
      }
      return;
    }

    if (activeTarget && scrollTop < offsets[0] - defaultOffset) {
      activeTarget = null;
      this.clear();
      return;
    }

    for (let i = 0, length = offsets.length; i < length; i++) {
      if (this.scrollTopWithinGroup(scrollTop, i)) {
        this.activateItem(targets[i]);
        return;
      }
    }
  };

  activate(element, offset) {
    const self = this;
    scrollableElement = element;
    defaultOffset = offset;

    element[0].addEventListener('scroll', self.update);
    angular.element(_window.get(self))
      .bind('resize', () => _timeout.get(self)(self.update, 100));

    this.refresh();
    this.update();
  };

  deactivate(element) {
    element.unbind('scroll');
  };

  activateItemOnClick(target) {
    const self = this;
    activeTargetUpdated = true;
    this.activateItem(target);
    scrollableElement[0].scrollTop = self.groups.get(target).prop('offsetTop');
    _timeout.get(self)(() => {
      activeTargetUpdated = false;
    }, 100);
  };
}

ScrollSpyController.$inject = ['$document', '$window', '$timeout'];
