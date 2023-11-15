/*!
 * @file anim.js
 * @class Anim
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */

/*begin:dom*/
__.BasicModule.register('Anim', '0.4.0', ['lang'], function () {
  "use strict";

      Anim = function (el, attr, ftobj) {
        if (typeof ftobj !== 'object') {
          ftobj = {to : ftobj};
        }

        this.el = el;
        this.attr = attr;
        this.from = ftobj.from === _undef ? false : ftobj.from;
        this.to = ftobj.to;
        this.unit = ftobj.unit === _undef ? '' : ftobj.unit;

        this.lasttime = ftobj.lasttime === _undef ? 300 :
            ftobj.lasttime;

        this.interval = ftobj.interval === _undef ? 15 :
            ftobj.interval;

        this.max = ftobj.max === _undef ?
            this.lasttime * 2 / this.interval : ftobj.max;

        this.onOver = ftobj.onOver === _undef ? _EF :
            ftobj.onOver;

        this.onSet = ftobj.onSet;

        this.isStyle = !!ftobj.isStyle;
        this.paused = false;
        this.iid = null;
        this.running = false;
      };

      Anim.getOpacity = function (el) {
        var r;
        if (el.style.opacity !== _undef) {
          r = el.style.opacity;
          r = r === '' ? '1' : r;
        } else {
          r = 100;
          try {
            r = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
          } catch (e) {
            try {
              r = el.filters('alpha').opacity;
            } catch (ignore) {}
          }
          r = r / 100;
        }
        return r;
      };

      Anim.setOpacity = function (el, op) {
        if (el.style.opacity !== _undef) {
          el.style.opacity = op;
        }

        if (typeof el.style.filter === 'string') {
          el.style.filter = 'alpha(opacity=' + (op * 100).toFixed(0) + ')';
          if (!el.currentStyle || !el.currentStyle.hasLayout) {
            el.style.zoom = 1;
          }
        }
      };

      Anim.prototype._get = function () {
        var obj = this.el;

        if (this.isStyle) {
          obj = obj.style;
        }

        if (this.attr === 'opacity') {
          obj = Anim.getOpacity(this.el);
        } else {
          obj = obj[this.attr];
        }

        return parseFloat(obj) || 0;
      };

      Anim.prototype._set = function (v) {

        var obj = this.el;

        if (this.isStyle) {
          obj = obj.style;
        }

        if (this.attr === 'opacity') {
          obj = Anim.setOpacity(this.el, v);
        } else {
          obj = obj[this.attr] = v + this.unit;
        }

        if (this.onSet) {
          this.onSet((v - this.from) / this.range);
        }
      };

      Anim.prototype._begin = function () {
        var that = this,
          fn = function () {
            var oldV = that._get();
            if (that.count++ >= that.max ||
                (that.piece > 0 && oldV + that.piece >= that.to) ||
                (that.piece < 0 && oldV + that.piece <= that.to)
                ) {
              that._stop();
              //el[that.attr] = that.to + that.unit;
              that._set(that.to);
              if (that.onOver) {
                that.onOver();
              }
              return;
            }
            that._set(oldV + that.piece);
          };

        this.count = 0;
        return setInterval(fn, that.interval);
      };

      Anim.prototype._stop = function () {
        this.running = false;
        clearInterval(this.iid);
      };

      Anim.prototype.run = function () {
        var oldF;

        if (this.running) {
          return;
        }

        this.running = true;

        if (!this.paused) {
          oldF = this.from;
          this.from = oldF === false ? this._get() : oldF;
          this.range = this.to - this.from;
          this.piece = this.range * (this.interval + 1) / this.lasttime;
          this._set(this.from + this.piece);
          this.from = oldF;
        }

        if (this.piece === 0 || this.range === 0) {
          this.running = false;

          this._set(this.to);
          if (this.onOver) {
            this.onOver();
          }
        } else {
          this.iid = this._begin();
        }
      };

      Anim.prototype.pause = function () {
        this.paused = true;
        this.running = false;
        clearInterval(this.iid);
      };

      Anim.prototype.stop = function () {
        if (this.running) {
          this._stop();
        }
      };
});

/*end:dom*/
