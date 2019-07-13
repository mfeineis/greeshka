require(["greeshka"], function (G) {

    G.log("M", G);
    G().use(function (use) {
        use.log("lib.use (clean)", use);

        use(function verySimple(Y) {
            use.log("very-simple.sandbox", Y, Y.log, Y.mix);
        });
    }).stop();

    const Core = G(function core(add, window) {

        // base(function base$browserFeature(Y) {
        //     Y.BROWSER_FEATURE = 1;
        // });

        add(function utils(Y) {
            //Y.log("utils", utils.name, Y, Y.log, Y.mix);

            Y.log = Y.log;
            Y.mix = Y.mix;
            Y.slice = Y.slice;
        });

        add(function fetch(Y) {
            //Y.log("fetch", fetch.name, Y, Y.log, Y.mix, "BROWSER_FEATURE", Y.BROWSER_FEATURE);

            Y.fetch = function fetch(url, options) {
                return window.fetch(url, options);
            };
        });

        add(function pubsub$browser(Y) {
            const subs = [];

            function on(topic, fn) {
                Y.log("pubsub.on()", topic, fn);
                const fullTopic = "topic:" + topic;

                function callback(ev) {
                    fn.call(null, ev.detail);
                }

                document.addEventListener(fullTopic, callback);
                function dispose() {
                    Y.log("pubsub.on().dispose", topic, fn);
                    document.removeEventListener(fullTopic, callback);
                }
                subs.push(dispose);
                return dispose;
            }

            function emit(topic, data) {
                Y.log("pubsub.emit()", topic, data);
                const fullTopic = "topic:" + topic;
                document.dispatchEvent(new CustomEvent(fullTopic, {
                    detail: data,
                }));
            }

            Y.emit = emit;
            Y.on = on;

            return function dispose() {
                subs.forEach(function (sub) {
                    sub();
                });
            };
        });

        add(function delay(Y) {
            const subs = [];

            Y.delay = function delay(fn, ms) {
                const id = window.setTimeout(fn, ms || 0);
                const dispose = function dispose() {
                    window.clearTimeout(id);
                };
                subs.push(dispose);
                return dispose;
            };

            return function dispose() {
                Y.delay = Y.noop;
                subs.forEach(function (sub) {
                    sub();
                });
            };
        });

        add(function widget(Y) {

            Y.widget = function widget(def) {
                Y.log("widget.widget()", def);
            };

        });

        add(function workerOffload(Y) {
            // Inspired by
            // https://github.com/developit/workerize
            // https://github.com/WebReflection/workway
            //

            function hackilyStumbleUponExports(code) {
                const exports = {};
                code.replace(/(?:exports|this)\.([\w]+)/g, function (_, name) {
                    exports[name] = name;
                });
                return exports;
            }

            const slice = [].slice;

            function augment(self, exports) {
                self.addEventListener("message", function (ev) {
                    console.log("WORKER.onmessage", ev);

                    function sendResult(result) {
                        console.log("WORKER.onmessage 'call'", result, "<-", ev.data);
                        self.postMessage({
                            id: ev.data.id,
                            result: result,
                            type: "RPC.SUCCESS",
                        });
                    }

                    function sendError(error) {
                        console.log("WORKER.onmessage 'error'", error);
                        self.postMessage({
                            id: ev.data.id,
                            result: {
                                message: error.message,
                                name: error.name,
                                stack: error.stack,
                            },
                            //result: error,
                            type: "RPC.ERROR",
                        });
                    }

                    if (ev.data.type !== "RPC") {
                        return;
                    }

                    try {
                        const result = exports[ev.data.fn].apply(null, ev.data.args);

                        if (typeof result.then === "function") {
                            result.then(function (asyncResult) {
                                sendResult(asyncResult);
                            }).catch(function (error) {
                                sendError(error);
                            });
                            return;
                        }

                        sendResult(result);
                    } catch (error) {
                        sendError(error);
                    }
                });
            }

            function offload(fn, options) {
                const fnCode = Function.prototype.toString.call(fn);
                const code = [
                    "importScripts(\"https://polyfill.io/v3/polyfill.min.js?flags=gated&features=Promise\");",
                    "importScripts(\"https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.js\");",
                    "(function runtime(module) {\"use strict\";",
                    "(" + fnCode + ").call(module.exports, requirejs, module.exports, module);",
                    "(" + Function.prototype.toString.call(augment) + "(self, module.exports));",
                    "}({ exports: {} }));"
                ].join("\n");
                console.log("offload\n", code);

                const exports = hackilyStumbleUponExports(fnCode);
                const url = URL.createObjectURL(new Blob([code]));
                const worker = new Worker(url, options);
                const callbacks = {};

                Object.keys(exports).forEach(function (key) {
                    exports[key] = function () {
                        const id = "call_" + Date.now() + "_" + (Math.random() * 1000000).toFixed(0);
                        const promise = new Promise(function (resolve, reject) {
                            callbacks[id] = {
                                reject: reject,
                                resolve: resolve,
                            };
                        });
                        worker.postMessage({
                            args: slice.call(arguments),
                            fn: key,
                            id: id,
                            type: "RPC",
                        });
                        return promise;
                    };
                });

                function recv(ev) {
                    console.log("UI.onmessage", ev);
                    if (ev.data.type === "RPC.SUCCESS") {
                        callbacks[ev.data.id].resolve(ev.data.result);
                        delete callbacks[ev.data.id];
                        return;
                    }
                    if (ev.data.type === "RPC.ERROR") {
                        const error = new Error(ev.data.result.message);
                        error.name = ev.data.result.name;
                        error.stack = ev.data.result.stack;

                        callbacks[ev.data.id].reject(error);
                        delete callbacks[ev.data.id];
                        return;
                    }
                }

                worker.addEventListener("message", recv);
                return exports;
            }

            Y.offload = offload;

        });

    });

    Core.use(function (use) {
        use.log("Core.use", use);

        use(function source(Y) {
            let active = true;

            Y.delay(function loop() {
                Y.log("~> source.loop");
                Y.emit("source.ping", {
                    some: "data",
                });

                if (active) {
                    Y.delay(loop, 500);
                }
            });

            return function dispose() {
                active = false;
            };
        });

        use(function sink(Y) {
            const sub = Y.on("source.ping", function (data) {
                Y.log("<~ sink.on.source.ping", data);
            });
            return function dispose() {
                sub();
            };
        });

        use(function SomeService(Y) {
            Y.log("SomeService.sandbox", Y);

            Y.fetch("/api/configs/7").then(function (res) {
                return res.json();
            }).then(function (json) {
                Y.log("configs/7", json);
            }).catch(function (error) {
                Y.log("[ERR] fetching", error);
            });

            Y.emit("THE_QUESTION", {
                data: "",
            });

            Y.on("THE_ANSWER", function (answer) {
                Y.log("the.answer", answer);
            });
        });

        use(function SidebarWidget(Y) {
            Y.log("x-sidebar.sandbox", Y);

            Y.widget("x-sidebar", function XSidebar(api, toolbox) {
                const { useMvu, useReducer, useState } = api;
                const { button, view } = toolbox;

                const [getState, setState] = useState({ count: 0 });

                const [getModel, dispatch] = useMvu(function update(model, msg) {
                    if (!msg) {
                        return [{ count: 0 }];
                    }
                    switch (msg) {
                        case "DEC":
                            return [{ count: model.count - 1 }];
                        case "INC":
                            return [{ count: model.count + 1 }];
                        default:
                            return [model];
                    }
                });

                const [getState2, dispatch2] = useReducer(function reduce(state, action) {
                    switch (action) {
                        case "DEC":
                            return { count: state.count - 1 };
                        case "INC":
                            return { count: state.count + 1 };
                        default:
                            return state;
                    }
                }, { count: 0 });

                function inc(ev) {
                    setState({ count: getState().count + 1 });
                    dispatch("INC");
                    dispatch2("INC");
                }

                function dec(ev) {
                    setState({ count: getState().count - 1 });
                    dispatch("DEC");
                    dispatch2("DEC");
                }

                return function render(props) {
                    const { count } = getState();
                    return [view, [button, { onClick: dec }, "-"], count, [button, { onClick: inc }, "+"]];
                };
            });
        });

        use(function puttingWorkloadIntoWorker(Y) {

            const lib = Y.offload(function lib(require, exports, module) {

                exports.addSync = function (a, b) {
                    return a + b;
                };

                this.add = function (a, b) {
                    return new Promise(function (resolve) {
                        require(["https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.js"], function (storage) {
                            console.log("fetched localForage", storage);
                            resolve(a + b);
                        });
                    });
                };

                exports.failSync = function () {
                    throw new Error("Boom!");
                };

                this.fail = function () {
                    return Promise.reject(new Error("Boom!"));
                };

            });

            Y.log("lib", lib);

            lib.addSync(1, 2).then(function (three) {
                Y.log("UI worker.addSync.success", three);
            });
            lib.add(1, 2).then(function (three) {
                Y.log("UI worker.add.success", three);
            });
            lib.failSync().catch(function (error) {
                Y.log("[ERROR] UI worker.failSync.error", error);
            });
            lib.fail().catch(function (error) {
                Y.log("[ERROR] UI worker.fail.error", error);
            });

        });

        use(function main(Y) {
            Y.log("imported", G);
            Y.log("window.Core", Core);

            let count = 0;
            Y.on("source.ping", function (data) {
                count += 1;
                Y.log("counting", count, "...");

                if (count >= 10) {
                    Core.stop();
                }
            });

            Y.delay(function () {
                Y.log("global timeout of 10sec elapsed.");
                Core.stop();
            }, 10000);
        });

    });

});
