/* global define, module */
(function (globalThis, base, core) {
    "use strict";

    const VERSION = "0.1.4";

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

    function mix(to) {
        const froms = slice(arguments, 1);

        froms.forEach(function (from) {
            for (const key in from) {
                if (Object_hasOwn.call(from, key)) {
                    to[key] = from[key];
                }
            }
        });

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
    const Object_create = Object.create;
    const Object_keys = Object.keys;

    function toString() {
        return "You are running " + NAME + "@" + VERSION;
    }

    function init(extensions) {
        extensions = extensions || Y.noop;

        const baseApi = Object_create(Y);
        const coreApi = Y.mix(Object_create(null), {
            log: Y.log,
        });

        function base(name, fn) {
            const exports = fn.call(null, Object_create(baseApi), name) || {};
            Object_keys(exports).forEach(function (key) {
                baseApi[key] = exports[key];
            });
            Y.log(name, "> base.extension", exports, ">>", baseApi);
        }

        function core(name, fn) {
            const exports = fn.call(null, Object_create(baseApi), name) || {};
            Object_keys(exports).forEach(function (key) {
                coreApi[key] = exports[key];
            });
            Y.log(name, "> core.extension", exports, ">>", coreApi);
        }

        extensions(core, base);
        freeze(baseApi);
        freeze(coreApi);

        const state = {
            registrations: {},
            running: false,
        };

        function createSandbox() {
            return coreApi;
        }

        function register(id, factory) {
            Y.log("register", id, factory);
            const registration = state.registrations[id] = {
                id: id,
                factory: factory,
                dispose: null,
                running: false,
            };

            if (state.running) {
                registration.dispose = factory.call(null, createSandbox(id));
                registration.running = true;
            }
        }

        function boot(...args) {
            Y.log("boot", ...args);

            Object_keys(state.registrations).forEach(function (id) {
                const registration = state.registrations[id];

                if (registration.running) {
                    return;
                }

                registration.dispose = registration.factory.call(null, createSandbox(id));
                registration.running = true;
            });
            state.running = true;

            Y.log("boot.done.");
        }

        function stop(...args) {
            Y.log("stop", ...args);
            Object_keys(state.registrations).forEach(function (id) {
                const registration = state.registrations[id];
                if (registration.dispose) {
                    registration.dispose();
                }
                registration.running = false;
            });
            Y.log("stop.done.");
        }

        const api = freeze({
            log: Y.log,
            register: register,
            toString: toString,
        });

        const root = freeze({
            stop: stop,
            use: function use(fn) {
                fn.call(null, api);
                boot();
                return root;
            },
        });

        return root;
    }

    return freeze(Y.mix(function () {
        return init.apply(null, arguments);
    }, {
        VERSION: VERSION,
        log: Y.log,
        toString: toString,
    }));

}));
