define(["modernoo"], function (M) {

    M().use(function (lib) {
        lib.log("lib.use (clean)", lib);

        lib.register("very-simple", function (Y) {
            lib.log("very-simple.sandbox", Y);
        });
    });

    window.Lib = M(function (core, base) {

        base("something-browser-related", function (Y, NAME) {
            return {
                BROWSER_FEATURE: 1,
            };
        });

        core("fetch", function (Y, NAME) {
            return {
                fetch: function fetch(url, options) {
                    return window.fetch(url, options);
                },
            };
        });

        core("pubsub", function (Y, NAME) {

            function listen(...args) {
                Y.log("pubsub.listen()", ...args);
            }

            function notify(...args) {
                Y.log("pubsub.notify()", ...args);
            }

            return {
                listen: listen,
                notify: notify,
            };
        });

        core("config", function (Y, NAME) {
        });

        core("widget", function (Y, NAME) {

            function widget(...args) {
                Y.log("widget.widget()", ...args);
            }

            return {
                widget: widget,
            };
        });

    }).use(function (lib) {
        lib.log("lib.use", lib);

        lib.register("some-service", function SomeService(Y) {
            Y.log("SomeService.sandbox", Y);

            Y.fetch("/api/configs/7").then(function (res) {
                return res.json();
            }).then(function (json) {
                Y.log("configs/7", json);
            }).catch(function (error) {
                Y.log("[ERR] fetching", error);
            });

            Y.notify("THE_QUESTION", {
                data: "",
            });

            Y.listen("THE_ANSWER", function (answer) {
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
    });

    M.log("imported", M);
    M.log("window.Lib", window.Lib);

});
