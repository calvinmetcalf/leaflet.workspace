var jam = {
    "packages": [
        {
            "name": "catiline",
            "location": "jam/catiline",
            "main": "dist/catiline.js"
        },
        {
            "name": "shp",
            "location": "jam/shp",
            "main": "dist/shp.js"
        },
        {
            "name": "spin-js",
            "location": "jam/spin-js",
            "main": "spin.js"
        }
    ],
    "version": "0.2.17",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "catiline",
            "location": "jam/catiline",
            "main": "dist/catiline.js"
        },
        {
            "name": "shp",
            "location": "jam/shp",
            "main": "dist/shp.js"
        },
        {
            "name": "spin-js",
            "location": "jam/spin-js",
            "main": "spin.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "catiline",
            "location": "jam/catiline",
            "main": "dist/catiline.js"
        },
        {
            "name": "shp",
            "location": "jam/shp",
            "main": "dist/shp.js"
        },
        {
            "name": "spin-js",
            "location": "jam/spin-js",
            "main": "spin.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}