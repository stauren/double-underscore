/**
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */

/*begin:__.widget.ScrollIndex*/
__.BasicModule.register('fn-scrollindex', '2.0.0', ['lang', 'dom', 'fn-table'], function () {
  __.set('__.widget');

  __.widget.ScrollIndex = function (id, config) {
    __.widget.Base.call(this);
    this.config = config || {};
    this.start = this.current = this.config.start || 0;
    this.column =  this.config.column || 2;
    this.rows = Math.ceil(this.keys.length / this.column);
    this.rowHeight = 34;

    this.id = id;
    this._prepareEls();
  };

  __.inherits(__.widget.ScrollIndex, __.widget.Base);

  __.widget.ScrollIndex.prototype.cssRules = [
    '.scroll-index .bg {width:16px;height:15px;float:right;cursor:pointer;margin-top:8px;}',
    '.clk-topstkup {background-position:0 -134px;margin-right:7px;}',
    '.clk-topstkdown {background-position:-16px -134px;margin-right:10px;}',
    '.topstk-list {height:35px;overflow:hidden;text-align:right;}',
    '.topstk-list p {margin:0;padding:7px 10px 12px 0;}',
    '.topstk-list b {color:#cfd6e6;padding:0 10px;}',
    '.topstk-list span {color:#ccc;width:50px;display:inline-block;}'
  ];

  __.widget.ScrollIndex.prototype.names = [
    '<a href="http://stockhtm.finance.qq.com/hqing/zhishu/000001.htm" title="上证指数:(000001)" target="_blank">上证指数:</a>',
    '<a href="http://stockhtm.finance.qq.com/hqing/zhishu/399001.htm" title="深证成指:(399001)" target="_blank">深证成指:</a>',
    '<a href="http://stockhtm.finance.qq.com/hk/ggcx/HSI.htm" title="恒生指数:(HSI)" target="_blank">恒生指数:</a>',
    '<a href="http://stockhtm.finance.qq.com/astock/ggcx/DJI.htm" title="道琼斯:(DJI)" target="_blank">道琼斯:</a>',
    '<a href="http://stockhtm.finance.qq.com/astock/ggcx/IXIC.htm" title="纳斯达克:(IXIC)" target="_blank">纳斯达克:</a>',
    '法国CAC:',
    '德国DAX:',
    '日经225:',
    '海峡时报:',
    '台湾加权指数:',
    '黄金:',
    '石油:'
  ];

  __.widget.ScrollIndex.prototype.keys = [
    'sh000001',
    'sz399001',
    'r_hkHSI',
    'usDJI',
    'usIXIC',
    'gzFCHI',
    'gzGDAXI',
    'gzN225',
    'gzFTSTI',
    'gzTWII',
    'fqUS_GC_1',
    'fqUS_CL_1'
  ];

  __.widget.ScrollIndex.prototype._prepareEls = function () {
    var i, count, rows, tmp,
      names = this.names,
      column = this.column,
      ps = [],
      ctn = [{
        cls : 'clk-topstkdown bg',
        title : '点击向下滚动'
      }, {
        cls : 'clk-topstkup bg',
        title : '点击向上滚动'
      }, {
        cls : 'topstk-list f12'
      }];

    rows = this.rows;
    i = (this.current + rows - 1) * this.column;
    count = 0;
    while (true) {
      if (count % column === 0) {
        if (ps.length < rows) {
          ps.push({
            tag : 'p',
            cls : 'scroll-index-row-' +
              Math.floor(i % this.names.length / this.column),
            html : ''
          });
        } else {
          break;
        }
      }

      ps[ps.length - 1].html += names[i % this.names.length] +
        '<span>--</span><span>--</span>' +
        (count % column !== column - 1 ? '<b class="c4">|</b>' : '');

      i++;
      count++;
    }

    ctn[2].child = ps;

    __.dom.addEl(ctn, this.id);

    tmp = {};
    tmp.ctn = __.dom.f(this.id);
    tmp.down = tmp.ctn.firstChild;
    tmp.up = tmp.down.nextSibling;
    tmp.lists = tmp.up.nextSibling;
    this.els = tmp;

    tmp.lists.scrollTop = this.rowHeight;

    tmp = null;
  };

  __.widget.ScrollIndex.prototype.scroll = function (isUp) {
    var anim, lists, that = this;

    if (this._isrunning) {
      return;
    }

    isUp = !!isUp;

    if (isUp) {
      if (this.current !== (this.start + this.rows - 1) % this.rows) {
        this.current = (this.current + this.rows - 1) % this.rows;
      } else {
        return;
      }
    } else {
      if (this.current !== (this.start + 2) % this.rows) {
        this.current = (this.current + 1) % this.rows;
      } else {
        return;
      }
    }

    lists = this.els.lists;
    anim = new __.Anim(lists, 'scrollTop', {
      to : lists.scrollTop + (isUp ? -this.rowHeight : this.rowHeight),
      isStyle : false,
      onOver : function () {
        that._isrunning = false;
      }
    });

    that._isrunning = true;
    anim.run();
  };

  __.widget.ScrollIndex.prototype.getKeysByRow = function (rowNum) {
    var start = this.column * rowNum,
      result = [],
      keys = this.keys;

    __.each(__.lang.range(this.column), function (o) {
      result.push(keys[start + o]);
    });

    return result;
  };

  __.widget.ScrollIndex.prototype.fillByRow = function (rowNum, data) {
    var tmp, rows, keys, p;

    rowNum = String(rowNum);
    rows = this.els.lists.childNodes;
    p = __.fnTable.processors;

    tmp = __.lang.find(rows, function (o) {
      return __.lang.endWith(o.className, rowNum);
    });

    tmp = rows[tmp];
    if (tmp) {
      tmp = tmp.childNodes;
      keys = this.getKeysByRow(rowNum);
      __.each(keys, function (o, i) {
        var ary, sp1, sp2;
        if (data[o]) {
          ary = data[o].split('~');

          if (o === 'gzFCHI' || o === 'gzGDAXI' ||
              o === 'gzN225' || o === 'gzFTSTI' ||
              o === 'gzTWII') {
            sp1 = p.GET_COLOR(ary[3], ary[5], true);
            sp2 = p.GET_PERCENT(ary[5]);
          } else if (o === 'fqUS_GC_1' || o === 'fqUS_CL_1') {
            sp1 = p.GET_COLOR(ary[5], ary[6], true);
            sp2 = ary[6] / (ary[5] - ary[6]) * 100;
            sp2 = __.lang.isNumber(sp2) ? sp2.toFixed(2) : '';
            sp2 = p.GET_PERCENT(sp2);
          } else {
            sp1 = p.L_PRICE(ary);
            sp2 = p.L_PERCENT(ary);
          }
          tmp[i * 4 + 1].innerHTML = sp1;
          tmp[i * 4 + 2].innerHTML = sp2;
        }
      });
    }
  };

  __.widget.ScrollIndex.prototype.disposeInternal = function () {
    this.els.ctn = this.els.up = this.els.down = this.els.lists = null;
    this.els = null;
  };
});
/*end:__.widget.ScrollIndex*/
