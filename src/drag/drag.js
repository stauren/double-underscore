/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules drag
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:drag*/
__.BasicModule.register('drag', '0.4.0', ['lang', 'dom', 'event'], function () {
  "use strict";

  var _UNDEFINED;

  __.exportPath('__.drag');

  __.drag.aElInfo = {};

  __.drag.disableSelection = function () {
    if (!__.ua.gecko) {
      __.drag.oldSsHl = __.doc.onselectstart;
      __.doc.onselectstart = function () {return false; };
    } else {
      __.drag.oldSsHl = __.doc.onmousedown;
      __.doc.onmousedown = function (event) { event.preventDefault(); };
    }
  };

  __.drag.enableSelection = function () {
    if (__.drag.oldSsHl) {
      if (!__.ua.gecko) {
        __.doc.onselectstart = __.drag.oldSsHl;
      } else {
        __.doc.onmousedown = __.drag.oldSsHl;
      }
      __.drag.oldSsHl = _UNDEFINED;
    }
  };

  __.drag._hlMouseup = function () {
    var el = __.drag.el,
      info = __.drag.aElInfo[__.getUid(el)];

    if (__.drag.withFade) {
      __.dom.setOpacity(el, __.drag.opacity);
    }

    el.style.zIndex = info.oriZ;

    __.topLayer--;

    if (__.drag.fnUp) {
      __.drag.fnUp(parseInt(el.style.left, 10), parseInt(el.style.top, 10),
        info.zone);
    }

    __.drag._purge();

    el = null;
  };

  __.drag._hlOnMove = function (ev) {
    var left, top, sXY, tmp, tmp2, scrb, az, winXY,
      el = __.drag.el,
      info = __.drag.aElInfo[__.getUid(el)];

    left = ev.clientX - __.drag.deltaX;
    top = ev.clientY - __.drag.deltaY;
    winXY = __.drag.winXY;

    if (info.zone) {
      az = info.zone;
      left = Math.max(az.left, left);
      left = Math.min(az.right, left);
      top = Math.max(az.top, top);
      top = Math.min(az.bottom, top);
    }

    //do the auto scroll
    if (__.drag.autoScroll) {
      tmp = __.drag.autoScroll;

/*
      scrb = tmp.scrBar;
      sXY = scrb.container.scrollTop;

      tmp2 = tmp.height;
      if (winXY[1] - top - tmp.bottomBorder < 10 && scrb.y < scrb.maxSliY) {
        //the mover is at the bottom

        tmp2 = Math.min(tmp2, scrb.maxSliY - scrb.y);
        top -= tmp2;
        sXY += tmp2;
        scrb.scrollCtn2(sXY);
        if (az) {
          az.top -= tmp2;
          az.bottom -= tmp2;
        }
        //deltaY -= tmp2;
      } else if (top - tmp.topBorder < 10 && sXY > 0) {//the mover is at the top
        tmp2 = Math.min(tmp2, sXY);
        top += tmp2;
        sXY -= tmp2;
        scrb.scrollCtn2(sXY);
        if (az) {
          az.top += tmp2;
          az.bottom += tmp2;
        }
        //deltaY += tmp2;
      }
*/

      sXY = __.dom.getScrollXY();
      if (!__.lang.isUndefined(tmp.height)) { // vertical scroll
        tmp2 = tmp.height;

//the mover is at the bottom
        if (top - sXY[1] - winXY[1] + tmp2 > tmp.bottomBorder) {
          top += tmp2;
          sXY[1] += tmp2;
          __.global.scrollTo(sXY[0], sXY[1]);
          __.drag.deltaY -= tmp2;
        } else if (top - sXY[1] < tmp.topBorder) {
          top -= tmp2;
          sXY[1] -= tmp2;
          __.global.scrollTo(sXY[0], sXY[1]);
          __.drag.deltaY += tmp2;
        }
      }

      if (!__.lang.isUndefined(tmp.width)) { // horizontal scroll
        tmp2 = tmp.width;
        if (left - sXY[0] - winXY[0] + tmp2 > tmp.rightBorder) {
          left += tmp2;
          sXY[0] += tmp2;
          __.global.scrollTo(sXY[0], sXY[1]);
          __.drag.deltaX -= tmp2;
        } else if (top - sXY[1] < tmp.topBorder) {
          top -= tmp2;
          sXY[0] -= tmp2;
          __.global.scrollTo(sXY[0], sXY[1]);
          __.drag.deltaX += tmp2;
        }
      }
    }

    el.style.left = left + "px";
    el.style.top = top + "px";

    if (__.drag.fnMove) {
      __.drag.fnMove(left, top, info.zone);
    }

    el = null;

    //important!
    return false;
  };

  __.drag._purge = function () {
    __.drag.autoScroll = __.drag.el = __.drag.fnUp = __.drag.fnMove = _UNDEFINED;

    /*
    if (__hlStack) {
      _E.off(_DOC, 'mousemove', __hlStack[0]);
      _E.off(_DOC, 'mouseup', __hlStack[1]);
      __hlStack = null;
    }
    */

    __.drag.enableSelection();

  };

  __.drag._attachEvent = function () {
    __.drag.disableSelection();

    __.event.on(__.doc, 'mousemove', __.drag._hlOnMove);
    __.event.on(__.doc, 'mouseup', __.drag._hlOnUp);
  };

  /**
   * a simple drag&drop method
   * @param {object} event the onmousedown event
   * @param {object} el the element to be D&D
   * @param {boolean} withFade the fade effect onmousemove
   * @param {object} restrict an object with 4 attributes : {t,r,b,l}, means how much
   *                 pixels can be move towards that direction from current point
   * @param {function} fnUp function(left, top, a1.zone){}, on mouse up callback
   * @param {function} fnMove function(left, top, a1.zone){}, on mouse move callback
   * @param {object} cfg config object
   * @config {boolean} autoScroll
   */
  __.drag.begin = function (event, el, withFade, restrict, fnUp,
    fnMove, cfg) {

    var elInfo, uid, as;

    withFade = withFade === false ? false : true;
    cfg = cfg || {};

    __.drag._purge();

    as = el.style;
    uid = __.getUid(el);
    elInfo = __.drag.aElInfo[uid];

    if (elInfo === _UNDEFINED) {
      elInfo = __.drag.aElInfo[uid] = {};
    }

//collect info
    elInfo.oriZ = __.lang.isEmpty(el.style.zIndex) ? 1 : el.style.zIndex;
    if (!elInfo.moved) {
      elInfo.moved = true;
      if (as.position.toLowerCase().indexOf('absolute') === -1) {
        as.position = "relative";
      }
    }
    if (as.left) {
      elInfo.oriL = parseInt(as.left, 10);
    } else {
      elInfo.oriL = 0;
      as.left = '0px';
    }
    if (as.top) {
      elInfo.oriT = parseInt(as.top, 10);
    } else {
      elInfo.oriT = 0;
      as.top = '0px';
    }
    if (restrict) {
      elInfo.zone = {
        top : elInfo.oriT - restrict.t,
        right : elInfo.oriL + restrict.r,
        bottom : elInfo.oriT + restrict.b,
        left : elInfo.oriL - restrict.l
      };
    }

    __.drag.withFade = withFade;
    __.drag.el = el;
    __.drag.deltaX = event.clientX - elInfo.oriL;
    __.drag.deltaY = event.clientY - elInfo.oriT;
    __.drag.oldOpacity = __.dom.getOpacity(el);
    __.drag.fnUp = fnUp;
    __.drag.fnMove = fnMove;
    __.drag.autoScroll = cfg.autoScroll ? true : false;
    __.drag.winXY = __.dom.getWindowXY();

    el.style.zIndex = ++__.topLayer;
    if (withFade) {
      __.dom.setOpacity(el, cfg.opacity || 0.7);
    }

    __.drag._attachEvent();
  };

  __.drag.bind = function (el, withFade, restrict, fnUp, fnMove, cfg) {
    el = __.dom.f(el);
    __.dom.on(el, 'mousedown', function (e) {
      __.drag.begin(e, el, withFade, restrict, fnUp, fnMove, cfg);
    });
  };
});
/*end:drag*/
