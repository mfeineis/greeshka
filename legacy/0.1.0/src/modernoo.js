/* global define, module */
(function (globalThis, factory) {
    "use strict";

    const VERSION = "0.1.0";

    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory("modernoo", VERSION, globalThis, Array, Object);
    } else if (typeof define === "function" && define.amd) {
        define("modernoo", [], function () {
            return factory("modernoo", VERSION, globalThis, Array, Object);
        });
    } else {
        globalThis["modernoo"] = factory("modernoo", VERSION, globalThis, Array, Object);
    }

}(self || this || document.documentElement, function base(NAME, VERSION, globalThis, Array, Object) {
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
    
    function freezeMix(target, source) {
        return freeze(mix(target, source));
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

    const sandboxApi = freeze({
        expose: expose,
        mix: mix,
    });

    function init() {
        // What to do, what to do? :-)
    }

    return freezeMix(function () {
        return init.apply(null, arguments);
    }, {
        VERSION: VERSION,
        boot: noop,
        log: log,
        service: noop,
        toString: function toString() {
            return "You are running " + NAME + "@" + VERSION + ".";
        },
        use: function use(fn) {
            fn.call(null, sandboxApi);
        },
        widget: noop,
    });
}));