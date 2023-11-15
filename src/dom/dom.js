/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules dom
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:dom*/
__.BasicModule.register('dom', '0.4.0', ['lang'], function () {
  "use strict";

  var _UNDEFINED;

  __.exportPath('__.dom');

  __.dom.id = function (s) {
    return typeof s === 'string' ? __.doc.getElementById(s) : s;
  };

  __.dom.$ = function (s) {
    var el = __.dom.id(s);
    return el ? [el] : [];
  };

  __.dom.f = __.dom.id;

  __.dom.hasClass = function (el, cls) {
    return __.lang.getReg('(?:^|\\s+)' + cls + '(?:\\s+|$)').
      test(el.className);
  };

  __.dom.addClass = function (el, cls) {
    if (!__.dom.hasClass(el, cls)) {
      el.className = __.lang.trim([el.className, cls].join(' '));
    }
  };

  __.dom.remClass = function (el, cls) {
    if (cls && __.dom.hasClass(el, cls)) {
      el.className = __.lang.trim(
        el.className.replace(__.lang.getReg('(?:^|\\s+)' +
          cls + '(?:\\s+|$)'), ' ')
      );
      if (__.dom.hasClass(el, cls)) {
        __.dom.remClass(el, cls);
      }
    }
  };

  __.dom.getElementsByClassName = (function () {
    return __.doc.getElementsByClassName ?
      function (node, cls) {
        return node.getElementsByClassName(cls);
      } :
      function (node, cls) {
        var k, kl, l, ll,
          classes = cls.split(' '),
          classesToCheck = [],
          elements = node.all ? node.all : node.getElementsByTagName('*'),
          current,
          returnElements = [],
          match;

        for (k = 0, kl = classes.length; k < kl; k += 1) {
          classesToCheck.push(__.lang.getReg("(^|\\s)" + classes[k] +
            "(\\s|$)"));
        }

        for (k = 0, kl = elements.length; k < kl; k += 1) {
          current = elements[k];
          match = false;
          for (l = 0, ll = classesToCheck.length; l < ll; l += 1) {
            match = classesToCheck[l].test(current.className);
            if (!match) {
              break;
            }
          }
          if (match) {
            returnElements.push(current);
          }
        }
        return returnElements;
      };
  }());

  __.dom.insertBefore = function (newOne, oldOne) {
    if (oldOne.parentNode && oldOne.parentNode.insertBefore) {
      oldOne.parentNode.insertBefore(newOne, oldOne);
    }
  };

  __.dom.insertAfter = function (newNode, oldNode) {
    if (oldNode.nextSibling) {
      oldNode.parentNode.insertBefore(newNode, oldNode.nextSibling);
    } else {
      oldNode.parentNode.appendChild(newNode);
    }
  };

  /**
   * create (append) html element by object
   * @param {object} obj
   * @config {string} tag default div, set to '_text' for a text node
   * @config {string|array} cls
   * @config {string} id
   * @config {string} html innerHTML
   * @config {string} css
   * @config {object|array} child child node
   * @config {object} attrs attrs add to the element via setAttribute
   * @config {string} text create a text node as the only child
   * @config {string} _t {_t : 'content'} equals
   *                     {tag:'_text', text : 'content'}
   * @config {object} parentN deprecated!!
   * @param {object|string} oparent
   * @param {boolean} purgeParent set the parent innerHTML to empty
   *                              before apend
   */
  __.dom.addEl = function (obj, oparent, purgeParent) {
    // tag, cls, id, html, css, child, attrs, text, value, src, name
    var el, tagName, tmp, value, fragment, addClass, fnAddEl;

    if (!obj) {
      return false;
    }

    addClass = function (oItem) {
      __.dom.addClass(el, oItem);
    };

    fnAddEl = function (oItem) {
      __.dom.addEl(oItem, el);
    };

    if (__.lang.isArray(obj)) {
      fragment = __.doc.createDocumentFragment();
      __.each(obj, function (o) {
        __.dom.addEl(o, fragment);
      });

      oparent = __.dom.id(oparent);

      if (oparent) {
        if (purgeParent) {
          oparent.innerHTML = '';
        }
        fragment = oparent.appendChild(fragment);
      }
      return fragment;
    }

    if (obj._t) {
      obj.tag = '_text';
      obj.text = obj._t;
    }

    tagName = obj.tag;

    if (!tagName && oparent && oparent.tagName) {
      switch (oparent.tagName.toLowerCase()) {
      case 'table':
      case 'tbody':
        tagName = 'tr';
        break;
      case 'tr':
        tagName = 'td';
        break;
      case 'ul':
        tagName = 'li';
        break;
      case 'select':
        tagName = 'option';
        break;
      }
    }

    tagName = tagName || 'div';

    if (__.ua.ie && (tagName === 'input' || tagName === 'select') &&
        obj.name) {
      el = __.doc.createElement('<input name=' + obj.name + '>');
    } else if (tagName === '_text') {
      el = __.doc.createTextNode(obj.text);
      obj = {};
    } else {
      el = __.doc.createElement(tagName);
    }

    if (!el) {
      return false;
    }

    for (tmp in obj) {
      if (obj.hasOwnProperty(tmp)) {
        value = obj[tmp];
        switch (tmp) {
        case 'cls':
          __.each(value, addClass);
          break;
        case 'child':
          __.each(value, fnAddEl);
          break;
        case 'text':
          el.appendChild(__.doc.createTextNode(value));
          break;
        case 'css':
          el.style.cssText = value;
          break;
        case 'html':
          el.innerHTML = value;
          break;
        case 'attrs':
          __.each(value, function(attrv, attrn) {
            el.setAttribute(attrn, attrv);
          }, true);
          break;
        default:
          el[tmp] = value;
          break;
        }
      }
    }

    oparent = __.dom.f(oparent);

    if (oparent && oparent.appendChild) {
      if (purgeParent) {
        oparent.innerHTML = '';
      }
      el = oparent.appendChild(el);
    }

    return el;
  };

  __.dom.remEl = function (els) {
    var i, rmFn = function (el) {
      el = __.dom.$(el);
      __.each(el, function (o) {
        if (o && o.parentNode) {
          o.parentNode.removeChild(o);
        }
      });
    };

    if (__.lang.isArray(els)) {
      for (i = els.length - 1; i > -1; i--) {
        rmFn(els[i]);
      }
    } else {
      rmFn(els);
    }
  };

  __.dom.addText = function (obj, txt) {
    obj.appendChild(__.doc.createTextNode(txt));
  };

  __.dom.fillText = function (obj, txt) {
    obj.innerHTML = '';
    __.dom.addText(obj, txt);
  };

  /**
   * dynamically add a css stylesheet
   * @param {string} sText the css content
   */
  __.dom.addStyle = function (sText) {
    var dCss;
    if (__.doc.createStyleSheet) {
      //IE, create new css
      //!!remember the 31 limit
      dCss = __.doc.createStyleSheet('');
      dCss.cssText = sText;
    } else {
      __.dom.addEl({
        tag : 'style',
        textContent : sText
   //     html : sText
      }, __.doc.getElementsByTagName('head')[0]);
    }
  };

  __.dom.addRules = function (aRules) {
    var fn, newSheet;

    __.dom.addStyle('');

    newSheet = __.doc.styleSheets;
    newSheet = newSheet[newSheet.length - 1];

    if (newSheet.insertRule) {
      //document.styleSheets[0].insertRule("div{font-size: 20px;}", document.styleSheets[0].cssRules.length)
      fn = function (rules) {
        var sheet = newSheet,
          result = [];

        __.each(rules, function (o, i) {
          result[i] = sheet.cssRules.length;
          sheet.insertRule(o, result[i]);
        });

        return result;
      };
    } else if (newSheet.addRule) {
      fn = function (rules) {
        var sheet = newSheet,
          result = [];

        __.each(rules, function (o, i) {
          o = o.split(__.lang.getReg('[{}]'));
          result[i] = sheet.rules.length;
          sheet.addRule(o[0], o[1], result[i]);
        });

        return result;
      };
    } else {
      fn = __.lang.EF;
    }

    __.dom.addRules = fn;

    return fn(aRules);
  };

  __.dom.remRules = function (aIndices) {
    var sheet = __.doc.styleSheets[0],
      isW3C;

    if (sheet.deleteRule) {
      isW3C = true;
    } else if (sheet.removeRule) {
      isW3C = false;
    } else {
      return;
    }

    __.each(aIndices, function (o) {
      if (isW3C) {
        sheet.deleteRule(o);
      } else {
        sheet.removeRule(o);
      }
    });
  };

  __.dom.getScrollXY = function () {
    var get = function (name) {
      name = 'scroll' + name;
      return Math.max(__.doc.documentElement[name], __.doc.body[name]);
    };

    return [get('Left'), get('Top')];
  };

  __.dom.getPosition = function (obj, type) {
    //offsetLeft or offsetTop
    var distance = 0;
    while (obj && !__.lang.isEmpty(obj.offsetParent)) {
      distance += obj[type];
      obj = obj.offsetParent;
    }
    distance += parseInt(__.doc.body[type], 10);
    return distance;
  };

  /**
   * @param {string|array} sQuery an Id or a CSS selector string
   */
  __.dom.v = function (sQuery) {
    var o = __.dom.f(sQuery);
    if (o) {
      return o.value;
    }
    return false;
  };

  __.dom.getWindowXY = function () {
    var height = __.global.innerHeight, // Safari, (Opera)
      width = __.global.innerWidth,
      mode = __.doc.compatMode;

    if ((mode || __.ua.ie)) { // IE, Gecko, (Opera)
      if (mode === 'CSS1Compat') { // Standards
        height = __.ua.opera ? height : __.doc.documentElement.clientHeight;
        width = __.doc.documentElement.clientWidth;
      } else { // Quirks
        height = __.ua.opera ? height : __.doc.body.clientHeight;
        width = __.doc.body.clientWidth;
      }
    }
    return [width, height];
  };

  __.dom.getDocumentXY = function () {
    var scrollWidth, scrollHeight, wxy;

    if (__.doc.compatMode !== 'CSS1Compat' || __.ua.webkit) {
      scrollWidth = __.doc.body.scrollWidth;
      scrollHeight = __.doc.body.scrollHeight;
    } else {
      scrollWidth = __.doc.documentElement.scrollWidth;
      scrollHeight = __.doc.documentElement.scrollHeight;
    }

    wxy = __.dom.getWindowXY();

    return [Math.max(scrollWidth, wxy[0]), Math.max(scrollHeight, wxy[1])];
  };


  /**
   * set an element to the window center
   * @param {object} el the dom element
   */
  __.dom.setCenter = function (el) {
    var wXY = __.dom.getWindowXY(),
      sXY = __.dom.getScrollXY(),
      w = el.offsetWidth || el.clientWidth || parseInt(el.style.width, 10),
      h = el.offsetHeight || el.clientHeight ||
        parseInt(el.style.height, 10),
      top;

    el.style.position = 'absolute';
    el.style.left = (wXY[0] - w) / 2 + sXY[0] + 'px';

    top  = (wXY[1] - h) / 2 + sXY[1];
    el.style.top = (top < 50 ? 50 : top) + 'px';
  };

  __.dom.getOpacity = function (el) {
    var r;
    if (!__.lang.isUndefined(el.style.opacity)) {
      r = el.style.opacity;
      r = r === '' ? '1' : r;
    } else {
      r = 100;
      try {
        r = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
      } catch (e) {
        try {
          r = el.filters('alpha').opacity;
        } catch (err) {}
      }
      r = r / 100;
    }
    return r;
  };

  __.dom.setOpacity = function (el, op) {
    if (!__.lang.isUndefined(el.style.opacity)) {
      el.style.opacity = op;
    }

    if (__.lang.isString(el.style.filter)) {
      el.style.filter = 'alpha(opacity=' + (op * 100).toFixed(0) + ')';
      if (!el.currentStyle || !el.currentStyle.hasLayout) {
        el.style.zoom = 1;
      }
    }
  };

  __.dom.prev = function (el) {
    var n = el.previousSibling;
    if (!n) {
      return false;
    }
    return __.lang.isNode(n) ? n : __.dom.prev(n);
  };

  __.dom.next = function (el) {
    var n = el.nextSibling;
    if (!n) {
      return false;
    }
    return __.lang.isNode(n) ? n : __.dom.next(n);
  };

});
/*end:dom*/
