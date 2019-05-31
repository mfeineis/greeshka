module.exports = function(config) {
    config.set({
        coverageAnalysis: "off",
        //logLevel: "debug",
        mutator: "javascript",
        packageManager: "yarn",
        reporters: [
            "html",
            "clear-text",
            "progress"
        ],
        testRunner: "jest",
        thresholds: {
            break: 50,
            high: 80,
            low: 60,
        },
        transpilers: [],
    });
};
