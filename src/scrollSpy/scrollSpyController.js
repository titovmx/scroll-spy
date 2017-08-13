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
  _scrollableElement = null,
  _activeTarget = null,
  _activeTargetUpdated = false;

export default class ScrollSpyController {
  constructor($document, $window, $timeout) {
    _timeout.set(this, $timeout);
    _document.set(this, $document);
    _window.set(this, $window);
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

  getScrollHeight() {
    return _scrollableElement
    && _scrollableElement[0].getAttribute('scrollHeight')
    || _document.has(this)
      ? Math.max(_document.get(this)[0].body.scrollHeight, _document.get(this)[0].scrollHeight)
      : null;
  };

  refresh() {

    _offsets = [];
    _targets = [];
    _activeTarget = null;
    _initScrollHeight = this.getScrollHeight();
    const offsets_targets = [];

    for (let [key, value] of _groups.entries()) {
      if (value.css('visibility') !== 'hidden') {
        offsets_targets.push({
          offset: value.prop('offsetTop'),
          target: key
        });
      }
    }
    offsets_targets.sort((a, b) => a.offset - b.offset).forEach((mappedObj) => {
      _offsets.push(mappedObj.offset);
      _targets.push(mappedObj.target);
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
    _activeTarget = target;
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
    for (let value of _listItems.values()) {
      this.getParentListItem(value).removeClass('active')
    }
    for (let [key, value] of _anchors.entries()) {
      this.getParentListItem(value).removeClass('active');
      if (_titles.has(key)) {
        const title = _titles.get(key);
        value.text(title);
      }
    }
    for (let value of _groups.values()) {
      value.removeClass('active');
    }
  };

  scrollTopWithinGroup(scrollTop, groupIndex) {
    return _activeTarget !== _targets[groupIndex]
      && scrollTop >= _offsets[groupIndex] - _defaultOffset
      && (_offsets[groupIndex + 1] === undefined || scrollTop < _offsets[groupIndex + 1] - _defaultOffset);
  };

  update() {
    if (!_scrollableElement || _activeTargetUpdated) {
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
      if (_activeTarget !== item) {
        this.activateItem(item);
      }
      return;
    }

    if (_activeTarget && scrollTop < _offsets[0] - _defaultOffset) {
      _activeTarget = null;
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
    const $window = angular.element(_window.get(this));
    $window.bind('resize', () => _timeout.get(this)(this.update, 100));

    this.refresh();
    this.update();
  };

  deactivate(element) {
    element.unbind('scroll');
  };

  activateItemOnClick(target) {
    _activeTargetUpdated = true;
    this.activateItem(target);
    _scrollableElement[0].scrollTop = _groups.get(target)[0].getAttribute('offsetTop');
    setTimeout(() => {
      _activeTargetUpdated = false;
    }, 100);
  };
}

ScrollSpyController.$inject = ['$document', '$window', '$timeout'];
