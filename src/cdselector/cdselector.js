/*!
 * @file cdselector.js
 * @class CdSelector, RegionSelector, DateTimeSelector
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

/**
 * cascading data selector as a widget of double-underscore
 *
 * usage : 
 * var oDataSelector = new __.widget.CdSelector('id', 
 *   oData, iCols, iDisplayStyle, fnOnselectionchange);
 */
__.set('__.widget');

__.log('cdselector 3 Classes begin.');
(function() {
  var _config = {
      sClassLiSelected : 'du-validate-category-selected',
      sClassLiHasChild : 'du-validate-category-parent',
      sClassLCPrefix : 'du-validate-category-level',
      sIdPrefix : 'du-validate-item-',
      sClassContainer : 'du-validate-category',
      sLvl5Instruct : '小区、建筑物、地段等',
      sLvl5Ctn : 'du-cdselector-lv5-ctn',
      sLvl6Ctn : 'du-cdselector-lv6-ctn'
    },
    _ = __._,

    _$ = _.$,
    _L = _.log,
    _ajax = _.ajax,
    _amp = _.p,
    _map = _.map,
    _each = _.e,
    /**
     * the private function to toggle the selected status of li
     * @private
     * @memberOf __.widget.CdSelector
     * @param {integer|object} li _config.sIdPrefix+sLi,number or dom reference
     */
    _fnToggleLi = function(li) {
      if (!_.isNode(li)) {
        _.log('Toggle Li falied, not an element');
        return;
      }
      var _sCls = _config.sClassLiSelected;
      _.hasClass(li, _sCls) ? _.remClass(li, _sCls) : _.addClass(li, _sCls);
    },
    /**
     * create a li dom element
     * @private
     * @memberOf __.widget.CdSelector
     * @param {string} sId
     * @param {string} sName
     * @param {object} oRoot
     * @param {boolean} bHasChild
     */
    _fnCreateLi = function(sId, sName, oRoot, bHasChild) {
      var _oLi = _.addEl({
        tag : 'li', text : sName, cls: 
        _config.sIdPrefix + sId + (bHasChild ? ' '+ _config.sClassLiHasChild : '')
      }, oRoot);
      return _oLi;
    },
    /**
     * create an option dom element
     * @private
     * @memberOf __.widget.CdSelector
     * @param {string} sId
     * @param {string} sName
     * @param {object} oRoot
     * @param {boolean} bSelected
     */
    _fnCreateOpt = function(sId, sName, oRoot, bSelected) {
      bSelected = bSelected ? 'selected' : false;
      var opt = _.addEl({
        tag : 'option', value : sId, text : sName, attrs : { selected : bSelected }
      }, oRoot);
      return opt;
    },
    /**
     * select changed event handler
     * @private
     * @memberOf __.widget.CdSelector
     * @param {event} e
     */
    _hSelectChanged = function(e) {
      var _oTarget = _.getTarget(e),
        _sValue = _oTarget.value;
      _fnSelect([_sValue]);
    },
    /**
     * get the year array from 1900 to current year
     * @private
     * @memberOf __.widget.CdSelector
     * @return {array} years
     */
    _getYearArray = function() {
      var year = (new Date()).getFullYear(), ary=[];
      year = year < 2008 ? 2008 : year;
      for (var i=1900;i<=year;i++) {
        ary[ary.length] = i;
      }
      return ary;
    }, 
    /**
     * get the month array
     * @private
     * @memberOf __.widget.CdSelector
     * @return {array} months
     */
    _getMonthArray = function() {
      return '01-02-03-04-05-06-07-08-09-10-11-12'.split('-')
    },
    /**
     * get the day array of some specific month
     * @private
     * @memberOf __.widget.CdSelector
     * @param {integer} year
     * @param {integer} month
     * @return {array} days
     */
    _getDayArray = function(year, month) {
      var dt = new Date(), ary=[];
      dt.setFullYear(year, month, 0);
      for (var i=1,j=dt.getDate();i<=j;i++) {
        var s = String(i);
        s = s.length == 1 ? '0' + s : s;
        ary[ary.length] = s;
      }
      return ary;
    };

  __.widget.CdSelector = __.Class.extend(
  /**
   * @lends __.widget.CdSelector.prototype
   */
  {

    /**
     * the rendering type, 1==select, 2==ul list
     * @memberOf __.widget.CdSelector
     * @type integer
     */
    iType : 1,

    /**
     * the count of levels of cascade we should display
     * @memberOf __.widget.CdSelector
     * @type integer
     */
    iLvlCount: 2,

    /**
     * array of containers of each level
     * @memberOf __.widget.CdSelector
     * @type integer
     */
    aLevelCtn : [],

    /**
     * array of selected values
     * @memberOf __.widget.CdSelector
     * @type integer
     */
    aChoosed : [],

    /**
     * array of level cascade
     * @memberOf __.widget.CdSelector
     * @type array
     */
    aLData : null,

    /**
     * object of id-value pair of data
     * @memberOf __.widget.CdSelector
     * @type object
     */
    oPData : null,

    /**
     * the array indicate which level allow value of 0 (means no limit)
     * @memberOf __.widget.CdSelector
     * @type array
     */
    aWithZero : null,

    /**
     * datasource of date when data type is Date
     * @memberOf __.widget.CdSelector
     * @type Date
     */
    oDate : null,

    /**
     * config object
     * @memberOf __.widget.CdSelector
     * @type object
     */
    config: null,

    /**
     * the constructor of category data selector
     * This is the basic cascade data selector class
     * It can be considered an abstract class, even though no such thing
     * really existing in JavaScript
     * @constructs
     * @author <a href="mailto:chang.liu@alibaba-inc.com">stauren</a>
     * @param {integer} iLevel cascading level
     * @param {string} sId container id 
     * @param {object|string} oData cascading data object or a date string
     * @config {object} data key value pairs of id:value 
     * @config {object} level array of levels, the first
     * @param {string} iType data selector type: 1=select,2=ul
     *   level's root must be 0
     * @param {function} fnAfterChange the callback handler, params 1 is int, 2 is array
     * @param {array} aWithZero do we allow zero value (no limit)
     * @param {object} config
     * @config {string} jsonName
     * @config {string} initValue
     * @return {__.widget.CdSelector} A new selector
     */
    init : function(sId, oData, iLevel, iType, fnAfterChange, aWithZero, config) {
      config = config || {};
      //var bAutoValue = _.isEmpty(config.jsonName) ? true : false;
      var that = this;
      this.aChoosed = [];
      this.aLevelCtn = [];

      if (!_.isString(oData)) {
        this.oPData = oData.data; 
        this.aLData = oData.level; 
      } else {
        //date
        var dt = oData.match(/^([12]\d{3})\-([01]\d)\-([0-3]\d)$/);
        if (!dt) { return false; }
        this.oDate = new Date();
        this.oDate.setFullYear(dt[1], dt[2]-1, dt[3]);
        dt.shift();
      }

      this.iLvlCount = iLevel || 2;
      this.iType = iType === 2 ? 2 : 1;
      this.oRoot = _.f(sId);
      if (!this.oRoot) {
        _.log('CdSelector: container not found.');
      }

      //if (bAutoValue) {
        var cdInput = _.addEl({
          tag : 'input',
          name : config.jsonName || (sId +'-value'),
          attrs : { type : 'hidden'}
        }, this.oRoot);

        var fnRealAfterChange = typeof fnAfterChange == 'function' ?
          function(l, a) {
            cdInput.value = a.join('-');
            fnAfterChange(l, a);
          } :
          function(l, a) {
            cdInput.value = a.join('-');
          };
      //}

      this.fnAfterChange = function(iLvl) {
        setTimeout(function() {
          fnRealAfterChange(iLvl, _.a(that.aChoosed));
        }, 100);
      };
      this.aWithZero = aWithZero || false;

      if (this.oRoot) {
        _.addClass(this.oRoot, _config.sClassContainer);
        this._createCt();
        this._fnDrawChild(0, 0, {sValue : config.initValue || undefined});
        this._fnAddEvent();
      }
      this.oDate && this.select(dt.join('-'));
      if (iType == 2 && config.initValue) {
        this.select(config.initValue);
      }
    }
    ,

  //__.widget.CdSelector.prototype = 

    /**
     * private function, create level container
     * @private
     * @memberOf __.widget.CdSelector
     */
    _createCt : function() {
      var i,j = this.iLvlCount, clsprefix = _config.sClassLCPrefix,
        lctag = this.iType == 1 ? 'select' : 'ul',
        root = this.oRoot;

      for(i=0;i<j;i++) {
        this.aLevelCtn[i] = _.addEl({
          tag : lctag, cls : clsprefix + i
        }, root);
      }
    }
    ,

    /**
     * private function
     * @private
     * @memberOf __.widget.CdSelector
     */
    _fnSelectOptionByString : function() {
      //the first argument is an array, 
      //which is the argument of category.select
      var sIds = arguments[0],
        _aIds = sIds.split('-'),
        lvlcount = this.iLvlCount,
        allCt = this.aLevelCtn, aCurrentOpt,
        that = this; 
      for(var i=1;i<lvlcount;i++) {
        this._fnDrawChild(i, _aIds[i - 1], {bDrawChild : false}); 
      }
      setTimeout(function() {
        _each(allCt, function(o, k) {
          aCurrentOpt = o.options;
          that.aChoosed[k] = _aIds[k] + "";
          for(var j=0,n=aCurrentOpt.length;j<n;j++) {
            if (aCurrentOpt[j].value === _aIds[k]) {
              aCurrentOpt[j].selected = true;
              o.selectedIndex= j;
            }
          }
        });
        that.fnAfterChange(lvlcount);
        //a bug here:!! if data = 0(not limit),but aWithZero=false, the aChoosed is wrongly set to 0
      }, 0);
    }
    ,

    /**
     * private function
     * @private
     * @memberOf __.widget.CdSelector
     */
    _fnSelectLiByString: function() {
      //the first argument is an array, 
      //which is the argument of category.select
      var sIds = arguments[0],
        _aIds = sIds.split('-'),
        iAl = this.iLvlCount,
        aCt = this.aLevelCtn,
        that = this;

      //clear all uls except the first one
      for (var i=iAl-1;i>0;i--) {
        aCt[i] && (aCt[i].innerHTML = '');
        this.aChoosed.length = i +""; 
      }
      _each(_aIds, function(id, i) {
        if (id && i < iAl) {
          that._fnSelectLi(i, id, arguments);
          var cn = aCt[i].childNodes;
          for (var j=0,n=cn.length;j<n;j++) {
            if (cn[j].className.indexOf(_config.sIdPrefix + id) != -1) {
              aCt[i].scrollTop = cn[j].offsetHeight * (j - 1);
              break;
            }
          }
        }
      });
    }
    ,

    /**
     * check && blur the choosed, focus the new li
     * update _aChoosed
     * draw the next level
     * @private
     * @memberOf __.widget.CdSelector
     */
    _fnSelectLi : function (iLevel, sId, argu) {
      var _oUl = this.aLevelCtn[iLevel],
        _oLi = _.f('.'+ _config.sIdPrefix + sId, _oUl);
      if (_oLi) {
        this.aChoosed[iLevel] && _fnToggleLi(_.f('.'+ _config.sIdPrefix + this.aChoosed[iLevel], _oUl));
        _fnToggleLi(_oLi, iLevel);
        this.aChoosed[iLevel] = sId +"";
        if (_.hasClass(_oLi, _config.sClassLiHasChild)) {
          this._fnDrawChild(iLevel+1, sId, { bDrawChild : false});
        }
      }
      this.fnAfterChange(iLevel);
    }
    ,

    /**
     * private function, create level container
     * @private
     * @memberOf __.widget.CdSelector
     */
    _fnAddEvent : function() {
      var ctns = this.aLevelCtn, iAllLvl = this.iLvlCount,
        that = this;
      if (this.iType == 1) {
        _.on(ctns, 'change', function(e) {
          var _oTgt = _.getTarget(e), _sName = _oTgt.name,
            _iLevel, _iChildLevel; 
          _each(ctns, function(o, k) {
            if (o == _oTgt) {
              _iLevel = k;
            }
          });
          that.aChoosed[_iLevel] = ctns[_iLevel].value +"";
          _iChildLevel = _iLevel - 0 + 1;
          if (_iLevel < that.iLvlCount - 1) { 
            that._fnDrawChild(_iChildLevel, ctns[_iLevel].value);
          } else {
            that.fnAfterChange(_iChildLevel);
          }
        });
      } else if (this.iType == 2) {
        _.on(this.oRoot, 'click', function(e){
          var _oTarget = _.getTarget(e),
            _oUl, _iClickedLevel = false;
          if (_oTarget.tagName.toLowerCase() == 'li') {
            _oUl = _oTarget.parentNode;
            _each(ctns, function(o, k) {
              if (o == _oUl) {
                _iClickedLevel = k;
              }
            });
            if (_iClickedLevel === false) {
              return false;
            }
            that.aChoosed.length = _iClickedLevel + 1;
            //that.aChoosed[_iClickedLevel] = ctns[_iLevel].value;
            for(var i=iAllLvl-1;i>_iClickedLevel;i--) {
              ctns[i].innerHTML = '';
            }
            var classIdReg = new RegExp(_config.sIdPrefix + '([^ $]+)'),
            classId = classIdReg.exec(_oTarget.className);
            classId && that._fnSelectLi(_iClickedLevel, classId[1]);
          }
        });
      }
    }
    ,

    /**
     * private function, create level container
     * @private
     * @memberOf __.widget.CdSelector
     * @param {integer} iLevel drawing child level
     * @param {integer} iFather drawing level's father's id
     * @param {object} config
     * @config {boolean} bDrawChild draw child level or not
     * @config {string} sValue all level's value joined with '-', init with corresponding value selected, 
     */
    _fnDrawChild : function(iLevel, iFather, config) {
      if (iLevel >= this.iLvlCount) {
        return false;
      }
      config = config || {};
      iFather = iFather === undefined ? 0 : iFather;
      var bDrawChild = config.bDrawChild === false ? false : true;
      var opt,
        parent = this.aLevelCtn[iLevel],
        itype = this.iType,
        aLvl, childList, bornList, pData,
        bBuildZero = this.aWithZero,
        bHasChild,
        iNextFather,
        aValue = config.sValue ? config.sValue.split('-') : false,
        isdate = this.oDate ? true : false;

      if (isdate) {
        switch(iLevel) {
          case 0 :
            //iLevel == 0 means year
            childList = _getYearArray();
            bHasChild = true;
            break;
          case 1 :
            childList = _getMonthArray();
            bHasChild = true;
            break;
          default :
            childList = _getDayArray(this.aChoosed[0], this.aChoosed[1]);
            bHasChild = false;
            break;
        }
      } else {
        aLvl = this.aLData[iLevel];
        childList = _.a(aLvl[iFather]);
        bornList = this.aLData[iLevel + 1];
        pData = this.oPData;
      }

      if (bBuildZero !== false && bBuildZero !== true) {
        bBuildZero = bBuildZero[iLevel] === true ? true : false; 
      }

      childList = childList === undefined ? [] : childList;

      bBuildZero && childList.unshift(0);

      parent.innerHTML = '';

      if (itype == 1) {

        // for select, the next level index 0 is auto selected,
        // but 0 is also 'not limited'
/*           this.aChoosed[iLevel] = bBuildZero ? childList[0] */
/*             : (childList.length > 1 && childList[0] == 0 ? childList[1] : childList[1]); */
        this.aChoosed[iLevel] = childList[0] +"";

        _each(childList, function(o) {
          //if (bBuildZero || o != 0 || childList.length == 1) {
          var optname = (pData && pData[o]) || o;
          var bSelected = aValue && aValue[iLevel] && aValue[iLevel] == o;
          _fnCreateOpt(o, optname, parent, bSelected);
          //}
        });
        if (bDrawChild && iLevel < this.iLvlCount - 1) {
/*           if (!bBuildZero && childList[0] == 0) { */
/*             iNextFather = childList[1] == undefined ? 0 : childList[1]; */
/*           } else { */
/*             iNextFather = childList[0]; */
/*           } */
/*           this._fnDrawChild(iLevel + 1, iNextFather); */
          iNextFather = aValue && aValue[iLevel] !== undefined ? aValue[iLevel] : childList[0];
          this._fnDrawChild(iLevel + 1, iNextFather, config);
        } else {
          //fire when last child drawn
          this.fnAfterChange(iLevel + 1);
        }
      } else if ( itype ==2 ) {
        _each(childList, function(o) {
          bHasChild = bHasChild === undefined
            ? bornList && bornList[o]!==undefined
            : bHasChild;
/*           if (bBuildZero || o != 0 || childList.length == 1) { */
          var optname = (pData && pData[o]) || o;
          _fnCreateLi(o, optname, parent, bHasChild);
          bHasChild = isdate ? bHasChild : undefined; 
/*           } */
        });
      }
    }
    ,

    /**
     * @memberOf __.widget.CdSelector
     * @param {string} sData set the selector's status, values of every level joined by '-'
     */
    select : function() {
      var argu = Array.prototype.slice.call(arguments);
      if (this.iType == 1) {
        this._fnSelectOptionByString(argu[0]);
      } else {
        this._fnSelectLiByString(argu[0]);
      }
    }
  }
  );

  __.widget.RegionSelector = __.widget.CdSelector.extend(
  /**
   * @lends __.widget.RegionSelector
   */
  {
    /**
     * Construct region cascade data selector
     * @author <a href="mailto:chang.liu@alibaba-inc.com">stauren</a>
     * @constructs
     * @param {string} sId container id 
     * @param {integer} iLevel cascading level
     * @param {object} config other unneccesary config info
     * @config {integer} renderType data selector type: 1=select,2=ul
     * @config {function} afterChange the callback handler, params 1 is int, 2 is array
     * @config {array} limitArray do we allow zero value (no limit)
     * @config {string} jsonName auto generate a hidden iput put 1-4 level's value
     * @config {function} fnAfterDataLoad function to run after data load 
     * @return {__.widget.RegionSelector} A new selector
     */
    init : function(sId, iLevel, config) {
      config = config || {};
      /*
      var superConfig = _.isEmpty(config.jsonName) ? {} : {
        jsonName : config.jsonName
      };
      */
      //config.autoValue = config.autoValue === false ? false : true;
      var that = this;
      var superinit = that._super;

      __.load('cds_data_region', function() {
        superinit.call(that, sId, __.widget.data.Region, iLevel,
          config.renderType || 1, config.afterChange || _.E, config.limitArray || false, config);
        config.fnAfterDataLoad && config.fnAfterDataLoad();
      });
    }
    ,
    /**
     * this has to call _super after superinit
     * @memberOf __.widget.RegionSelector
     * @param {string} sData set the selector's status, values of every level joined by '-'
     */
    select : function() {
      var that = this;
      var argu = Array.prototype.slice.call(arguments);
      var superSelect = that._super;
      __.toCall(function() {
        superSelect.apply(that, argu);
      }, function() {
        return that.oPData !== null
      });
    }
  });

  var _mrsConfig = {
    mapInputId : 'mapposition',
    mapMarkUrl : '/map/emark/emark.jsp?city='
  };

  __.widget.DateTimeSelector = __.widget.CdSelector.extend(
  /**
   * @lends __.widget.DateTimeSelector
   */
   {


    /**
     * Construct a date time selector
     * @author <a href="mailto:chang.liu@alibaba-inc.com">stauren</a>
     * @constructs
     * @param {string} sId container id 
     * @param {integer} iLevel cascading level
     * @param {object} config other unneccesary config info
     * @config {integer} renderType data selector type: 1=select,2=ul
     * @return {__.widget.MapRegionSelector} A new selector
     */
    init : function(sId, iLevel, config) {
      config = config || {};
      var that = this, 
        bBuildInput = iLevel > 4,
        bBuildMap = iLevel > 5,
        aValue = config.initValue ? config.initValue.split('-') : null;

      _mrsConfig.mapInputName = config.mapInputName || sId + '-map-ipt';
      _mrsConfig.mapMarkUrl = config.mapMarkUrl || _mrsConfig.mapMarkUrl;
      this.lv5Name = config.diyInputName;

      if (iLevel > 4) {
        iLevel = 4;
      }
      config.fnAfterDataLoad = function() {
        bBuildInput && that.buildDetailInput();
        bBuildMap && that.buildMapInput();
        aValue && aValue[5] !== undefined && (_.f(_mrsConfig.mapInputId).value = aValue[5]);
        aValue && aValue[4] !== undefined && (that.dLvl5Ipt.value = aValue[4]);
      }
      this._super(sId, iLevel, config);
    }
    ,
    /**
     * this has to call _super after superinit
     * @memberOf __.widget.DateTimeSelector
     * @param {string} sData set the selector's status, values of every level joined by '-'
     */
    select : function(value) {
    }
  });

})();
__.log('cdselector 3 Classes end.');
