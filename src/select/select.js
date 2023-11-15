/*!
 * @file select.js
 * @class __.widget.Select
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

__.BasicModule.register('select', '2.0', ['lang', 'dom', 'selector', 'event', 'cookie'], function () {
  var Select, prefix;

  __.widget.Select = function (id, config) {

    this._initCfg(config);

    this.id = id;
    this.listDisplaying = false;
    this.values = {};
    this.value = this._config.defaultValue;
    this.lastActiveItem = null;
    if (!config.name) {
      this._config.name = id + '_select';
    }

    this._createEls();
    this._initEls();
    this._addEvents();
  };

  Select = __.widget.Select;

  prefix = 'du-select-';
  Select.prototype._cfg = {
    txt : {
      wrongValue : 'the value to be set is wrong'
    },
    cls : {
      container : prefix + 'ctn',
      icon : prefix + 'icon',
      value : prefix + 'value',
      list : prefix + 'list',
      item : prefix + 'item',
      active : prefix + 'active',
      input :  prefix + 'input'
    },
    status : {
    },
    defInstCfg : {
      width : 45,
      height : 20,
      items : { 1 : 'item 1', 2 : 'item 2' },
      zIndex : 100,
      defaultValue : 1,
      ctnZindex : 1,
      fontsize : 13,
      bgSrc : 'http://mat1.gtimg.com/finance/stock/qq_panel/qq_bg2.gif',
      bgNormal : '-33px -64px',
      bgActive : '-63px 0',
      onChange : function (newValue, newText) {
      }
    }
  };

  Select.prototype._error = function (t) {
    throw new Error('du-select: ' + t);
  };

  Select.prototype._initCfg = function (config) {
    var cfg, longest = 0;

    config = config || {};

    this._config = __.lang.clone(this._cfg.defInstCfg);

    cfg = this._config;

    __.each(config, function (o, i) {
      cfg[i] = o;
    }, true);

    //auto detect the width by items text length
    if (__.lang.isUndefined(config.width)) {
      __.each(config.items, function (o) {
        o = String(o);
        if (o.length > longest) {
          longest = o.length;
        }
      }, true);
      cfg.width = longest * (cfg.fontsize + 1) + 18;
    }
  };

  Select.prototype._initEls = function () {
    var ctn = __.dom.f(this.id),
      cls = this._cfg.cls;

    this.els = {
      ctn : ctn,//out ctn
      innerCtn : __.dom.f('.' + cls.container, ctn),
      value : __.dom.f('.' + cls.value, ctn),
      icon : __.dom.f('.' + cls.icon, ctn),
      list : __.dom.f('.' + cls.list, ctn),
      input : __.dom.f('.' + cls.input, ctn)
    };
  };

  Select.prototype._addEvents = function () {
    var bind = __.event.bind,
      els = this.els;

    __.event.on(els.ctn, 'mouseover', bind(this._hlMouseOver, this));
    __.event.on(els.ctn, 'mouseout', bind(this._hlMouseOut, this));
    __.event.on(__.doc, 'click', bind(this._hlClick, this));
  };

  Select.prototype._hlMouseOut = function (e) {
    this.els.icon.style.backgroundPosition = this._config.bgNormal;
  };

  Select.prototype._hlMouseOver = function (e) {
    var tar = e.target || e.srcElement,
      cls = tar.className,
      els = this.els;

    if (tar === els.value || tar === els.icon ||
        tar === els.value.parentNode) {
      els.icon.style.backgroundPosition = this._config.bgActive;
    } else {
      while (tar !== this.els.ctn) {
        if (__.dom.hasClass(tar, this._cfg.cls.item)) {
          this.setActive(tar);
          break;
        }
        tar = tar.parentNode;
      }
    }
  };

  Select.prototype._hlClick = function (e) {
    var tar = e.target || e.srcElement,
      cls = tar.className,
      els = this.els;

    if (!this.listDisplaying && (tar === els.value || tar === els.icon ||
        tar === els.icon.parentNode)) {
      this.show();
    } else {
      if (__.dom.contains(tar, els.ctn)) {
        while (tar && tar !== this.els.ctn) {
          if (__.dom.hasClass(tar, this._cfg.cls.item)) {
            this.set(__.lang.stripTags(tar.innerHTML), true);
            break;
          }
          tar = tar.parentNode;
        }
      }
      this.hide();
    }
  };

  Select.prototype.setActive = function (li) {
    this.clearActive();
    li.style.background = '#428fdc';
    li.style.color = '#fff';
    this.lastActiveItem = li;
  };

  Select.prototype.clearActive = function (li) {
    if (this.lastActiveItem) {
      this.lastActiveItem.style.background = '#fff';
      this.lastActiveItem.style.color = '#000';
      this.lastActiveItem = null;
    }
  };

  Select.prototype.toggle = function () {
    if (this.listDisplaying) {
      this.hide();
    } else {
      this.show();
    }
  };

  Select.prototype.show = function () {
    var e = this.els;
    if (!this.listDisplaying) {
      e.list.style.display = 'block';
      e.value.style.background = '#428fdc';
      e.value.style.color = '#fff';
      e.innerCtn.style.zIndex = this._config.ctnZindex;
      this.listDisplaying = true;
    }
  };

  Select.prototype.hide = function () {
    var e = this.els;
    if (this.listDisplaying) {
      e.list.style.display = 'none';
      e.value.style.background = '#fff';
      e.value.style.color = '#000';
      e.innerCtn.style.zIndex = '0';
      this.listDisplaying = false;
    }
  };

  Select.prototype.set = function (newValue, isText) {
    isText = isText === true ? true : false;//default is true

    var el, newText;

    if (isText && !__.lang.isUndefined(this.values[newValue])) {
      newText = newValue;
      newValue = this.values[newValue];
    } else {
      newText = this._config.items[newValue];
    }

    if (!__.lang.isUndefined(this._config.items[newValue])) {
      el = this.els.value;
      el.innerHTML = '';
      __.dom.addText(el, newText);
      this.value = newValue;
      this.els.input.value = newValue;
      if (this._config.onChange) {
        this._config.onChange(newValue, newText);
      }
    } else {
      this._error(this._cfg.txt.wrongValue);
    }
  };

  Select.prototype._createEls = function () {
    var els, linesCss, diff, aChild, values, ua, w,
      config = this._config,
      that = this;

    ua = __.ua;
    w = config.width;
    linesCss = 'height:1px;font-size:1px;line-height:0;';

    diff = [2];
    if (ua.ie > 6) {
      diff = [3];
    }
    if (ua.webkit) {
      diff = [1];
    }

    aChild = [];
    values = this.values;

    __.each(config.items, function (o, i) {
      aChild.push({
        css : 'padding:2px 14px 0 3px;width:' + (w - 21) +
          'px;background:#fff;',
        cls : that._cfg.cls.item,
        child : {
          tag : 'nobr',
          css : '',
          text : o
        }
      });
      values[o] = i;
    }, true);


    /*jslint white:false*/
    els = {
      css : 'height:' + config.height + 'px;width:' + w + 'px;cursor:pointer;font-size:' + this._config.fontsize + 'px;position:relative;z-index:0;',
      cls : this._cfg.cls.container,
      child : [{
        css : linesCss + 'margin:0 1px;background:#d0cece;width:' +
          (w - 2) + 'px;overflow:hidden;float:left;display:inline;'
      }, {
        css : 'background:#fff;border:1px solid #d0cece;border-width:0 1px;float:left;',
        child : [{
          css : linesCss + 'border:1px solid #e3e2e2;border-width:0 1px;border-top-color:#0f0;width:' + (w - 4) + 'px;float:left;'
        }, {
          css : 'height:16px;float:left;padding-left:1px;width:' + (w - 3) + 'px;', child : [{
            css : 'padding:'+diff[0] + 'px 1px 0 3px;float:left;height:13px;line-height:13px;',
            cls : this._cfg.cls.value,
            text : this._config.items[this.value]
          }, {
            css : 'width:11px;height:16px;float:right;background:transparent url(' + config.bgSrc + ') no-repeat ' + config.bgNormal + ';margin-right:1px;',
            cls : this._cfg.cls.icon
          }, {
            css : 'visibility:hidden;',
            html : '<input type="hidden" value="' + this._config.defaultValue + '" name="' + this._config.name + '" class="' + this._cfg.cls.input + '"/>'
          }]
        }, {
          css : linesCss + 'border:1px solid #e3e2e2;border-width:0 1px;width:' + (w - 4) + 'px;float:left;'
        }]
      }, {
        css : linesCss + 'margin:0 1px;background:#d0cece;width:' + (w - 2) + 'px;float:left;display:inline;overflow:hidden;'
      }, {
        cls : this._cfg.cls.list,
        css : 'float:left;position:absolute;left:0px;top:18px;display:none;width:' + (w) +'px;z-index:' + this._config.zIndex,
        child : [{
          css : 'border:1px solid #D0CECE;/*border-bottom:0;*/background:#fff;padding:1px;text-align:left;',
          child : {
            tag : 'ul',
            css : 'list-style:none;padding:0;margin:0;',
            child : aChild
          }
        }, {
          //css : linesCss +'margin:0 1px;background:#d0cece;width:43px;float:left;display:inline;overflow:hidden;'
        }]
      }]
    };

    __.dom.addEl(els, this.id);
  };

});
