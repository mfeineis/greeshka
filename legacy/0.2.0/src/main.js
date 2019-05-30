define(["modernoo"], function (M) {

    M().use(function (lib) {
        lib.log("lib.use (clean)", lib);

        lib.register("very-simple", function (Y) {
            lib.log("very-simple.sandbox", Y);
        });
    });

    window.Lib = M(function (core, base) {

        base("base.BROWSER_FEATURE", function (Y, NAME) {
            return {
                BROWSER_FEATURE: 1,
            };
        });

        core("core.utils", function (Y, NAME) {
            const Array_slice = Array.prototype.slice;

            function slice(it, begin, length) {
                return Array_slice.call(it, begin, length);
            }

            return {
                log: Y.log,
                mix: Y.mix,
                slice: slice,
            };
        });

        core("core.fetch", function (Y, NAME) {
            return {
                fetch: function fetch(url, options) {
                    return window.fetch(url, options);
                },
            };
        });

        core("core.pubsub", function (Y, NAME) {

            function on(...args) {
                Y.log("pubsub.on()", ...args);
                return function dispose() {
                    Y.log("pubsub.on().dispose", ...args);
                };
            }

            function emit(...args) {
                Y.log("pubsub.emit()", ...args);
            }

            return {
                emit: emit,
                on: on,
            };
        });

        core("core.delay", function (Y, NAME) {
            return {
                delay: function delay(fn, ms) {
                    const id = window.setTimeout(fn, ms || 0);
                    return function dispose() {
                        window.clearTimeout(id);
                    };
                },
            };
        });

        core("core.config", function (Y, NAME) {
        });

        core("core.widget", function (Y, NAME) {

            function widget(...args) {
                Y.log("widget.widget()", ...args);
            }

            return {
                widget: widget,
            };
        });

    }).use(function (lib) {
        lib.log("lib.use", lib);

        lib.register("source", function source(Y) {
            let active = true;

            Y.delay(function loop(...args) {
                Y.log("source.loop", ...args);
                Y.emit("~> source.ping", {
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
