/* global define, module */
(function (globalThis, base, core) {
    "use strict";

    const VERSION = "0.1.2";
    const KEY = {};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = core("modernoo", VERSION, KEY, base(KEY, globalThis, Array, Object));
    } else if (typeof define === "function" && define.amd) {
        define("modernoo", [], function () {
            return core("modernoo", VERSION, KEY, base(KEY, globalThis, Array, Object));
        });
    } else {
        globalThis["modernoo"] = core("modernoo", VERSION, KEY, base(KEY, globalThis, Array, Object));
    }

}(self || this || document.documentElement, function base(KEY, globalThis, Array, Object) {
    const isArray = Array.isArray;
    const freeze = Object.freeze;
    const hasOwn = {}.hasOwnProperty;
    
    function mix(to, from) {
        for (let key in from) {
            if (hasOwn.call(from, key)) {
                to[key] = from[key];
            }
        }
        return to;
    }
   
    function isPlainObject(o) {
        var t = typeof o;
        return (t === 'object' && !(o instanceof RegExp) && t !== null && !isArray(o));
    }
    
    function noop() {}

    function slice(it, begin, length) {
        return slice.fn.call(it, begin, length);
    }
    slice.fn = [].slice;

    const SUPPORTS_CONSOLE = typeof console !== "undefined";
    const SUPPORTS_DECOMPILATION = /z/.test(function(){z});

    function isNative(o, name) {
        var ex = typeof o[name] !== undefined;
        return ex && isNative.fn(o[name]);
    }
    isNative.fn = SUPPORTS_DECOMPILATION ? function (fn) {
            return /\s*[\s*native\s+code\s*]\s*/i.test(fn);
        }
      : function () {
            // We don't have any means of knowing whether
            // or not the thingy is native so we assume it is
            return true;
        };

    const log = SUPPORTS_CONSOLE ? function log() {
        console.log.apply(console, arguments);
    } : noop;

    function expose(path, it, root) {
        root = root || globalThis;
        let last = null;
        const parts = path.split(".");
        parts.forEach(function (part) {
            last = root;
            root = root[part];
        });
        last[parts[parts.length - 1]] = it;
        return it;
    }

    function Base() {}
    Base.extension = function extension(name, fn) {
        fn.call(null, base, name);
    };

    const base = freeze({
        Base: freeze(Base),
        expose: expose,
        freeze: freeze,
        isPlainObject: isPlainObject,
        log: log,
        mix: mix,
        noop: noop,
    });
    return base;
}, function core(NAME, VERSION, KEY, Y) {

    function toString() {
        return "You are running " + NAME + "@" + VERSION;
    }

    function Core() {}
    Core.extension = function extension(name, fn) {
        fn.call(null, Y, name);
    };

    function createSandbox() {
        return Y.freeze({
        });
    }

    function createApi() {
        return Y.freeze({
            log: Y.log,
            service: Y.noop,
            toString: toString,
            widget: Y.noop,
        });
    }

    function init(extensions) {
        extensions(Core, Y.Base);
        return Y.freeze({
            use: function use(fn) {
                fn.call(null, createApi());
            },
        });
    }

    return Y.freeze(Y.mix(function () {
        return init.apply(null, arguments);
    }, {
        VERSION: VERSION,
        log: Y.log,
        toString: toString,
    }));

}));