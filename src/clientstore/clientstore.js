/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules clientstore
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:clientStore*/
__.BasicModule.register('clientstore', '0.4.0', ['lang'], function () {
  "use strict";

  __.exportPath('__.clientStore');

  __.clientStore._inited = false;

  __.clientStore._store = null;

  __.clientStore._searchOrder = [
    'localStorage', 'userData', 'globalStorage'
  ];

  __.clientStore._engines = {
    localStorage : {
      test : function () {
        return __.global.localStorage ? true : false;
      },
      init : function () {
        __.clientStore._store = __.global.localStorage;
      },
      get : function (key) {
        return __.clientStore._store.getItem(key);
      },
      set : function (key, value) {
        return __.clientStore._store.setItem(key, value);
      },
      del : function (key) {
        return __.clientStore._store.removeItem(key);
      }
    },
    globalStorage : {
      test : function () {
        return __.global.globalStorage ? true : false;
      },
      init : function () {
        __.clientStore._store = __.global.globalStorage[__.doc.domain];
      },
      get : function (key) {
        return __.clientStore._store.getItem(key).value;
      },
      set : function (key, value) {
        return __.clientStore._store.setItem(key, value);
      },
      del : function (key) {
        return __.clientStore._store.removeItem(key);
      }
    },
    userData : {
      test : function () {
        return __.global.ActiveXObject ? true : false;
      },
      init : function () {
        try {
          __.clientStore._store = __.doc.documentElement;
          __.clientStore._store.addBehavior('#default#userdata');
        } catch (e) {}
      },
      get : function (key) {
        var result;
        try {
          __.clientStore._store.load(key);
          result = __.clientStore._store.getAttribute(key);
        } catch (e) {result = '';}
        return result;
      },
      set : function (key, value) {
        try {
          __.clientStore._store.load(key);
          __.clientStore._store.setAttribute(key, value);
          __.clientStore._store.save(key);
        } catch (e) {}
      },
      del : function (key) {
        try {
          __.clientStore._store.load(key);
          __.clientStore._store.expires =
            new Date(315532799000).toUTCString();
          __.clientStore._store.save(key);
        } catch(e) {}
      }
    }
  };

  __.clientStore._init = function () {
    var idx, eng;

    __.clientStore._inited = true;

    idx = __.lang.find(__.clientStore._searchOrder, function (o) {
      eng = __.clientStore._engines[o];
      return eng.test();
    });

    if (idx !== -1) {
      try {
        eng.init();
        delete eng.test;
        delete eng.init;

        __.extend(__.clientStore, eng, true);
      } catch (e) {}
    }
  };

  __.clientStore.set = function () {
    if (!__.clientStore._inited) {
      __.clientStore._init();

      return __.clientStore.set.apply(__.clientStore, __.lang.a(arguments));
    }
  };

  __.clientStore.get = function () {
    if (!__.clientStore._inited) {
      __.clientStore._init();

      return __.clientStore.get.apply(__.clientStore, __.lang.a(arguments));
    }
  };

  __.clientStore.del = function () {
    if (!__.clientStore._inited) {
      __.clientStore._init();

      return __.clientStore.del.apply(__.clientStore, __.lang.a(arguments));
    }
  };

});
/*end:clientStore*/
