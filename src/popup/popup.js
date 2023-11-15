/*!
 * @file popup.js
 * @class __.widget.Popup
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

(function(_scope) {

var _NAME = '__', _SELF = _scope[_NAME],
  _VERSION;

if (!_scope[_NAME] || !_scope[_NAME].add) {
  return;
}

_VERSION = _SELF.cfg[2];

_SELF.register('popup', _VERSION, ['core'], function() {
  __.set("__.widget");
  if (__.widget.Popup) {
    return;
  }
  __.log('Popup: Class begin.');
  var _SELF = __, _DOCUMENT = _SELF.config.doc,
  _WIN = _SELF.config.win,
  _RESIZE = 'resize',
  _FALSE = false,
  _closeFn = function(fr) {
    fr.close();
  },
  _config = {
    cls : {
      frame: 'du-popup-container',
      content : 'du-popup-content',
      hidden : 'du-popup-hidden',
      close : 'du-popup-close',
      closeCtn : 'du-popup-closectn',
      closed : 'du-popup-closed',
      cancel: 'du-popup-cancel',
      ok : 'du-popup-ok',
      hbf: 'du-popup-hbf',
      hd : 'du-popup-hd',
      bd : 'du-popup-bd',
      ft : 'du-popup-ft',
      notice : 'du-popup-notice',
      run : 'du-popup-runjs'
    },
    sGlobalPrefix : 'Popup',
    sOk: 'OK',
    sCancel : 'Cancel',
    sCssSpriteSrc : 'http://double-underscore.googlecode.com/svn/tags/0.3.0/pkgs/popup/bg.png',
    //sCssSpriteSrc : 'http://maps.google.com/intl/en_ALL/mapfiles/iw3.png',
    //sCssSpriteSrc : 'http://k.kbcdn.com/global/popup/bg.png',
    //sCssSpriteIe6Src : 'http://maps.google.com/intl/en_ALL/mapfiles/iw3.png',
    sCssSpriteIe6Src: 'http://double-underscore.googlecode.com/svn/tags/0.3.0/pkgs/popup/bg.png',
    //sCssSpriteIe6Src : 'http://k.kbcdn.com/global/popup/bg.gif',
    defInstCfg : {
      bUniqueMode : _FALSE,
      bCenter : true,
      modal : true,
      bAutoAdjust : true,
      iTop : 0,
      iLeft : 0,
      iWidth : 400,
      iHeight : 300,
      vContent : '',
      showAfterInit : true,
      onOK : _closeFn,
      onClose : _closeFn,
      onCancel : _closeFn
    }
  };

  if (__.config.ua.ie == 6) {
    _config.sCssSpriteSrc = _config.sCssSpriteIe6Src;
  }

  var _L = __.Lang, _D = __.Dom, _E = __.Event;

  /**#@+
   * the private functions
   * @private
   * @memberOf __.widget.Popup
   */

  /**
   * simple log function used in class
   * @param {mixed} t anything to be logged
   */
  var _log = function(t) {
    __.log(_config.sGlobalPrefix +': '+ t);
  },

  /**
   * get existing or create frame
   */
  _getFrame = function(that) {
    if (!that._config.bUniqueMode) {
      var frames = _findExistingFrame();
      var id = _L.find(frames, function(o) {
        if (_D.hasClass(o, _config.cls.closed)) {
          return true;
        }
      });
      if (id >= 0) {
        that._isNewFrame = _FALSE;
        return _purgeFrame(frames[id]);
      }
    }
    return _createFrame(that);
  },

  /**
   * find all existing frames
   */
  _findExistingFrame = function() {
    return _D.$('div.'+ _config.cls.frame);
  },

  /**
   * clear an existing frame
   */
  _purgeFrame = function(fr) {
    _D.remClass(fr, _config.cls.closed);
    return fr;
  },

  /**
   * create a popup frame
   */
  _createFrame = function(that) {
    var w = that._config.iWidth, h = that._config.iHeight,
    isIe6 = __.config.ua.ie == 6,
    cls = _config.cls,
    hd = {
      cls : cls.hd, css : 'border-bottom:2px solid #E1E8F2;cursor:move;'+(that._config.sTitle ? '' : 'display:none;'), child : {
        css : 'font-size:16px;padding:0 0 2px 10px;font-weight:bold;', text : that._config.sTitle
      }
    },
    bd = { cls : cls.bd, css:'padding:10px;overflow:hidden;'},
    yes = that._config.onOk !== _FALSE ? '' : 'display:none;',
    no = that._config.onCancel !== _FALSE ? '' : 'display:none;',
    close = that._config.onClose !== _FALSE ? '' : 'display:none;',
    ie6filter = isIe6 ? 'filter:alpha(opacity=65);' : '',
    corner = {
      css : 'width:25px;height:25px;overflow:hidden;position:absolute;', child : {
        tag : 'img', src : _config.sCssSpriteSrc, css : 'position:absolute;-moz-user-select:none;'+ ie6filter
      }
    }, corners = [], xmid1 = {
      css : 'width:'+(w - 40)+'px;height:20px;overflow:hidden;position:absolute;left:20px;', child : {
        tag : 'img', src : _config.sCssSpriteSrc, css : 'position:absolute;left:-20px;-moz-user-select:none;'+ ie6filter
      }
    }, xmid2, ymid1 = {
      css : 'width:20px;height:'+(h-40)+'px;overflow:hidden;position:absolute;top:20px;background:transparent url('+_config.sCssSpriteSrc+') repeat-y 0 -20px;-moz-user-select:none;'+ ie6filter
    }, ymid2;

    for (var i=0, newobj;i<4;i++) {
      corners[corners.length] = _L.clone(corner);
    }
    corners[0].css += 'top:0;left:0;';
    corners[0].child.css += 'top:0;left:0;';
    corners[1].css += 'top:0;right:0px;';
    corners[1].child.css += 'top:0;left:-665px;';
    corners[2].css += 'bottom:0;left:0;';
    corners[2].child.css += 'top:-665px;left:0;';
    corners[3].css += 'bottom:0;right:0;';
    corners[3].child.css += 'top:-665px;left:-665px;';

    xmid2 = _L.clone(xmid1);
    xmid1.css += 'top:0;';
    xmid1.child.css += 'top:0;';
    xmid2.css += 'bottom:0px;';
    xmid2.child.css += 'top:-670px;';

    ymid2 = _L.clone(ymid1);
    ymid1.css += 'left:0;';
    ymid2.css += 'right:0;background-position:-670px -20px;';

    var fr = _D.addEl({
      cls : cls.frame, css : 'position:absolute;width:'+ w +'px;height:'+ h +'px;overflow:hidden;text-align:left;display:none;', child : [{
        cls : cls.content, css : 'position:relative;width:'+ (w-20) +'px;height:'+ (h-20) +'px;top:10px;left:10px;overflow:hidden;', child : {
          cls : cls.hbf, css : 'position:absolute;top:0px;left:0px;width:'+ (w - 20) +'px;height:'+ (h - 20) +'px;background:#fff;text-align:left;overflow:hidden;', child : [
            hd,
            bd,
            {
            cls : [cls.ft, 'du-popup-btna'], css : 'text-align:right;height:20px;line-height:20px;', child : [{
              tag : 'span', css :'margin-right:10px;color:#e11;', cls : [cls.notice]
            },{
              tag : 'a', href : 'javascript:void(0)', css :'margin-right:10px;'+ yes, cls : [cls.ok, cls.run],  text : _config.sOk
            }, {
              tag : 'a', href : 'javascript:void(0)', css :'margin-right:10px;'+ no, cls : [cls.cancel, cls.run], text : _config.sCancel
            }]
          }]
        }
      },
      isIe6 ? {
        tag :'iframe', css:'position:absolute;top:0;left:0;z-index:-1;filter:alpha(opacity=0);width:'+ w + 'px;height:'+ h +'px;'
      } : _FALSE,
      corners[0],
      corners[1],
      corners[2],
      isIe6 ? _FALSE : corners[3],
      xmid1,
      xmid2,
      ymid1,
      ymid2,
      isIe6 ? corners[3] : _FALSE,
      {
        cls : cls.closeCtn, css : 'width:14px;height:13px;position:absolute;top:10px;right:10px;line-height:13px;font-size:0;'+ close, child : {
          tag :'a', cls : [cls.close, cls.run], href : 'javascript:void(0)', css : 'height:13px;width:14px;display:block;'
        }
      }]
    }, _DOCUMENT.body);
    return fr;
  },

  _updateZindex = function(fr, z) {
    var cl = _config.cls.content, cl2 = _config.cls.closeCtn;
    _L.e(_D.$('div', fr), function(o) {
      if (o.parentNode === fr) {
        o.style.zIndex = _D.hasClass(o, cl) || _D.hasClass(o, cl2) ? z : z-1;
      }
    });
  },

  /**
   * add drag and drop event for frame
   */
  _addDdEvent = function(obj) {
    var ctn = obj.frame,
    bd = obj.body,
    hl = function(e) {
      var t = e.target || e.srcElement;
      /*
      if (t === hd || t === ft || _D.contains(t, hd) || _D.contains(t, ft)) {
        __.Drag.handler(e, obj.frame, !__.config.ua.ie);
      }
      */
      if (!_D.hasClass(t, _config.cls.run) && t !== bd && !_D.contains(t, bd)) {
        __.Drag.handler(e, obj.frame, !__.config.ua.ie);
      }
      return _FALSE;
    }, ary = [ctn, 'mousedown', hl];

    obj._events['draganddrop'] = ary;
    _E.on.apply(_E, ary);
  },

  /**
   * add drag and drop event for frame
   */
  _addClickEvent = function(obj) {
    //obj._events['draganddrop'] = ary;
    //_E.on.apply(_, ary);
    var ye = obj._events, fr = obj.frame,
    drs = {
      ok : _D.f('a.'+ _config.cls.ok, fr),
      cancel : _D.f('a.'+ _config.cls.cancel, fr),
      close : _D.f('a.'+ _config.cls.close, fr)
    };

/*
    yy['onOk'] = new ce('onOk');
    yy['onCancel'] = new ce('onCancel');
    yy['onClose'] = new ce('onClose');
*/

    var hl = function(e) {
      var t = e.target || e.srcElement,
      type = _L.find(drs, function(o) {
        return o===t || _D.contains(t, o);
      }, true);

      type !== -1 && _clickCustomEv(e, type, obj);
    }, ary = [fr, 'click', hl];

    ye['onClick'] = ary;
    _E.on.apply(_E, ary);
  },
   // create an half transparent white div
  _addIvDiv = (function () {
    var fn = function() {
      var _selfFn = arguments.callee,
        id = _selfFn.idPrefix,
        cz = ++_selfFn.ivCount,
        newDiv = _D.addEl({
          cls : "ivDiv",
          css : 'position:absolute;top:0px;left:0px;background-color:#fff;opacity:0.8;filter:alpha(opacity=80);',
          id : id + cz
        }, _DOCUMENT.body),
        isIe6 = _SELF.config.ua.ie == 6,
        ih = '<table border="0" style="background:transparent;left:0px;top:0px;"><tr><td><div>&nbsp;</div></td></tr></table>';

      if (isIe6) {
        ih = '<iframe style="filter:alpha(opacity=0);position:absolute;top:300px;left:0;z-index:-1;" frameborder="0"></iframe>'+ ih;
      }
      newDiv.innerHTML = ih;

      _selfFn.ajSize(null, newDiv);
      newDiv.style.zIndex = ++_SELF.topLayer;

      if (cz > 1) {
        var preDiv = _D.f(id + (cz-1));
        //_addClass(preDiv, 'transparent');
        preDiv.style.background = 'transparent';
        _E.off(_WIN, _RESIZE, arguments.callee.ajSize);
      }

//      _E.on(window, _RESIZE, arguments.callee.ajSize, newDiv);
      _E.on(_WIN, _RESIZE, arguments.callee.ajSize);
    };
    fn.ivCount = 0;
    fn.idPrefix = "du-popup-ivdiv";
    fn.ajSize = function (ev, div) {
      div = div || _D.f(fn.idPrefix + fn.ivCount);
      var xy = _D.getDocumentXY(), ds = div.style, ds2 = div.firstChild.style;
      ds.width = "auto";
      ds.height = "auto";
      ds.width = xy[0] + 'px';
      ds.height = xy[1] + 'px';
      ds2.width = xy[0] + 'px';
      ds2.height = xy[1] + 'px';
    };
    return fn;
  }).call(_WIN),

  _remIvDiv = function() {
    var addfn = _addIvDiv,
      cz = addfn.ivCount;
    if(cz > 0) {
      addfn.ivCount--;
      _SELF.topLayer--;
      _E.off(_WIN, _RESIZE, addfn.ajSize);
      _D.remEl(addfn.idPrefix + cz);
      if (cz > 1) {
        var preDiv = _D.f(addfn.idPrefix + (cz-1));
        //_remClass(preDiv, 'transparent');
        preDiv.style.background = '#fff';
//        _E.on(_WIN, _RESIZE, addfn.ajSize, preDiv);
        _E.on(_WIN, _RESIZE, addfn.ajSize);
      }
    }
  },

  _clickCustomEv = function(e, type, that) {
    var cfg = that._config;
    switch (type) {
    case 'ok' :
      if (!cfg.onB4Ok || cfg.onB4Ok(that)) {
        that.hide();
        cfg.onOk && cfg.onOk.call(_WIN, that);
      }
      break;
      case 'cancel' :
      if (!cfg.onB4Cancel || cfg.onB4Cancel(that)) {
        that.hide();
        cfg.onCancel && cfg.onCancel.call(_WIN, that);
      }
      break;
      case 'close' :
      if (!cfg.onB4Close || cfg.onB4Close(that)) {
        that.hide();
        cfg.onClose && cfg.onClose.call(_WIN, that);
      }
      break;
    }
    _E.stopEvent(e);
  };


  /**#@-*/


  __.widget.Popup= __.Class.extend(
  /**
   * @lends __.widget.Popup.prototype
   */
  {

    /**
     * the iv div is showing or not
     * @memberOf __.widget.Popup
     * @type boolean
     */
    ivDiv : _FALSE,

    /**
     * frame root dom reference
     * @memberOf __.widget.Popup
     * @type object
     */
    frame : null,

    /**
     * body dom reference
     * @memberOf __.widget.Popup
     * @type object
     */
    body : null,

    /**
     * events objects, used for purge
     * @memberOf __.widget.Popup
     * @private
     * @typea object 
     */
    _events : null,

    _isNewFrame : true,

    /**
     * the constructor of popup window
     * @constructs
     * @param {string|dom|object} content popup content, could be innerHTML or dom refence or __.Dom.addEl parameter object
     * @param {string} title popup title, this param could be omitted
     * @param {object} config detail config object, the last param is config
     * @config {function} onOk handler when ok button is clicked, receive an param of the Popup object
     * @config {function} onCancel handler when ok button is clicked, receive an param of the Popup object
     * @config {function} onClose handler when ok button is clicked, receive an param of the Popup object
     * @config {boolean} modal this is a modal dialog or not
     */
    init : function(content) {
      var config = arguments[arguments.length - 1];
      config = typeof config == 'object' ? config : {};
      config.vContent = content || undefined;
      if (typeof arguments[1] == 'string') {
        config.sTitle = arguments[1];
      }
      this._config = _L.clone(_config.defInstCfg);
      _L.objExtend(this._config, config);

      this.frame = _getFrame(this);
      if (!this.frame) {
        throw new Error('Popup: fail to get frame.');
      }

      this.head = _D.f('.'+ _config.cls.hd, this.frame);
      this.body = _D.f('.'+ _config.cls.bd, this.frame);
      this.foot = _D.f('.'+ _config.cls.ft, this.frame);
      this.setContent(this._config.vContent, _FALSE);

      //this._setPosition();
      this._addEvents();
      this._config.showAfterInit && this.show();
      _log('Class initiated');
    }
    ,

    /**
     * all d&d and click events
     * @private
     * @memberOf __.widget.Popup
     */
    _addEvents : function() {
      var that = this, fr = this.frame;

      this._events = {};

      //trigger custom click event
      _addClickEvent(this);

      if (this._isNewFrame) {
        _addDdEvent(this);
      }
    },

    /**
     * set the position of popup frame
     * @private
     * @memberOf __.widget.Popup
     * @param {array} position x,y of popout position
     */
    _setPosition : function(position) {
      if (_L.isArray(position)) {
        //_.setElXY(this.frame, position);
        this.frame.style.top = position[0] + 'px';
        this.frame.style.left = position[1] + 'px';
      } else if (this._config.bCenter) {
        _D.setCenter(this.frame);
      } else {
        this.frame.style.top = this._config.iLeft + 'px';
        this.frame.style.left = this._config.iTop + 'px';
      }
    }
    ,

    /**
     * set the size of popup frame
     * @memberOf __.widget.Popup
     */
    setSize : function(w, h) {
      var el = this.body,
        fr = this.frame,
        tmp, bdH;

      function sw(el, w) {
        el.style.width = w +'px';
      }

      function sh(el, h) {
        el.style.height = h +'px';
      }

      function sl(el, l) {
        el.style.left = h +'px';
      }

      if (!_L.isInt(w) || !_L.isInt(h)) {
        el = el.firstChild;
        if (!el || !el.tagName) { // generally because content is text
          el = this.body;
        }
        w = el.offsetWidth || el.clientWidth || parseInt(el.style.width, 10);
        h = el.offsetHeight || el.clientHeight || parseInt(el.style.height, 10);
        if (_L.isInt(w) && _L.isInt(h)) {
          //40 = frame border 20 + bd padding 20
          w += 40;
          h += 40;
          if (this._config.sTitle) {
            h += 24; //24 = hd height
          }
          if (this._config.onOk !== _FALSE || this._config.onCancel !== _FALSE) {
            h += 20; //20 = ft button height
          }
        }
      }
      if (_L.isInt(w) && _L.isInt(h)) {
        sw(fr, w);
        sh(fr, h);
        tmp = fr.firstChild;//popup-content
        sw(tmp, w - 20);
        sh(tmp, h - 20);

        tmp = tmp.firstChild;//popup-hbf
        sw(tmp, w - 20);//popup-hbf
        sh(tmp, h - 20);

        bdH = h - 40;// 40 = 20frameborder + 20padding
        if (this._config.sTitle) {
          bdH -= 24;
        }
        if (this._config.onOk !== _FALSE || this._config.onCancel !== _FALSE) {
          bdH -= 20;
        }
        tmp = tmp.childNodes[1];//popup-bd
        sw(tmp, w - 40);
        sh(tmp, bdH);

        //40 = frame border width
        sw(fr.childNodes[5], w - 40);
        sw(fr.childNodes[6], w - 40);
        sh(fr.childNodes[7], h - 40);
        sh(fr.childNodes[8], h - 40);
      }
    }
    ,

    /**
     * add or remove the iv div
     * @private
     * @memberOf __.widget.Popup
     * @param {boolean} show true to show the iv div
     */
    _toggleIvDiv : function(show) {
      if (this._config.modal) {
        if (show && !this.ivDiv) {
          _addIvDiv();
        } else if (!show && this.ivDiv) {
          _remIvDiv();
        }
        this.ivDiv = show;
      }
    },

    /**
     * show the pop div, append it if not already done
     * @memberOf __.widget.Popup
     * @param {array} position x,y of popout position
     */
    show : function(position) {
      this._toggleIvDiv(true);
      var st = this.frame.style;
      var z = parseInt(st.zIndex, 10);
      if (isNaN(z) || z <= __.topLayer) {
        st.zIndex = ++__.topLayer;
        __.topLayer += 2;
        _updateZindex(this.frame, __.topLayer);
      }

      st.display = 'block';
      this._config.bAutoAdjust && this.setSize();
      this._setPosition(position);
    }
    ,

    /**
     * set the content of the popup frame
     * @param {string|object|node} ct
     * @param {boolean} doadjust
     * @memberOf __.widget.Popup
     */
    setTitle : function(ct) {
      var hd = this.head;
      this._config.sTitle = ct;
      if (!ct) {
        hd.style.display = 'none';
      } else {
        if (_L.isNode(ct)) {
          hd.firstChild.appendChild(ct);
        } else if (_L.isObject(ct)) {
          _D.addEl(ct, hd.firstChild);
        } else {
          hd.firstChild.innerHTML = ct;
        }
        hd.style.display = 'block';
      }
    },

    /**
     * set the content of the popup frame
     * @param {string|object|node} ct
     * @param {boolean} doadjust
     * @memberOf __.widget.Popup
     */
    setContent: function(ct, doadjust) {
      var bd = this.body;
      doadjust = doadjust === _FALSE ? _FALSE : true;
      if (_L.isNode(ct)) {
        bd.innerHTML = '';
        bd.appendChild(ct);
      } else if (_L.isObject(ct)) {
        bd.innerHTML = '';
        _D.addEl(ct, bd);
      } else {
        bd.innerHTML = ct;
      }
      doadjust && this._config.bAutoAdjust && this.setSize();
    }
    ,

    /**
     * set the content of the popup frame
     * @param {object} config
     * @config {function} onOk handler when ok button is clicked, receive an param of the Popup object
     * @config {function} onCancel handler when ok button is clicked, receive an param of the Popup object
     * @config {function} onClose handler when ok button is clicked, receive an param of the Popup object
     * @memberOf __.widget.Popup
     */
    setHandler : function(config, doReset) {
      var c = this._config,
        str = _L.w('onOk onCancel onClose onB4Ok onB4Cancel onB4Close'),
        defConf = [_closeFn, _closeFn, _closeFn, _FALSE, _FALSE, _FALSE],
        dDom, fr = this.frame;

      _L.e(str, function(o, i) {
        c[o] = doReset ? defConf[i] : (o in config ? config[o] : c[o]);
      });

      if (c.onOk === _FALSE && c.onCancel === _FALSE) {
        this.foot.style.display = 'none';
      } else {
        this.foot.style.display = 'block';
      }

      _L.e(_L.w('ok cancel closeCtn'), function(o, i) {
        dDom = _D.f('.'+_config.cls[o], fr);
        if (c[str[i]] === _FALSE) {
          dDom.style.display = 'none';
        } else {
          dDom.style.display = '';
        }
      });
    }
    ,

    /**
     * set red notice next to the ok button
     * @memberOf __.widget.Popup
     */
    setNotice : function(txt, autoClear) {
      var sp = _D.f('.'+ _config.cls.notice, this.frame);
      sp.innerHTML = '';
      _D.addText(sp, txt);
      if (autoClear !== _FALSE) {
        setTimeout(function() {
          sp.innerHTML = '';
        }, 5000);
      }
    },

    /**
     * hide the pop div
     * @memberOf __.widget.Popup
     */
    hide : function() {
      this._toggleIvDiv(_FALSE);
      this.frame.style.display = 'none';
    }
    ,

    /**
     * close and purge the frame (can't show the same content again)
     * the frame will be hidden and left for possible future use
     * @memberOf __.widget.Popup
     */
    close : function(destroy) {
      _E.off.apply(_E, this._events.onClick);

      this.hide();
      if (destroy) {
        _D.remEl(this.frame);
      } else {
        this.frame.id = '';
        this.setTitle(false);
        this.setContent('');
        this.setHandler({}, true);
        _D.addClass(this.frame, _config.cls.closed);
      }
    },

    addIvDiv : _addIvDiv
  });

  _D.addStyle('\
.du-popup-close {\
  background:transparent url('+ _config.sCssSpriteSrc +') no-repeat -354px -690px;\
}\
.du-popup-close:hover {\
  background-position : -354px -703px;\
}\
.du-popup-btna a.du-popup-runjs:link,\
.du-popup-btna a.du-popup-runjs:visited,\
.du-popup-btna a.du-popup-runjs:active {\
  background:#D9D9D9;\
  padding:1px 5px;\
  height : 18px;\
  line-height : 20px;\
  color:#111;\
  border:1px solid #777;\
  border-top-color:#ECECEC;\
  border-left-color:#ECECEC;\
  -moz-border-radius:3px;\
  -webkit-border-radius:3px;\
  border-radius:3px;\
  text-decoration:none;\
}\
.du-popup-btna a.du-popup-runjs:hover{background:#B2B2B2;}\
');

  if (_SELF.config.ua.ie == 6) {
    try {
      document.execCommand('BackgroundImageCache', _FALSE, true);
    } catch(e) {}
  }

  /**
   * preload the background image and get its size
   */
   (new Image()).src = _config.sCssSpriteSrc;

  __.log('Popup: Class end.');
});

}(this));


