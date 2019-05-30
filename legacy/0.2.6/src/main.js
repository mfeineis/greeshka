define(["modernoo"], function (M) {

    M.log("M", M);
    M().use(function (add) {
        add.log("lib.use (clean)", add);

        add(function verySimple(Y) {
            add.log("very-simple.sandbox", Y, Y.log, Y.mix);
        });
    }).stop();

    window.Lib = M(function (add) {

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

            Y.widget = function widget(...args) {
                Y.log("widget.widget()", ...args);
            };

        });

    }).use(function (add) {
        add.log("lib.use", add);

        add(function source(Y) {
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

        add(function sink(Y) {
            const sub = Y.on("source.ping", function (...args) {
                Y.log("<~ sink.on.source.ping", ...args);
            });
            return function dispose() {
                sub();
            };
        });

        add(function SomeService(Y) {
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

        add(function SidebarWidget(Y) {
            Y.log("x-sidebar.sandbox", Y);

            Y.widget("x-sidebar", function XSidebar(widget) {
                return function render(props) {
                    return (this)();
                };
            });
        });

        add(function ping(Y) {
            Y.delay(function () {
                Y.log("imported", M);
                Y.log("window.Lib", window.Lib);

                let count = 0;
                Y.on("source.ping", function (...args) {
                    count += 1;
                    Y.log("counting", count, "...");

                    if (count >= 10) {
                        window.Lib.stop();
                    }
                });

                Y.delay(function () {
                    Y.log("global timeout of 10sec elapsed.");
                    window.Lib.stop();
                }, 10000);
            });
        });

    });

});
