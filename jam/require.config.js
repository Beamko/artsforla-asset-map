var jam = {
    "packages": [
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "version": "0.2.17",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}