/*
dialog : (function(){//-su.dialog
      var _frame;
      return {
        alertDivId : 'stDomAlertDiv',
        dlgCount : 0,
        alertCount : 0,
        init : (function() {
          var fro = _addEl({cls : "movableHideDiv"}),
            inframe = _addEl({cls : 'i'}, fro), tl, ft;

          tl = _addEl({
            cls : 'mHDTitle',
            html : '<table><tbody><tr><td></td></tr></tbody></table>'
          }, inframe);
          _addEl({cls : 'mHDBd'}, inframe);
          ft = _addEl({
            cls : 'mHDBottom',
            html : '<table><tbody><tr><td style="text-align:right;color:#E00;"><span></span></td><td class="btna" style="text-align:right;"><input type="button" class="btnLogin" value="Ok" />&nbsp;<input type="button" class="btnLogin" value="Cancel"></td></tr></tbody></table>'
          }, inframe);

          _frame = fro;
        })(),

        getFrame : function(id, width){
          var fr=_frame.cloneNode(true), ns=fr.firstChild.childNodes, self=this,
            btns=ns[2].getElementsByTagName('input');

          _setP(fr.firstChild, 'width', width+'px');
          ns[0].onmousedown = function(ev) {_.beginDrag(ev||window.event, this.parentNode.parentNode);};
          fr.tl = ns[0].getElementsByTagName('td')[0];
          fr.bd = ns[1];
          fr.ft = ns[2];
          fr.ok = btns[0];
          fr.cancel = btns[1];
          fr.msg = ns[2].getElementsByTagName('span')[0];

          fr.id = id;
          //on and off are used to just remove the div and dialog
          //remember to add unset your stuff in b4ok and b4cancel
          fr.on = function(){self.on(fr);};

          fr.b4off = function(){return true;};

          fr.off = function(){ if(fr.b4off()) {self.off(fr);}};

          fr.b4ok = function(){return true;};
          fr.b4cancel = function(){return true;};

          fr.clickok = function() {
            if (fr.b4ok()) {
              fr.off();
            }
          };
          fr.clickcancel = function() { if(fr.b4cancel()) {fr.off();}};

          // dialog tabindex begin from 1000, and for 1 dialog, 100 assigned 
          fr.tibase = 1000 + this.dlgCount++ * 100;
          fr.ok.tabIndex = fr.tibase + 98;
          fr.cancel.tabIndex = fr.tibase + 99;

          return fr;
        },

        on : function(fr) {
          var wXY = _getWindowXY(),
            sXY = _getScrollXY(),
            _iDlgCount = _.dialog.dlgCount;// self = this;
          _setP(fr, 'opacity', 0);
          _addIvDiv();
          _DOCUMENT.body.appendChild(fr);
          fr.style.position = 'absolute';
          fr.style.left = (wXY[0] - fr.offsetWidth) / 2 + sXY[0] + _iDlgCount*10 + 'px';
          fr.style.top = (wXY[1] - fr.offsetHeight) / 2 + sXY[1] + _iDlgCount*10 + 'px';
          fr.style.zIndex = ++_SELF.topLayer;
          fr.ok.onclick = fr.clickok;
          fr.cancel.onclick = fr.clickcancel;
          _setP(fr, 'opacity', 85);
//            opacity(fr, 0, 85, 3000);
        },

        off : function(fr) {
          var sud = _.dialog;
          fr = _$(fr)[0];
          //opacity(fr, 85, 0, 200);
          fr.style.display = 'none';
          _SELF.topLayer--;
          sud.dlgCount--;
          sud.alertCount--;
          _DOCUMENT.body.removeChild(fr);
          _remIvDiv();
          // Mem leak
          fr = null;
        },
      };
    })()
*/

