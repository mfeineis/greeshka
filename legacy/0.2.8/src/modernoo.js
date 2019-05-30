/* global define, module */
(function (globalThis, base, core) {
    "use strict";

    const VERSION = "0.2.8";

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

    function slice(it, begin, length) {
        return Array_slice.call(it, begin, length);
    }

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

    const SUPPORTS_CONSOLE = typeof console !== "undefined";

    // TODO: Provide configurable logging/tracing?
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

    return {
        expose: expose,
        log: log,
        mix: mix,
        noop: noop,
        slice: slice,
    };

}, function core(NAME, VERSION, Y, Object) {
    const Object_create = Object.create;
    const Object_freeze = Object.freeze;
    const Object_keys = Object.keys;
    const log = Y.log;
    const mix = Y.mix;
    const noop = Y.noop;

    function toString() {
        return "You are running " + NAME + "@" + VERSION;
    }

    function init(config) {
        config = config || noop;

        function Sandbox() {}
        Sandbox.prototype = Object_create(null);

        const extensions = [];
        const registrations = [];

        let running = false;

        function core(fn) {
            const exports = Object_create(Y);
            const dispose = fn.call(null, exports) || noop;
            Object_keys(exports).forEach(function (key) {
                //log("  [", key, "] =", exports[key]);
                Sandbox.prototype[key] = exports[key];
            });
            extensions.push(dispose);
            //log(fullName, "> core.extension", exports, ">>", coreApi);
        }

        config(core);

        //log("core.extended, freezing base and core apis...");
        Object_freeze(Sandbox);
        Object_freeze(Sandbox.prototype);

        function createSandbox() {
            //log("createSandbox", ...args, "log", coreApi.log, "Y.mix", coreApi.mix, "Y.slice", coreApi.slice.name);
            return new Sandbox();
        }

        function add(factory) {
            const registration = {
                dispose: null,
                factory: factory,
                name: factory.name,
                running: false,
            };
            registrations.push(registration);

            if (running) {
                // TODO: Error handling for starting modules
                registration.dispose = factory.call(null, createSandbox());
                registration.running = true;
            }
        }

        function stop(...args) {
            //log("stop", ...args);
            extensions.forEach(function (dispose) {
                dispose();
            });
            registrations.forEach(function (registration) {
                if (registration.dispose) {
                    registration.dispose();
                }
                registration.running = false;
            });
            //log("stop.done.");
        }

        const api = Object_freeze(mix(add, {
            log: log,
            toString: toString,
        }));

        const root = Object_freeze({
            stop: stop,
            use: function use(fn) {
                fn.call(null, api);

                log("start", registrations);
                registrations.forEach(function (registration) {
                    if (registration.running) {
                        return;
                    }

                    registration.dispose = registration.factory.call(null, createSandbox());
                    registration.running = true;
                });
                running = true;

                return root;
            },
        });

        return root;
    }

    return Object_freeze(mix(function () {
        return init.apply(null, arguments);
    }, {
        VERSION: VERSION,
        log: log,
        toString: toString,
    }));

}));
