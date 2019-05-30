define(["modernoo"], function (M) {

    M().use(function (lib) {
        lib.log("lib.use (clean)", lib);

        lib.register("very-simple", function (Y) {
            lib.log("very-simple.sandbox", Y, Y.log, Y.mix);
        });
    }).start(function (Y, app) {
        app.stop();
    });

    const Lib = window.Lib = M(function (core, base) {

        base("BROWSER_FEATURE", function (Y, NAME) {
            Y.BROWSER_FEATURE = 1;
        });

        core("utils", function (Y, NAME) {
            //Y.log("utils", NAME, Y, Y.log, Y.mix);

            const Array_slice = Array.prototype.slice;

            function slice(it, begin, length) {
                return Array_slice.call(it, begin, length);
            }

            Y.log = Y.log;
            Y.mix = Y.mix;
            Y.slice = slice;
        });

        core("fetch", function (Y, NAME) {
            //Y.log("fetch", NAME, Y, Y.log, Y.mix, "BROWSER_FEATURE", Y.BROWSER_FEATURE);

            Y.fetch = function fetch(url, options) {
                return window.fetch(url, options);
            };
        });

        core("pubsub.browser", function (Y, NAME) {
            const subs = [];

            function on(topic, fn) {
                Y.log("pubsub.on()", topic, fn);
                const fullTopic = "topic:" + topic;

                function callback(ev) {
                    fn.call(null, ev.detail);
                }

                document.addEventListener(fullTopic, callback);
                const dispose = function dispose() {
                    Y.log("pubsub.on().dispose", topic, fn);
                    document.removeEventListener(fullTopic, callback);
                };
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

        core("delay", function (Y, NAME) {
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

        core("config", function (Y, NAME) {
        });

        core("widget", function (Y, NAME) {

            Y.widget = function widget(...args) {
                Y.log("widget.widget()", ...args);
            };

            return function dispose() {
            };
        });

    }).use(function (lib) {
        lib.log("lib.use", lib);

        lib.register("source", function source(Y) {
            let active = true;

            Y.delay(function loop(...args) {
                Y.log("~> source.loop", ...args);
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

        lib.register("sink", function sink(Y) {
            const sub = Y.on("source.ping", function (...args) {
                Y.log("<~ sink.on.source.ping", ...args);
            });
            return function dispose() {
                sub();
            };
        });

        lib.register("some-service", function SomeService(Y) {
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

            return function dispose() {
            };
        });

        lib.register("x-sidebar", function (Y) {
            Y.log("x-sidebar.sandbox", Y);

            Y.widget("x-sidebar", function XSidebar(widget) {
                return function render(props) {
                    return (this)();
                };
            });

            return function dispose() {
            };
        });

    }).start(function coordinate(Y, app) {
        Y.delay(function () {
            Y.log("app", app);
            Y.log("imported", M);
            Y.log("window.Lib", window.Lib);

            let count = 0;
            Y.on("source.ping", function (...args) {
                count += 1;
                Y.log("counting", count, "...");

                if (count >= 10) {
                    app.stop();
                }
            });

            Y.delay(function () {
                Y.log("global timeout of 10sec elapsed.");
                app.stop();
            }, 10000);
        });
    });

});
