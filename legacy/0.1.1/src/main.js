define(["modernoo"], function (M) {

    M.Base.extension("ajax", function (base, NAME) {
        base.log("Base.extension", base);
    });

    M.Core.extension("pubsub", function (base, NAME) {
        base.log("Core.extension", base);
        base.expose("modernoo", M);
    });

    M.boot();

    //M.service("", ["pubsub"], function (pubsub) {
    //
    //});

    M.service("some-service", function (sandbox) {
        return function someService() {
            return function destroy() {
            };
        };
    });

    M.widget("my-sidebar", function (sandbox) {

        function ApiLess() {
            return (this)();
        }

        return class MySidebar extends HTMLElement {

        };
    });

    M.log("imported", M);
    M.log("window.modernoo", window.modernoo);
});