/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules History
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:history*/
__.BasicModule.register('history', '0.4.0', ['lang', 'event'], function () {
  "use strict";

  __.History = function (conf) {
    var initState;

    if (__.History._theInstance) {
      return __.History._theInstance;
    }

    __.History._theInstance = this;

    conf = conf || {};

    this._initEvents();

    if (__.History.useIframe) {
      this._initIframe();
    }

    initState = conf.initState || this._parseHash();

    this._resolveChanges(initState);
  };

  __.History.nativeHashChange =
    (!__.lang.isUndefined(__.global.onhashchange) ||
    __.doc.onhashchange) &&
    (!__.doc.documentMode || __.doc.documentMode > 7);

  __.History.useIframe = __.ua.ie && !__.History.nativeHashChange;

  __.History.prototype._iframe = null;

  __.History.prototype._globalPollingId = null;

  __.History.prototype.state = {};

  __.History.prototype._parseHash = function () {
    var hash, results, params, decode = this.decode;

    hash = this.getHash();

    results = hash.split(__.lang.getReg('&(?!amp;)'));

    //__.History.prototype.REGEX_HASH = __.lang.getReg('([^\\?#&]+)=([^&]+)', 'g');

    params = {};

    __.each(results, function (o) {
      o = o.split('=');
      if (o.length === 2) {
        params[decode(o[0])] = decode(o[1]);
      }
    });

    return params;
  };

  __.History.prototype._resolveChanges = function (newStat, doNoSet) {
    var isChanged,
      oldState = this.state,
      changed = {},
      removed = {};

    if (!newStat) {
      newStat = {};
    }

    __.each(newStat, function (value, key) {
      var oldv = oldState[key];
      if (value !== oldv) {
        changed[key] = {
          newVal : value,
          oldVal : oldv
        };
        isChanged = true;
      }
    }, true);

    __.each(oldState, function (oldvalue, key) {
      if (__.lang.isUndefined(newStat[key]) || newStat === null) {
        removed[key] = oldvalue;
        isChanged = true;
      }
    }, true);

    if (isChanged) {
      this._trigger({
        changed : changed,
        removed : removed,
        newState : newStat,
        oldState : oldState
      }, doNoSet);
    }
  };

  __.History.prototype._trigger = function (changed, doNoSet) {
    this.state = changed.newState;

    if (!doNoSet) {
      this.setHash(this.createHash(changed.newState));
    }

    this._fire(changed);
  };

  __.History.prototype._handleChange = function (e) {
    this._resolveChanges(this._parseHash(), true);
  };

  __.History.prototype._fire = function (changes) {
    __.event.fire(__.doc, 'du-history:change', {
      changed : changes.changed,
      newVal  : changes.newState,
      oldVal : changes.prevState,
      removed : changes.removed
    });
  };

  __.History.prototype._updateIframe = __.History.useIframe ?
    function (hash) {
      var iframeDoc, iframeLocation;

      if (this._iframe) {
        iframeDoc = this._iframe.contentWindow.document;
        iframeLocation = iframeDoc.location;

        iframeDoc.open().close();

        iframeLocation.hash = hash;
      }
    } : null;

  __.History.prototype.createHash = function (params) {
    var encode = this.encode,
      hash   = [];

    __.each(params, function (value, key) {
      hash.push(encode(key) + '=' + encode(value));
    }, true);

    return hash.join('&');
  };

  __.History.prototype.setHash = function (hash) {
    if (hash.charAt(0) === '#') {
      hash = hash.substr(1);
    }

    location.hash = hash;

    if (__.History.useIframe) {
      this._updateIframe(hash);
    }
  };

  __.History.prototype.getHash = __.ua.gecko ? function () {
    var matches = location.href.match(__.lang.getReg('#(.*)$')),
      hash = (matches && matches[1]) || '';

    return hash;
  } : function () {
    var hash = (this._iframe ? this._iframe.contentWindow.location :
      location).hash.substr(1);

    return hash;
  };

  __.History.prototype.getUrl = __.History.useIframe ? function () {
    var hash = this.getHash();

    if (hash && hash !== location.hash.substr(1)) {
      return location.href.replace(__.lang.getReg('#.*$'), '') + '#' + hash;
    } else {
      return location.href;
    }
  } : function () {
    return location.href;
  };


  __.History.prototype.decode = function (str) {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  };

  __.History.prototype.encode = function (str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
  };

  __.History.prototype.addEntry = function (key, value) {
    var stat = {};

    __.each(this.state, function (value, key) {
      stat[key] = value;
    }, true);

    stat[key] = String(value);
    this._resolveChanges(stat);
  };

  __.History.prototype.setStat = function (stat) {
    var st = {};
    __.each(stat, function (value, key) {
      st[key] = value;
    }, true);
    this._resolveChanges(st);
  };

  __.History.prototype._initIframe = function () {
    var that = this;
    if (!this._iframe) {
      __.event.onReady(function () {
        this._iframe = __.doc.createElement('<iframe src="javascript:0" style="display:none" height="0" width="0" tabindex="-1" title="empty"/>');

        // Keeping it outside the body prevents scrolling on the initial page load 
        __.doc.documentElement.appendChild(this._iframe);

        // Update the iframe with the initial location hash, if any. This
        // will create an initial history entry that the user can return to
        // after the state has changed.
        that._updateIframe(location.hash.substr(1));
      });
    }
  };

  __.History.prototype._initEvents = function () {
    var oldHash, that = this;

    oldHash = this.getHash();

    if (__.History.nativeHashChange) {
      __.event.on(__.global, 'hashchange',
        __.event.bind(this._handleChange, this));
    } else if (!this._globalPollingId) {
      if (__.ua.webkit &&
          navigator.userAgent.indexOf('Chrome') === -1 &&
          navigator.vendor.indexOf('Apple') !== -1) {
        __.event.on(__.global, 'unload', function () {});
      }
      this._globalPollingId = setInterval(function () {
        var newhash = that.getHash();
        if (newhash !== oldHash) {
          oldHash = newhash;
          that._handleChange();
        }
      }, 50);
    }
  };

});
/*end:history*/
