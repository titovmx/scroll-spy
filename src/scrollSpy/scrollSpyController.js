const _timeout = new WeakMap();
const _document = new WeakMap();
const _window = new WeakMap();
const _anchors = new Map();
const _groups = new Map();
const _listItems = new Map();
const _titles = new Map();

export default class ScrollSpyController {
  controller($timeout, $document, $window) {
    _timeout.set(this, $timeout);
    _document.set(this, $document);
    _window.set(this, $window);
    this.scrollableElement = null;
    this.defaultOffset = 10;
    this.offsets = [];
    this.targets = [];
    this.activeTarget = null;
    this.initScrollHeight = 0;
    this.activeTargetUpdated = false;
  }

  getAnchors() {
    return _anchors;
  };

  setAnchor(name, item) {
    _anchors.set(name, item);
  };

  setGroup(name, item) {
    _groups.set(name, item);
  };
  setTitle(name, item) {
    _titles.set(name, item);
  };
  setListItem(name, item) {
    _listItems.set(name, item);
  };

  mapValues(obj) {
    return Object.keys(obj)
      .map((key) => obj[key]);
  };

  getScrollHeight() {
    const document = _document.get(this)[0];
    return this.scrollableElement && this.scrollableElement.prop('scrollHeight') || Math.max(document.body.scrollHeight, document.scrollHeight);
  };

  refresh() {

    this.offsets = [];
    this.targets = [];
    this.activeTarget = null;
    this.initScrollHeight = this.getScrollHeight();

    // Object.keys(this.groups)
    //   .map((groupTarget) => {
    //     const groupElement = this.groups[groupTarget];
    //     if (groupElement.css('visibility') !== 'hidden') {
    //       return {
    //         offset: groupElement.prop('offsetTop'),
    //         target: groupTarget
    //       };
    //     }
    //   })
    //   .sort((a, b) => a.offset - b.offset)
    //   .forEach((mappedObj) => {
    //     this.offsets.push(mappedObj.offset);
    //     this.targets.push(mappedObj.target);
    //   });
    debugger;
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

    const listItem = _listItems.get(target);
    if (listItem) {
      this.getParentListItem(listItem).addClass('active');
      const title = _titles.get(target);
      if (title) {
        listItem.text(title);
      }
    }

    const anchor = _anchors.get(target);
    if (anchor) {
      this.getParentListItem(anchor).addClass('active');
      const title = _titles.get(target);
      if (title) {
        anchor.text(title);
      }
    }

    _groups.get(target).addClass('active');
  };

  clear() {
    this.mapValues(_listItems)
      .forEach((li) => this.getParentListItem(li).removeClass('active'));

    // Object.keys(this.anchors)
    //   .forEach((key) => {
    //     const anchor = this.anchors[key];
    //     if (!anchor) return;
    //     this.getParentListItem(anchor).removeClass('active');
    //     const title = this.titles[key];
    //     if (title) {
    //       anchor.text(title);
    //     }
    //   });
    debugger;

    this.mapValues(_groups.get(target))
      .forEach((group) => {
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
    const window = angular.element(_window.get(this));
    window.bind('resize', () => _timeout.get(this)(this.update, 100));

    this.refresh();
    this.update();
  };

  deactivate(element) {
    element.unbind('scroll');
  };

  activateItemOnClick(target) {
    this.activeTargetUpdated = true;
    this.activateItem(target);
    this.scrollableElement[0].scrollTop = _groups.get(target).prop('offsetTop');
    _timeout.get(this)(() => this.activeTargetUpdated = false, 100);
  };
}

ScrollSpyController.$inject = ['$timeout', '$document', '$window'];
