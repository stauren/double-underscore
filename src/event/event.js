/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules event
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:event*/
__.BasicModule.register('event', '0.4.0', ['lang'], function () {
  "use strict";

  __.exportPath('__.event');

  __.event.listeners = 0;

  __.event._allEvents = {};

  __.event._getEl = function (selector) {
    return __.lang.isString(selector) ? (__.dom ?
      __.dom.$(selector) : __.doc.getElementById(selector)) : selector;
  };

  __.event.on = (function () {
    if (__.global.addEventListener) {
      return function (el, type, fn, capture) {
        var newfn, newtype;
        el = __.event._getEl(el);
        if (type.indexOf(':') > -1) {
          newtype = 'dataavailable';
          newfn = function (e) {
            if (e.eventName === type) {
              fn(e);
            }
          };
        } else {
          newtype = type;
          newfn = fn;
        }
        __.event._allEvents[fn] = newfn;
        __.each(el, function (o) {
          __.event.listeners++;
          o.addEventListener(newtype, newfn, (!!capture));
        });
      };
    } else if (__.global.attachEvent) {
      return function (el, type, fn) {
        var newfn, newtype;
        el = __.event._getEl(el);
        if (type.indexOf(':') > -1) {
          newtype = 'dataavailable';
          newfn = function (e) {
            e = e || __.global.event;
            e.target = e.target || e.srcElement;
            if (e.eventName === type) {
              fn(e);
            }
          };
        } else {
          newtype = type;
          newfn = function (e) {
            e = e || __.global.event;
            e.target = e.target || e.srcElement;
            fn(e);
          };
        }
        __.event._allEvents[fn] = newfn;
        __.each(el, function (o) {
          __.event.listeners++;
          o.attachEvent("on" + newtype, newfn);
        });
      };
    } else {
      return __.lang.EF;
    }
  }());

  __.event.off = (function () {
    if (__.global.removeEventListener) {
      return function (el, type, fn, capture) {
        var newfn;
        el = __.event._getEl(el);
        type = type && type.indexOf(':') > -1 ? 'dataavailable' : type;
        newfn = __.event._allEvents[fn];
        delete __.event._allEvents[fn];
        __.each(el, function (o) {
          __.event.listeners--;
          o.removeEventListener(type, newfn, !!capture);
        });
      };
    } else if (__.global.detachEvent) {
      return function (el, type, fn) {
        var newfn;
        el = __.event._getEl(el);
        type = type && type.indexOf(':') > -1 ? 'dataavailable' : type;
        newfn = __.event._allEvents[fn];
        delete __.event._allEvents[fn];
        __.each(el, function (o) {
          __.event.listeners--;
          o.detachEvent("on" + type, newfn);
        });
      };
    } else {
      return __.lang.EF;
    }
  }());

  /**
   * fire custom event
   */
  __.event.fire = function (el, eventName, memo) {
    /* example:
     __.event.on(document, 'st:ohyeah', function(e) {
       alert(e.memo.haha)
     })
     __.event.fire(doucment, 'st:ohyeah', {'haha':123123})
    */
    var ev,
      element = __.event._getEl(el);

    if (__.lang.isArray(element)) {
      element = element[0];
    }

    element = element || __.doc;

    if (element === __.doc && __.doc.createEvent &&
        !element.dispatchEvent) {
      element = __.doc.documentElement;
    }

    if (__.doc.createEvent) {
      ev = __.doc.createEvent("HTMLEvents");
      //initEvent function(type, bubbles, cancelable) 
      ev.initEvent('dataavailable', true, true);
    } else {
      ev = __.doc.createEventObject();
      ev.eventType = 'ondataavailable';
    }

    ev.eventName = eventName;
    ev.memo = memo || {};

    if (__.doc.createEvent) {
      element.dispatchEvent(ev);
    } else {
      element.fireEvent(ev.eventType, ev);
    }
    return ev;
  };

  __.event.stopPropagation = function (ev) {
    if (ev.stopPropagation) {
      ev.stopPropagation();
    } else {
      ev.cancelBubble = true;
    }
  };

  __.event.preventDefault = function (ev) {
    if (ev.preventDefault) {
      ev.preventDefault();
    } else {
      ev.returnValue = false;
    }
  };

  __.event.stopEvent = function (ev) {
    __.event.preventDefault(ev);
    __.event.stopPropagation(ev);
  };

  __.event.bind = function (fn, obj) {
    return function () {
      fn.apply(obj, __.lang.a(arguments));
    };
  };


  // http://www.dynamic-tools.net/toolbox/isMouseLeaveOrEnter/
  /*
  _isMouseLeaveOrEnter = function (e, el) {
    if (e.type != 'mouseout' && e.type != 'mouseover') return false;
    var reltg = e.relatedTarget ? e.relatedTarget :
      e.type == 'mouseout' ? e.toElement : e.fromElement;
    while (reltg && reltg != el) reltg = reltg.parentNode;
    return (reltg != el);
  }
  ,
  */

  __.event.onReady = function (fn) {
    var klass = __.event.onReady;

    klass._bindReady();

    if (klass._isReady) {
      fn.call(__.global);
    } else {
      klass._readyList.push(function () {
        return fn.call(__.global);
      });
    }
  };

  __.event.onReady._readyList = [];
  __.event.onReady._isReady = false;
  __.event.onReady._isBound = false;

  __.event.onReady._hlReady = function () {
    var klass = __.event.onReady;

    if (!klass._isReady) {
      klass._isReady = true;
      __.each(klass._readyList, function (o) {
        o();
      });
      klass._readyList = null;
    }
  };

  __.event.onReady._bindReady = function () {
    var klass = this,
      oldonload,
      ol = 'onload';

    if (klass._isBound) {
      return;
    }
    klass._isBound = true;

    //dom ready may be already fired when run to here
    //if (_CFG[4].webkit) 
    if (__.doc.readyState) {
      if (__.doc.readyState === 'complete') {
        klass._hlReady();
        return;
      }
    }

    if (__.ua.ie) {
      klass._domReadyId = setInterval(function () {
        try {
          __.doc.documentElement.doScroll('left');
          clearInterval(klass._domReadyId);
          klass._domReadyId = null;
          klass._hlReady();
        } catch (ex) {}
      }, 50);
    } else {
      __.doc.addEventListener("DOMContentLoaded", klass._hlReady, false);
    }

    oldonload = __.global[ol];
    if (typeof oldonload !== 'function') {
      __.global[ol] = klass._hlReady;
    } else {
      __.global[ol] = function () {
        klass._hlReady();
        oldonload();
      };
    }
  };
});
/*end:event*/

