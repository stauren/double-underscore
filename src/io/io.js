/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules io
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:io*/
__.BasicModule.register('io', '0.4.0', ['lang'], function () {
  "use strict";

  var _UNDEFINED;

  __.exportPath('__.io');

  /**
   * function to start a ajax request
   * @param {string} url the url to send xhr request
   * @param {object} config the config object
   * @config {function} onOk the success handler
   * @config {function} onFail the fail handler
   * @config {integer} timeout the timeout milliseconds
   * @config {boolean} async
   * @config {object} headers {headername:'headercontent'}
   * @config {string|object} post the post string or object, object will
   *                         be auto json encoded ignore oPost param to
   *                         start a GET request
   */
  __.io.Ajax = function (url, config) {
    config = config || {};
    this.base = url;

//set default timeout to 60 seconds
    this.timeout = config.timeout || 60000;
    this.onOk = config.onOk;
    this.onFail = config.onFail;
    this.async = __.lang.isBoolean(config.async) ? config.async : true;

    if (config.post) {
      this.method = 'POST';
      this.post = config.post;
    } else {
      this.method = 'GET';
    }

    this.id = ++__.io.Ajax.uidCount;

    this.headers = __.lang.mergeObj(this.defaultHeaders,
      config.headers || {});
  };

  __.io.Ajax.uidCount = 0;

  __.io.Ajax.pollingWait = 50;

  __.io.Ajax.prototype.defaultHeaders = {
    "Content-Type" : "application/x-www-form-urlencoded"
  };

  __.io.Ajax.prototype.getTransport = function () {
    var i, j, t, transports = [
      function () {return new XMLHttpRequest(); },
      function () {return new ActiveXObject('Microsoft.XMLHTTP'); },
      function () {return new ActiveXObject('Msxml2.XMLHTTP'); }
    ];

    for (i = 0, j = transports.length; i < j; ++i) {
      try {
        t = transports[i]();
        if (t) {
          __.io.Ajax.prototype.getTransport = transports[i];
          return t;
        }
      } catch (e) {}
    }
  };

  __.io.Ajax.prototype.setupPolling = function () {
    var that = this, count = 0;

    this.iid = setInterval(function () {
      count++;
      if (count * __.io.Ajax.pollingWait > that.timeout) {
        that.stop();
        that.xhr.isTimeout = true;
        that.onFail(that.xhr);
      } else if (that.xhr.readyState === 4) {
        that.stop();
        if (that.xhr.status === 200) {
          that.onOk(that.xhr);
        } else {
          that.onFail(that.xhr);
        }
      }
    }, __.io.Ajax.pollingWait);
  };

  __.io.Ajax.prototype.setHeaders = function () {
    var xhr = this.xhr;

    __.each(this.headers, function (o, i) {
      xhr.setRequestHeader(i, o);
    }, true);
  };

  __.io.Ajax.prototype.prepare = function () {
    var post = this.post;

    if (post) {
      this.post = __.lang.isString(post) || !JSON ?
          post : JSON.stringify(post);
    }

    this.xhr = this.getTransport();

    this.xhr.open(this.method, this.base, this.async);

    this.setHeaders();
  };

  __.io.Ajax.prototype.send = function () {
    this.xhr.send(this.post);
    this.setupPolling();
  };

  __.io.Ajax.prototype.stop = function () {
    if (this.iid) {
      clearInterval(this.iid);
      this.iid = null;
    }
  };

  __.io.Ajax.prototype.abort = function () {
    this.stop();
    if (this.xhr.abort) {
      this.xhr.abort();
    }
  };

  __.io._ajaxManager = {

    _uidCount : 0,

    _maxThread : __.ua.ie && __.ua.ie < 8 ? 2 : 4,

    _waiting : [],

    _requesting : [],

    /**
     * @example
     *  var i=0;
     *  for(var j=0;j<=10;j++)
     *    __.io.doAjax({
     *      sUrl : '/behavior/rpc?doc&t='+Math.random(),
     *      onOk : function(o) {
     *        console.log(i++);
     *      }
     *    })
     * @param {object} oDetail detail ajax config
     * @config {string} sUrl the url to be requested
     * @config {object} oGet name value pair of get parameters
     * @config {object} sPost the post content, will auto be json encode
     * @config {integer} timeout timeout of the request, milliseconds
     * @config {boolean} cache cache or not, default true, set to false will
     *                         append a random number to the url
     * @config {function} onOk on success handler
     * @config {function} onFail on failure handler
     * @config {dom|id|selector} target response will be target's innerHTML
     */
    push : function (oDetail) {
      oDetail.cache = __.lang.isBoolean(oDetail.cache) ?
        oDetail.cache : true;

      oDetail._duAmUid = ++this._uidCount;

      this._waiting.push(oDetail);

      this._try2Send();

      return oDetail._duAmUid;
    },

    abort : function (uid) {
      var aborted = false, idx;

      idx = __.find(this._waiting, function (o) {
        return o._duAmUid === uid;
      });

      if (idx > -1) {
        __.lang.arrayRemove(this._waiting, idx);
        aborted = true;
      } else {
        __.each(this._requesting, function (o) {
          if (o._duAmUid === uid) {
            o.abort();
            aborted = true;
          }
        });
      }

      return aborted;
    },

    _try2Send : function () {
      var newReqDetail, ajaxObj;

      if (this._requesting.length >= this._maxThread) {
        //do not send
        return;
      }

      while (this._waiting.length) {
        newReqDetail = this._waiting.shift();
        if (newReqDetail) {
          ajaxObj = this._send(newReqDetail);
          this._requesting.push(ajaxObj);
          break;
        }
      }
    },

    _send : function (oDetail) {
      var url, obj,
        realOnOk = oDetail.onOk,
        realOnFail = oDetail.onFail;

      oDetail.onOk = oDetail.onFail = __.io._ajaxManager._finish;

      url = this._makeUrl(oDetail.sUrl, oDetail.oGet, oDetail.cache);

      obj = new __.io.Ajax(url, oDetail);

      obj.onOk2 = realOnOk;
      obj.onFail2 = realOnFail;
      obj.target = oDetail.target;
      obj._duAmUid = oDetail._duAmUid;

      obj.prepare();

      obj.send();

      return obj;
    },

    _finish : function (xhr) {
      var that = __.io._ajaxManager,
        stillRequesting = [],
        theAjaxObj,
        resTxt,
        idx;

      idx = __.lang.find(that._requesting, function (o) {
        return o.xhr === xhr;
      });

      if (idx !== -1) {
        theAjaxObj = that._requesting[idx];
        __.lang.arrayRemove(that._requesting, idx);
      }

      if (xhr.readyState === 4 && xhr.status === 200) {
        resTxt = xhr.responseText;
        if (theAjaxObj.target) {
          if (__.dom) {
            __.dom.fillText(__.dom.f(theAjaxObj.target), resTxt);
          } else {
            theAjaxObj.target.innerHTML = '';
            theAjaxObj.target.appendChild(__.doc.createTextNode(resTxt));
          }
        }
        if (theAjaxObj.onOk2) {
          theAjaxObj.onOk2(resTxt, xhr);
        }
      } else {
        __.lang.log('xmlhttp request #' + theAjaxObj.id + ' failed');
        if (theAjaxObj.onFail2) {
          theAjaxObj.onFail2(xhr);
        }
      }

      that._try2Send();

      xhr = null;
      theAjaxObj = null;
      that = null;
    },

    _makeUrl : function (sUrl, oGet, bCache) {
      if (oGet || !bCache) {
        if (sUrl.indexOf('?') < 0) {
          sUrl += '?';
        }
        if (!bCache) {
          sUrl += '&_durd=' + Math.random();
        }
        if (oGet) {
          __.each(oGet, function (v, n) {
            sUrl += ['&', encodeURIComponent(n), '=',
              encodeURIComponent(v)].join('');
          }, true);
        }
      }
      //return encodeURI(sUrl);
      return sUrl;
    }
  };

  /**
   * a wrap of the __.io._ajaxManager.push method, provide easier parameter format
   * @param {string|object} sUrl the requesting url or the request object
   * @param {function|object} onOk the on success callback or the request object
   * @param {object} obj the request object, equals the only param of ajaxManager.push
   */
  __.io.ajax = function (sUrl, onOk, obj) {
    obj = obj || {};

    if (__.lang.isFunction(onOk)) {
      obj.onOk = onOk;
    } else if (__.lang.isObject(onOk)) {
      obj = onOk;
    }

    if (__.lang.isObject(sUrl)) {
      obj =  sUrl;
    } else if (__.lang.isString(sUrl)) {
      obj.sUrl = sUrl;
    }
    __.io._ajaxManager.push(obj);
  };

});
/*end:io*/
