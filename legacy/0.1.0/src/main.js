define(["modernoo"], function (M) {

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
        return class MySidebar extends HTMLElement {

        };
    });

    M.use(function (sandbox) {
        sandbox.expose("modernoo", M);
    });

    M.log("imported", M);
    M.log("window.modernoo", window.modernoo);

    function ApiLess() {
        return (this)();
    }

    M.boot();
});