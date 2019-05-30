define(["modernoo"], function (M) {
    // jinora
    // wanshitong
    // zaheer
    // asmun

    M.log("M", M);
    M().use(function (module) {
        module.log("lib.use (clean)", module);

        module(function verySimple(Y) {
            module.log("very-simple.sandbox", Y, Y.log, Y.mix);
        });
    }).stop();

    const Core = M(function core(plugin) {

        // base(function base$browserFeature(Y) {
        //     Y.BROWSER_FEATURE = 1;
        // });

        plugin(function utils(Y) {
            //Y.log("utils", utils.name, Y, Y.log, Y.mix);

            Y.log = Y.log;
            Y.mix = Y.mix;
            Y.slice = Y.slice;
        });

        plugin(function fetch(Y) {
            //Y.log("fetch", fetch.name, Y, Y.log, Y.mix, "BROWSER_FEATURE", Y.BROWSER_FEATURE);

            Y.fetch = function fetch(url, options) {
                return window.fetch(url, options);
            };
        });

        plugin(function pubsub$browser(Y) {
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

        plugin(function delay(Y) {
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

        plugin(function widget(Y) {

            Y.widget = function widget(...args) {
                Y.log("widget.widget()", ...args);
            };

        });

        return {
            trace: true,
        };

    });

    // Core.module(function (Y) {
    //     Y.log("Core.module", Y);
    // });

    Core.use(function (module) {
        module.log("Core.use", module);

        module(function source(Y) {
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

        module(function sink(Y) {
            const sub = Y.on("source.ping", function (...args) {
                Y.log("<~ sink.on.source.ping", ...args);
            });
            return function dispose() {
                sub();
            };
        });

        module(function SomeService(Y) {
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

        module(function SidebarWidget(Y) {
            Y.log("x-sidebar.sandbox", Y);

            Y.widget("x-sidebar", function XSidebar(widget) {
                return function render(props) {
                    return (this)();
                };
            });
        });

        module(function ping(Y) {
            Y.log("imported", M);
            Y.log("window.Core", Core);

            let count = 0;
            Y.on("source.ping", function (...args) {
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
