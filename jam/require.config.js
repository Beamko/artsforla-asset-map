var jam = {
    "packages": [
        {
            "name": "bootstrap-amd",
            "location": "jam/bootstrap-amd"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "version": "0.2.17",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "bootstrap-amd",
            "location": "jam/bootstrap-amd"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "bootstrap-amd",
            "location": "jam/bootstrap-amd"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "./dist/lodash.compat.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}