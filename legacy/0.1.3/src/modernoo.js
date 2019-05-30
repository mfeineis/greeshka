/* global define, module */
(function (globalThis, base, core) {
    "use strict";

    const VERSION = "0.1.3";

    if (typeof module !== "undefined" && module.exports) {
        module.exports = core("modernoo", VERSION, base(globalThis, Array, Object), Object);
    } else if (typeof define === "function" && define.amd) {
        define("modernoo", [], function () {
            return core("modernoo", VERSION, base(globalThis, Array, Object), Object);
        });
    } else {
        globalThis["modernoo"] = core("modernoo", VERSION, base(globalThis, Array, Object), Object);
    }

}(self || this || document.documentElement, function base(globalThis, Array, Object) {
    const Object_hasOwn = Object.prototype.hasOwnProperty;
    const Array_slice = Array.prototype.slice;

    function mix(to, from) {
        for (const key in from) {
            if (Object_hasOwn.call(from, key)) {
                to[key] = from[key];
            }
        }
        return to;
    }

    function noop() {}

    function slice(it, begin, length) {
        return Array_slice.call(it, begin, length);
    }

    const SUPPORTS_CONSOLE = typeof console !== "undefined";

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

    return Object.freeze({
        expose: expose,
        log: log,
        mix: mix,
        noop: noop,
        slice: slice,
    });

}, function core(NAME, VERSION, Y, Object) {
    const KEY = {};
    const freeze = Object.freeze;

    function toString() {
        return "You are running " + NAME + "@" + VERSION;
    }

    function init() {

        function Base(name, fn) {
            fn.call(null, Y, name);
        }

        function Core(name, fn) {
            fn.call(null, Y, name);
        }

        Y.slice(arguments).forEach(function (extension) {
            extension(Core, Base);
        });

        function createSandbox() {
            return freeze({
            });
        }

        return freeze({
            use: function use(fn) {
                fn.call(null, freeze({
                    log: Y.log,
                    service: Y.noop,
                    toString: toString,
                    widget: Y.noop,
                }));
            },
        });
    }

    return freeze(Y.mix(function () {
        return init.apply(null, arguments);
    }, {
        VERSION: VERSION,
        log: Y.log,
        toString: toString,
    }));

}));
