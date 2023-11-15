/*!
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 * @version:2.0
 */

/**
 * module fn-cronloader
 * @example var oCron = new __.FnCronLoader(); oCron.addJob()
 * @file fn-cronloader.js
 * @class __.FnCronLoader
 */

/*begin:fn-cronloader*/
__.BasicModule.register('fn-cronloader', '2.0.0', ['lang', 'dom', 'fn-table', 'clientstore'], function () {
  "use strict";

  var _UNDEFINED;

  /**
   * push data loader, will need a a server to cooperate
   * request such as:
   * GET http://example.com/q=sh000002&r=187242670 HTTP/1.1
   * Connection: Keep-Alive
   *
   * should get:
   * HTTP/1.1 200 OK
   * Content-Length: 21
   * Connection: Keep-Alive
   * Content-Type: application/x-javascript
   * Cache-Control: must-revalidate
   * Expires: Mon, 01 Sep 1980 06:51:02 GMT
   * Etag: 1285585161-0
   *
   * pv_sh000002="2-909";
   *
   * if request header "If-None-Match: 1285585156-0 header"
   * is presented and matched, response should halt until new data arrive
   * constructor of Class __.FnCronLoader
   * @constructor
   * @param {object} confObj config object
   * @config {string} pushDummy dummy iframe html url
   * @config {array} pushBases push server base url
   * @config {integer} max max data loading cycle, default 3600*24*30
   * @config {boolean} autoCache set to true will save the data to cache
   */
  __.FnCronLoader = function (confObj) {

    confObj = confObj || {};

    if (confObj.pushBases) {
      //push bases are shared between all instances
      __.FnCronLoader.pushBases = confObj.pushBases;
    }

    if (confObj.pushDummy) {
      __.FnCronLoader.pushDummy = confObj.pushDummy;
    }

    this._maxCount = confObj.max || 3600 * 24 * 2;//2 days

    this._autoCache = confObj.autoCache === true ? true : false;

    this._idIntv = null;
    this.stop();
  };

  __.FnCronLoader.version = '2.0.0';

  __.FnCronLoader.QT_LIMIT = 60;

  __.FnCronLoader.PUSH_LIMIT = 60;

  __.FnCronLoader.NO_MATCH = 'pv_none_match';

  __.FnCronLoader.TIME_OUT = 'pv_timeout';

  __.FnCronLoader.defaultInterval = 5;

  __.FnCronLoader.pushDummy = './pushiframe.html';

  __.FnCronLoader.pushBases = [
    'http://push1.example.com/q=',
    'http://push2.example.com/q=',
    'http://push3.example.com/q='
  ];

  __.FnCronLoader._pushInited = false;

  /**
   * invisible push data-loading iframe container
   * @type object
   */
  __.FnCronLoader._pushIfrCtn = null;


  /**
   * push iframe array
   * @type array
   */
  __.FnCronLoader._aIframes = [];

  /**
   * unique count of a job in any job created
   * @type integer
   */
  __.FnCronLoader.prototype._jobUidIdx = 0;

  /**
   * count of push requests which come back in less that 1 sec
   * @type integer
   */
  __.FnCronLoader.prototype._fastCount = 0;


  /**
   * every push request will be delayed before sent, millisec
   * @type integer
   */
  __.FnCronLoader.prototype._defSendDelay = 100;

  __.FnCronLoader.prototype.pushSessions = [];

  __.FnCronLoader._initPush = function () {
    this._pushInited = true;
    this._pushIfrCtn = __.dom.addEl({
      css : 'position:absolute;visibility:hidden;top:0;left:0;height:0;width:0;'
    }, __.doc.body);
  };

  __.FnCronLoader._createIfr = function () {
    var ifr = __.dom.addEl({
      tag : 'iframe',
      id : 'du-push-ifr' + this._aIframes.length,
      css : 'height:0;width:0;border:0;'
    }, this._pushIfrCtn);

    this._aIframes.push(ifr);

    return ifr;
  };

  __.FnCronLoader._getIframe = function (refresh) {
    var ret, ary = this._aIframes;

/*
    if (__.ua.ie) {
//all request in ie use the same iframe
      ret = ary.length > 0 ? 0 : -1;
    } else {
      ret = __.lang.findByAttr(ary, 'className', '');
    }
*/
    ret = __.lang.findByAttr(ary, 'className', '');

    if (ret === -1) {
      ret = this._createIfr();
    } else {
      ret = ary[ret];
    }

    if (refresh || !ret.src) {
      ret.src = this._getDummySrc();
    }

    ret.className = 'active';
    return ret;
  };

  __.FnCronLoader._getDummySrc = function () {
    return this.pushDummy + '?_u=' + (new Date()) % 1e5 + Math.random();
  };

  __.FnCronLoader._purgeIframe = function (ifr, refresh) {
    if (ifr) {
      ifr.className = '';
      if (refresh) {
        if (ifr.contentWindow) {
          ifr.contentWindow.__ = null;
        }
        ifr.src = this._getDummySrc();
      }
      ifr = null;
    }
  };

  __.FnCronLoader.setCache = function (data) {
    var time = +new Date();

    __.each(data, function (o, i) {
      __.clientStore.set('du-cl~' + i, time + '~' + o);
    }, true);
  };

  /**
   * get quotes data from localStorage by keys
   * @param {integer} validTimeRange a integer of milliseconds, only data
   *                  saved within validTimeRange milliseconds will be
   *                  returned. set validTimeRange to 0(default) to avoid
   *                  this check
   */
  __.FnCronLoader.getCache = function (keys, validTimeRange) {
    var time, tmp, item,
      data = {};

    validTimeRange = parseInt(validTimeRange, 10);
    if (!__.lang.isInt(validTimeRange) || validTimeRange < 0) {
      validTimeRange = 0;
    }

    time = +new Date();

    __.each(keys, function (o) {
      item = null;
      tmp = __.clientStore.get('du-cl~' + o);
      if (tmp) {
        tmp = tmp.split('~');
        if (validTimeRange === 0 ||
            time - tmp[0] <= validTimeRange) {
          tmp.shift();
          item = tmp.join('~');
        }
      }
      data[o] = item;
    });

    return data;
  };

  __.FnCronLoader.prototype._getPushBase = function () {
    var count = __.FnCronLoader.pushBases.length,
      lastnum = parseInt(__.clientStore.get('du_push_id'), 10),
      currentnum;

    if (__.lang.isInt(lastnum)) {
      currentnum = (lastnum + 1) % count;
    } else {
      currentnum = __.lang.rand(count);
    }

    __.clientStore.set('du_push_id', String(currentnum));

    return __.FnCronLoader.pushBases[currentnum];
  };

  __.FnCronLoader.prototype.getJobById = function (id, isPush) {
    var job, idx;

    if (isPush === true) {
      job = this.jobs[0];
      idx = __.lang.isArray(job) ? __.lang.findByAttr(job, 'id', id) : -1;
      if (idx === -1) {
        return null;
      }
    } else {
      job = this.jobs[id.split('-')[1]];
      idx = __.lang.isArray(job) ? __.lang.findByAttr(job, 'id', id) : -1;
      if (idx === -1) {
        return this.getJobById(id, true);
      }
    }
    return job[idx];
  };

  /**
   * @param {string} id Run job with this id. if no id is passed,
   *                    all jobs are checked.
   */
  __.FnCronLoader.prototype._doPolling = function (id) {
    var that = this,
      nameAry = [],
      newAry,
      pass = true,
      count = this.pollingCount,
      allKeys = [],
      callbacks = [],
      ids = [],
      data = {},
      runner = function () {
        if (nameAry.length > 0) {
          newAry = nameAry.splice(__.FnCronLoader.QT_LIMIT, nameAry.length);
          nameAry = newAry;
          __.fnTable.load(nameAry.join(','), runner);
        } else {
          __.each(allKeys, function (o) {
            var k = 'v_' + o, v;

            v = __.global[k];
            if (v !== _UNDEFINED && v !== null) {
              data[o] = v;
              __.global[k] = null;
            }
          });

          that._onDataLoaded(data, ids);
        }
      };

    if (!id) {
      __.each(this.jobs, function (o, i) {
        if (i > 0 && count % i === 0) {
          __.each(o, function (oo, ii) {
            var result;
            result = oo.judge(count);
            if ((result & 1) === 1 && oo.keys) {
              pass = false;
              allKeys = allKeys.concat(oo.keys);
            }
            if ((result & 2) === 2) {
              ids.push(oo.id);
            }
          });
        }
      }, true);
    } else {
      __.each(this.jobs[id.split('-')[1]], function (oo, ii) {
        var result;
        if (oo.id === id) {
          result = oo.judge(0);
          if (oo && (result & 1) === 1 && oo.keys) {
            pass = false;
            allKeys = allKeys.concat(oo.keys);
          }
          if ((result & 2) === 2) {
            ids.push(id);
          }
        }
      });
    }

    if (!pass || callbacks.length > 0) {

      if (allKeys.length === 0) {
        runner();
      } else {
        nameAry = allKeys = __.lang.unique(allKeys);
        newAry = nameAry.splice(__.FnCronLoader.QT_LIMIT, nameAry.length);
        __.fnTable.load(nameAry.join(','), runner);
        nameAry = newAry;
      }
    }
  };

  __.FnCronLoader.prototype._consumePushJob = function () {
    var keys, ids, sessionId,
      jb = this.jobs[0],
      unassigned = [],
      pushLimit = __.FnCronLoader.PUSH_LIMIT,
      remainkeys,
      tmp;

    __.each(jb, function (o) {
      if (__.lang.isUndefined(o.sessionId)) {
        unassigned.push(o.id);
      }
    });

    while (unassigned.length) {
      keys = [];
      ids = [];

      while (unassigned.length) {
        tmp = this.getJobById(unassigned[0], true);
        //tmp = jb[__.lang.findByAttr(jb, 'id', unassigned[0])];

        if (tmp.keys.length >= pushLimit) {
//split the big job into several sessions
          if (keys.length) {
//there are unassigned jobs waiting for merge
//break here to assign and update the session to simplify the logic
//another merge may be done in _assignSession
            break;
          }
          if (!remainkeys) {
            remainkeys = __.lang.a(tmp.keys);
          }
          ids.push(tmp.id);
          if (remainkeys.length > pushLimit) {
            keys = remainkeys.splice(0, pushLimit);
            break;
          } else {
            keys = remainkeys;
            remainkeys = null;
            unassigned.shift();
          }
        } else if (tmp.keys.length + keys.length <= pushLimit) {
//merge multiple push jobs into a single session(unassigned job merge
//first, the merge with jobs in session
          unassigned.shift();
          keys = keys.concat(tmp.keys);
          ids.push(tmp.id);
        } else {
          break;
        }
      }
      this._updateSession(this._assignSession(keys, ids));
    }
  };

  __.FnCronLoader.prototype._assignSession = function (keys, ids) {
    var id, tmp, session,
      that = this;

    id = __.lang.find(this.pushSessions, function (o) {
      tmp = [];
      tmp = __.lang.unique(tmp.concat(o.keys).concat(keys));
      return tmp.length <= __.FnCronLoader.PUSH_LIMIT;
    });

    if (id === -1) {
      id = this.pushSessions.length;
      this.pushSessions.push({
        keys : keys,
        ids : ids,
        id : id
      });
    } else {
      session = this.pushSessions[id];
      session.ids = session.ids.concat(ids);
      session.keys = tmp;
    }

    __.each(ids, function (o) {
      var job = that.getJobById(o);
      if (job.sessionId) {
        job.sessionId.push(id);
      } else {
        job.sessionId = [id];
      }
      //jb[__.lang.findByAttr(jb, 'id', o)].sessionId = id;
    });

    return id;
  };

  __.FnCronLoader.prototype._updateSession = function (id, reCalculateKeys) {
    var keys, session, alljobs;

    alljobs = this.jobs[0];
    session = this.pushSessions[id];

    //_remPushJob only remove id from session.ids, recalculate keys here
    if (reCalculateKeys) {
      keys = [];
      __.each(session.ids, function (o) {
        keys.push(alljobs[o].keys);
      });
      keys = __.lang.unique(keys);
      session.keys = keys;
    } else {
      keys = session.keys;
    }

    session.running = true;
    session.iframe = null;

    session.url = this._getPushBase() + keys.join(',') + '&m=push&r=' +
      (+new Date()) % 1e5 + __.lang.rand(10000);
    this._sendPushReq(id);
  };

  __.FnCronLoader.prototype._sendPushReq = function (id) {
    var oldIfr, session, that = this,
      nomatch = __.FnCronLoader.NO_MATCH,
      timeout = __.FnCronLoader.TIME_OUT;
    session = this.pushSessions[id];

    if (this._paused || !session || !session.running ||
        this.pushCount > this._maxCount) {
      return;
    }

    if (__.ua.webkit) {
      oldIfr = session.iframe;
      delete session.iframe;
    }

    if (!session.iframe) {
      session.iframe = __.FnCronLoader._getIframe();
    }

    session.pushCount = ++this.pushCount;

    __.lang.toCall(function () {
      var reqWin = session.iframe.contentWindow,
        starttime,
        idu;

      if (!reqWin || !reqWin.__) {
        //TODO error handling?
        if (!that._paused) {
          that._delayPushReq(id);
        }
        reqWin = null;
        session = null;
        that = null;
        return;
      }

      starttime = +new Date();
      reqWin.reqCount = session.pushCount;
      idu = reqWin.__;

/*
      if (delayId) {
        clearTimeout(delayId);
      }

      //if there is no response after 75 secs, send new request
      delayId = _WIN.setTimeout(function() {
        if (ifr.contentWindow.reqCount === i) {
          doListen(true);
        }
      }, 75000);
*/

      idu.load(session.url, function () {
        var data = {}, k;

        if (that._paused || !session || !session.running) {
          return;
        }

        if (reqWin[nomatch] === 1) {
          //404, wrong request, throw error
          reqWin[nomatch] = 0;
          //TODO switch to qt request?
          throw new Error('No data for:' + session.keys.join(','));
        } else if (reqWin[timeout] === 1) {
          //60 server timeout, do reload
          reqWin[timeout] = 0;
          that._delayPushReq(id);
        } else if (reqWin.reqCount === session.pushCount) {
//this is the newest request
          if (new Date() - starttime < 1000) {
            that._fastCount++;
          } else {
            that._fastCount = 0;
          }

          __.each(session.keys, function (o) {
            k = 'pv_' + o;
            if (reqWin[k] !== _UNDEFINED && reqWin[k] !== null) {
              data[o] = reqWin[k];
              reqWin[k] = _UNDEFINED;
            }
          });

          that._onDataLoaded(data, session.ids, session.id);
          that._delayPushReq(id);
          reqWin = null;
          idu = null;
          data = null;
          session = null;
          that = null;
        }
      }, {
        charset : 'gbk',
        cache : true
      });

//purge the old iframe after the data request is sent
      if (oldIfr) {
        __.FnCronLoader._purgeIframe(oldIfr, true);
        oldIfr = null;
      }
    }, function () {
      var result;
      try {
        //ie may throw Access is denied err
        result = session.iframe.contentWindow &&
          session.iframe.contentWindow.__;
      } catch (e) {}
      return !!result;
    }, 100);
  };

  __.FnCronLoader.prototype._delayPushReq = function (id) {
    var that = this, delay = this._defSendDelay;

    //Exponential backoff
    delay = delay * Math.pow(2, Math.floor(this._fastCount / 2));

    try {
      setTimeout(function () {
        that._sendPushReq(id);
      }, delay);
    } catch (e) {}
  };

  __.FnCronLoader.prototype._onDataLoaded = function (data, ids, pushSessionId) {
    var job, count,
      that = this,
      isPush = __.lang.isInt(pushSessionId);

    count = isPush ? that.pushCount : that.pollingCount;

    if (this._autoCache) {
      __.FnCronLoader.setCache(data);
    }

    __.each(ids, function (o) {
      job = that.getJobById(o, isPush);

      if (job) {
        //try {
          if (job && job.onData) {
            //_log('cron job '+ i+' done.');
            if (!job.__created ||
                (isPush && !job.__created[pushSessionId])) {
              job.onData(data, count);
              if (isPush) {
                job.__created[pushSessionId] = true;
              } else {
                job.__created = true;
              }
              if (job.runOnce) {
                //that.jobs[i] = null;
                that.remJob(job.id);
              }
            } else {
              if (job.onUpdate) {
                job.onUpdate(data, count);
              } else {
                job.onData(data, count);
              }
            }
          }
          /*
        } catch (er) {
          if (__.isDebug()) {
            __.lang.log('Cron job ' + o.id + ' failed.');
            if (__.global.console) {
              console.log(er);
            }
          }
        }
        */
      }
    });
  };

  __.FnCronLoader.prototype._addPolling = function (runnerObj) {
    var judge = runnerObj && runnerObj.judge,
      inv,
      that = this;

    if (__.lang.isUndefined(runnerObj.judge)) {
      judge = runnerObj.interval;
      runnerObj.judge = judge;
    }

    if (judge && __.lang.isInt(runnerObj.judge) && judge > 0) {
      runnerObj.judge = function (count) {
        if (count % judge === 0) {
          return 1 | 2;
        }
        return 0;
      };
    }

    inv = parseInt(runnerObj.interval, 10);

    if (!this.jobs[inv]) {
      this.jobs[inv] = [];
    }
    this.jobs[inv].push(runnerObj);

    if (runnerObj.noWait) {
      setTimeout(function () {
        that._doPolling(runnerObj.id);
      }, 0);
    }
  };

  __.FnCronLoader.prototype._addPush = function (runnerObj) {
    if (!this.jobs[0]) {
      this.jobs[0] = [];
    }

    runnerObj.__created = [];
    this.jobs[0].push(runnerObj);

    if (!this._paused) {
      this._consumePushJob();
    }
  };

  __.FnCronLoader.prototype._remPushJob = function (id) {
    var job, n, session, idx,
      result = false,
      that = this;

    if (this.jobs[0]) {
      n = __.lang.findByAttr(this.jobs[0], 'id', id);

      if (n > -1) {
        job = this.jobs[0][n];
        __.lang.arrayRemove(this.jobs[0], n);
        if (__.lang.isArray(job.sessionId)) {
          __.each(job.sessionId, function (o) {
            session = that.pushSessions[o];
            idx = __.lang.find(session.ids, function (v) {
              return v === id;
            });
            if (idx > -1) {
              __.lang.arrayRemove(session.ids, idx);
              if (session.ids.length === 0) {
                session.running = false;
                session.keys = [];
                __.FnCronLoader._purgeIframe(session.iframe);
              } else {
                that._updateSession(o, true);
              }
            }
          });
        }
        delete job.onData;
        delete job.onUpdate;
        result = true;
      }
    }

    return result;
  };

  __.FnCronLoader.prototype.isPushUsable = function () {
    return true;
  };

  /**
   * @param {object} runnerObj
   * @config {integer} type 1 will use push if possible, 2 will use qt,
   *                        default: 1
   * @config {array} keys array of data names
   * @config {function|integer} judge function return a parameter of count
   *                                  number return &1 to trigger qt data
   *                                  loading, return&2 to trigger callback;
   *                                  integer means trigger both in every
   *                                  'judge' seconds
   * @config {integer} interval judge function running interval
   * @config {function} onData callback function when data is loaded for
   *                             the first time
   * @config {function} onUpdate callback function, override the onData
   *                             after the 1st data arrived
   * @config {boolean} runOnce run the onData on next loop only
   * @config {boolean} noWait run the first loop after setup immediately
   * @return {integer} reigerter id, -1 means fail
   */
  __.FnCronLoader.prototype.addJob = function (runnerObj) {
    var jobCount;

    if (runnerObj.keys) {
      if (__.lang.isString(runnerObj.keys)) {
        runnerObj.keys = runnerObj.keys.split(',');
      }
      runnerObj.keys = __.lang.unique(runnerObj.keys);
    }

    //a push job will auto downgrade to polling job using default interval
    if (__.lang.isUndefined(runnerObj.interval)) {
      runnerObj.interval = __.FnCronLoader.defaultInterval;
    }

    jobCount = ++this._jobUidIdx;
    runnerObj.id = jobCount + '-' + runnerObj.interval;

    if (runnerObj.type === 2 || !this.isPushUsable() ||
        !runnerObj.keys || runnerObj.keys.length === 0
        ) {
      this._addPolling(runnerObj);
    } else {
      if (!__.FnCronLoader._pushInited) {
        __.FnCronLoader._initPush();
      }
      this._addPush(runnerObj);
    }

    return runnerObj.id;
  };

  /**
   * remove a loading job and purge its trace
   * @param {integer} jobId the id returned by addJob
   */
  __.FnCronLoader.prototype.remJob = function (id) {
    var rid, intev, n, result = false;

    rid = id.split('-');

    intev = rid[1];

    if (this.jobs[intev]) {
      n = __.lang.findByAttr(this.jobs[intev], 'id', id);

      if (n > -1) {
        __.lang.arrayRemove(this.jobs[intev], n);
        result = true;
      } else {
        result = this._remPushJob(id);
      }
    }

    return result;
  };

  __.FnCronLoader.prototype.start = function () {
    if (this.pollingCount === -1) {
      this._paused = false;
      this.pollingCount++;
      this._doPolling();
      this._consumePushJob();
    }
    this.resume();
  };

  __.FnCronLoader.prototype.pause = function () {
    if (this._idIntv !== null) {
      clearInterval(this._idIntv);
      this._idIntv = null;
    }
    this._paused = true;
  };

  __.FnCronLoader.prototype.resume = function () {
    var that = this;
    if (this._idIntv === null) {
      this._idIntv = setInterval(function () {
        that.pollingCount++;
        that._doPolling();
      }, 1000);
    }
    this._paused = false;
  };

  __.FnCronLoader.prototype.stop = function () {
    this.pause();
    this.jobs = {};
    this.pollingCount = -1;
    this.pushCount = -1;
    this._jobUidIdx = 0;
    __.dom.remEl(this._aIframes);
  };

});
/*end:fn-cronloader*/
