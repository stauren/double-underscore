/*!
 * @file imguploader.js
 * @class __.widget.ImgUploader
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

(function(_scope) {

var _NAME = '__', _SELF = _scope[_NAME],
  _VERSION;

if (!_scope[_NAME] || !_scope[_NAME].add) {
  return;
}

_VERSION = _SELF.cfg[2];

_SELF.register('imguploader', _VERSION, ['core'], function() {

  __.set("__.widget");
  __.log('ImgUploader: Class begin.');

  var  _config = {
    _sRootClass : 'st-iu',
    _sFileIptPostFix : '-st-fipt',
    _sDataIptPostFix : '-st-dataipt',
    _sSpinningImgPostFix : '-st-spinningload',
    _sSpinningClass : 'st-iu-spinningctn',
    _sSpinningText : 'Uploading, please wait......',
    _sSpinningImgSrc : 'http://localhost/att/workspace/os/svn/trunk/src/imguploader/loading.gif',
    _sFileIptCtn : 'st-iu-fipt-ctn',
    _sFileIptNoticeCtn : 'st-iu-fipt-notice',
    _sUploadedCtn : 'st-iu-uploaded-ctn',
    _sCropperCtn : 'st-iu-cropper-ctn',
    _sImgsCtn : 'st-iu-imgs-ctn',
    _sFileIptNotice : 'Multiple upload. Support jpg, gif and png. Picture file must be smaller than 500k. Best resolution 640x480.',
    _sBeingUploadingNotice : 'Please wait... If it\'s taking too long to response, please refresh the page',
    _sChoosePicNotice : 'Please choose a picture first',
    _sWrongPic : 'Please select a valid picture',
    _sImgTypeNotice : 'This format is not support',
    _sPostUrl : '/fuwu/common/uploads',
    _iTimeout : 60000,
    _sTimeoutNotice : 'Server timeout, please try again later',
    _sError500 : 'Server error, please try again later',
    _sErrorMaxCount : 'Max picture count reached.',
    _sDelete : 'Delete',
    maxImgCount : 5,
    _iFileIptSize : 45,
    _iResultImgWidth : 88
  };
  var _D = _SELF.Dom, _L = _SELF.Lang, _E = _SELF.Event;

  /**#@+
   * the private functions
   * @private
   * @memberOf __.widget.ImgUploader
   */
  
  /**
   * initiate elements id and name
   */
  var _initIds = function(id, scope) {
    scope._sFileIptName = _config.inputName || (id + _config._sFileIptPostFix);
    scope._sFileIptId = id + _config._sFileIptPostFix;
    scope._sDataInput = _config.jsonName || (id + _config._sDataIptPostFix);
    scope._sSpinningId = id + _config._sSpinningImgPostFix;
  };

  /**
   * create upload elements on the fly
   */
  var _createEls = function(scope) {
    var a=_D.addEl([{
      cls : _config._sFileIptCtn
    }, {
      cls : _config._sFileIptNoticeCtn, text : _config._sFileIptNotice, child : {
        tag : 'input', name : scope._sDataInput, id : scope._sDataInput, type : 'hidden'
      }
    }, {
      cls : _config._sUploadedCtn, child : {
        tag : 'ul'
      }
    }], scope.oRoot);
    scope.dFileIptCtn = _D.f('.'+ _config._sFileIptCtn, scope.oRoot);
    scope.dUploadedCtn = _D.f('.'+ _config._sUploadedCtn + ' ul', scope.oRoot);
  };

  /**
   * function to get or create the images container
   */
  var _getImgsCtn = function(scope) {
    if (!scope.dImgsCtn) {
      scope.dImgsCtn = _D.addEl({
        cls : _config._sImgsCtn
      }, scope.oRoot);
    }
    return scope.dImgsCtn;
  };

  /**
   * reset file ipt to avoid repeat click
   */
  var _resetFileIpt = function(scope) {
    scope.dFileIptCtn.innerHTML = '<input type="file" name="'+ scope._sFileIptName +'" id="'+
      scope._sFileIptId +'" size="'+ _config._iFileIptSize +'" />';
    scope.dFileIpt = _D.f(scope._sFileIptId);
    _E.on(scope.dFileIpt, 'change', function() {
      _canDoUpload(scope) && _doUpload(scope);
      _resetFileIpt(scope);
    });
  };

  /**
   * detect whether we are uploading, user select the wrong file,
   * user has uploaded too many files
   */
  var _canDoUpload = function(scope) {
   if (scope.bUploading) {
      alert(_config._sBeingUploadingNotice);
      return false;
    }
    var maxCount = _config.maxImage || _config.maxImgCount;
    if (scope.uploadedImgs.length >= maxCount) {
      alert(_config._sErrorMaxCount);
      return false;
    }
    var _pwdPic = scope.dFileIpt.value;
    if (_pwdPic == '') {
      alert(_config._sChoosePic);
      return false;
    }
    if (__.config.ua.ie < 8 && !/^[a-zA-Z]:\\|^\//.test(_pwdPic)) {
      alert(_config._sWrongPic);
      return false;
    }
    if (!/\.(gif|jpg|png|jpeg|jpe)$/i.test(_pwdPic)) {
      alert(_config._sImgTypeNotice);
      return false;
    }
    return true;
  };

  /**
   * add event handler for the created elements
   */
  var _addEvents = function(scope) {
    _E.on(scope.dUploadedCtn, 'click', function(e) {
      var tat = e.target;
      if (tat && tat.tagName && tat.tagName.toLowerCase() == 'a') {
        tat = tat.parentNode.parentNode;
      }
      _fnRmImage(tat, scope);
    });
  };

  /**
   * real image uploading function
   * @description the responseText will be a JSON string and parsed to get an object,
   *   the object MUST have a url property and a data property
   */
  var _doUpload = function(scope) {
    _changeLoadingTip(true, scope);
    console.log(scope.dFileIpt.value);
    /*
    YAHOO.util.Connect.setForm(scope.dForm, true);
    var cObj = YAHOO.util.Connect.asyncRequest('POST', _config.postUrl || _config._sPostUrl, {
      timeout: _config.timeout || _config._iTimeout,
      upload : function(o) {
        var sResText = o.responseText, oRes;

        var dDiv = _E.addEl({
          html : sResText
        });
        sResText = dDiv.childNodes[0].nodeValue;

        //debug example
        //big
        //sResText = "{\"data\":\"what the fuck\",\"url\":\"http://cn.yimg.com/ncp/i315/img/tg/job_380x170_090225.gif\"}";
        //small
        //sResText = "{\"data\":\"what the fuck\",\"url\":\"http://i0.sinaimg.cn/blog/2/2008/1230/U2681P478T2D53542F21DT20090311143618.jpg\"}";
        _SELF.log('ImgUploader: '+ sResText);

        // remove tailing comments 
        var iComment = sResText.indexOf('<!-'+'-');
        sResText = iComment > 0 ? sResText.substr(0, iComment) : sResText;

        oRes = JSON.parse(sResText);
        _SELF.log(oRes);

        if (oRes && oRes.code && oRes.code == 200) {
          _afterUploading(oRes, scope);
        } else {
          oRes = oRes || {};
          alert(oRes.msg || oRes.message || _config._sError500);
          _changeLoadingTip(false, scope);
        }
      },
      failure : function(o) {
        alert(_config._sTimeoutNotice);
        _changeLoadingTip(false, scope);
      }
    });
    */
  };
  
  /**
   * set the upload status, to lock further uploading until this one is finished
   * and show a spining pic
   * @param {boolean} bShow true the lock, false to unlock
   */
  var _changeLoadingTip = function (bShow, scope) {
    var spinningId = scope._sSpinningId;
    var newImg = _D.f(spinningId);
    newImg && _D.remEl(newImg);
    if (bShow) {
      scope.bUploading = true;
      var notice = _D.addEl({
        tag : 'span', cls : _config._sSpinningClass, id : spinningId, child : [{
          tag : 'img', src : _config._sSpinningImgSrc
        }, {
          tag : 'span', text : _config._sSpinningText 
        }]
      });
      _D.insertAfter(notice, scope.dFileIptCtn);
    } else {
      scope.bUploading = false;
    }
  };

  /**
   * image upload oncomplete handler
   * @param {object} res object parsed from responseText
   * @config {string} url the uploaded image url
   * @config {object} data data of the uploaded image
   * @param {object} the ImgUploader object
   */
  var _afterUploading = function(res, scope) {
    if (!res || !res.url) {
      alert(oRes.msg || oRes.message || _config._sError500);
      _changeLoadingTip(false, scope);
      return false;
    }
    if (_config.cropConfig) {
      _doImgCrop(res, scope);
    } else {
      _fnAddImage(res, scope);
      _changeLoadingTip(false, scope);
    }
    scope.fnAfterUploading(res, scope);
  };
  
  /**
   * add image to the image container
   */
  var _fnAddImage = function(obj, scope) {
    var img = new Image();
    img.onload = function() {
      _D.addEl({
        tag : 'li', child : [{
          child : {
            tag : 'img', src : obj.url, css : 'width:'+_config._iResultImgWidth+'px;height:'+
              (_config._iResultImgWidth/img.width*img.height) +'px;'
          }
        }, {
          child : {
            tag : 'a', href : 'javascript:void(0)', text : _config._sDelete
          }
        }]
      }, scope.dUploadedCtn);
      scope.uploadedImgs.push(obj.data);
      //scope.uploadedImgs.push(obj);
      _D.f(scope._sDataInput).value = JSON.stringify(scope.uploadedImgs);
    };
    img.src = obj.url;
  };

  /**
   * remove image from the image container
   */
  var _fnRmImage = function(li, scope) {
    var lis = _D.$('li', scope.dUploadedCtn);
    var iClicked = _L.find(lis, _L.curry('===', li));
    _D.remEl(lis[iClicked]);
    _L.arrayRemove(scope.uploadedImgs, iClicked);
    _D.f(scope._sDataInput).value = JSON.stringify(scope.uploadedImgs);

  };

  /**
   * call the image cropper widget
   * the crop rpc response must contain a code, 200 means success
   */
  var _doImgCrop = function(obj, scope) {
    var cConf = _config.cropConfig;

    cConf.onPostSuccess = function(res, result) {
      _fnAddImage(res, scope);
      _changeLoadingTip(false, scope);
      cConf.onPostSuccess_ori(res, result);
    };
    cConf.onPostFail = function(res, result) {
      _changeLoadingTip(false, scope);
    };
    cConf.onCancel = function() {
      _changeLoadingTip(false, scope);
      cConf.onCancel_ori();
    };

    cConf.imageInfo = obj.data;

    var _yic = new __.widget.ImgCropper(_config._sCropperCtn, obj.url, cConf);
  };
  /**#@-*/

  __.widget.ImgUploader = __.Class.extend(
  /**
   * @lends __.widget.ImgUploader.prototype
   */
  {

    /**
     * set to true to block further uploading
     * @type boolean
     */
    bUploading : false,

    /**
     * after uploading callback
     * @type function
     */
    fnAfterUploading : _L.EF,

    /**
     * image json array
     * @type array
     */
    uploadedImgs : [],

    /**
     * the method used to set the onLoad handler of uploading,
     * the handler receive a object param parsed from the responseText
     * @param {function} handler the callback function
     */
    setOnLoadedFn : function(fn) {
      this.fnAfterUploading = fn;
    }
    ,

    /**
     * add uploaded images, update, both displayed images and uploadedImgs array
     * @param {object|array} vImage image date object or array of object
     * @config {string} url image url
     * @config {mixed} data image data
     */
    addImages : function(vImage) {
      var that = this;
      _SELF.toCall(function() {
        _L.e(vImage, function(o) {
          _fnAddImage(o, that);
        });
      }, function() {
        return that.bInitiated === true
      });
    },

    /**
     * the constructor of image uploader
     * @constructs
     * @param {string} sId container id 
     * @param {object} config detail config object
     * @config {string} inputName name of the file input
     * @config {string} jsonName name of the returned json input
     * @config {string} postUrl the url of img uploading
     * @config {integer} timeout uploading timeout, miliseconds
     * @config {integer} maxImage how many images can be loaded
     * @config {object} cropConfig config object of image crop config, don't set it if do not want to crop, config detail check the __.ImgCropper.init
     */
    init : function(sId, config) {
      this.oRoot = _D.f(sId);
      if (!this.oRoot) {
        _SELF.log('ImgUploader: Container is not found!');
        return;
      }
      _D.addClass(this.oRoot, _config._sRootClass);

      var parentForm = this.oRoot;
      while (parentForm != document.body && parentForm.tagName.toLowerCase() != 'form' && parentForm.parentNode) {
        parentForm = parentForm.parentNode;
      }
      if (!parentForm || !parentForm.tagName || parentForm.tagName.toLowerCase() != 'form') {
        _SELF.log('ImgUploader: Parent Form is not found!');
        return;
      }
      this.dForm = parentForm;
      config = config || {};
      _L.objExtend(_config, config, true);

      var that = this;
      var realInit = function() {
        _SELF.log('ImgUploader: do realInit after load ImgCropper begin.');
        _initIds(sId, that);
        _createEls(that);
        _resetFileIpt(that);
        _addEvents(that);
        that.bInitiated = true;
      };
      var cConf = _config.cropConfig;
      if (cConf) {
        cConf.onPostSuccess_ori = cConf.onPostSuccess || _L.EF;
        cConf.onCancel_ori = cConf.onCancel || _L.EF;
        _SELF.load('imgcropper', realInit);
      } else {
        realInit();
      }
    }

  });
  _SELF.log('ImgUploader: Class end.');
});

}(this));
