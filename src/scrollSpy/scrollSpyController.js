const _timeout = new WeakMap(),
  _document = new WeakMap(),
  _window = new WeakMap(),
  _anchors = new Map(),
  _groups = new Map(),
  _listItems = new Map(),
  _titles = new Map();
let _offsets = [],
  _targets = [],
  _defaultOffset = 10,
  _initScrollHeight = 0,
  _scrollableElement = null;

export default class ScrollSpyController {
  controller($timeout, $document, $window) {
    _timeout.set(this, $timeout);
    _document.set(this, $document);
    _window.set(this, $window);
    this.activeTarget = null;
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
    const document = _document.get(this);
    return _scrollableElement && _scrollableElement.prop('scrollHeight')
    || document ? Math.max(document[0].body.scrollHeight, document[0].scrollHeight) : false;
  };

  refresh() {

    _offsets = [];
    _targets = [];
    this.activeTarget = null;
    _initScrollHeight = this.getScrollHeight();

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

    // this.mapValues(_groups.get(target))
    //   .forEach((group) => {
    //     group.removeClass('active');
    //   });
  };

  scrollTopWithinGroup(scrollTop, groupIndex) {
    return this.activeTarget !== _targets[groupIndex]
      && scrollTop >= _offsets[groupIndex] - _defaultOffset
      && (_offsets[groupIndex + 1] === undefined || scrollTop < _offsets[groupIndex + 1] - _defaultOffset);
  };

  update() {
    if (!_scrollableElement || this.activeTargetUpdated) {
      return;
    }
    const scrollTop = _scrollableElement.prop('scrollTop') + _defaultOffset;
    const scrollHeight = this.getScrollHeight();
    const maxScroll = _defaultOffset + scrollHeight - _scrollableElement.prop('offsetHeight');

    if (scrollHeight !== _initScrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      const item = scrollTop === _defaultOffset ? _targets[0] : _targets[_targets.length - 1];
      if (this.activeTarget !== item) {
        this.activateItem(item);
      }
      return;
    }

    if (this.activeTarget && scrollTop < _offsets[0] - _defaultOffset) {
      this.activeTarget = null;
      this.clear();
      return;
    }

    for (let i = 0, length = _offsets.length; i < length; i++) {
      if (this.scrollTopWithinGroup(scrollTop, i)) {
        this.activateItem(_targets[i]);
        return;
      }
    }
  };

  activate(element, offset) {
    _scrollableElement = element;
    _defaultOffset = offset;

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
    _scrollableElement[0].scrollTop = _groups.get(target).prop('offsetTop');
    _timeout.get(this)(() => this.activeTargetUpdated = false, 100);
  };
}

ScrollSpyController.$inject = ['$timeout', '$document', '$window'];
