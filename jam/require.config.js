var jam = {
    "packages": [
        {
            "name": "bootstrap-amd",
            "location": "jam/bootstrap-amd"
        },
        {
            "name": "chosen-js",
            "location": "jam/chosen-js",
            "main": "chosen/chosen.jquery.js"
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
        }
    ],
    "version": "0.2.17",
    "shim": {
        "chosen-js": {
            "deps": [
                "jquery"
            ],
            "exports": "chosen"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "bootstrap-amd",
            "location": "jam/bootstrap-amd"
        },
        {
            "name": "chosen-js",
            "location": "jam/chosen-js",
            "main": "chosen/chosen.jquery.js"
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
        }
    ],
    "shim": {
        "chosen-js": {
            "deps": [
                "jquery"
            ],
            "exports": "chosen"
        }
    }
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
            "name": "chosen-js",
            "location": "jam/chosen-js",
            "main": "chosen/chosen.jquery.js"
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
        }
    ],
    "shim": {
        "chosen-js": {
            "deps": [
                "jquery"
            ],
            "exports": "chosen"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}