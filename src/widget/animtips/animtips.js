/**
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */
/*begin:__.widget.AnimTips*/
__.BasicModule.register('AnimTips', '2.0.0', ['BasicTips', 'Anim'], function () {
  __.widget.AnimTips = function (config) {
    __.widget.BasicTips.call(this, config);
  };

  __.inherits(__.widget.AnimTips, __.widget.BasicTips);

  __.widget.AnimTips.prototype.setPosition = function (el) {
    var anim;

    __.dom.setOpacity(el, 0);
    __.widget.AnimTips._super.setPosition.apply(this,
      __.lang.a(arguments));

    anim = new __.Anim(el, 'opacity', {
      to : 1
    });

    anim.run();
  };

  __.widget.AnimTips.prototype.hide = function () {
    var anim,
      that = this,
      el = __.dom.id(this.id);

    if (el) {
      anim = new __.Anim(this.id, 'opacity', {
        to : 0,
        onOver : function () {
          __.widget.AnimTips._super.hide.apply(that);
        }
      });

      anim.run();
    }
  };
});
/*end:__.widget.AnimTips*/
