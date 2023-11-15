/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @modules cookie
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:cookie*/
__.BasicModule.register('cookie', '0.4.0', [], function () {
  "use strict";

  __.exportPath('__.cookie');

  /**
   * Gets a cookie's value
   * @param {String} name The name of the cookie to get
   * @return {String} The cookie's value, or false if it can't find the cookie
   * @member cookies
   * @return String
   * @public
   */
  __.cookie.get = function (name) {

    var cookie = __.doc.cookie,
      end,
      pre = name + '=',
      begin  = cookie.indexOf('; ' + pre),
      result;

    if (begin === -1) {
      begin = cookie.indexOf(pre);
      if (begin !== 0) {
        return '';
      }
    } else {
      begin += 2;
    }

    end = cookie.indexOf(';', begin);
    if (end === -1) {
      end = cookie.length;
    }

    cookie = cookie.substring(begin + pre.length, end);
    try {
      result = decodeURIComponent(cookie);
    } catch (e) {
      result = cookie;
    }
    return result;
  };


  /**
   * Removes a cookie that has already been set
   * @param {String} name The name of the cookie to remove
   * @param {String} path The path of the cookie to remove
   * @param {String} domain The domain of the cookie to remove
   * @member cookies
   * @public
   */
  __.cookie.del = function (name, path, domain) {

    var cookie = name + '=';

    if (!__.cookie.get(name)) {
      return;
    }

    if (path) {
      cookie += '; path=' + path;
    }

    if (domain) {
      cookie += '; domain=' + domain;
    }

    cookie += '; expires=Thu, 01-Jan-70 00:00:01 GMT';

    __.doc.cookie = cookie;
  };

  /**
   * Tells the browser to set a cookie
   * @param {String} name The name of the cookie to set
   * @param {String} value The value to set in the cookie
   * @param {Object} config extra parameters expires, path, domain, secure
   * @config {integer} expires The date that the cookie expires (value of Date.valueOf)
   * @config {String} path The path of the cookie to set
   * @config {String} domain The domain of the cookie to set
   * @config {Boolean} secure Whether to make the cookie secure or not
   * @member cookies
   * @public
   */
  __.cookie.set = function (name, value, config) {
    var cookie, tmp;

    config = config || {};

    cookie = name + '=' + encodeURIComponent(value);

    if (config.expires) {
      tmp = config.expires;
      if (!tmp.toGMTString) {
        tmp = new Date(tmp);
      }
      cookie += '; expires=' + tmp.toGMTString();
    }
    if (config.path) {
      cookie += '; path=' + config.path;
    }
    if (config.domain) {
      cookie += '; domain=' + config.domain;
    }
    if (config.secure) {
      cookie += '; secure';
    }

    __.doc.cookie = cookie;
  };
});
/*end:cookie*/

