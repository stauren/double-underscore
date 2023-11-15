/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules selector
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:selector*/
/**
 * will override __.Dom.$, __.Dom.f
 * @module Selector
 * @requires Dom,Lang
 */
__.BasicModule.register('selector', '0.4.0', ['lang', 'dom'], function () {
  "use strict";

  __.exportPath('__.selector');

  /**
   * private function used to get Dom element
   * @param {string|array} sQuery an Id or a CSS selector string
   * @param {object} root dom reference of the root
   * @param {boolean} firstOnly stop after found the first el
   * @return {array} array of Dom elements
   */
  __.dom.$ = function (sQuery, root, firstOnly) {
    var _els, i, j;

    if (sQuery) {
      if (sQuery.nodeType) { // Node
        _els = [sQuery];
      } else if (sQuery.item) { // NodeList
        _els = [];
        for (i = 0, j = sQuery.length; i < j; ++i) {
          _els.push(sQuery[i]);
        }
      } else if (__.lang.isString(sQuery)) { // id or query
        _els = root ? null : __.dom.id(sQuery);
        _els = _els ? [_els] : __.selector.query(sQuery, root, firstOnly);
      }
    } else {
      _els = [];
    }
    return _els;
  };

  /**
   * first
   * @param {string|array} sQuery an Id or a CSS selector string
   * @param {string|dom} root the rood id or dom reference
   */
  __.dom.f = function () {
    return __.dom.$.apply(__.dom, __.lang.a(arguments))[0];
  };

  /**
   * function to test whether the dom needle is in haystack
   * @param {object} needle
   * @param {object} haystack
   * @param {boolean} allowEqual
   */
  __.dom.contains = (function () {
    if (__.doc.documentElement.compareDocumentPosition) {
      return function (needle, haystack, allowEqual) {
        if (!needle || !haystack || !haystack.tagName) {
          return false;
        }
        return (allowEqual && needle === haystack ) ||
          !!(haystack.compareDocumentPosition(needle) & 16);
      };
    } else if (__.doc.documentElement.contains) {
      return function (needle, haystack, allowEqual) {
        if (!needle || !haystack || !haystack.tagName) {
          return false;
        }

//contains method does NOT support TEXT_NODE param
        if (needle.nodeType === 3) {
          needle = needle.parentNode;
          allowEqual = true;
        }

        return (allowEqual && needle === haystack) ||
          haystack.contains(needle);
      };
    } else {
      return function () {};
    }
  }());

  __.selector.query = (function () {
    return __.doc.querySelectorAll ?
      function (selector, root, firstOnly) {
        var result = [], i, len, nodelist;
        if (root && !root.nodeName) {
          root = __.dom.f(root);
          if (!root) {
            return result;
          }
        }
        root = root || __.doc;
        if (firstOnly) {
          result[0] = root.querySelector(selector);
        } else {
          nodelist = root.querySelectorAll(selector);
          for (i = 0, len = nodelist.length; i < len; ++i) {
            result.push(nodelist[i]);
          }
        }
        return result;
      } :
      function (selector, root, firstOnly) {
        var result, groups, found, i, len, roots, levels, thetag, theid,
          theclass, nodes, classstr, j, jlen, theroot, bcontain,
          directChild, thesel, tmpnodes, k, klen;

        result = [];

        if (!selector) {
          return result;
        }

        selector = __.lang.trim(selector);

        groups = __.lang.trim(selector).split(',');
        if (groups.length > 1) {
          for (i = 0, len = groups.length; i < len; ++i) {
            found = __.selector.query(groups[i], root, firstOnly);
            if (firstOnly && found.length > 1) {
              result[0] = found[0];
              break;
            } else {
              result = result.concat(found);
            }
          }
          return result;
        }
        if (root && !root.nodeName) {
          root = __.dom.f(root);
          if (!root) {
            return result;
          }
        }
        root = root || __.doc;

        roots = [root]; //for multilevel selector

        levels = selector.split(' ');
        directChild = false;
        for (j = 0, jlen = levels.length; j < jlen; j++) {
          thesel = levels[j];
          if (thesel === '>') {
            directChild = true;
          } else {
            nodes = [];
            thetag = thesel.match(__.lang.getReg('^([^.#]+)'));
            theid = thesel.match(__.lang.getReg('#([^.#]+)'));
            theclass = thesel.match(__.lang.getReg('\\.[^.#]+', 'g'));
            classstr = theclass ?  theclass.join(' ').
              replace(__.lang.getReg('\\.', 'g'), '') : '';

            if (theid) {
              nodes = __.dom.id(theid[1]);
              nodes = nodes ? [nodes] : [];
              thetag = thetag ? thetag[1] : null;
            } else if (thetag || theclass) {
              for (i = 0, len = roots.length; i < len; ++i) {
                tmpnodes = thetag ?
                  roots[i].getElementsByTagName(thetag[1]) :
                  __.dom.getElementsByClassName(roots[i], classstr);

                if (directChild) {
                  for (k = 0, klen = tmpnodes.length; k < klen; k++) {
                    if (tmpnodes[k].parentNode === roots[i]) {
                      nodes.push(tmpnodes[k]);
                    }
                  }
                } else {
                  nodes = nodes.concat(__.lang.a(tmpnodes));
                }
              }
              classstr = thetag ? classstr : null;
              thetag = null;
            }

            nodes = __.selector._nodeFilter(nodes, {
              tagname : thetag,
              classname : classstr
            });

            if (theid && nodes[0]) {
              bcontain = false;
              for (i = 0, len = roots.length; i < len; ++i) {
                theroot = roots[i];
                if (directChild ? nodes[0].parentNode === theroot :
                    (theroot === __.doc ||
                    __.dom.contains(nodes[0], theroot))) {
                  bcontain = true;
                  break;
                }
              }
              if (!bcontain) {
                nodes = [];
              }
            }
            directChild = false;
            roots = nodes;
            if (roots.length === 0) {
              break;
            }
          }
        }
        return roots;
      };
  }());

  __.selector._nodeFilter = function (els, config) {
    var leftNode, tagName, i, len, classes, k, kl, classesToCheck,
      match, current;

    els = __.lang.unique(els);
    if (config.tagname) {
      leftNode = [];
      tagName = __.lang.getReg("\\b" + config.tagname + "\\b", "i");
      for (i = 0, len = els.length; i < len; ++i) {
        if (tagName.test(els[i].tagName)) {
          leftNode.push(els[i]);
        }
      }
      els = leftNode;
    }
    if (config.classname) {
      leftNode = [];
      classes = config.classname.split(' ');
      classesToCheck = [];

      for (i = 0, len = classes.length; i < len; ++i) {
        classesToCheck.push(__.lang.getReg("(^|\\s)" + classes[i] +
          "(\\s|$)"));
      }

      for (i = 0, len = els.length; i < len; ++i) {
        current = els[i];
        match = false;
        for (k = 0, kl = classesToCheck.length; k < kl; k++) {
          match = classesToCheck[k].test(current.className);
          if (!match) {
            break;
          }
        }
        if (match) {
          leftNode.push(current);
        }
      }
      els = leftNode;
    }
    return els;
  };
});
/*end:selector*/
