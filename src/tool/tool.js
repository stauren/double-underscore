/*!
 * @file tools.js
 * @module Tool
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

if (typeof __ != 'undefined' && !__.Tool) (function(){
  var _SELF  = __;
  _SELF.log('Tool: Def begin.');
  _SELF.add('Tool', {});

  var _CFG = _SELF.cfg,
  _DOCUMENT = _SELF.config.doc,
  _LENGTH = 'length',
  _SPLIT = 'split',
  _INDEXOF = 'indexOf',
  _TRUE = true,
  _T = _SELF.Tool, _L = _SELF.Lang, _D = _SELF.Dom,

  _baseConvert = _SELF.Lang.baseConvert;

  /**
   * global variable leak check
   * usage :
   *  __.Tool.globalcheck.init()
   *
   */
  _T.globalCheck = (function() {
    //from http://blog.jcoglan.com/2008/08/21/checking-your-javascript-for-variable-leaks/
    var globals = {
      originals:   [],
      userdefined: [],
      warned:      [],
      root:        this,
      initialize: function() {
        if (this.originals.length > 0) {
          return;
        }
        for (var key in this.root) {
          if (true) {
            this.originals.push(key);
          }
        }
      },
      register: function() {
        for (var i = 0, n = arguments.length; i < n; i++) {
          this.userdefined.push(arguments[i]);
        }
      },
      check: function() {
        for (var key in this.root) {
          if (this.originals.indexOf(key) == -1 &&
              this.userdefined.indexOf(key) == -1 &&
              this.warned.indexOf(key) == -1) {
            if (console) {
              console.warn('global variable: ' + key);
            }
            this.warned.push(key);
          }
        }
      },
      run: function() {
        var self = this;
        setInterval(function() { self.check(); }, 1000);
      }
    };
    return {
      init : function() {
        globals.register('__', 'Yahoo', '_firebugcommandline', '_firebug', '_firebugconsole');
        globals.initialize();
        globals.run();
      }
    };
  })();

  _T.getCharset = function() {
    return _DOCUMENT.characterSet || _DOCUMENT.charset || _DOCUMENT.defaultCharset;
  };


  /**
   * eval a script in the global scope
   * Evalulates a script in a global context, from jquery
   * @param {string} data script to be eval
   */
  _T.globalEval = function( data ) {
    data = _SELF.Lang.trim( data );

    if ( data ) {
      // Inspired by code by Andrea Giammarchi
      // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
      var head = _DOCUMENT.getElementsByTagName("head")[0] || _DOCUMENT.documentElement,
        script = _DOCUMENT.createElement("script");

      script.type = "text/javascript";
      if ( _CFG[4].ie ) {
        script.text = data;
      } else {
        script.appendChild(_DOCUMENT.createTextNode(data));
      }

      head.appendChild( script );
      head.removeChild( script );
    }
  },

  _T.addFav = function(el, title, url) {
    var ua = _CFG[4];
    if (ua.gecko) {
      window.sidebar.addPanel(title,url,"");
    } else if(ua.ie) {
      window.external.AddFavorite(url, title);
    } else if(ua.opera) {
      el.setAttribute('href',url);
      el.setAttribute('title',title);
      el.setAttribute('rel','sidebar');
      el.click();
    } else {
      alert('Please press Ctrl+D to add bookmark.');
    }
  }

  _T.loadFirebug = function() {
    var firebug = _DOCUMENT.createElement('script');
    firebug.src = 'http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js';
    _DOCUMENT.body.appendChild(firebug);
    _SELF.toCall(function() {
      window.firebug.init();
    }, 'window.firebug.version');
  };

  /**
   * get value of input element(textarea), and return a object of id:value pair
   *
   */
  _T.getObjFromId = function(ary) {
    var oResult = {};
    ary = _SELF.Lang.isArray(ary) ? ary : [ary];
    _SELF.Lang.each(ary, function(sId) {
      var temp = _SELF.Dom.f(sId);
      if(temp && (typeof temp.value != 'undefined')) {
        oResult[sId] = temp.value;
      } else if (temp && temp.innerHTML) {
        oResult[sId] = temp.innerHTML;
      } else {
        oResult[sId] = null;
      }
    });
    return oResult;
  };


  /**
   * from : http://www.hedgerwow.com/360/dhtml/css-word-break.html 
   */
  _T.breakWord = function(dEl) {
    if(!dEl || dEl.nodeType !== 1){
      return false;
    } else if(dEl.currentStyle && typeof dEl.currentStyle.wordBreak === _STRING){
      //Lazy Function Definition Pattern, Peter's Blog
      //From http://peter.michaux.ca/article/3556
      _T.breakWord = function(dEl){
        //For Internet Explorer
        dEl.runtimeStyle.wordBreak = 'break-all';
        return true;
      };
      return _T.breakWord(dEl);
    } else if (_DOCUMENT.createTreeWalker) {
      _T.breakWord = function(dEl){
        //For Opera, Safari, and Firefox
        var dWalker = _DOCUMENT.createTreeWalker(dEl, NodeFilter.SHOW_TEXT, null, false);
        var node,s,c = String.fromCharCode('8203');
        while (dWalker.nextNode())
        {
          node = dWalker.currentNode;
          //we need to trim String otherwise Firefox will display 
          //incorect text-indent with space characters
          s = _SELF.Lang.trim( node.nodeValue ) .split('').join(c);
          node.nodeValue = s;
        }
        return true;
      };
      return _T.breakWord(dEl);
    } else {
      return false;
    }
  };

  _T.rand = function(number) {
    var today = new Date(),
      seed = today.getTime(),
      percent;
    for(var i=1;i<=5;i++) {
      seed = (seed * 9301 + 49297) % 233280;
    }
    percent = seed / 233280.0;
    return Math.round(percent * number);
  };


  /**
   * remove whitespaces between nodes
   * @param {object|str} nodes
   */
  var _normalizeNode = function (nodes){
    nodes = _D.$(nodes);
    _L.e(nodes, function(node) {
      if(node.hasChildNodes){
        var spaceTest = /^\s+$/;
        var children = node.childNodes;
        for(var i=0;children[i];i++){
          if(children[i].nodeType === _L.NODE_TYPE.TEXT_NODE){
            if(spaceTest.test(children[i].nodeValue)){
              children[i].parentNode.removeChild(children[i]);
            }
          }
        }
      }
    });
  };

  /**
   * get text from a node and its children
   * @param {object} nodes
   */
  _T.getText = function(nodes) {
    nodes = _SELF.Dom.$(nodes);
    var txt = [];
    _L.e(nodes, function(node) {
      node = node.cloneNode(_TRUE);
      _normalizeNode(node);
      if (node && node.nodeType === _L.NODE_TYPE.TEXT_NODE) {
        txt[txt[_LENGTH]] =  node.nodeValue;
      } else if (node && node.nodeType === _L.NODE_TYPE.ELEMENT_NODE) {
        if (node.hasChildNodes()) {
          _L.e(node.childNodes, function(o) {
            txt[txt[_LENGTH]] = _T.getText(o);
          });
        }
      }
    });
    return txt.join('');
  };

  _T.encode = {
    encodeHTML : function(str) {
      return _SELF.Dom.addEl({
        text:str
      }).innerHTML;
    },

    decodeHTML : function(str) {
      return _T.getText(_SELF.Dom.addEl({
        html : str
      }));
    },

    /**
     * utf-8 encode, but not gb or else...
     * eg : %B9%FE = 哈 in gb, %E5%93%88 = 哈 in utf8
     */
    encodePercent : function(str) {
      //TODO: U-00000800 – U-0000FFFF:    1110xxxx 10xxxxxx 10xxxxxx
      str = encodeURIComponent(str);
      var result = '';
      str = str[_SPLIT]('');
      for (var i=0,j=str[_LENGTH];i<j;i++) {
        if (str[i] == '%') {
          i += 2;
          result += str[i] + str[i+1] + str[i+2];
        } else {
          result += '%'+ _baseConvert(str.charCodeAt(i), 16);
        }
      }
      /*
      _each(str.split(''), function(o) {
        result += '%'+ _baseConvert(o.charCodeAt(0), 16);
      });
      */
      return result;
    },

    decodePercent : function(str) {
      //TODO: can't noe handle "\n"
      /*var result = '';
      _each(str.substr(1).split('%'), function(o) {
        result += String.fromCharCode(_baseConvert(o, 10, 16));
      });
      return result;*/
      return decodeURIComponent(str);
    },

    encodeHex : function(str) {
      var result = [];
      _L.e(str[_SPLIT](''), function(o) {
        var code = o.charCodeAt(0);
        code = _baseConvert(code, 16, 10);
        code = _L.strRepeat('0', 4 - code[_LENGTH]) + code;
        result[result[_LENGTH]] = '\\u' + code;
      });
      return result.join('');
    },

    decodeHex : function(str) {
      var result = [];
      str = _L.trim(str);
      _L.e(str[_SPLIT]('\\u'), function(o) {
        if (o[_LENGTH]> 0) {
          result.push(String.fromCharCode(_baseConvert(o, 10, 16)));
        }
      });
      return result.join('');
    },

    /**
     * encode numeric character reference
     */
    encodeNCR : function(str) {
      var result = [];
      _L.e(str[_SPLIT](''), function(o) {
        var code = o.charCodeAt(0);
        result[result[_LENGTH]] = '&#' + code + ';';
      });
      return result.join('');
    },

    /**
     * decode numeric character reference
     */
    decodeNCR : function(str) {
      return _T.encode.decodeHTML(str);
    },

    //TODO : error handle chinese
    encode64 : function (sStr) {
      var output = "", i = 0, len = sStr[_LENGTH],
        chr1,chr2,chr3,
        enc1,enc2,enc3,enc4,
        base64keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      do {
        chr1 = sStr.charCodeAt(i++);
        chr2 = sStr.charCodeAt(i++);
        chr3 = sStr.charCodeAt(i++);
        enc1 = chr1>>2;
        enc2 = ((chr1&3)<<4)|(chr2>>4);
        enc3 = ((chr2&15)<<2)|(chr3>>6);
        enc4 = chr3&63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if(isNaN(chr3)) {
          enc4=64;
        }
          output = output + base64keyStr.charAt(enc1) + base64keyStr.charAt(enc2) +
            base64keyStr.charAt(enc3) + base64keyStr.charAt(enc4);
        } while(i<len);
      return output;
    },

    decode64 : function(sStr) {
      var output = "",
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0,
        base64keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

      sStr = sStr.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = base64keyStr[_INDEXOF](sStr.charAt(i++));
        enc2 = base64keyStr[_INDEXOF](sStr.charAt(i++));
        enc3 = base64keyStr[_INDEXOF](sStr.charAt(i++));
        enc4 = base64keyStr[_INDEXOF](sStr.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      } while (i < sStr[_LENGTH]);

      return output;
    }
  };

  _SELF.log('Tool: Def end.');
}());
