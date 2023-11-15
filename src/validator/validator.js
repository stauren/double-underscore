/*!
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

/**
 * widget 'validator' used to verify submitting tables
 * @example var oVerfier = new __.widget.Validator()
 * @file validator.js
 * @class __.widget.Validator
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

__.set("__.widget");

(function() {
  /**
   * regular expression for predefined rules
   */
  var _regExp = {
      email : /^\s*([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+\s*$/,
      cnPhone : /^\s*(\d{3,4}-?)\d{7,8}(-\d{1,6})?\s*$/,
      cnMobile : /^\s*1\d{10}\s*$/,
      cnTele : /^\s*(\d{3,4}-?)\d{7,8}(-\d{1,6})?\s*$|^\s*1\d{10}\s*$/,
      yid : /^\s*[a-z][a-z_0-9]{3,}(@yahoo\.cn)?\s*$/,
      date : /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/,
      integer : /^\s*[1-9][0-9]*\s*$/,
      number : /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/,
      alpha : /^[a-zA-Z]+$/,
      alphaNum : /^[a-zA-Z0-9_]+$/,
      urls : /^(http|https):\/\/\w+\.(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
      chinese : /^[\u2E80-\uFE4F]+$/,
      postal : /^\s*[0-9]{6}\s*$/,
      anything : /.*/,
      ip : /^[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}$/,
      cnId : /^(\d{15}|\d{17}[\dx])$/i
    }
    ,
    /**
     * @ignore
     * if there is a group of radio or checkbox with the same name,
     * add class to the first one
     */
    _config = {
      sImgBase : 'http://cn.yimg.com/ncp/i315/img/',
      bHideSuccess : false,
/*      sLoadingImgSrc : 'yn_validate_icon_loading.gif',*/
      sInlineErrorTag : 'em',
      sInlineErrorClass : 'st-validate-error-notice',
      sErrorActiveClass : 'active',
      sErrorHideClass : 'hide',
      sInputErrorClass : 'st-validate-input-error',
      sInputInboxNotice: 'st-validate-input-in',
      //begin  predefined rule class
      sNotRequiredClass : 'st-validate-not-required',
      sNeededClass : 'st-validate-needed',
      sDateClass : 'st-validate-date',
      sPhoneClass : 'st-validate-phone',
      sTeleClass : 'st-validate-tele',
      sMobileClass : 'st-validate-mobile',
      sYidClass : 'st-validate-yid',
      sIntClass : 'st-validate-int',
      sNumberClass : 'st-validate-number',
      sAlphaClass : 'st-validate-alpha',
      sAlphaNumClass : 'st-validate-alphanum',
      sEmailClass : 'st-validate-email',
      sUrlClass : 'st-validate-url',
      sChineseClass : 'st-validate-chinese',
      sPostalClass : 'st-validate-postal',
      sAnythingClass: 'st-validate-anything',
      sIpClass: 'st-validate-ip',
      sCnidClass: 'st-validate-cnid',
      sFormClass : 'st-validate',
      sIptWrapper : 'st-validate-wrapper',
      sENWrapper : 'st-validate-bbs', /*error and notice wrapper*/
      sRowPassed : 'st-passed',
      sRowBlocked : 'st-blocked',
      sErrPrefix : 'Validator: ',
      sTipsSuccess : 'st-validate-success'
    }
    ,
    _oPredefinedRules = {
      sDateClass : {
        mask : _regExp.date
      },
      sPhoneClass : {
        mask : _regExp.cnPhone
      },
      sTeleClass : {
        mask : _regExp.cnTele
      },
      sMobileClass : {
        mask : _regExp.cnMobile
      },
      sNotRequiredClass : {
        required : false
      },
      sYidClass : {
        mask : _regExp.yid
      },
      sIntClass : {
        mask : _regExp.integer
      },
      sNumberClass : {
        mask : _regExp.number
      },
      sAlphaClass : {
        mask : _regExp.alpha
      },
      sAlphaNumClass : {
        mask : _regExp.alphaNum
      },
      sEmailClass : {
        mask : _regExp.email
      },
      sUrlClass : {
        mask : _regExp.urls
      },
      sChineseClass : {
        mask : _regExp.chinese
      },
      sAnythingClass : {
        mask : _regExp.anything
      },
      sPostalClass : {
        mask : _regExp.postal
      },
      sIpClass : {
        mask : _regExp.ip
      },
      sCnidClass : {
        mask : _regExp.cnId
      }
    }
    ,
    _oPredefinedRulesName = {
      date : 'sDateClass',
      cnphone : 'sPhoneClass',
      cnmobile : 'sMobileClass',
      cntele : 'sTeleClass',
      yid : 'sYidClass',
      integer : 'sIntClass',
      number : 'sNumberClass',
      alpha : 'sAlphaClass',
      alphanum : 'sAlphaNumClass',
      email : 'sEmailClass',
      urls : 'sUrlClass',
      chinese : 'sChineseClass',
      anything: 'sAnythingClass',
      postal : 'sPostalClass',
      ip : 'sIpClass',
      cnid : 'sCnidClass'
    }
    ,
    _ERROR_SUCCESS = 200,
    _ERROR_EMPTY = 1501,
    _ERROR_MAXLENGTH = 1502,
    _ERROR_MINLENGTH = 1503,
    _ERROR_MAXVALUE = 1504,
    _ERROR_MINVALUE = 1505,
    _ERROR_REGEXP = 1506,
    _ERROR_WRONGVALUE = 1507,
    _ERROR_AJAXVALUEERR = 1508,
    _ERROR_AJAXFAIL = 1509,
    _ERROR_EMPTYCHECK = 1510,
    _ERROR_NEEDED = 1511,
    _ERROR_ALTER = 1512,
    _ERROR_PWDSAME = 1513,
    _ERROR_INITERR = 1514,
    _ERROR_IGNORED = 1600,
    _oErrorOfRule = {
      required : [_ERROR_EMPTY,_ERROR_EMPTYCHECK],// _ERROR_EMPTYCHECK, check when display
      predefined : _ERROR_REGEXP,
      mask : _ERROR_REGEXP,
      maxLength : _ERROR_MAXLENGTH,
      minLength : _ERROR_MINLENGTH,
      maxValue : _ERROR_MAXVALUE,
      minValue : _ERROR_MINVALUE,
      content : _ERROR_WRONGVALUE,
      equal : _ERROR_PWDSAME,
      ajax : _ERROR_AJAXVALUEERR,// _ERROR_AJAXFAIL use default
      alter : _ERROR_ALTER
      //needed : _ERROR_NEEDED, this rule is not ready to config
    },
    _oErrorTemplate = (function() {
      var rtnObj = {};
      rtnObj[_ERROR_SUCCESS] = '成功',
      rtnObj[_ERROR_EMPTY] = '%s不能为空',
      rtnObj[_ERROR_MAXLENGTH] = '%s不能超过最大长度%s',
      rtnObj[_ERROR_MINLENGTH] = '%s不能小于最小长度%s',
      rtnObj[_ERROR_MAXVALUE] = '%s不能超过最大值%s',
      rtnObj[_ERROR_MINVALUE] = '%s不能小于最小值%s',
      rtnObj[_ERROR_REGEXP] = '%s不符合指定格式',
      rtnObj[_ERROR_WRONGVALUE] = '%s输入不符合要求',
      rtnObj[_ERROR_AJAXVALUEERR] = '%s',
      rtnObj[_ERROR_AJAXFAIL] = '请求服务器端验证失败，请稍后重试',
      rtnObj[_ERROR_EMPTYCHECK] = '请至少选择一项',
      rtnObj[_ERROR_NEEDED] = '您的选择项不符合要求',
      rtnObj[_ERROR_ALTER] = '以上选项不能都为空',
      rtnObj[_ERROR_PWDSAME] = '两次输入的值不一致',
      rtnObj[_ERROR_INITERR] = '%s', //a server side error of initErr
      rtnObj[_ERROR_IGNORED] = '检查未进行'
      return rtnObj
    })(),
    _aNoticeType = ['tips', 'domDiv', 'alert','tips2','tipsdiy'],

    _ = __._,
    _$ = _.$,
    _L = _.log,
    _ajax = _.ajax,
    _amp = _.p,
    _each = _.each,
    _reduce = _.reduce,
    _map = _.map,
    _isNode = _.isNode,
    _inArray = _.inArray,
    _sprintf = _.sprintf,
    _getMergeObj = _.getMergedObj,

    /**
     * @ignore
     * get value of input element(textarea), and return a object of id:value pair
     * 
     */
    _getObjFromId = function(ary) {
      var _oResult = {};
      _each(ary, function(sId) {
        var _temp = _$(sId)[0];
        if(_temp && (typeof _temp.value != 'undefined')) {
          _oResult[sId] = _temp.value;
        } else if (_temp && _temp.innerHTML) {
          _oResult[sId] = _temp.innerHTML;
        } else {
          _oResult[sId] = null;
        }
      });
      return _oResult;
    }
    ,
    _checkOneSetting = function(sRname, sRvalue, sValue) {
      var _iReturn = _ERROR_SUCCESS;
      switch (sRname) {
     /* required rule should be check before other rules
        because we don't want to trigger an empty notice on blur
        case 'required' :
          if (sRvalue && sValue === '') {
            _iReturn = _ERROR_EMPTY;
          }
          break;*/
        case 'maxLength': 
          if (sValue.length > sRvalue) {
            _iReturn = _ERROR_MAXLENGTH;
          }
          break;
        case 'minLength': 
          if (sValue.length < sRvalue) {
            _iReturn = _ERROR_MINLENGTH;
          }
          break;
        case 'maxValue': 
          if (sValue > sRvalue) {
            _iReturn = _ERROR_MAXVALUE;
          }
          break;
        case 'minValue': 
          if (sValue < sRvalue) {
            _iReturn = _ERROR_MINVALUE;
          }
          break;
        case 'mask': 
          if (!sRvalue.test) {
            sRvalue = new RegExp(sRvalue);
          }
          if (!sRvalue.test(sValue)) {
            _iReturn = _ERROR_REGEXP;
          }
          break;
        case 'content': 
          if (sRvalue !== sValue) {
            _iReturn = _ERROR_WRONGVALUE;
          }
          break;
      }
      return _iReturn;
    },
    
    /**
     * constructor of check result object of validator
     * @constructor
     * @param {integer} iCode error code 
     * @param {object} oIpt dom reference of input element
     * @param {mixed} oRule rule set of currently checking rule
     * @param {string} vDesc input name used in auto-generated error message
     * @param {string} sDiyTemplate user diy template of error message
     */
    _CheckError = function(iCode, oIpt, oRule, vDesc, sDiyTemplate) {
      this.iCode = iCode;
      this.sTemplate = sDiyTemplate || _oErrorTemplate[iCode];
      this.oRule = oRule;
      this.sName = vDesc || (oIpt && oIpt.name) || (oIpt && oIpt[0] && oIpt[0].name);
      this.oDomInput = oIpt;
    };
    _CheckError.prototype.sErrorTag = _config.sInlineErrorTag;
    _CheckError.prototype.sErrorClass = _config.sInlineErrorClass;
    _CheckError.prototype.sActiveClass = _config.sErrorActiveClass;
    _CheckError.prototype.sHideClass = _config.sErrorHideClass;

    _CheckError.prototype.toString = function() {
      return _sprintf(this.sTemplate, this.sName);
    };

    /**
     * find or create the em, append to the input's parent
     * @return {array} array(errortip, wrapper)
     */
    _CheckError.prototype.getTipsDom = function() {
      var _sTag = this.sErrorTag, _sClass = this.sErrorClass,
        oExistingTips = _$(_sTag+'.'+_sClass,
          this.oDomInput.parentNode, true)[0];
      if (!_isNode(oExistingTips)) {
        //var oNextOfInput = this.oDomInput.nextSibling;
        oExistingTips = document.createElement(_sTag);
        _.addClass(oExistingTips, _sClass);
        //this.oDomInput.parentNode.insertBefore(oExistingTips,
        //  oNextOfInput);
        this.oDomInput.parentNode.appendChild(oExistingTips);
      }
      _config.bHideSuccess && _.addClass(oExistingTips, this.sHideClass);
      return [oExistingTips, this.oDomInput.parentNode];
    };

    /**
     * input in st-validate-wrapper, sibling is st-validate-bbs
     * em in st-validate-bbs, wrapper directly in td
     * if wrapper is a span, the return a dl, else a tr
     * @return {array} array(tips, wrapperTr|Dl)
     */
    _CheckError.prototype.getTipsDom2 = function() {
      var _sTag = this.sErrorTag, _sClass = this.sErrorClass,
        oIptWrapper = this.oDomInput.parentNode,
        oExistingTips, trOrDl, td;
      while (oIptWrapper && oIptWrapper != document.body) {
        if (_.hasClass(oIptWrapper, _config.sIptWrapper)) {
          break;
        }
        oIptWrapper = oIptWrapper.parentNode;
      }

      if (_.hasClass(oIptWrapper, _config.sIptWrapper)) {
        oExistingTips = _$(_sTag+'.'+_sClass, 
          oIptWrapper.parentNode, true)[0];

        if (!_isNode(oExistingTips)) {
          var bbs = document.createElement('div');
          oExistingTips = document.createElement(_sTag);
          _.addClass(oExistingTips, _sClass);
          _.addClass(bbs, _config.sENWrapper);
          bbs.appendChild(oExistingTips);
          oIptWrapper.parentNode.insertBefore(bbs,
            oIptWrapper.nextSibling);
        }

        if (oIptWrapper.tagName.toLowerCase() == 'div') {
          //tr.st-blocked td div.st-validate-wrapper
          td = oIptWrapper.parentNode;
          trOrDl = oIptWrapper.parentNode.parentNode;
        } else {
          //dd.st-blocked span.st-validate-wrapper
          trOrDl = oIptWrapper.parentNode;//span.dd
        }

        return [oExistingTips, trOrDl, td];
      }
    };

    _CheckError.prototype.showTips = function() {
      var oTips = this.getTipsDom()[0];
      if (this.iCode == _ERROR_IGNORED) {
        oTips.innerHTML = '';
        _.remClass(oTips, this.sActiveClass);
        _.addClass(oTips, this.sHideClass);
      } else if (this.iCode != _ERROR_SUCCESS) {
        oTips.innerHTML = this.toString();
        _.addClass(oTips, this.sActiveClass);
        _.remClass(oTips, this.sHideClass);
        _.remClass(oTips, _config.sTipsSuccess);
      } else {
        _.addClass(oTips, _config.sTipsSuccess);
        _.remClass(oTips, this.sActiveClass);
        _.remClass(oTips, this.sHideClass);
      }
    };

    _CheckError.prototype.showTips2 = function() {
      var oDoms = this.getTipsDom();
      if (!oDoms) {
        return false;
      }
      if (this.iCode == _ERROR_IGNORED) {
        oDoms[0].innerHTML = '';
        _.remClass(oDoms[1], _config.sRowPassed);
        _.remClass(oDoms[1], _config.sRowBlocked);
        _.remClass(oDoms[0], this.sActiveClass);
        _.addClass(oDoms[0], this.sHideClass);
      } else if (this.iCode != _ERROR_SUCCESS) {

        //don't overwrite existing errors!!!!
        if (!_.hasClass(oDoms[1], _config.sRowBlocked)) {
          oDoms[0].innerHTML = this.toString();
          
          _.remClass(oDoms[1], _config.sRowPassed);
          _.addClass(oDoms[1], _config.sRowBlocked);
          _.remClass(oDoms[0], this.sHideClass);
          _.addClass(oDoms[0], this.sActiveClass);
          if (oDoms[2]) {
            // this is baomu table, multi td in one tr
            _.remClass(oDoms[2], 'st-err-hidden');
            _.addClass(oDoms[2], 'st-err-show');
          }
        } else {
          //ignore this to avoid error overlap
          if (oDoms[2]) {
            // this is baomu table, multi td in one tr
            oDoms[0].innerHTML = this.toString();
            if (oDoms[2]) {
              _.remClass(oDoms[2], 'st-err-hidden');
              _.addClass(oDoms[2], 'st-err-show');
            }
          }
          _L('Notice ignored:'+this.sName+':'+this.iCode);
        }
      } else {
        oDoms[0].innerHTML = '';
        //_.remEl(oDom[0]);
        _.remClass(oDoms[1], _config.sRowBlocked);
        _.addClass(oDoms[1], _config.sRowPassed);
        _.addClass(oDoms[0], this.sActiveClass);
        _.remClass(oDoms[0], this.sHideClass);
        if (oDoms[2]) {
          _.remClass(oDoms[2], 'st-err-hidden');
          _.addClass(oDoms[2], 'st-err-show');
        }
      }
    };

    /*
    _CheckError.prototype.showLoading = function() {
      var oTips = this.getTipsDom()[0];
      oTips.innerHTML = '<img src="'+_config.sImgBase +_config.sLoadingImgSrc+'" />';
    };
    */

  /**
   * constructor of stauren validator
   * @constructor
   * @param {string} sForm the id or cssSelector string or name of form
   * @param {object} oConfig the configuration object
   * @config {string} notifyType notify type when error happened, default = tips,
   *                  possible value : 'tips', 'domDiv', 'alert', 'tips2','tipsdiy'
   * @config {function} getTipsDom (diy notify function for notifyType==tipsdiy)
   * @config {function} showTips (diy notify function for notifyType==tipsdiy)
   * @config {boolean} onSubmit set true to check the form when submit, default = true
   * @config {boolean} stopOnFirst set true to stop checking when the first error
   *                   happened, default = false
   * @config {boolean} checkOnBlur check an input when it losts focus, default = true
   * @config {boolean} hideSuccess set to true to hide success checking result, 
   *                   default = false 
   * @config {boolean} autoRequired set to true means every input should not be empty,
   *                   default = true
   * @config {string} ajaxLog the url to log the user action
   * @config {boolean} autoScroll auto vertically scroll to the first error, default true
   * @config {string} imageBase default http://cn.yimg.com/ncp/i315/img/
   */
  __.widget.Validator = function(sForm, oConfig) {
    oConfig = oConfig || {};
    var self = this;
    /**
     * the id or the name of the form
     * @type string
     */
    this.sForm = sForm;

    /**
     * the dom reference of the form
     * @type object
     */
    this.oForm = null;

    if(sForm) {
      var _oFormTmp = _$(sForm);
      this.oForm = _isNode(_oFormTmp[0]) ? _oFormTmp[0] :
        (_isNode(document.forms[sForm]) ? document.forms[sForm] : null);
    }

    if(this.oForm == null) {
      throw new Error(_config.sErrPrefix +'container form not found.');
      return;
    }

    _.addClass(this.oForm, _config.sFormClass);

    var _aInputs = _$('input, textarea', this.oForm),
      _aSelects = _$('select', this.oForm), _allInputs = _aInputs;

    _each(_aSelects, function(o) {
      _allInputs[_allInputs.length] = o;
    });

    this.aInputs = _allInputs;
    this.aInputTextArea = _aInputs;

    if(oConfig.onSubmit !== false) {
      _.on(this.oForm, 'submit', this._hSubmit, self, true);
    }

    this.bCheckOnBlur = false;
    if(oConfig.checkOnBlur !== false) {
      _.on(_aInputs, 'blur', this._hBlur, self, true);
      _.on(_aInputs, 'click', this._hClick, self, true);
      _.on(_aInputs, 'focus', this._hFocus, self, true);
      _.on(_aInputs, 'change', this._hChange, self, true);

      //_.on(_aInputs, 'keyup', this._hKeyup, self, true);
      this.bCheckOnBlur = true;
    }

    /**
     * the stored rules of form verification
     * index == the name of input element
     * @type object
     */
    this.oRules = {};

    /**
     * the stored self-defined error messages 
     * index == error code
     * @type object
     */
    this.oErrMessages = {};

    /**
     * the error notification type
     * default to 0
     * see the comment of 'setNoticeType' too
     * @type integer
     */
    this.iNoticeType = 0;
    oConfig.notifyType !== undefined &&
      this.setNoticeType(oConfig.notifyType, oConfig.getTipsDom, 
        oConfig.showTips);

    /**
     * whether return when the first error occur, default to true
     * @type boolean
     */
    this.stopOnFirst = oConfig.stopOnFirst === true ? true : false;
    
    this.autoRequired = oConfig.autoRequired === false ? false : true;

    this.ajaxLog = false;
    if (oConfig.ajaxLog && Math.ceil(Math.random()*100) <= oConfig.ajaxLog.rate) {
      this.ajaxLog = oConfig.ajaxLog;
    }

    this.startTime = (new Date()).getTime();

    this.autoScroll = oConfig.autoScroll === false ? false : true;

     _config.sImgBase = oConfig.imageBase || _config.sImgBase;
     _config.bHideSuccess = typeof oConfig.hideSuccess == 'boolean'
      ? oConfig.hideSuccess : _config.bHideSuccess;
  };

  __.widget.Validator.prototype = {

    /*
    _test : function() {
      console.log('test _$:'+(typeof _$('#hd div')[0] == 'object'));
      var aValue = _getObjFromId(['test-form1-name', 'test-form1-pwd']);
      console.log('test _getObjFromId:'+(typeof aValue['test-form1-name'] == 'string'));
      //console.log(document.forms['test-form1a']);
      this.addRules({'a':'a added', 'b':{'123':222}});
      console.log('test addRules:'+(this.oRules['a'] == 'a added'));
      //this.setNoticeType(_aNoticeType[1]);//div
      console.log('test setNoticeType:'+(this.iNoticeType == 1));
    }
    ,
    */

    /**
     * set a Rule to be checked with
     *
     * @memberOf __.widget.Validator
     * @param {string} sName equals input element "name" attribute or "id",
     *                 will look for name first
     * @param {object} oRule
     * @config {string} desc description of the input, 
     *                  used on error message, or title attribute will be used, 
     *                  then alt attr then name attr
     * @config {boolean} required default true
     * @config {string} predefined use predefined set of rules to check
     * @config {integer} maxLenth
     * @config {integer} minLenth
     * @config {number} maxValue 
     * @config {number} minValue
     * @config {regexp} mask value must pass the regexp
     * @config {string} content input's value must equal this
     * @config {string} equal another input's name, two value must equal 
     * @config {string} ajax the url to be requested is :
     *                  oRule.ajax+input.value
     *                  server return a JSON object, with code and message properties,
     *                  code=_ERROR_SUCCESS means success
     * @config {array} group an array of input names.
     *                 grouped inputs share the same notice tips
     *                 if checked an input and got _ERROR_SUCCESS, then will auto check its 
     *                 grouped inputs
     * @config {string} alter another input names or id, 
     *                  either of them must not be empty 
     * @config {string} inBoxNotice prefilled in input value which disappear on focus 
     * @config {object} extra 
     *                  like {1 : {name : 'xxx', rule : {required:true,...}}} 
     *                  input with extra must be type radio it self will not be checked
     *                  extra[input.value].name will be the relating input to be checked
     *                  extra[input.value].rule will be added to the relating input
     *                  click of the relating input will auto check the radio
     *                  an autoCheck rule will be added to the relating input when init 
     * @config {object} autoCheck structure:{name:xxx,value:xxx}
     * @config {bool} hideSuccess won't trigger notice when 200 
     * @config {integer} validateOrder validate inputs in form in order 
     * @config {boolean} trimValue trim the input value or not before check, default true
     * @config {object} isExtra add automatically, don't use it manually 
     */
    _addRule : function(sName, oRule) {
      var _self = this, _oNewRule, _oNewMsg, 
        _oriRules = this.oRules[sName],
        _fnMerge = function(oldOne, newOne) {
          return typeof oldOne == 'undefined' ? 
            newOne : _getMergeObj(oldOne, newOne);
      };
      _oNewRule = this._getValueFromRule(oRule);
      _oNewMsg = this._getErrMsgFromRule(oRule);

      _oriRules = _fnMerge(_oriRules, _oNewRule);

      //if hideSuccess is not set, then use the default set from _config
      if (typeof _oriRules.hideSuccess != 'boolean') {
        _oriRules.hideSuccess = _config.bHideSuccess;
      }
 
      if (_oriRules.inBoxNotice) {
        var ipt = this._getIptFromName(sName);
        if (ipt) {
          ipt.value === '' && (ipt.value = _oriRules.inBoxNotice);
          ipt.value === _oriRules.inBoxNotice &&
          _.addClass(ipt, _config.sInputInboxNotice);
        }
      }

      if (_oriRules.initErr) {
        var ipt = this._getIptFromName(sName),
          oErr = new _CheckError(_ERROR_INITERR, ipt, _oriRules, _oriRules.initErr);
        this._triggerNotice([oErr]);
      }

      // add autoCheck rule 
      if (_oriRules.extra) {
        var _relateIpt, oe = _oriRules.extra, tempOb;
        for(var _ind in oe) {
          tempOb = oe[_ind];
          this.oRules[tempOb.name] = _fnMerge(this.oRules[tempOb.name], {
            autoCheck : {
              name : sName,
              value : _ind
            }
          });
          //alert(_relateIpt);
        }
      }

      //add(merge) group rules to other inputs in group
      if (_oriRules.group) {
        var _aTheGroup = _map(_oriRules.group, function(o){return o});
        _aTheGroup[_aTheGroup.length] = sName;
        _each(_oriRules.group, function(o) {
          var _aGroupForMe;
          _self.oRules[o] || (_self.oRules[o] = {});
          _aGroupForMe = _self.oRules[o].group || [];
          _each(_aTheGroup, function(oItem) {
            if (oItem != o) {
              _inArray(oItem, _aGroupForMe) || (_aGroupForMe[_aGroupForMe.length] = oItem);
            }
          });
          _self.oRules[o].group = _aGroupForMe;
          
        });
      }

      this.oRules[sName] = _oriRules;
      _oNewMsg && (this.oErrMessages[sName] =
        _fnMerge(this.oErrMessages[sName], _oNewMsg));
      this._buildRuleForInput(sName);
    }
    ,

    /**
     * private function, check an input value by request a remote server
     * @param {string}, url to request 
     * @param {object}, input dom 
     */
    _ajaxCheck : function(sUrl, oInput) {
      /*
      var _oCEobj = new _CheckError(_ERROR_SUCCESS, oInput, '', oInput.name), _self = this,
        _sDiyTemplate = this.oRules[oInput.name] && this.oRules[oInput.name].errorMessage,
        _oCallback = {
        success : function(o) {
          var _oResult, _oCheckE;
          try {
            _oResult = _.fromJson(o.responseText);
          } catch(e) {}
          if (_oResult) {
            if (_oResult.code == _ERROR_SUCCESS) {
              _oCheckE = new _CheckError(_ERROR_SUCCESS, oInput, );
            } else {
              _oCheckE = new _CheckError(_ERROR_AJAXVALUEERR, oInput, '',
                _oResult.message+', Error Code:'+_oResult.code,
                _sDiyTemplate);
            }
          } else {
            _oCheckE = new _CheckError(_ERROR_AJAXFAIL, oInput, '', '', _sDiyTemplate);
          }
          _self._triggerNotice([_oCheckE]);
        },
        failure : function() {
          var _oCheckE = new _CheckError(_ERROR_AJAXFAIL, oInput,  '', '', _sDiyTemplate);
          _self._triggerNotice([_oCheckE]);
        }
      };
      _oCEobj.showLoading();
      */
      //_ajax(sUrl + encodeURI(oInput.value || ''), _oCallback);
    }
    ,

    /**
     * private function
     * use input but not input name because its class will be checkd
     * @param {string|object} id or name or Dom ref of an input
     */
    _buildRuleForInput : function(vIpt) {
      var oIpt = _.isString(vIpt) ? this._getIptFromName(vIpt) : vIpt;
      if (!oIpt) {
        return false;
      }
      var bAutoReq = this.autoRequired,
        _oRule = {required : bAutoReq},//default Rule 
        _sName = oIpt.name,
        _oConfigedRule = this.oRules[_sName] || {},
        _aPredefined = _oConfigedRule.predefined || [];
      _.isArray(_aPredefined) || (_aPredefined = [_aPredefined]);

/*
move this to _getRuleFromIpt, some input without rules to add failed on class-style rule
      for (var k in _oPredefinedRules) {
        //TODO:only one predefined rules could be apply
        //so make no sense to use array
        if (_.hasClass(oIpt, _config[k])) {
          _oRule = _getMergeObj(_oRule, _oPredefinedRules[k])
        }
      }
*/
      
      if (_aPredefined.length > 0) {
        _each(_aPredefined, function(o) {
          _oRule = _getMergeObj(_oRule,
            _oPredefinedRules[_oPredefinedRulesName[o]]); 
        });
      }

      if (this.oRules[_sName]) {
        _oRule = _getMergeObj(_oRule, this.oRules[_sName]);
        this.oRules[_sName] = _oRule;
      }
    }
    ,

    /**
     * private function, check one rule set
     * @param {string} value of input
     * @param {object} rule see comment of _addRule
     * @param {object} dIpt dom reference of the input element
     * @return {integer} errorCode
     */
    _check : function(sValue, oRule, dIpt) {
      //var _vReturn = true, _vTemp;
      var _vReturn = _ERROR_SUCCESS, _vTemp;
      for (var i in oRule) {
        _vTemp = _checkOneSetting(i, oRule[i], sValue);
        if (_vTemp != _ERROR_SUCCESS) {
          //_vReturn = new _CheckError(_vTemp, dIpt, oRule, dIpt.name);
          _vReturn = _vTemp;
          break;
        }
      }
      //_vReturn = _vReturn === true ? (new _CheckError(_ERROR_SUCCESS, dIpt, oRules, dIpt.name)) : _vReturn;
      return _vReturn;
    }
    ,

    /**
     * private function, check one rule by its name
     * @param {string}, rule name
     * @param {boolean}, do ajax or not, default true
     * @param {boolean}, do alter or not, default true
     * @param {boolean}, do extra or not, default false 
     * @return true, false or _CheckError object
     */
    _checkByName : function(sName, bDoAjax, bDoAlter, bDoExtra) {
      var _oRule, _oInput, _sValue, _oResult, _iResult,  _aInputs,
        _sIptType, _sIptTag, self = this, _fnGetErr;
      bDoAjax = bDoAjax === false ? false : true;
      bDoAlter = bDoAlter === false ? false : true;
      bDoExtra = bDoExtra === true ? true : false;

      if (sName === '') {
        _.log('Check input without name, ignore.');
        return new _CheckError(_ERROR_IGNORED, null, null, sName);
      }

      //_oInput = (this.oForm && this.oForm[sName]) || _$(sName)[0];
      _oInput = this._getIptFromName(sName);

      if (!_oInput) {
        _.log(_config.sErrPrefix +'Input '+ sName +' is not found.');
        return new _CheckError(_ERROR_IGNORED, null, null, sName);
      }

      if (_oInput[0] && _oInput.type === undefined) {
        //radio or check box, but not select
        _aInputs = _.a(_oInput);
        _oInput = _aInputs[0];
      }

      _sIptType = _oInput.type.toLowerCase();
      _sIptTag = _oInput.tagName.toLowerCase();
      _sValue = _oInput.value;

      _oRule = this._getRuleFromIpt(sName);  

      _fnGetErr = function(code) {
        var ce = new _CheckError(code, _oInput, _oRule);
        ce.sName = _oRule.desc || _oInput.title || _oInput.alt || sName;
        if (self.oErrMessages && self.oErrMessages[sName] && self.oErrMessages[sName][code]) {
          ce.sTemplate = self.oErrMessages[sName][code];
        }
        return ce;
      };
      
      if (_oRule.ignore) {
        //return _ERROR_IGNORED but _ERROR_SUCCESS because we don't want 
        //trigger a success notice
        return _fnGetErr(_ERROR_IGNORED);
      }

      if (!bDoExtra && _oRule.isExtra) {
        //don't check if this is an extra input(checked by owner)
        return _fnGetErr(_ERROR_IGNORED);
      }

      //this.clearNotice(_aInputs || _oInput);

   /*   if (_oRule.autoCheck) {
        var _oRadioRule = this.oRules[_oRule.autoCheck.name],
          _oRadioInputs = this.oForm[_oRule.autoCheck.name];
        if (_oRadioRule) {
          _sValue = '';
        }
      }*/

      if (_oRule.inBoxNotice && _sValue === _oRule.inBoxNotice) {
        _sValue = '';
      }

      if (_oRule.trimValue) {
        _sValue = _.trim(_sValue);
      }

      if (_sValue === '') {
        //deal with alter rule
        //required error happened, and if alter is set
        if (bDoAlter && _oRule.alter) {
          var _oAltResult = this._checkByName(_oRule.alter, true, false);
          if (_oAltResult.iCode == _ERROR_ALTER) {
            //both empty error is the ori's _ERROR_ALTER
            _iResult = _ERROR_ALTER;
          } else {
            //other err is the alter's err
            return _oAltResult;
          }
        } else {
          if (_oRule.alter) {
            //this is altering check of another input
            _iResult = _ERROR_ALTER;

          //} else if (_oRule.required === true) {
          //changed 2009-03-30, xslt can't determing value is string or bool,
          //just add quote for everything
          } else if (_oRule.required === true || _oRule.required === 'true') {
            _iResult = _ERROR_EMPTY;
          } else {
            //changed here : value:'' + required:false
            //don't trigger 200 notice here
            //_iResult = _ERROR_SUCCESS;
            _iResult = _ERROR_IGNORED;
          }
        }
      }

      if (_iResult) {
        return _fnGetErr(_iResult);
      }
      
      if (_oRule.equal) {
        var _oOtherIpt = this._getIptFromName(oRule.equal);
        if (_oOtherIpt && _sValue !== _oOtherIpt.value) {
          return _fnGetErr(_ERROR_PWDSAME);
        }
      }

      if (_sIptType == 'radio' || _sIptType == 'checkbox') {

        /**
         * input with extra it self will not be checked
         * this rule should only be used on radio input(checkbox?)
         * extra[input.value].name will be the relating input to be checked
         * extra[input.value].rule will be added to the relating input
         * click of the relating input will auto check the radio
         */
        if (_oRule.extra) {
          var _sCurrentRadioValue, _oTheExtraRuleSet;
          if(_aInputs) {//value for radios and checkboxs
            _each(_aInputs, function(o) {
              if (o.checked) {
                _sCurrentRadioValue = o.value;
              }
            });
          }
          
          _oTheExtraRuleSet = _oRule.extra[_sCurrentRadioValue];
          if (!_oTheExtraRuleSet) {
            return _fnGetErr(_ERROR_IGNORED);
          }
          this._setExtraRule(_oRule.extra, _sCurrentRadioValue);
          var _sExtraName = _oTheExtraRuleSet.name;

          return this._checkByName(_sExtraName, true, true, true);
        }
        //1 or more radio with the same name
        _iResult = this._checkRadio(_aInputs || [_oInput], _oRule);
      } else if (_sIptTag == 'select') {
        _iResult = this._checkSelect(_oInput, _oRule);
      } else {
        if (_oRule.ajax) {
          //TODO: ajax check should stop the form submit
          /*bDoAjax && 
            this._ajaxCheck(_oRule.ajax, _oInput);*/
          return _fnGetErr(_ERROR_IGNORED);
        }
        _iResult = this._check(_sValue, _oRule, _oInput);
      }

      //_oResult = _fnGetErr(_iResult);
      
      //_oResult.sName = _oRule.desc || _oInput.title || _oInput.alt || sName;
      //hideSuccess rule
      if (_oRule.hideSuccess && _iResult == _ERROR_SUCCESS) {
        return _fnGetErr(_ERROR_IGNORED);
      }

      //_oRule.errorMessage && (_oResult.sTemplate = _oRule.errorMessage);
      /* this.oErrMessages && this.oErrMessages[sName] &&
        this.oErrMessages[sName][_oResult.iCode] &&
        (_oResult.sTemplate = this.oErrMessages[sName][_oResult.iCode]);
      _oResult.oDomInput = _oInput;*/

      _oResult = _fnGetErr(_iResult);
      return _oResult;
    }
    ,

    /**
     * private function, check an array of radio input or checkbox input
     * @return {integer} errorCode
     */
    _checkRadio : function(aInputs, oRules) {
      //sNeededClass
      aInputs = _.a(aInputs);
      var _checked = false, _iReturn = _ERROR_SUCCESS, _bWrongSelect = false;
      _each(aInputs, function(o){
        if (o.checked === true) {
          _checked = true;
        } else if (_.hasClass(o, _config.sNeededClass)) {
          _bWrongSelect = true;
        }
      });
      if (oRules.required && !_checked) {
        _iReturn = _ERROR_EMPTYCHECK;
      } else if (_bWrongSelect) {
        _iReturn = _ERROR_NEEDED;
      }
      return _iReturn;
    }
    ,

    /**
     * private function, check a select
     * @return {integer} errorCode
     */
    _checkSelect : function(oSelect, oRules) {
      //sNeededClass
      var _iIndex = oSelect.selectedIndex, 
        _sValue = oSelect[_iIndex].value;
      return this._check(_sValue, oRules, oSelect);
    }
    ,

    /**
     * private function
     */
    _getErrMsgFromRule : function(o) {
      //_oErrorOfRule 
      var notempty = false, err = {};
      _each(o, function(v, k) {
        if (v.errorMsg) {
          notempty = true;
          _each(_oErrorOfRule[k], function(item) {
            err[item] = v.errorMsg;//because empty==2error
          });
        }
      }, true);
      return notempty ? err : notempty;
    }
    ,

    /**
     * private function
     */
    _getRuleFromIpt : function(vIpt) {
      var bAutoReq = this.autoRequired, 
        defaultRule = {ignore : true},
        sName, oIpt, oRule;
      if (vIpt === '') {
        return defaultRule;
      }

      if (_.isString(vIpt)) {
        sName = vIpt;
        oIpt = this._getIptFromName(sName);
      } else {
        sName = vIpt.name;
        oIpt = vIpt;
      }

      if (!oIpt) {
        return defaultRule;
      }

      /*if (!oIpt.type || !oIpt.type.toLowerCase &&
        oIpt.type.toLowerCase() != 'hidden') {
        //the default rule for hidden input is ignore
        //or it may cause error which could not been seen
        defaultRule = {required : bAutoReq};
      }*/
      //now all input's default rule is ingore if autoRequired == false
      if (bAutoReq) {
        defaultRule = {
          required : true,
          hideSuccess : _config.bHideSuccess
        };
      }

      oRule = this.oRules[sName] || defaultRule;
      oRule.trimValue = oRule.trimValue === false ? false : true;

      _.e(_oPredefinedRules, function(o,i) {
        //TODO:only one predefined rules could be apply
        //so make no sense to use array
        if (_.hasClass(oIpt, _config[i])) {
          oRule = _getMergeObj(oRule, o);
        }
      }, true);
      
      return oRule;
    }
    ,

    /**
     * private function
     */
    _getValueFromRule : function(o) {
      var rulevalue = {};
      _each(o, function(v, k) {
        //compatible with rule version 1.0.3
        rulevalue[k] = v.value !== undefined ? v.value : v;
      }, true);
      return rulevalue;
    }
    ,

    /**
     * private function
     */
    _getIptFromName : function(sStr) {
      var found;
      if (sStr != '') {
        found = this.oForm[sStr] || _.f(sStr, this.oForm);
      }
      if (found) {
        return found;
      } else {
        _.log(_config.sErrPrefix +'Input "'+ sStr +'" not found.');
        return false;
      }
    }
    ,

    /**
     * private function, input on blur handler
     */
    _hBlur : function(e) {
      //_.stopEvent(e);
      var _oInput = _.getTarget(e),
        _oRule = this._getRuleFromIpt(_oInput);  

      if (_oRule.inBoxNotice && _oInput.value === '') {
        _oInput.value = _oRule.inBoxNotice;
        _.addClass(_oInput, _config.sInputInboxNotice);
      }
      if (_oInput.type != 'submit' && _oInput.type != 'image' && _oInput.type != 'button'
        && _oInput.type != 'radio' && _oInput.type != 'checkbox'
      ) {
        this._validateInput(_oInput, true, true, false); 
      }
    }
    ,

    /**
     * private function, inputs onchange handler
     */
    _hChange : function(e) {
      //_.stopEvent(e);
      /*var _oInput = _.getTarget(e);

      */
    }
    ,

    /**
     * private function, onclick handler
     * mainly used for radio & checkbox onchange validate handle (instead of onblur)
     */
    _hClick : function(e) {
      //_.stopEvent(e);
      var _oInput = _.getTarget(e);

      if (_oInput.type == 'radio' || _oInput.type == 'checkbox') {
        this._validateInput(_oInput, true, true, false);
      }
    }
    ,

    /**
     * private function, handler for input on focus
     * mainly used to clear tips on focus
     */
    _hFocus : function(e) {
      //_.stopEvent(e);
      var _oInput = _.getTarget(e),
        _oRule = this._getRuleFromIpt(_oInput),
        _sType = _oInput.type;  
      if (!_oRule.ignore && _sType != 'submit' &&
          _sType != 'image' && _sType != 'button' &&
          (this.iNoticeType == 0 || this.iNoticeType == 3
            || this.iNoticeType == 4) 
      ) {
        this.clearNotice(_oInput);
      }

      if (_oRule.extra) {
        var _oTempE, ipt, i;
        for(i in _oRule.extra) {
          _oTempE = _oRule.extra[i];
          ipt = this._getIptFromName(_oTempE.name);
          ipt && this.clearNotice(ipt);
        }
      }

      if (_oRule.autoCheck) {
        var _sCurRadioValue, _sRadioName = _oRule.autoCheck.name,
          ipts = (this.oForm && this.oForm[_sRadioName]) || _$(_sRadioName);
        _each(ipts, function(o) {
          if(o.value == _oRule.autoCheck.value) {
            o.checked = true;
            _sCurRadioValue = o.value;
          }
        });
        if (this.oRules[_sRadioName] && this.oRules[_sRadioName].extra) {
          this._setExtraRule(this.oRules[_sRadioName].extra, _sCurRadioValue);
        }
      }

      if (_oRule.inBoxNotice && _oInput.value === _oRule.inBoxNotice) {
        _oInput.value = '';
        _.remClass(_oInput, _config.sInputInboxNotice);
      }
/*
      if (_sType == 'radio' || _sType == 'checkbox') {
        //the value don't 
        //var _aRCs = this.oForm[];
        //this._validateInput(_oInput, true, true, false);
      }

        var fm = _.$('request')[0]['category-radio'],rt='';
        for (var i=0,j=fm.length;i<j;i++) {
          rt += fm[i].checked;
        }
        console.log(rt);
        */
    }
    ,

    /**
     * private function, input on keyup handler
     */
    _hKeyup : function(e) {
      _.stopEvent(e);
      var _oInput = _.getTarget(e);
      if (_oInput.type != 'submit') {
        this._validateInput(_oInput, true, false);
      }
    }
    ,

    /**
     * private function, form on submit handler
     */
    _hSubmit : function(e) {
      this._validateForm(e);
    }
    ,

    /**
     * private function, add error class to input
     */
    _notifyInput : function(el) {
      _.addClass(el, _config.sInputErrorClass);
    }
    ,

    /**
     * private function, add error class to input
     */
    _normalizeInput : function(el) {
      _.remClass(el, _config.sInputErrorClass);
    }
    ,

    /**
     * private function, set extra rules 
     */
    _setExtraRule: function(extra, sRadioValue) {
      var _oTheExtraRuleSet = extra[sRadioValue];
      if (!_oTheExtraRuleSet) {
        return false;
      }
      var _sExtraName = _oTheExtraRuleSet.name, _oNewRule = _oTheExtraRuleSet.rule;

      this._addRule(_sExtraName, _getMergeObj(_oNewRule, {isExtra : true}));
    }
    ,

    /**
     * private function, trigger the notification for user
     * @param {array} aCheckError, array of _CheckError object
     */
    _triggerNotice : function(aCheckError) {
      var _iType = this.iNoticeType, self = this,
        _sType = _aNoticeType[_iType] ? _aNoticeType[_iType] : _aNoticeType[0];
      switch(_sType) {
        case 'tips': 
        case 'tips2': 
        case 'tipsdiy': 
          _each(aCheckError, function(o) {
            o.showTips && o.showTips();
            if (o.iCode != _ERROR_SUCCESS && o.iCode != _ERROR_IGNORED) {
              self._notifyInput(o.oDomInput);
            } else {
              self._normalizeInput(o.oDomInput);
            }
          });
          break;
        case 'domDiv': 
          break;
        case 'alert': 
          var _aMessage = _map(aCheckError, function(o) {
            if (o.iCode != _ERROR_SUCCESS && o.iCode != _ERROR_IGNORED) {
              self._notifyInput(o.oDomInput);
            } else {
              self._normalizeInput(o.oDomInput);
            }
            //o.iCode != _ERROR_SUCCESS && self._notifyInput(o.oDomInput);
            return o.toString();
          }), _sMessage = _aMessage.join('，\n');
          alert(_sMessage);
          break;
      }
    }
    ,

    /**
     * validate the form
     *@return {boolean} true if the form passed validate
     */
    _validateForm : function(e) {

//      var _oRules = this.oRules;
      var _aInputs, _aResult = [], self = this, _bIsEnd = false,
        _aFinishedCheckRadio = [], _aIgnoreChecking = [], _oFirstEI,
        _aAllRule = this.oRules;

      _aInputs = this.aInputs;
      _aInputs.sort(function(a,b) {
        var namea = a.name, nameb = b.name, rulea, ruleb;

        // put those who don't have name later to check
        if (!namea) {
          return 1;
        }
        if (!nameb) {
          return -1;
        }

        rulea = _aAllRule[namea];
        ruleb = _aAllRule[nameb];
        
        // put those who don't have rule configed or don't
        // have a validateOrder later to check
        if (!rulea || !rulea.validateOrder) {
          return 1;
        }
        if (!ruleb || !ruleb.validateOrder) {
          return -1;
        }

        return rulea.validateOrder - ruleb.validateOrder;
      });
      /*if (this.oForm) {
        _aInputs = _$('input, textarea, select', this.oForm);
        //_each(_$('textarea', this.oForm), function(o) {
        //  _aInputs[_aInputs.length] = o;
        //});
      }*/

      _reduce(_aInputs, function(isend, o, i) {
        var _sType = o.type.toLowerCase();
        if (isend || _sType == 'submit' || _sType == 'button' || _sType == 'image') {
          return isend;
        }
        var _sName = o.name, _oResult;
        if (_inArray(_sName, _aIgnoreChecking)) {
          //ignore checking the group when 1 ipt of the group failed
          return isend;
        }
        if (_sType == 'radio' || _sType == 'checkbox') {
          //only check a set of radio once
          if (_inArray(_sName, _aFinishedCheckRadio)) {
            return isend;
          } else {
            _aFinishedCheckRadio[_aFinishedCheckRadio.length] = _sName;
          }
        }
        _oResult = self._checkByName(_sName);
        _.log(_oResult);
        if (_oResult && _oResult.iCode != _ERROR_IGNORED) {
          _aResult[_aResult.length] = _oResult;
          if(_oResult.iCode != _ERROR_SUCCESS) {
            typeof e == 'object' && _.stopEvent(e);
            if (_oFirstEI === undefined) 
              _oFirstEI = (self.iNoticeType == 0 || self.iNoticeType == 3)
              ?  _oResult.getTipsDom()[0] : _oResult.oDomInput.parentNode;
            if (self.stopOnFirst) {
              self._triggerNotice(_aResult);
              return true;
            }
            //if error happend on one member of a group,
            //stop check the other member
            if (self.oRules[_sName] && self.oRules[_sName].group) {
              _each(self.oRules[_sName].group, function(o) {
                _aIgnoreChecking[_aIgnoreChecking.length] = o;
              });
            }
          } else {
            /*// move this out, because now empty value with
              // required:false trigger ignore error
              //!!above is wrong!, because grouped empty value may return 
              // success!
            if (self.oRules[_sName] && self.oRules[_sName].inBoxNotice) {
              var _oIptWithInbox = self._getIptFromName(_sName);
              if (_oIptWithInbox.value ===
                self.oRules[_sName].inBoxNotice) {
                _oIptWithInbox.value = '';
              }
            }
            */
          }
        }/* else if (_oResult) {
          if (self.oRules[_sName] && self.oRules[_sName].inBoxNotice) {
            var _oIptWithInbox = self._getIptFromName(_sName);
            if (_oIptWithInbox.value ===
              self.oRules[_sName].inBoxNotice) {
              _oIptWithInbox.value = '';
            }
          }
        }*/
        if (self.oRules[_sName] && self.oRules[_sName].inBoxNotice) {
          var _oIptWithInbox = self._getIptFromName(_sName);
          if (_oIptWithInbox.value ===
            self.oRules[_sName].inBoxNotice) {
            _oIptWithInbox.value = '';
          }
        }
      }, _bIsEnd);
      this._triggerNotice(_aResult);
      var y = _.getElXY(_oFirstEI)[1],
        bNoError = _oFirstEI === undefined;
      y = y || 100;//hidden input
      bNoError || !this.autoScroll || window.scrollTo(0,y-100);
      //focus will erase the first error message
      this.bCheckOnBlur || _oFirstEI.focus();
      return bNoError;
    }
    ,

    /**
     * validate an input, could choose whether auto validate its group inputs
     * @return {integer|bool}
     */
    _validateInput : function(oInput, bValidateGroup, bValidateAjax, bNoticeEmpty) {
      bValidateGroup = bValidateGroup === false ? false : true;
      bValidateAjax = bValidateAjax === false ? false : true;
      bNoticeEmpty = bNoticeEmpty === false ? false : true;
      var _self = this, _sName = oInput.name,
        //do isExtra check
        _oResult = this._checkByName(_sName, bValidateAjax, null, true),
        _iReturn = _oResult.iCode,
        _aGrp = this.oRules[_sName] ? this.oRules[_sName].group : false;
      if(_oResult && _iReturn != _ERROR_IGNORED) {
        if (_iReturn == _ERROR_SUCCESS ||
            //because user can't see the error when operation
            (_iReturn == _ERROR_EMPTY && bNoticeEmpty)
        ) {
          if (bValidateGroup && _aGrp) {
            bValidateGroup = _reduce(bValidateGroup, function(base, o) {
              base && _each(_self.aInputs, function(p) {
                if (o == p.name) {
                  base = _self._validateInput(p, false) === _ERROR_SUCCESS ? true : false;
                }
              });
              return base;
            }, _aGrp);
          }
          //bValidateGroup == false means a notice has been triggered
          //only the first success in a group trigger _ERROR_SUCCESS notice
          bValidateGroup && this._triggerNotice([_oResult]);
          _iReturn = _ERROR_SUCCESS;
        } else if (_iReturn == _ERROR_EMPTY && !bNoticeEmpty){
        } else {
          this._triggerNotice([_oResult]);
        }
      }

      //change from false to icode, ajaxLog need this code
      this.sendAjaxLog(_sName, oInput.value, _iReturn);
      return _iReturn;
    }
    ,

    /**
     * Public API begins:
     */

    /**
     * add batch rules
     * @see __.widget.Validator._addRule
     * @param {object} oNewRules array of sName
     * @config {string} name name of a rule
     * @config {object} rule rule object
     */
    addRules : function(oNewRules) {
      var self = this;
      for(var i in oNewRules) {
        self._addRule(i, oNewRules[i])
      }
    }
    ,

    /**
     * clear all notice class on input and remove notice tips
     * @return boolean
     */
    clearAll : function() {
      this.clearNotice(this.aInputs);
    }
    ,

    /**
     * clear notice class on input and remove notice tips
     * @param {object|array} vInput dom reference of input object
     * @return boolean
     */
    clearNotice : function(vInput) {
      var self = this, fn = function(o) {
        o = _.f(o);
        if (!o) {
          return;
        }
        var oErr = new _CheckError(_ERROR_IGNORED, o);
        self._normalizeInput(o);
        oErr.showTips();
      };
      /*if (this.iNoticeType == 1) {
        fn = function(o) {
          self._normalizeInput(o);
          var oExistingTips = _$(_config.sInlineErrorTag+
            '.'+_config.sInlineErrorClass, o.parentNode, true)[0];
          if (_isNode(oExistingTips)) {
            oExistingTips.innerHTML = '';
            _.remClass(oExistingTips, _config.sErrorActiveClass);
          }
        };
      } else if (this.iNoticeType == 3) {
        fn = function(o) {
          var td = o.parentNode.parentNode, oExistingTips;
          while(td && td != document.body) {
            if (td.tagName.toLowerCase() == 'td') {
              break;
            }
            td = td.parentNode;
          }

          if (td.tagName.toLowerCase() == 'td') {
            oExistingTips = _$(_config.sInlineErrorTag+'.'+
              _config.sInlineErrorClass, td, true)[0];
            if (_isNode(oExistingTips)) {
              oExistingTips.innerHTML = '';
              _.remClass(td.parentNode, _config.sRowBlocked);
              _.remClass(td.parentNode, _config.sRowPassed);
            }
          }
        };
      }*/
      _each(vInput, fn);
    }
    ,

    /**
     * cancel listening events
     */
    cancel : function() {
      _.off(this.aInputTextArea, 'blur', this._hBlur, self, true);
      _.off(this.aInputTextArea, 'click', this._hClick, self, true);
      _.off(this.aInputTextArea, 'focus', this._hFocus, self, true);
      _.off(this.aInputTextArea, 'change', this._hChange, self, true);
      _.off(this.oForm, 'submit', this._hSubmit, self, true);
    }
    ,

    /**
     * send check result log back to server
     * @param {string} sName input name
     * @param {string} sValue input value
     * @param {integer} iCode error code
     */
    sendAjaxLog : function(sName, sValue, iCode) {
      if (this.ajaxLog) {
        var al = this.ajaxLog,
          newTime = (new Date()).getTime(),
          passedTime = newTime - this.startTime,
          oPost = {
            beid : al.id,
            input_name : sName,
            input_value : sValue,
            input_time : passedTime,
            error : iCode,
            url : escape(location.href)
          };
        this.startTime = newTime;
        _amp({
          sUrl : al.url,
          sPost : "method=record&params=[" + _.toJson(oPost) + "]",
          fnSuccess : function(o) {
            //_L(o.responseText);
            _L([sName, ':', iCode, ':', sValue].join(''));
          },
          fnFailure : function() {}
        });
      }
    }
    ,

    /**
     * set notice type when error happened
     * @param {string} sNotice possible value: 
     *                 'tips', 'domDiv', 'alert', 'tips2','tipsdiy'
     * @return boolean
     */
    setNoticeType : function(sNotice) {
      var _bReturn = _inArray(sNotice, _aNoticeType);
      if(_bReturn) {
        this.iNoticeType = _bReturn[0];
        if (_bReturn[0] == 3) {
          _CheckError.prototype.getTipsDom =
            _CheckError.prototype.getTipsDom2;
          _CheckError.prototype.showTips =
            _CheckError.prototype.showTips2;
        } else if (_bReturn[0] == 4) {
          _CheckError.prototype.getTipsDom = arguments[1];
          _CheckError.prototype.showTips= arguments[2];
        }
        _bReturn = true;
      }
      return _bReturn;
    }
    ,

    /**
     * public function, validate the form
     */
    validate : function() {
      return this._validateForm(false);
    }

  };

})();
