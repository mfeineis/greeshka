/* eslint-env amd, node */
(function (globalThis, base, core) {
    "use strict";

    const VERSION = "0.3.1";

    if (typeof module !== "undefined" && module.exports) {
        module.exports = core(
            "greeshka",
            VERSION,
            globalThis,
            base(globalThis, Array, Object),
            Object
        );
    } else if (typeof define === "function" && define.amd) {
        define("greeshka", [], function () {
            return core(
                "greeshka",
                VERSION,
                globalThis,
                base(globalThis, Array, Object),
                Object
            );
        });
    } else {
        globalThis["greeshka"] = core(
            "greeshka",
            VERSION,
            globalThis,
            base(globalThis, Array, Object),
            Object
        );
    }

    // eslint-disable-next-line immutable/no-this, max-len, no-undef
}(typeof self !== "undefined" ? self : this || document.documentElement, function base(window, Array, Object) {
    const Object_hasOwn = Object.prototype.hasOwnProperty;
    const Array_slice = Array.prototype.slice;

    const SKIP_FIRST = 1;
    const LAST_ITEM = 1;

    function slice(it, begin, length) {
        return Array_slice.call(it, begin, length);
    }

    function mix(to) {
        const froms = slice(arguments, SKIP_FIRST);

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

    const log = SUPPORTS_CONSOLE ? function log() {
        // eslint-disable-next-line no-console
        console.log.apply(console, arguments);
    } : noop;
    log.error = SUPPORTS_CONSOLE ? function error() {
        // eslint-disable-next-line no-console
        console.error.apply(console, arguments);
    } : noop;

    function expose(path, it, root) {
        root = root || window;
        let last = null;
        const parts = path.split(".");
        parts.forEach(function (part) {
            last = root;
            root = root[part];
        });
        last[parts[parts.length - LAST_ITEM]] = it;
        return it;
    }

    return {
        "expose": expose,
        "log": log,
        "mix": mix,
        "slice": slice,
    };

}, function core(NAME, VERSION, window, Y, Object) {
    const Object_create = Object.create;
    const Object_freeze = Object.freeze;
    const Object_keys = Object.keys;
    const log = Y.log;
    const mix = Y.mix;

    function noop() {}

    function toString() {
        return "You are running " + NAME + "@" + VERSION;
    }

    const ERR_EXTENSION_FAILED_TO_START = 1001;
    const ERR_EXTENSION_FAILED_TO_STOP = 1002;
    const ERR_REGISTRATION_FAILED_TO_START = 1101;
    const ERR_REGISTRATION_FAILED_TO_STOP = 1102;
    const ERR_USE_CALL_FAILED = 1201;

    function init(config) {
        config = config || noop;

        function Sandbox() {}
        Sandbox.prototype = Object_create(null);

        const extensions = [];
        const registrations = [];

        let running = false;

        function setup(fn) {
            const exports = Object_create(Y);
            const dispose = fn.call(null, exports) || noop;
            Object_keys(exports).forEach(function (key) {
                //log("  [", key, "] =", exports[key]);
                Sandbox.prototype[key] = exports[key];
            });
            extensions.push(dispose);
            //log(fullName, "> core.extension", exports, ">>", coreApi);
        }

        function logError(code, e) {
            log.error("[ERR:", code, "]", e);
        }

        function createSandbox() {
            return new Sandbox();
        }

        function run(registration) {
            if (registration.running) {
                return;
            }

            try {
                registration.dispose =
                    registration.factory.call(null, createSandbox());
                registration.running = true;
            } catch (e) {
                logError(ERR_REGISTRATION_FAILED_TO_START, e);
            }
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
                run(registration);
            }
        }

        function stop() {
            //log("stop", ...args);
            extensions.forEach(function (dispose) {
                try {
                    dispose();
                } catch (e) {
                    logError(ERR_EXTENSION_FAILED_TO_STOP, e);
                }
            });
            registrations.forEach(function (registration) {
                if (registration.dispose) {
                    try {
                        registration.dispose();
                    } catch (e) {
                        logError(ERR_REGISTRATION_FAILED_TO_STOP, e);
                    }
                    registration.dispose = null;
                }
                registration.running = false;
            });
            //log("stop.done.");
        }

        try {
            config(setup, window);

            //log("core.extended, freezing base and core apis...");
            Object_freeze(Sandbox);
            Object_freeze(Sandbox.prototype);

            const api = Object_freeze(mix(add, {
                "log": log,
                "toString": toString,
            }));

            const root = Object_freeze({
                "log": log,
                "stop": stop,
                "use": function use(fn) {
                    try {
                        fn.call(null, api);

                        log("[greeshka.js:trace] start", registrations);
                        registrations.forEach(run);
                        running = true;

                    } catch (e) {
                        logError(ERR_USE_CALL_FAILED, e);
                    }
                    return root;
                },
            });

            return root;
        } catch (e) {
            logError(ERR_EXTENSION_FAILED_TO_START, e);
        }

        return null;
    }

    return Object_freeze(mix(function () {
        return init.apply(null, arguments);
    }, {
        "VERSION": VERSION,
        "log": log,
        "toString": toString,
    }));

}));
