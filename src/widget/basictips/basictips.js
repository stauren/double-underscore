/**
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */

/*begin:__.widget.BasicTips*/
__.BasicModule.register('BasicTips', '2.0.0', ['lang', 'dom'], function () {

  /**
   * constructor of widget BasicTips
   * @param {object} config
   * @config {string|dom} content
   * @config {integer} autoHide milliseconds
   * @config {integer} x style.left of the tip
   * @config {integer} y style.top of the tip
   * @config {integer} deltaX x detal from the center
   * @config {integer} deltaY y detal from the center
   */
  __.widget.BasicTips = function (config) {
    __.widget.Base.call(this);

    config = config || {};

    this.id = this._idPrefix + __.getUid(this);
    this.timeoutId = null;
    this.config = config;

    if (config.content) {
      this.display(config.content);
    }
  };

  __.inherits(__.widget.BasicTips, __.widget.Base);

  __.widget.BasicTips.prototype._idPrefix = 'du-yt-';

  __.widget.BasicTips.prototype._prepareEl = function () {
    var el = __.dom.f(this.id);
    if (!el) {
      el = __.dom.addEl({
        id : this.id,
        css : 'position:absolute;background:#fff8c1;border:1px solid #fd8b44;border-width:1px;color:#000;line-height:20px;font-size:12px;padding:5px 20px;'
      }, __.doc.body);
    }
    return el;
  };

  __.widget.BasicTips.prototype.disposeInternal = function () {
    var el = __.dom.f(this.id);
    if (el) {
      __.dom.remEl(el);
    }
  };

  __.widget.BasicTips.prototype.hide = function () {
    var el = __.dom.f(this.id);
    if (el) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      el.style.display = 'none';
      el = null;
    }
  };

  __.widget.BasicTips.prototype.setContent = function (content) {
    var el = __.dom.f(this.id);

    el.innerHTML = '';
    if (__.lang.isString(content)) {
      __.dom.addText(el, content);
    } else {
      el.appendChild(content);
    }
  };

  __.widget.BasicTips.prototype.setPosition = function (el, config) {
    var scrollXY, winXY, elXY, x, y;

    scrollXY = __.dom.getScrollXY();
    winXY = __.dom.getWindowXY();
    el.style.zIndex = ++__.topLayer;
    el.style.display = 'block';
    elXY = [el.offsetWidth, el.offsetHeight];

    if (__.lang.isInt(config.x)) {
      x = config.x;
    } else {
      x = (winXY[0] - elXY[0]) / 2 + scrollXY[0];
      if (__.lang.isInt(config.deltaX)) {
        x += config.deltaX;
      }
    }

    if (__.lang.isInt(config.y)) {
      y = config.y;
    } else {
      y = (winXY[1] - elXY[1]) / 2 + scrollXY[1];
      if (__.lang.isInt(config.deltaY)) {
        y += config.deltaY;
      }
    }

    el.style.left = x + 'px';
    el.style.top = y + 'px';
  };

  __.widget.BasicTips.prototype.display = function (content, config) {
    var el, scrollXY, winXY, elXY,
      that = this;

    if (config) {
      __.extend(config, this.config);
    } else {
      config = this.config;
    }

    el = this._prepareEl();

    this.setContent(content);

    this.setPosition(el, config);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (__.lang.isInt(config.autoHide)) {
      this.timeoutId = setTimeout(function () {
        that.hide();
      }, config.autoHide);
    }
    el = null;
  };
});
/*end:__.widget.BasicTips*/
