/*!
 * core file of double-underscore library
 * http://code.google.com/p/double-underscore/
 * @class __.Disposable
 * @revision:
 * @author <a href="mailto:stauren@qq.com">stauren</a>
 */

/*begin:Disposable*/
__.BasicModule.register('Disposable', '0.4.0');

/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface
 * @constructor
 */
__.Disposable = function () {
  __.Disposable._instances[__.getUid(this)] = this;
};

__.Disposable._instances = {};

__.Disposable.getUndisposedObjects = function () {
  var ret = [];
  __.each(__.Disposable._instances, function (o, i) {
    ret.push(__.Disposable._instances[i]);
  }, true);
  return ret;
};

__.Disposable.disposeAll = function () {
  __.each(__.Disposable._instances, function (o) {
    o.dispose();
  }, true);
};

/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
__.Disposable.prototype._disposed = false;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
__.Disposable.prototype.isDisposed = function () {
  return this._disposed;
};


/**
 * @return {void} Nothing.
 */
__.Disposable.prototype.dispose = function () {
  if (!this._disposed) {
    this._disposed = true;
    this.disposeInternal();
    delete __.Disposable._instances[__.getUid(this)];
  }
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend __.Disposable should
 * override this method.  For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     __.Disposable.call(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   __.inherits(mypackage.MyClass, __.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     // Dispose logic specific to MyClass.
 *     ...
 *   };
 * </pre>
 * @protected
 */
__.Disposable.prototype.disposeInternal = function () {
  // No-op in the base class.
};

/*end:Disposable*/
