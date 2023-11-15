/*!
 * @file imgcropper.js
 * @class __.widget.ImgCropper
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

/**
 * widget image cropper
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

(function(_scope) {

var _NAME = '__', _SELF = _scope[_NAME],
  _VERSION;

if (!_scope[_NAME] || !_scope[_NAME].add) {
  return;
}

_VERSION = _SELF.cfg[2];

_SELF.register('imgcropper', _VERSION, ['core'], function() {

  _SELF.set("__.widget");
  _SELF.log('ImgCropper: Class begin.');

  var _D = _SELF.Dom, _E = _SELF.Event, _L = _SELF.Lang, _I = _SELF.Io,
    _W = __.widget,
    _config = {
      iSliderLeft : 147,
      maxRate : 3.0,
      minRate : 0.5,
      trackLength : 440,
      sliderWidth : 78,
      zoomLevel : 15,
      trackPreX : 0,
      trackPostX : 0,
      windowX : 280,
      windowY : 210,
      canvasX : 450,
      canvasY : 300,
      initRate : 0,
      popup : true,
      //trackImg : 'http://k.kbcdn.com/global/imgcropper/image_crop_track.gif',
      //trackImg : 'http://k.kbcdn.com/global/imgcropper/track.gif',
      trackImg : 'http://localhost/att/workspace/os/svn/trunk/src/imgcropper/track.gif',
      //sliderImg : 'http://k.kbcdn.com/global/imgcropper/image_crop_grip.gif',
      //sliderImg : 'http://k.kbcdn.com/global/imgcropper/slider.gif',
      sliderImg : 'http://localhost/att/workspace/os/svn/trunk/src/imgcropper/slider.gif',
      sError500 : '服务器发生错误，裁切图片发生错误，请稍后重试。',
      sErrorCode : '服务器发生错误，裁切图片发生错误，请稍后重试。错误代码：',
      text : {
        cutPic: '裁切图片',
        cutNotice: '您可以拖动图片以裁切满意的图片显示效果',
        zoomin : '放大',
        zoomout : '缩小',
        save : '保存图片',
        cancel : '取消'
      },
      ids : {
        container : 'st-cropper-ctn',
        ok : 'st-cropper-ok',
        cancel : 'st-cropper-cancel'
      },
      cls : {
        track : 'st-cropper-track',
        slider : 'st-cropper-slider',
        zoomin : 'st-cropper-zoomin',
        zoomout : 'st-cropper-zoomout',
        canvas : 'st-cropper-canvas'
      }
      //onCancel,
      //onOk
      //onAfterRender
//      trackImg : 'image_crop_track.gif',
//      sliderImg : 'image_crop_grip.gif'
    },
    _dImg, _dSliderHandler, _iWidth, _iHeight,
    _fOldRate, _dX, _dY, _fSliderX, _fnGetRate, _fnGetXByRate,

  /**#@+
   * the private functions
   * @private
   * @memberOf __.widget.ImgCropper
   */

  /**
   * set image size and position accordding to the zoom rate
   * @param {float} rate room rate
   */
    _fnSetImg = function(rate) {
      var _ds = _dImg.style;
      _ds.width = _iWidth * rate + 'px';
      _ds.height = _iHeight * rate + 'px';

     // centralized zoom
     // _ds.left = [(_config.canvasX-rate*_iWidth)/2, 'px'].join('');
     // _ds.top = ['-', (_config.canvasY+rate*_iHeight)/2, 'px'].join('');

     // _ds.left = [(_xo+_config.canvasX*(_fOldRate-1)/2)*rate/_fOldRate+_config.canvasX/2*(1-rate), 'px'].join('');
     // _ds.top = ['-', _config.canvasY/2*(rate+1)+(_config.canvasY/2*(_fOldRate+1)+_yo)/_fOldRate*rate, 'px'].join('');
      _ds.left = Math.round(_dX*rate+_config.canvasX/2*(1-rate)) + 'px';
      _ds.top = Math.round(_dY*rate + _config.canvasY/2*(rate-1)) + 'px';
      //_SELF.log(_dX*rate+_config.canvasX/2*(1-rate));
      _fOldRate = rate;
    },
    _fnOnOk = function(e, that) {
      _E.stopEvent(e);
      var winX = _config.windowX, winY = _config.windowY,
        x = parseInt(_dImg.style.left) - (_config.canvasX - winX)/2,
        y = parseInt(_dImg.style.top) + (_config.canvasY + winY)/2,
        oResult = {
          pointx : -x,
          pointy : -y,
          width : winX,
          height : winY,
          rate : _fOldRate.toFixed(3)
        };

      if (_config.imageInfo) {
        oResult.imageInfo = _config.imageInfo;
      }

      if (_config.onOk) {
        _config.onOk(oResult);
      }
      if (_config.postUrl) {
        _I.p({
          sUrl : _config.postUrl,
          sPost : 'stIcInfo='+ JSON.stringify(oResult),
          fnSuccess : function(t) {
            _SELF.log('ImgCropper post response: '+ t);

            //debug example
            //must return code 200
            //t = "{\"code\":200,\"msg\":\"ok\",\"data\":\"what the fuck\",\"url\":\"http://cn.yimg.com/ncp/i315/img/tg/430x120_shfc_090225.jpg\"}";

            t = JSON.parse(t);
            if (t && t.code && t.code == 200) {
              _config.onPostSuccess && _config.onPostSuccess(t, oResult);
            } else {
              var code = t && t.code;
              alert(_config.sErrorCode + code);
              _config.onPostFail && _config.onPostFail(t, oResult);
            }
          },
          fnFail : function() {
            alert(_config.sError500);
            _config.onPostFail && _config.onPostFail();
          }
        });
      }
      that.close();
    },
    _fnOnCancel = function(e, that){
      _E.stopEvent(e);
      if (_config.onCancel) {
        _config.onCancel();
      }
      that.close();
    }
    ,
    _fnOnZoom = function(e) {
      var x = _fnGetXByRate(_fOldRate),
      quantum = _config.movableX/(_config.zoomLevel-1);
      var t = e.target || e.srcElement;
      if (_D.hasClass(t, _config.cls.zoomin)) {
        x = (Math.ceil(x/quantum) - x/quantum) < 1E-6 ? Math.ceil(x/quantum) + 1 : Math.ceil(x/quantum);
      } else if (_D.hasClass(t, _config.cls.zoomout)) {
        x = (x/quantum - Math.floor(x/quantum)) < 1E-6 ? Math.floor(x/quantum) - 1 : Math.floor(x/quantum);
      }
      x = x > _config.zoomLevel - 1 ? _config.zoomLevel - 1 : x;
      x = x < 0 ? 0 : x;
      x = x*quantum;
      _fnSetImg(_fnGetRate(x));
      _dSliderHandler.style.left = x + 'px';
      _fSliderX = x;
    }
    ,
    _fnSliderMd = function(e){
      __.Drag.handler(e, _dSliderHandler, false, {'t':0, 'r':_config.trackLength - _fSliderX - _config.trackPostX - _config.sliderWidth, 'b':0, 'l':_fSliderX - _config.trackPreX}, false, 
        function(x,y,zone) {
          var _fPercent = _fnGetRate(x - zone.left);
          //_SELF.log(_fPercent);
          _fnSetImg(_fPercent);
        }
      );
    },
    _fnCanvasMd = function(e){
      __.Drag.handler(e, _dImg, false, false, false, function(x,y,zone) {
        var _ds = _dImg.style, _xo = parseFloat(_ds.left, 10), _yo = parseFloat(_ds.top, 10);
        _dX = (_xo*2+_config.canvasX*(_fOldRate-1))/(2*_fOldRate);
        _dY = (_config.canvasY*(1-_fOldRate)+2*_yo)/(2*_fOldRate);
      });
    },
    _fnRemEls = function() {
      if (_config.popup) {
        _D.remEl(_config.container);
      } else {
        _D.remEl(_config.ids.container);
      }
    },
    _fnCreateEls = function() {
      var i13height = ( _config.canvasY - _config.windowY - 2 ) / 2,
        i13width = (_config.canvasX - _config.windowX - 2) / 2,
        zo = _SELF.topLayer,
        sAlphaWindow = 'background:#f5f5f5;position:absolute;opacity:0.75;filter:alpha(opacity=75);z-index:'+ (zo+2)+';';


      _SELF.topLayer = zo + 2;

      var oEls = {
        id : _config.ids.container,
        css : 'width : '+ (_config.canvasX-0+50) +'px;font-size: 14px; font-family: Geneva,Lucida Sans,Lucida Grande,Lucida Sans Unicode,Verdana,sans-serif;position:relative;',
        child : [{
          css : 'padding:5px 0 5px 10px;', child : [{
            tag : 'span', text : _config.text.cutPic, css : 'font-weight:bold;'
            }, {
            tag : 'span', css : 'font-size:12px;color:#999;padding-left:10px;', text : _config.text.cutNotice
          }]
        },{
          // 42 = height of tools, 10=border height, 75=button height
          css : 'border-top:1px solid #e2eff5;background:#eef5fb;padding:20px 20px 10px;;height:'+ (_config.canvasY+10+42+65) +'px;margin-top:10px;', child : [{
            css : 'width : '+ _config.canvasX +'px;height:'+ (_config.canvasY+42) +'px;border:5px solid #ebebeb;overflow:hidden;position:relative;z-index:'+(zo+2)+';background:#fff;', child : [{
            cls : _config.cls.canvas,
            css :  'height : '+ _config.canvasY +'px;cursor:move;',
            child : [{
              css : 'width:'+ _config.canvasX +'px;height:'+ i13height +'px;top:0px;left:0px;'+ sAlphaWindow
            }, {
              css : 'width:'+ _config.canvasX +'px;height:'+ i13height +'px;top:'+ (i13height + _config.windowY + 2) +'px;left:0px;'+ sAlphaWindow
            },{
              css : 'width:'+ i13width +'px;height:'+ (_config.windowY + 2) +'px;top:'+ i13height +'px;left:0px;'+ sAlphaWindow
            },{
              css : 'width:'+ i13width +'px;height:'+ (_config.windowY + 2) +'px;top:'+ i13height +'px;right:0px;'+ sAlphaWindow
            },{
              css : 'width:'+ (_config.windowX + 2) +'px;height:'+ (_config.windowY + 2) +'px;background:transparent;position:absolute;top:'+ i13height +'px;left:'+ i13width +'px;z-index:'+ (zo+2) + ';'
            },{
              css : 'width:'+ (_config.windowX)+'px;height:'+ (_config.windowY) +'px;background:transparent;position:absolute;top:'+ (i13height + 1) +'px;left:'+ (i13width + 1) +'px;border:1px solid #111;z-index:'+ (zo+2) + ';'//42 == tools height
            },

            /*{
              tag : 'table',
              css : 'width:100%;height:100%;opacity:0.75; filter:alpha(opacity=75);cursor:move;z-index:9;',
              child : [{
                tag : 'col',
                css : 'width:'+ i13width +'px;'
              },{
                tag : 'col',
                css : 'width:' + _config.windowX + 'px;'
              }, {
                tag : 'col',
                css : 'width:' + i13width + 'px;'
              }, {
                tag : 'tbody',
                child : [
                  { 
                    tag : 'tr',
                    child : {
                      tag : 'td',
                      attrs : { colSpan : '3'},
                      cls : 'yc-top',
                      css : 'height:' + i13height + 'px;background-color:#f5f5f5;'
                    }
                  },
                  {
                    tag : 'tr',
                    child : [
                      {
                        tag : 'td',
                        css : 'width:'+ i13width +'px;background-color:#f5f5f5;',
                        cls : 'yc-left'
                      },
                      {
                        tag : 'td',
                        css : '',
                        child : {
                          css : 'width:'+ (_config.windowX+8) +'px;height:'+ (_config.windowY+8) +'px;border:1px dashed #3e3e3e;', child : {
                            cls : 'yc-window',
                            css : 'width:'+ _config.windowX +'px;height:'+ _config.windowY +'px;background:transparent;border:4px solid #f5f5f5;'
                          }
                        }
                      },
                      {
                        tag : 'td',
                        css : 'background-color:#f5f5f5;width:'+ i13width +'px;',
                        cls : 'yc-right'
                      }
                    ]
                  },
                  { 
                    tag : 'tr',
                    child : {
                      tag : 'td',
                      attrs : { colSpan : '3'},
                      cls : 'yc-bottom',
                      css : 'height:'+ i13height +'px;background-color:#f5f5f5;'
                    }
                  }
                ]
              }]
            },*/
            {
              id : 'yc-ori-image',
              css : 'position:relative;top:'+ _config.canvasY +'px;left:0;z-index:'+ (zo+1) +';',
              child : {
                tag : 'img',
                css : 'position:absolute;z-index:'+ (zo+1) +';top:-200px;',
                src : _config.sImgSrc
              }
            }
            ]}, {
              cls : 'tools',
              css : 'position:relative;top:0px;left:0px;background:#fff url('+ _config.trackImg +') repeat-x 0 12px;width:'+ _config.canvasX +'px;height:22px;padding:10px 0;z-index:'+ (zo+2) +';',
              child : {
                tag : 'ul',
                child : [
                  {
                    tag : 'li',
                    child : [{
                      css : 'float:left;cursor:pointer;padding-top:3px;', child : {
                        tag : 'span', cls : _config.cls.zoomout, css : 'padding:5px 5px 5px 30px;background:transparent url('+ _config.trackImg +') no-repeat 5px -147px;', text : _config.text.zoomout
                      }
                    }, {
                      css : 'float:left;height:22px;line-height:22px;position:relative;width:'+ _config.trackLength +'px;',
                      child : [{
                        css : 'width:15px;height:22px;position:absolute;left:0;top:0;overflow:hidden;', child : {
                          tag : 'img', src : _config.trackImg, css : 'position:absolute;left:0;top:-70px;'
                        }
                      }, {
                        cls : _config.cls.track,
                        css : 'height:22px;position:absolute;left:15px;width:'+ (_config.trackLength-30) +'px;background:transparent url('+
                        _config.trackImg+') repeat-x 0px -40px;'
                      }, {
                        css : 'width:15px;height:22px;position:absolute;right:0;top:0;overflow:hidden;', child : {
                          tag : 'img', src : _config.trackImg, css : 'position:absolute;left:0;top:-100px;'
                        }
                      }
                      ,
                        {
                          cls : _config.cls.slider,
                          css : 'background:url('+ _config.sliderImg +') no-repeat;position:absolute;height:22px;line-height:22px;font-size:0;width:80px;display:inline;top:0;cursor:ew-resize;'
                        }
                      ]
                    },{
                      css : 'float:left;cursor:pointer;padding-top:3px;', child : {
                        tag : 'span', cls : _config.cls.zoomin, css : 'padding:5px 0px 5px 30px;background:transparent url('+ _config.trackImg +') no-repeat 5px -125px;', text : _config.text.zoomin
                      }
                    }]
                  }
                ]
              }
            }
          ]}, {
              cls : 'btn-ft',
              css : 'padding:20px 0 10px;',
              child : {
                      css : 'text-align:center;width:'+ (_config.canvasX-0+10) +'px;', child : [{
                        tag : 'a',
                        id : _config.ids.ok,
                        cls : ['st-btn', 'st-xl', 'st-btn-style-a'],
                        href : '#',
                        child : { tag : 'b', child : { tag : 'b', text : _config.text.save} }
                      }, {
                        tag : 'a',
                        id : _config.ids.cancel,
                        css : 'color:#999;font-size:12px;padding:10px 0 0 10px;', 
                        href : '#',
                        child : { tag : 'b', child : { tag : 'b', text : _config.text.cancel} }
                      }]
                    }
            }
          ]
        }
        ]
      };
      _D.addEl(oEls, _config.container);
    };

  /**#@-*/

  _W.ImgCropper = _SELF.Class.extend(
  /**
   * @lends __.widget.ImgCropper.prototype
   */
  {
    /**
     * @memberOf __.widget.ImgCropper
     */
     popObj : null,

    /**
     * the constructor of image cropper
     * @constructs
     * @param {string} container container id 
     * @param {string} src url of the image being cropped
     * @param {object} config detail config object
     * @config {integer} windowX crop result window width, in px
     * @config {integer} windowY crop result window height, in px
     * @config {integer} canvasX crop background window width, in px
     * @config {integer} canvasY crop background window height, in px
     * @config {boolean} popup do we need to pop the crop window out?
     * @config {function} onOk the callback function after user clicked ok, the function receive a obj of crop details
     * @config {function} onCancel the callback function after user clicked cancel
     * @config {function} onPostSuccess the callback function after the crop detail post done
     * @config {function} onPostFail the callback function after the crop detail post fail
     * @config {string} postUrl the url to post the crop detail info to
     * @config {object} imageInfo meta data about the image
     */
    init : function(container, src,  config) {
      _SELF.log('ImgCropper: begin init');
      _SELF.log('ImgCropper: src='+ src, true);
      config = config == undefined ? {} : config;
      _L.objExtend(_config, config, true);

      _config.sImgSrc = src;

      if(!container || !src) {
        return false;
      }

      var poploaded = !_config.popup, imgloaded = false, that = this,
      check2Init = function() {
        if (!poploaded || !imgloaded) {
          return;
        }
        if (_config.popup) {
          container = that.popObj.body;
        } else {
          container = _D.f(container);
        }
        _config.container = container;

        //63 == width of zoom button
        _config.trackLength = _config.canvasX - 63 * 2;

        _config.movableX = _config.trackLength - _config.trackPreX - _config.trackPostX - _config.sliderWidth;

        _fnCreateEls();
        if (_config.popup) {
          that.popObj.show();
        }

        _dImg = _D.$('#yc-ori-image img')[0];
        _dSliderHandler = _D.$('#'+ _config.ids.container +' .'+ _config.cls.slider)[0];
        _iWidth = _dImg.width;
        _iHeight = _dImg.height,

        // the min scale rate means the longer border fit the window
        _config.minRate = Math.min(_config.windowX/_iWidth, _config.windowY/_iHeight, _config.minRate);

        //_config.initRate = Math.min(_config.canvasX / newImg.width, _config.canvasY / newImg.height, _config.maxRate);
        _config.initRate = Math.min(Math.max(_config.windowX / newImg.width, _config.windowY / newImg.height), _config.maxRate);
        _config.initRate = Math.max(_config.initRate, _config.minRate);
        _fOldRate = _config.initRate;

        //var a = _L.curry('-2', _config.minRate);

        _fnGetRate = function (x) {
          return _config.minRate + (x - _config.trackPreX) / _config.movableX *
            (_config.maxRate - _config.minRate);
        };
        /*_L.compose(_L.curry('+', _config.minRate),
          _L.curry('*', (_config.maxRate - _config.minRate) / _config.trackLength));
        */

        _fnGetXByRate = function(r) {
          return (r - _config.minRate) / (_config.maxRate - _config.minRate) *
            _config.movableX + _config.trackPreX;
        };
        /*_L.compose(
          _L.curry('*', _config.trackLength / (_config.maxRate - _config.minRate)),
          _L.curry('-2', _config.minRate)
        );*/

        _dX = (_config.canvasX-_iWidth)/2;
        _dY = '-' + (_config.canvasY+_iHeight)/2;
        _fSliderX = _fnGetXByRate(_config.initRate); 
        //_fSliderX =  _config.trackLength / (_config.maxRate - _config.minRate) * (1 - _config.minRate);
        //_SELF.log(_fSliderX);
        _dSliderHandler.style.left = _fSliderX + 'px';

        _fnSetImg(_config.initRate, true);

        that._addEvents();

        if (_config.onAfterRender) {
          _config.onAfterRender();
        }
        _SELF.log('ImgCropper: initRate:'+ _config.initRate);
        _SELF.log('ImgCropper: minRate:'+ _config.minRate);
        _SELF.log('ImgCropper: maxRate:'+ _config.maxRate);
      };

      _config.popup && _SELF.load('popup', function() {
        that.popObj = new _W.Popup('', '', {
          //10=canvas border, 40=canvas padding, 32=popup border
          iWidth : _config.canvasX + 10 + 40 + 32,
          // 42 = height of tools, 10=border height, 75=button height,27=title height,32=popup border,30=canvas wrapper padding
          iHeight : _config.canvasY+10+42+65+27+32+30,
          onOk : false,
          onCancel : false,
          onClose : false,
          bShowAfterInit : false
        });
        poploaded = true;
        check2Init();
      });

      var newImg = new Image(), fnOnload = function() {
        _E.off(newImg, 'load', fnOnload);
        imgloaded = true;
        check2Init();
      };
      _E.on(newImg, 'load', fnOnload);
      newImg.src = src;
      _SELF.log('ImgCropper: finish init');
    }
    ,
    _addEvents : function() {
      var ids = _config.ids, cls = _config.cls;

      _E.on(_D.f('#'+ ids.container +' .'+ cls.canvas), 'mousedown', _fnCanvasMd);
      _E.on(_dSliderHandler, 'mousedown', _fnSliderMd, this);
      _E.on(_D.f(ids.ok), 'click', _fnOnOk, this);
      _E.on(_D.f(ids.cancel), 'click', _fnOnCancel, this);
      _E.on(_D.$('.' +cls.zoomin +', .'+cls.zoomout, ids.container), 'click', _fnOnZoom);
    }
    ,
    close : function() {
      if (_config.popup) {
        this.popObj.hide();
      }
      _fnRemEls();
    }
  });
  _SELF.log('ImgCropper: Class end.');
});

}(this));
