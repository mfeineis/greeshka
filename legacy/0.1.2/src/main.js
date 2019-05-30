define(["modernoo"], function (M) {

    M(function (Core, Base) {

        Base.extension("ajax", function (Y, NAME) {
            Y.log("Base.extension", Y, NAME);
        });
    
        Core.extension("pubsub", function (Y, NAME) {
            Y.log("Core.extension", Y, NAME);
            Y.expose("modernoo", M);
        });

    }).use(function (Y) {
        Y.log("Y.use", Y);

        //Y.service("", ["pubsub"], function (pubsub) {
        //
        //});

        Y.service("some-service", function (sandbox) {
            return function someService() {
                return function destroy() {
                };
            };
        });

        Y.widget("my-sidebar", function (sandbox) {

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