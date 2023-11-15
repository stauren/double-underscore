/**
 * visit : http://code.google.com/p/double-underscore/
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */

(function (_global) {
  "use strict";

  var _DU_TAG = '0.4.0',
    __ = _global.__ = _global.__ || {},
    _UNDEFINED,
    _rModName = /^[a-z0-9\-]+$/,
    _rHttp = /^http(s)?:\/\/|^\.|^\//,
    _slice = Array.prototype.slice;

  __.global = _global;

  __.doc = _global.document;

  /**
   * unified layer count
   */
  __.topLayer = 1;


//debug related
  __.isDebug = (function () {
    var _isDebug = false;
    return function (debug) {
      if (debug !== _UNDEFINED) {
        _isDebug = debug;
      }
      return _isDebug;
    };
  }());

  /**
   * set debug status
   * @param {boolean} isDebug default to true
   */
  __.debug = function (isDebug) {
    this.isDebug(isDebug === false ? false : true);
  };


//language helper
  (function (_scope) {
    /**
     * @param {array|object} arrayToTranverse
     * @param {Function} fnProcess callback function accept 2 params,
     *                   array element value and index
     * @param {boolean} bIsObject if the arrayToTranverse is not an array,
     *                  false means treat as 1 element array,
     *                  true means tranverse the object
     */
    _scope.each = function (arrayToTranverse, fnProcess, bIsObject) {
      var i, j;

      if (!arrayToTranverse) {
        return;
      }

      if (bIsObject[2]) {
        for (i in arrayToTranverse) {
          if (arrayToTranverse.hasOwnProperty(i)) {
            fnProcess(arrayToTranverse[i], i);
          }
        }
      } else {
        //  splice failed for Nodelist

        //form element has a length property -- tagName
        if (typeof arrayToTranverse === 'string' ||
            typeof arrayToTranverse.length !== 'number' ||
            arrayToTranverse.tagName ||
            arrayToTranverse === this.global
            ) {
          //not an array
          arrayToTranverse = [arrayToTranverse];
        }

        for (i = 0, j = arrayToTranverse.length; i < j; ++i) {
          fnProcess(arrayToTranverse[i], i);
        }
      }
    };

    /**
     * @param {object} r reciever
     * @param {object} s source 
     * @param {boolean} override true to override properties with the same name in r, default to true
     */
    _scope.extend = function (r, s, override) {
      var i;

      override = override === false ? false : true;

      for (i in s) {
        if (s.hasOwnProperty(i) && (override || r[i] === _UNDEFINED)) {
          r[i] = s[i];
        }
      }
    };
  }(__));


//user agent sniff
  (function (_scope, userAgent) {
    var matches,
      map = {
        win : 'Windows',
        mac : 'Mac',
        ie : 'MSIE',
        webkit : 'KHTML',
        ipad : 'iPad',
        iphone : 'iPhone',
        gecko : 'Gecko',
        opera : 'Opera'
      },
      uaObj = {};

    if (userAgent) {
      _scope.each(map, function (keyWord, name) {
        uaObj[name] = userAgent.indexOf(keyWord) > -1;
      }, true);

      if (uaObj.ie) {
        uaObj.ie = userAgent.match(/MSIE (\d)/)[1];
      } else if (uaObj.webkit) {
        if ((/Chrome\/(\d+)/).test(userAgent)) {
          uaObj.chrome = RegExp.$1;
        }
        if (userAgent.indexOf('Safari') > -1) {
          uaObj.safari = true;
        }
        if (uaObj.ipad || uaObj.iphone) {
          uaObj.os = userAgent.match(/OS (\d)/)[1];
        }
      } else if (uaObj.gecko) {
        uaObj.firefox = userAgent.match(/Firefox\/(\d+)/)[1];
      }
    }
    _scope.ua = uaObj;

  }(__, _global.navigator && navigator.userAgent));


//TODO: begin here

//uid of dom elements
  __._uIdx = 0;
  __.getUid = function (el) {
    var uid;

    if (!el) {
      return el;
    }
    // IE generates its own unique ID for dom nodes
    // The uniqueID property of a document node returns a new ID
    if (el.uniqueID && el.nodeType && el.nodeType !== 9) {
      uid = el.uniqueID;
    } else {
      uid = (typeof el === 'string') ? el : el._duid;
    }

    if (!uid) {
      uid = '_duid_' + (++__._uIdx);
      try {
        el._duid = uid;
      } catch (e) {
        uid = null;
      }
    }
    return uid;
  };


//package management

  /**
   * create the object link, set value to the last property 
   * @param {string} varName a string of object chain name, such as "__.util.addEl"
   * @param {mixed} newValue the new value
   * @description if don't give the new value, the last properties' value will not change if it's not undefined, or it will be given a new value : an empty object
   */
  __.set = function (varName, newValue, scope) {
    var key, i, j,
      bAry = varName.split('.'),
      d = scope || __.global;

    for (i = 0, j = bAry.length - 1; i < j; ++i) {
      d[bAry[i]] = d[bAry[i]] || {};
      d = d[bAry[i]];
    }

    key = bAry[bAry.length - 1];
    d[key] = newValue === _UNDEFINED ?
      (d[key] === _UNDEFINED ? {} : d[key]) : newValue;

    return d[key];
  };

  /**
   * get value of the last property in the object link
   * @param {string} varName a string of object chain name, such as "__.util.addEl"
   */
  __.get = function (varName, scope) {
    var i, j,
      bAry = varName.split('.'),
      d = scope || __.global;

    for (i = 0, j = bAry.length; i < j; ++i) {
      //d[bAry[i]] = d[bAry[i]] || {};
      if (!d) {
        return _UNDEFINED;
      }
      d = d[bAry[i]];
    }
    return d;
  };

  __.exportPath = function (name, newValue, scope) {
    var part,
      parts = name.split('.'),
      cur = scope || __.global;

    /*jslint evil: true*/
    if (cur[parts[0]] === _UNDEFINED && cur.execScript) {
      cur.execScript('var ' + parts[0]);
    }

    __.set(name, scope, scope);
/*
    part = parts.shift();
    for (; parts.length >= 0 && part;) {
      if (!parts.length && opt_object) {
        // last part and we have an object; use it
        cur[part] = opt_object;
      } else if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
      part = parts.shift();
    }
*/
  };

  /**
   * Inherit the prototype methods from one constructor into another.
   *
   * Usage:
   * function ParentClass(a, b) { }
   * ParentClass.prototype.foo = function(a) { }
   *
   * function ChildClass(a, b, c) {
   *   ParentClass.call(this, a, b);
   * }
   *
   * __.inherits(ChildClass, ParentClass);
   *
   * var child = new ChildClass('a', 'b', 'see');
   * child.foo();
   *
   * ChildClass.prototype.foo = function(a) {
   *   ChildClass._super.foo.call(this, a);
   *   // other code
   * };
   *
   * @param {Function} childCtor Child class.
   * @param {Function} parentCtor Parent class.
   */
  __.inherits = function (childCtor, parentCtor) {
    function TempCtor() {}
    TempCtor.prototype = parentCtor.prototype;
    childCtor._super = parentCtor.prototype;
    childCtor.prototype = new TempCtor();
    childCtor.prototype.constructor = childCtor;
  };

//loading js related
  /**
   * Download a script in such a way that it's not executed immediately.
   * borrow from http://stevesouders.com/controljs/
   */
  __.preLoadJs = function (url) {

    if (__.ua.ie || __.ua.opera) {
      __.downloadScriptImage(url);
    } else {
      __.downloadScriptObject(url);
    }
  };


// Download a script as an image.
// This puts it in the browser's cache, but doesn't execute it.
  __.downloadScriptImage = function (url) {
    var img = new Image();

// Chrome does onerror (not onload).
//    img.onload = img.onerror = function () { CJS.onloadCallback(url); };

    img.src = url;
  };


// Download a script as an object.
// This puts it in the browser's cache, but doesn't execute it.
// Based on http://www.phpied.com/preload-cssjavascript-without-execution/
  __.downloadScriptObject = function (url) {
    var obj;

    if (!__.doc.body) {
      // we need body for appending objects
      setTimeout(function () {
        __.downloadScriptObject(url);
      }, 50);
      return;
    }

    obj = __.doc.createElement('object');
    obj.data = url;
    obj.width  = 0;
    obj.height = 0;
//    obj.onload = obj.onerror = function() { CJS.onloadCallback(url); };
    __.doc.body.appendChild(obj);
  };

  __.loadJs = function (url, obj) {
    var doc = __.doc,
      head = doc.getElementsByTagName("head")[0] || doc.documentElement,
      node,
      fn,
      done = false;

    fn = obj.onSuccess;

    if (obj.cache === false || (__.isDebug() && obj.cache !== true)) {
      url += (url.indexOf('?') > 0 ? '&' : '?') +
        '_du_r_t=' + Math.random();
    }

    node = doc.createElement('script');
    node.type = 'text/javascript';
    node.src = url;

    if (obj.charset) {
      node.charset = obj.charset;
    }

    // Attach handlers for all browsers
    node.onload = node.onreadystatechange = function () {
      if (!done && (!this.readyState ||
        this.readyState === "loaded" || this.readyState === "complete")) {
        done = true;

        if (fn) {
          fn();
        }

        // Handle memory leak in IE
        fn = node.onload = node.onreadystatechange = null;
        if (head && node.parentNode) {
          head.removeChild(node);
        }
      }
    };

    head.appendChild(node);
  };

/*begin: BasicModule*/
  __.BasicModule = function (modName, detailObj) {
    detailObj = detailObj || {};

    this.mname = modName;
    this.detailObj = detailObj;
  };

  __.BasicModule.modules = {};
  __.BasicModule.waitingReg = [];
  __.BasicModule.loadingMods = {};
  __.BasicModule.loadedMods = {};
  //__.BasicModule.waitingOnOk = {};

  /**
   * add a module infor to the loading list of loader
   *                   this parameter equals getObj.onSuccess, could be omitted
   * @param {string} n name of the module
   * @param {object} detailObj module detail infor about how to load it
   * @config {string} base this override the global base
   * @config {string} dirName directory name of the module, default is n
   * @config {string} fullPath loader will load this module by fullPath without calculation
   * @config {string} afterPath loader will load this module through
   *                  basePath + '\' + afterPath
   * @config {string} dynamic dynamic version controlled by loader
   * @config {string} dependency dependency modules which should be loaded first
   */
  __.BasicModule.add = function (n, detailObj) {
    var mod = new __.BasicModule(n, detailObj);
    this.modules[":" + n] = mod;
    return mod;
  };

  __.BasicModule.load = function (modName, getObj) {
    var loadingItem, waiting, loaded, loading, onalldependsok;

    loadingItem = this.modules[":" + modName];

    //auto create modules
    if (!loadingItem) {
      loadingItem = this.add(modName);
    }

    loadingItem = loadingItem.getURI(getObj);

    if (getObj.preload) {
      __.preLoadJs(loadingItem, getObj);
      return;
    }

    onalldependsok = getObj.onSuccess;

    loading = this.loadingMods;
    waiting = this.waitingReg;
    loaded = this.loadedMods;

    if (onalldependsok) {
//create a virtual module, put it to the list to run the callback when dependency ready
      waiting.push(['_', false, getObj.dependency, onalldependsok]);
    }

    if (loading[modName]) {
//this happens when different part of a page request the same module
//the callback is in waiting queue, no need to send new request
      return;
    }

    /*
    onload = function () {
      var wo;

      wo = _SC.waitingOnOk;

      __.each(wo, function (o, i) {
//invoke real onload by setTimeout, avoid error break, avoid 'alert' caused bug
        setTimeout(o, 0);
        delete wo[i];
      }, true);
    };
    */

//avoid duplicate load
    if (loaded[modName] !== _UNDEFINED) {
//the module is loaded, but the onalldependsok need to run,
//trigger a virtual register to check the dependency
      __.BasicModule.register('_', false);
      //onload();
      return;
    } else {
      loading[modName] = getObj;
    }

    __.loadJs(loadingItem, {
      cache : getObj.cache
      //onload : onload
    });
  };

  /**
   * register a module to the global namespace
   * the module will be ready if dependent modules are loaded
   * any callbacks depends on this module will be triggered
   * @param {string} name name of the module
   * @param {string} v version
   * @param {array} dependency dependent module names
   * @param {Function} init module init function
   */
  __.BasicModule.register = function (name, v, dependency, init) {
    var missing, waiting, loaded, loading, getObj, argus;

    loaded = this.loadedMods;

    if (loaded[name] !== _UNDEFINED) {
//do NOT allow duplicate register the same module
      return;
    }

    dependency = dependency || [];
    waiting = this.waitingReg;
    loading = this.loadingMods;
    missing = this.getMissingMods(name, dependency);

    if (loading[name] !== _UNDEFINED) {
//preserve the get obj, onLoad may be used after dependency loaded
//Update : dep loading do NOT need dependency of parent
      getObj = loading[name];
    }

    if (missing.length) {
      argus = _slice.call(arguments);
      __.each(missing, function (mname) {
        if (loaded[mname] === _UNDEFINED) {

//its dependency is not loaded, put itself to wait
//when register from module file, the init is not in waiting queue
          waiting.push(argus);

//its dependency is not loaded, load it.
//when the loading is sent from here, mean it's NOT a load param,
//but an auto dependency module, no detailObj needed
          if (loading[mname] === _UNDEFINED) {
            __.BasicModule.load(mname, {
              version : getObj && getObj.version
            });
          }
        }
      });
    } else {
//module loaing ends when all dependency meet
      delete loading[name];

      if (init) {
//attach the module
        init();
      }

      if (name !== '_') {
        loaded[name] = v;
      }

//try to register waiting dependency modules
      __.each(waiting, function (o, i) {
        if (o) {
          waiting[i] = false;
          __.BasicModule.register.apply(__.BasicModule, o);
        }
      }, true);
    }
  };

  /**
   * @param {string} mname the module which needs other modules
   * @param {array} dependency array of module names or urls
   * @return {array} array of missing dependency
   */
  __.BasicModule.getMissingMods = function (name, dependency) {
    var lm, missing = [];

    dependency = dependency || [];
    lm = this.loadedMods;

    __.each(dependency, function (mname, i) {
      if (mname === name) {
        mname = '_';
//remove the dependency for a loaded url
        dependency[i] = mname;
      }
      if (mname !== '_' && lm[mname] === _UNDEFINED) {
//its dependency is not loaded, put itself to wait
        missing.push(mname);
      }
    });

    return missing;
  };

  //get base URI from the current script src
  (function () {
    var scripts = __.doc.getElementsByTagName('script'),
      src = scripts[scripts.length - 1].src;

    __.BasicModule.prototype.baseURI =
      src.substr(0, src.lastIndexOf('/'));
  }());

  __.BasicModule.prototype.getURI = function (getObj) {
    var sBase, edition, dirName,
      detObj = this.detailObj, uri;

    getObj = getObj || {};

    sBase = detObj.base || this.baseURI;

    if (detObj.fullPath) {
      uri = detObj.fullPath;
    } else if (detObj.afterBasePath) {
      uri = [sBase, detObj.afterBasePath].join('/');
    } else {

      dirName = detObj.dirName || this.mname;

//dynamic version could be set while addModule
//after module is updated, just update addModule part
      if (detObj.dynamic) {

//a runtime version is respected
        edition = (getObj.version ? getObj.version : detObj.dynamic);

        uri = [sBase, dirName, this.mname].join('/');
        uri += '_' + edition + '.js';
      } else {

//if no dynamic version set, means this is a library package style module
//all module loaded should have the same version of the loader
//and runtime version override is allowed
        edition = __.isDebug() ? '0' :
          (getObj.version ? getObj.version : _DU_TAG);

        if (edition === '0') {
// load trunk
          sBase += '/trunk/src';
        } else {
// load special tags
          sBase += '/tags/' + edition + '/pkgs';
        }
        uri = [sBase, dirName, this.mname + '.js'].join('/');
      }
    }

    return uri;
  };
/*end: BasicModule*/

  __._loadOne = function (modOrUrl, getObj) {
    if (getObj._isMod) {
//loading a module

      __.BasicModule.load(modOrUrl, getObj);
    } else {
// loading a url

      if (!modOrUrl.match(_rHttp)) {
        modOrUrl = 'http://' + modOrUrl;
      }

      if (getObj.preload) {
        __.preLoadJs(modOrUrl, getObj);
      } else {
        __.loadJs(modOrUrl, getObj);
      }
    }
  };

  /**
   * usage : __.load('xxx', callback, obj), __.load('xxx yyy', obj)
   * callback and obj could both be ignored
   * @param {string|array} modOrUrl urls of js file or module names to
   *                                be loaded, module will be load
   *                                simultaneously, do NOT mix load url
   *                                and mod
   * @param {Function} onSuccess the onload call back, this parameter
   *                             equals getObj.onSuccess, could be omitted
   * @param {object} getObj configuration
   * @config {Function} onSuccess the onload call back
   * @config {string} version version, 0 mean trunk
   * @config {boolean} cache add a random get param to the url
   * @config {string} charset default utf-8
   * @config {boolean} preload download the script without exec,
   *                           default false
   */
  __.load = function (modOrUrl, getObj) {
    var tmp, i, j, loaded, isfirst, modorurlarray,
      dopreload = false;

    getObj = getObj || {};

    if (typeof getObj === 'function') {
      tmp = arguments[2] || {};
      tmp.onSuccess = getObj;
      getObj = tmp;
    }

    if (typeof modOrUrl === 'string') {
      modorurlarray = modOrUrl.split(' ');
    } else {
      modorurlarray = _slice.call(modOrUrl);
    }

    isfirst = getObj._isMod === _UNDEFINED;

    if (isfirst) {
      getObj._isMod = _rModName.test(modorurlarray[0]);
    }

    if (getObj._isMod) {
      getObj._isMod = true;

      //wrap the onload callback to avoid duplicate exec
      if (getObj.onSuccess) {
        tmp = getObj.onSuccess;
        loaded = false;
        getObj.onSuccess = function () {
          if (!loaded) {
            loaded = true;
            tmp();
          }
        };
      }
    } else {
      if (getObj.onSuccess) {
        if (isfirst) {
          getObj.onAllLoad = getObj.onSuccess;
          dopreload = getObj.preload === true ? true : false;
        }

        getObj.onSuccess = function () {
          modorurlarray.shift();
          if (modorurlarray.length === 0) {
            getObj.onAllLoad();
          } else {
            __.load(modorurlarray, getObj);
          }
        };
      }
    }

    getObj.dependency = getObj.dependency || modorurlarray;

    __.each(modorurlarray, function (o, i) {
      if (i > 0) {
        if (dopreload) {
          __._loadOne(o, {
            preload : true,
            version : getObj.version
          });
        }
      } else {
        setTimeout(function () {
          __._loadOne(o, getObj);
        }, 0);
      }
    });
  };

  __.each('load widget app'.split(' '), function (o) {
    __.exportPath('__.' + o);
  });

  //_register('loader', _CFG[2]);

}(this));
