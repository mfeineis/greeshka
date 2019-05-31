require(["greeshka"], function (G) {

    G.log("M", G);
    G().use(function (use) {
        use.log("lib.use (clean)", use);

        use(function verySimple(Y) {
            use.log("very-simple.sandbox", Y, Y.log, Y.mix);
        });
    }).stop();

    const Core = G(function core(add) {

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
