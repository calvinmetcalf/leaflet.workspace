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
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}