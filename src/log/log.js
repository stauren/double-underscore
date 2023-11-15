/*!
 * @file log.js
 * @module log
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

if (typeof __ != 'undefined' && !__.Lang.dump) (function() {
  var _SELF = __;
  _SELF.log('Log: Def begin.');

  /**
   * like var_dump in php 
   * @param {object} obj things to be dump
   * @param {mixed} level how many levels to expand, default to 1, set to true to expand all levels
   */
  var _dump = function(obj, level) {
    var content = '';
    if (_isFunction(obj)) {
      content = 'Function(' + obj.toString() + ')';
    } else if (_isObject(obj) || _isArray(obj)) {
      var len = 0;
      if (level !== true) {
        level = parseInt(level, 10);
        level = _isNumber(level) ? level : 1;
        level--;
      }
      if (level === true || level >= 0) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            content += '\n' + key + ':' + _dump(value, level) + ',';
            len++;
          }
        }
        /**
         * some cases there are a length and values, (arguments)
         */
        if(obj.length && len === 0) {
          len=obj.length;
          for (var i=0;i<len;i++) {
            content += '\n' + i + ':' + _dump(obj[i], level) + ',';
          }
        }
        if (_isArray(obj)) {
          content = 'Array(' + len +') [' + content.substr(0, content.length-1) + '\n]';
        } else {
          content = 'Object(' + len +') {' + content.substr(0, content.length-1) + '\n}';
        }
      } else {
        content = _isArray(obj) ? 'Array['+ obj.length +']' : 'Object[object]';
      }
    } else if (_isString(obj)) {
      content = 'String(' + obj.length + ') "' + obj + '"';
    } else if (_isNumber(obj)) {
      content = 'Number(' + obj + ')';
    } else if (typeof obj == 'number') {
      if (isNaN(obj)){
        content = 'NaN(NaN)';
      } else if (!isFinite(obj)) {
        content = 'Infinity(' + obj.toString() + ')';
      }
    } else if (_isBoolean(obj)) {
      content = 'Bool(' + obj.toString() + ')';
    } else if (obj === null) {
      content = 'Null(null)';
    } else if (typeof obj === 'undefined') {
      content = 'Undefined(undefined)';
    } else {
      content = 'Unknowntype(unknown)';
    }
    return content;
  },

  /**
   * log message to console (or an div when the browser don't have a console) in debug mode
   * @param {object} obj info to be log
   * @param {boolean} bVarDump use var dump or not, default false
   * @param {boolean} bUseDiv use div or console to log, defaut false 
   */
  _log = (function() {
    var fn = function(obj, bVarDump) {
      var bUseDiv = arguments[2] === true ? true : _CFG[6],
      _dt, sTime, container = _CFG[7], dcontainer, addel = _SELF.Dom.addEl;
      if (_CFG[1]) {
        _dt = new Date();
        obj = bVarDump ? _dump(obj) : obj;
        sTime = ['(', _dt.getFullYear(), '-', (_dt.getMonth()+1), '-', _dt.getDate(), ' ',
          _dt.getHours(), ':', _dt.getMinutes(), ':', _dt.getSeconds(), ') : '].join('');

        if (!_WINDOW.console || !_WINDOW.console.log) {
          bUseDiv = true;
        }

        if (_CFG[8]) {
          var me = arguments.callee;
          me.data = me.data || [];
          me.data[me.data.length] = obj;
        }

        if (bUseDiv) {
          if (!(dcontainer = _f(container))) {
            dcontainer = addel({
              id : container, css:'font-family:consolas "courier new";width:300px;position:absolute;top:15px;background:#fff;border:1px solid #111;margin:0 .5em;left:'+ (_getWindowXY()[0]-330)+'px;', child : [{
                css : 'text-align:center;background:#e5ecf9;height:20px;line-height:20px;position:relative;cursor:move;', text :'DU log:', attrs : { onmousedown:function(e){_beginDrag(e||_WINDOW.event, container);}}, child : {
                  css : 'float:right;padding:3px 3px 0 0;line-height:12px;font-size:12px;', child : {
                    tag : 'a', text : 'close', href : '#', cls:'close'
                  }
                }
              }, {
                cls : 'bd', css :'text-align:left;overflow-y:scroll;height:'+Math.max((_getWindowXY()[1]-400), 350)+'px;'
              }]
            }, _DOCUMENT.body);

            var _scrollFn = function() {
              _setP(dcontainer, 'top', (_getScrollXY()[1] + 15) +'px');
            };
            _scrollFn();
            _on(_WINDOW, 'scroll', _scrollFn);
            _on(_$('#'+ container +' .close'), 'click', function(e) {
              _stopEvent(e);
              _remEl(_f(container));
            });
          }

          obj = '\n'+ addel({text:obj+''}).innerHTML;

          var pel = addel({
            tag : 'p', css : 'border:1px solid #ccc;border-width:1px 0;padding:.3em;margin:1px 0 0;', html : sTime + obj.replace(/\n/g, '<br>')
          });
          var bd = _$('.bd', container)[0];
          if (bd.firstChild) {
            bd.insertBefore(pel, bd.firstChild);
          } else {
            bd.appendChild(pel);
          }
        } else {
          _WINDOW.console.log(sTime, obj);
        }
        return sTime + obj;
      }
    };
    fn.close = function(e) {
      e = e || window.event;
      _stopEvent(e); 
    };
    return fn;
  })();

  _SELF.log = _log;
  _SELF.Lang.dump = _dump;

  _SELF.log('Log: Def end.');
}());
