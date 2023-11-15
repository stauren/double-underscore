/**
 * visit : http://code.google.com/p/double-underscore/
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 * @revision
 */

/*begin:__.widget.Base*/
__.exportPath('__.widget');

__.widget.Base = function () {
  __.Disposable.call(this);
  if (this.cssRules) {
    this._addCssRules(this.cssRules);
  }
};

__.inherits(__.widget.Base, __.Disposable);

__.widget.Base.prototype.disposeInternal = function (rules) {
  if (this._cssRuleIds) {
    __.dom.remRules(this._cssRuleIds);
    delete this._cssRuleIds;
  }
};

__.widget.Base.prototype._addCssRules = function (rules) {
  this._cssRuleIds = __.dom.addRules(rules);
};
/*end:__.widget.Base*/
