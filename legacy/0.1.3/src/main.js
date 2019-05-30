define(["modernoo"], function (M) {

    M(function (core, base) {

        base("fetch", function (Y, NAME) {
            Y.log("Base.extension", NAME, Y);
        });

        core("pubsub", function (Y, NAME) {
            Y.log("Core.extension", NAME, Y);
            Y.expose("modernoo", M);
        });

    }, function (core) {

        core("config", function (Y, NAME) {
            Y.log("Core.extension", NAME, Y);
        });

    }).use(function (Y) {
        Y.log("Y.use", Y);

        Y.service("some-service", ["fetch", "pubsub"], function (fetch, pubsub) {
            return function someService() {

                fetch("/api/configs/7").then(function (res) {
                    return res.json();
                }).then(function (json) {
                    Y.log("configs/7", json);
                });

                pubsub.notify("THE_QUESTION", {
                    data: "",
                });

                pubsub.listen("THE_ANSWER", function (answer) {
                    Y.log("the.answer", answer);
                });

                return function destroy() {
                };
            };
        });

        Y.widget("x-sidebar", function () {

            function ApiLess() {
                return (this)();
            }

            return class MySidebar extends HTMLElement {
            };
        });
    });

    M.log("imported", M);
    M.log("window.modernoo", window.modernoo);

});
