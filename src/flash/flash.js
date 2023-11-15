/*!
 * @file flash.js
 * @module Flash
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision:
 */

if (typeof __ != 'undefined' && !__.Flash) (function() {
  __.log('Flash: Def begin.');

  __.add('Flash', (function() {
    return {

      create : function (uri) {
        var _swf = '<object type="application/x-shockwave-flash" data="' +
            uri + '" width="0" height="0">' +
            '<param name="movie" value="' + uri + '">' +
           // '<param name="FlashVars" value="yid=' + yid + '">' +
            '<param name="allowScriptAccess" value="sameDomain">' +
            '</object>';
        return _swf;
      }
      ,
      /**
       * get flash version of the browser
       */
      getVersion : function () {
        var _ver = false, axo;
        if(navigator.plugins&&navigator.mimeTypes.length){
          var x=navigator.plugins["Shockwave Flash"];
          if(x&&x.description){
            _ver=x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split(".")[0];
          }
        } else {
          if(navigator.userAgent&&navigator.userAgent.indexOf("Windows CE")>=0) {
            axo=1;
            var _tempVer=3;
            while(axo) {
              try{
                _tempVer++;
                axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+_tempVer);
                _ver=_tempVer;
              } catch(e) {
                axo=null;
              }
            }
          } else {
            try {
              axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            } catch(e2) {
              try {
                axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                _ver=6;
                axo.AllowScriptAccess="always";
              } catch(e3) {
                if(_ver==6){
                  return _ver;
                }
              }
              try {
                axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
              } catch(e4) {}
            }
            if(axo !== null) {
              _ver= axo.GetVariable("$version").split(" ")[1].split(",")[0];
            }
          }
        }
        return _ver;
      }
    };
  }()));

  __.log('Flash: Def end.');
}());
