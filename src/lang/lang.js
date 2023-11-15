/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules __.lang
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:lang*/
__.BasicModule.register('lang', '0.4.0', [], function () {
  "use strict";

  var _UNDEFINED;

  __.exportPath('__.lang');

  __.lang.OPER = {
    "+": function (a, b) {return a + b; },
    "-": function (a, b) {return a - b; },
    "*": function (a, b) {return a * b; },
    "/": function (a, b) {return a / b; },
    "%": function (a, b) {return a % b; },
    "-2": function (a, b) {return b - a; },
    "/2": function (a, b) {return b / a; },
    "%2": function (a, b) {return b % a; },
    ">": function (a, b) {return a > b; },
    "<": function (a, b) {return a < b; },
    ">=": function (a, b) {return a >= b; },
    "<=": function (a, b) {return a <= b; },
    //"==": function (a, b) {return a == b; },
    "===": function (a, b) {return a === b; },
    "&&": function (a, b) {return a && b; },
    "||": function (a, b) {return a || b; },
    "&": function (a, b) {return a & b; },
    "|": function (a, b) {return a | b; },
    "^": function (a, b) {return a ^ b; },
    "++": function (a) {return a + 1; },
    "--": function (a) {return a - 1; },
    "!": function (a) {return !a; }
  };

  __.lang.NODE_TYPE = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  };

  __.lang.EF = function () {};

  __.lang.K = function (x) { return x; };

  __.lang.isArray = function (obj) {
    return Object.prototype.toString.apply(obj) === '[object Array]';
  };

  __.lang.isUndefined = function (obj) {
    return obj === _UNDEFINED;
  };

  __.lang.isNull = function (obj) {
    return obj === null;
  };

  __.lang.isBoolean = function (obj) {
    return typeof obj === 'boolean';
  };

  __.lang.isFunction = function (obj) {
    return typeof obj === 'function';
  };

  __.lang.isNumber = function (obj) {
    return typeof obj === 'number' && isFinite(obj);
  };

  __.lang.isInt = function (obj) {
    var iV = parseInt(obj, 10);
    if (isNaN(iV)) {
      return false;
    }
    return obj === iV;
  };

  __.lang.isFloat = function (obj) {
    // T_T has problem detect 1.2e5
    var fV = parseFloat(obj);
    if (isNaN(fV)) {
      return false;
    }
    return obj === fV;
  };

  __.lang.isObject = function (obj) {
    return (obj && (typeof obj === 'object' || __.lang.isFunction(obj))) ||
      false;
  };

  __.lang.isString = function (obj) {
    return typeof obj === 'string';
  };

  __.lang.isEmpty = function (obj) {
    return obj === null || typeof obj === 'undefined' || obj === 0 ||
      obj === false || obj === '' ||
      (typeof obj.length === 'number' && obj.length === 0);
  };

  __.lang.isNode = function (obj, strict) {
    return __.lang.isObject(obj) &&
      ((!strict && (obj === __.global || obj === __.doc)) ||
      obj.nodeType === __.lang.NODE_TYPE.ELEMENT_NODE);
  };

  /**
   * @param {integer} start the first number (could be ignored as 0)
   * @param {integer} end the last number < end
   * @param {integer} pace
   */
  __.lang.range = function (start, end, pace) {
    var aReturn = [];

    pace = pace || 1;

    if (end === _UNDEFINED) {
      end = start;
      start = 0;
    }

    while (end > start) {
      aReturn[aReturn.length] = start;
      start += pace;
    }
    return aReturn;
  };

  __.lang.each = __.each;

  /**
   * @param {array|object|object(to be traversed)} aAry
   * @param {function} fn callback function accept 2 params, array element value and index
   * @param {boolean} bIsObject if the aAry is not an array, false=treat as 1 element array, true=tranverse the object
   */
  __.lang.all = function (aAry, fn, bIsObject) {
    var i, j;
    if (!aAry) {
      return;
    }
    if (bIsObject) {
      for (i in aAry) {
        if (aAry.hasOwnProperty(i) && !fn(aAry[i], i)) {
          return false;
        }
      }
    } else {
      if (typeof aAry === 'string' || typeof aAry.length !== 'number' ||
          aAry.tagName || aAry === __.global) {
        //not an array
        aAry = [aAry];
      }
      for (i = 0, j = aAry.length; i < j; ++i) {
        if (!fn(aAry[i], i)) {
          return false;
        }
      }
    }
    return true;
  };

  /**
   * @param {array|object|object(to be traversed)} aAry
   * @param {function} fn callback function accept 2 params, array element value and index
   * @param {boolean} bIsObject if the aAry is not an array, false=treat as 1 element array, true=tranverse the object
   */
  __.lang.find = function (aAry, fn, bIsObject) {
    var i, j;
    if (!aAry) {
      return;
    }
    if (bIsObject) {
      for (i in aAry) {
        if (aAry.hasOwnProperty(i) && fn(aAry[i], i)) {
          return i;
        }
      }
    } else {
      if (typeof aAry === 'string' || typeof aAry.length !== 'number' ||
          aAry.tagName || aAry === __.global) {
        aAry = [aAry];
      }
      for (i = 0, j = aAry.length; i < j; ++i) {
        if (fn(aAry[i], i)) {
          return i;
        }
      }
    }
    return -1;
  };

  __.lang.findByAttr = function (aAry, attrName, attrValue, bIsObject) {
    return __.lang.find(aAry, function (o) {
      return o && o[attrName] === attrValue;
    }, bIsObject);
  };

  /**
   * @param {array|object|object(to be traversed)} aAry
   * @param {function} fn callback function accept 2 params, array element value and index
   * @param {boolean} bIsObject if the aAry is not an array, false=treat as 1 element array, true=tranverse the object
   */
  __.lang.any = function (aAry, fn, bIsObject) {
    var i, j;
    if (!aAry) {
      return;
    }
    if (bIsObject) {
      for (i in aAry) {
        if (aAry.hasOwnProperty(i) && fn(aAry[i], i)) {
          return true;
        }
      }
    } else {
      if (typeof aAry === 'string' || typeof aAry.length !== 'number' ||
          aAry.tagName || aAry === __.global) {
        aAry = [aAry];
      }
      for (i = 0, j = aAry.length; i < j; ++i) {
        if (fn(aAry[i], i)) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * @param {function} fn callback function, accepts 3 params, base, array element value and index
   * @param {mixed} base 
   * @param {array|object} aAry accept an array or a single element
   * @param {boolean} bIsObj
   */
  __.lang.reduce = function (aAry, fn, base, bIsObj) {
    __.each(aAry, function (oItem, i) {
      base = fn(base, oItem, i);
    }, bIsObj);
    return base;
  };

  /**
   * @param {array|object} aAry
   * @param {function} fn callback function, accept 2 params, array element value and index
   * @param {boolean} bIsObj
   */
  __.lang.map = function (aAry, fn, bIsObj) {
    var aNew = [];

    __.each(aAry, function (oItem, i) {
      aNew[i] = fn(oItem);
    }, bIsObj);
    return aNew;
  };

  /**
   * turn some thing in to an array
   * @param {fixed} aAry array-like object with a length attribute
   */
  __.lang.a = function (aAry) {
    var leng, results;

    if (!aAry) {
      return [];
    }

    leng = aAry.length || 0;
    results = new Array(leng);

    while (leng--) {
      results[leng] = aAry[leng];
    }
    return results;
  };

  /**
   * split a string with space
   * @param {string} str
   */
  __.lang.w = function (str) {
    if (!__.lang.isString(str)) {
      return [];
    }
    str = __.lang.trim(str);
    return str ? str.split(__.lang.getReg('\\s+')) : [];
  };

  /**
   * delete duplicated values in an array, get unique array
   * @param {array} aAry
   * @param {boolean} sorted indicated the array is already sorted or not
   */
  __.lang.unique = function (aAry, sorted) {
    return __.lang.reduce(aAry, function (array, value, index) {
      if (0 === index ||
          (sorted ? array[array.length - 1] !== value : !__.lang.inArray(value, array, true))) {
        array.push(value);
      }
      return array;
    }, []);
  };

  /**
   * return false or an array of index of the found values
   */
  __.lang.inArray = function (obj, ary) {
    var found = false;
    __.each(ary, function (oItem, i) {
      if (oItem === obj) {
        found = found === false ? [] : found;
        found.push(i);
      }
    });
    return found;
  };

  /**
   * delete part of an array with high efficiency
   * Based on John Resig's Array Remove
   * @param {array} ary
   * @param {integer} from the start index
   * @param {integer} to the end index
   */
  __.lang.arrayRemove = function (ary, from, to) {
    var rest,
      len = ary.length;

    from = ary < 0 ? parseInt(from, 10) + len : from;
    to = to < 0 ? parseInt(to, 10) + len : to;
    if (to < from || from >= len || to >= len) {
      return false;
    }
    rest = ary.slice((to || from) + 1 || ary.length);
    ary.length = from < 0 ? ary.length + from : from;
    return ary.push.apply(ary, rest);
  };

  /**
   * function to get a property of an array of object in to an new array
   * @param {array} aAry 
   * @param {string} key
   */
  __.lang.absorb = function (aAry, key) {
    var aValues = [];

    __.each(aAry, function (o) {
      aValues.push(o[key]);
    });
    return aValues;
  };

  /**
   * function to create function with prefilled param
   * @param {function|string} fn string must be a __.Lang.OPER index
   */
  __.lang.curry = function (fn) {
    var argu;

    fn = typeof fn === 'string' && __.lang.OPER[fn] ? __.lang.OPER[fn] : fn;
    argu = __.lang.a(arguments);
    argu.shift();
    return function () {
      return fn.apply(null, argu.concat(__.lang.a(arguments)));
    };
  };

  /**
   * function to compose 2 functions
   * @param {function} fnWrap 
   * @param {function} fnParam 
   */
  __.lang.compose = function (fnWrap, fnParam) {
    return function () {
      return fnWrap(fnParam.apply(null, arguments));
    };
  };

  /**
   * function to generate a negative functions
   * @param {function} fn 
   */
  __.lang.negate = function (fn) {
    return function () {
      return !fn.apply(null, arguments);
    };
  };

  /**
   * function to get the keys of an object as an array
   * @param {object} aAry 
   */
  __.lang.keys = function (aAry) {
    var aKeys = [];

    __.each(aAry, function (o, i) {
      aKeys.push(i);
    }, true);
    return aKeys;
  };

  /**
   * function to get the values of an object as an array
   * @param {object} aAry 
   */
  __.lang.values = function (aAry) {
    var aValues = [];

    __.each(aAry, function (o, i) {
      aValues.push(o);
    }, true);

    return aValues;
  };

  /**
   * function to clone an object
   * @param {object} obj 
   */
  __.lang.clone = function (obj) {
    var temp, key;

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    temp = new obj.constructor();

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        temp[key] = __.lang.clone(obj[key]);
      }
    }

    return temp;
  };


  __.lang.mergeObj = function () {
    var i, theOne, argus, newO = {};

    argus = __.lang.a(arguments);

    while ((theOne = argus.shift()) !== _UNDEFINED) {
      for (i in theOne) {
        if (theOne.hasOwnProperty(i)) {
          newO[i] = theOne[i];
        }
      }
    }

    return newO;
  };

  /**
   * from http://blog.stevenlevithan.com/archives/faster-trim-javascript
   * faster trim a string
   */
  __.lang.trim = function (str) {
    var ws, i;

    str = str.replace(__.lang.getReg('^\\s\\s*'), '');
    ws = __.lang.getReg('\\s');
    i = str.length - 1;
    while (ws.test(str.charAt(i))) {
      i--;
    }
    return str.slice(0, i + 1);
  };

  /**
   * function to cut a string to certain length and append truncation
   * @param {string} str the string to be cutted
   * @param {integer} len the length to be cutted to, include truncation, default 30
   * @param {string} truncation the string to be appended at the end, default '...'
   * @param {boolean} isAsciiLen set to true means the second param is ascii character length,
   *                  a non-ascii character will be count as 2 ascii length
   */
  __.lang.truncate = function (str, len, truncation, isAsciiLen) {
    var i, k,
      j = str.length,
      actualLen = 0;

    len = len || 30;
    truncation = truncation === _UNDEFINED ? '...' : truncation;
    isAsciiLen = isAsciiLen === _UNDEFINED ? false : true;


    if (isAsciiLen && j > len / 2) {

      for (i = 0, k = truncation.length; i < k; i++) {
        actualLen += truncation.charCodeAt(i) > 255 ? 2 : 1;
      }

      for (i = 0; i < j; i++) {
        actualLen += str.charCodeAt(i) > 255 ? 2 : 1;
        if (actualLen > len) {
          break;
        }
      }

      str = str.substring(0, i) + truncation;
    } else if (str.length > len) {
      str = str.slice(0, len - truncation.length) + truncation;
    } else {
      str = String(str);
    }
    return str;
  };

  __.lang.strRepeat = function (str, times) {
    var result = [];

    __.each(__.lang.range(times), function () {
      result.push(str);
    });
    return result.join('');
  };

  __.lang.baseConvert = function (num, to, from) {
    if (!num || !to) {
      return false;
    }
    num = String(num).toLowerCase();
    if (from === _UNDEFINED) {
      if (__.lang.startWith(num, '0x')) {
        from = 16;
      } else if (__.lang.startWith(num, '0')) {
        from = 8;
      } else {
        from = 10;
      }
    }
    num = parseInt(num, from);
    return num.toString(to);
  };

  __.lang.stripTags = function (str) {
    return str.replace(__.lang.getReg('<\\/?[^>]+>', 'gi'), '');
  };

  __.lang.camelize = function (str) {
    var i, camelized,
      parts = str.split('_'),
      len = parts.length;

    if (len === 1) {
      return parts[0];
    }

    camelized = str.charAt(0) === '_' ?
      parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];

    for (i = 1; i < len; ++i) {
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }

    return camelized;
  };

  __.lang.underscore = function (str) {
    return str.replace(__.lang.getReg('([A-Z]+)([A-Z][a-z])', 'g'),
      '$1_$2').replace(__.lang.getReg('([a-z\\d])([A-Z])', 'g'),
      '$1_$2').toLowerCase();
  };

  __.lang.capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  };

  /**
   * function to print a string from template
   * @param {string} sTemplate a string with '%s' in it
   * @param {string} replacement can be many replacement parameters replace '%s' in template in order
   */
  __.lang.sprintf = function (sTemplate) {
    var i = 1;
    while (arguments[i] !== _UNDEFINED) {
      sTemplate = sTemplate.replace(__.lang.getReg('%s'), arguments[i++]);
    }
    return sTemplate;
  };

  __.lang.startWith = function (str, pattern) {
    return str.indexOf(pattern) === 0;
  };

  __.lang.beginWith = __.lang.startWith;

  __.lang.endWith = function (str, pattern) {
    var d = str.length - pattern.length;
    return d >= 0 && str.lastIndexOf(pattern) === d;
  };

  __.lang.greplace = function (str, sReg, fn) {
    var p,
      gReg = __.lang.getReg(sReg, 'g'),
      nReg = __.lang.getReg(sReg),
      result = '';
    __.each(str.match(gReg), function (o, i) {
      p = str.indexOf(o) + o.length;
      result += str.substring(0, p).replace(nReg, fn(o, i));
      str = str.substring(p);
    });
    return result + str;
  };

  __.lang.rand = function (min, max) {
    if (max === _UNDEFINED) {
      max = min;
      min = 0;
    }
    return Math.round(Math.random() * (max - min)) + min;
  };

  __.lang.getReg = (function () {
    var regCache = {}, fn;

    fn = function (str, flag) {
      var key = str + (flag || '');
      if (!regCache[key]) {
        regCache[key] = new RegExp(str, flag);
      }
      return regCache[key];
    };

    fn.purge = function () {
      regCache = {};
    };

    return fn;
  }());

  __.lang.log = __.isDebug() ? (function () {
    var starting = 0, fn, count = 0;
    if (__.global.console) {
      fn = function () {
        var nt, oldst, c, args;

        if (!__.isDebug()) {
          return;
        }

        nt = (new Date()).getTime();
        c = __.global.console;
        oldst = starting || nt;

        starting = nt;
        nt = (++count) + ',(' + nt + ',+' + (nt - oldst) + 'ms): ';
        args = __.lang.a(arguments);
        args.unshift(nt);
        if (c.log.apply) {
          c.log.apply(c, args);
        } else {
          c.log(args.join(' '));
        }
      };
    } else {
      fn = __.lang.EF;
    }
    return fn;
  }()) : __.lang.EF;

  /**
   * call a function if some requirements are satisfied, usually used for lazy load and initiate
   * @param {function} fnCall the init function, 
   * @param {function|string} judge mixed, could be a function or a string(a set global var)
   * @param {integer} iInterval milliseconds of interval
   */
  __.lang.toCall = function (fnCall, judge, iInterval) {
    var _sId, _fnJudge, called = false;

    iInterval = iInterval || 1000;

    _fnJudge = typeof judge === 'function' ? judge : function () {
      var _bRet = false;
      if (__.get(judge) !== _UNDEFINED) {
        _bRet = true;
      }
      return _bRet;
    };

    // do it now
    if (!called && _fnJudge()) {
      called = true;
      fnCall();
    } else {
    //or later
      _sId = setInterval(function () {
        if (!called && _fnJudge()) {
          called = true;
          clearInterval(_sId);
          fnCall();
        }
      }, iInterval);
    }
  };
});
/*end:lang*/
