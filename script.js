require(['catiline'], function(cw) {
    var worker = cw({
        init: function(scope) {
            importScripts('jam/require.js');
            require.config({
                baseUrl: this.base
            });
            require(['shp'], function(shp) {
                scope.shp = shp;
            });
        },
        data: function(data, cb, scope) {
            this.shp(data).then(function(geoJson){
                if(Array.isArray(geoJson)){
                    geoJson.forEach(function(geo){
                        scope.json([geo, geo.fileName, true],true,scope);
                    });
                }else{
                    scope.json([geoJson, geoJson.fileName, true],true,scope);
                }
            }, function(e) {
                console.log('shit', e);
            });

        },
        color:function(s){
            //from http://stackoverflow.com/a/15710692
            importScripts('js/colorbrewer.js');
            return colorbrewer.Spectral[11][Math.abs(JSON.stringify(s).split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 11];
        },
        makeString:function(buffer) {
                var array = new Uint8Array(buffer);
                var len = array.length;
                var outString = "";
                var i = 0;
                while (i < len) {
                    outString += String.fromCharCode(array[i++]);
                }
                return outString;
            },
        json: function(data, cb, scope) {
            importScripts('js/topojson.v1.min.js');
            var name = data[1];
            //console.log(name);
            var json = data.length === 2 ? JSON.parse(scope.makeString(data[0])) : data[0];
            var nom;
            if (json.type === 'Topology') {
                for (nom in json.objects) {
                    scope.layer(topojson.feature(json, json.objects[nom]), nom, scope);
                }
            }
            else {
                scope.layer(json, name, scope);
            }
        },layer:function(json,name,scope){
            
            json.features.forEach(function(feature){
                feature.properties.__color__ = scope.color(feature);
            });
            scope.fire('json',[json,name]);
        },
        base: cw.makeUrl('.')
    });
    function readerLoad() {
        if (this.readyState !== 2 || this.error) {
            return;
        }
        else {
            worker.data(this.result, [this.result]);
        }
    }

    function handleZipFile(file) {
        
        var reader = new FileReader();
        reader.onload = readerLoad;
        reader.readAsArrayBuffer(file);
    }

    function handleFile(file) {

        m.spin(true);
        if (file.name.slice(-3) === 'zip') {
            return handleZipFile(file);
        }
        var reader = new FileReader();
        reader.onload = function() {
            var ext;
            if (reader.readyState !== 2 || reader.error) {
                return;
            }
            else {
                ext = file.name.split('.');
                ext = ext[ext.length - 1];


                worker.json([reader.result, file.name.slice(0, (0 - (ext.length + 1)))], [reader.result]);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function makeDiv() {
        var div = L.DomUtil.create('form', 'bgroup');
        div.id = "dropzone";
        return div;
    }

    function makeUp(div, handleFile) {
        var upButton = L.DomUtil.create('input', 'upStuff', div);
        upButton.type = "file";
        upButton.id = "input";
        upButton.onchange = function() {
            var file = document.getElementById("input").files[0];

            handleFile(file);
        };
        return upButton;
    }

    function setWorkerEvents() {
        worker.on('json', function(e) {
            m.spin(false);
            lc.addOverlay(L.geoJson(e[0], options).addTo(m), e[1]);
        });
        worker.on('error', function(e) {
            console.warn(e);
        });
    }

    function makeDone(div, upButton) {
        var doneButton = L.DomUtil.create('button', "btn  btn-primary span3", div);
        doneButton.type = "button";
        doneButton.innerHTML = "Upload File<br />(or Drag and Drop Anywhere)<br />GeoJSON, TopoJSON, or Zipped Shapefile Work";
        L.DomEvent.addListener(doneButton, "click", function() {
            upButton.click();
        });
        return doneButton;
    }

    function addFunction(map) {
        // create the control container with a particular class name
        var div = makeDiv();
        var upButton = makeUp(div, handleFile);
        setWorkerEvents()
        var doneButton = makeDone(div, upButton);






        var dropbox = document.getElementById("map");
        dropbox.addEventListener("dragenter", dragenter, false);
        dropbox.addEventListener("dragover", dragover, false);
        dropbox.addEventListener("drop", drop, false);
        dropbox.addEventListener("dragleave", function() {
            m.scrollWheelZoom.enable();
        }, false);

        function dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            m.scrollWheelZoom.disable();
        }

        function dragover(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            m.scrollWheelZoom.enable();
            var dt = e.dataTransfer;
            var files = dt.files;

            var i = 0;
            var len = files.length;
            if (!len) {
                return
            }
            while (i < len) {
                handleFile(files[i]);
                i++;
            }
        }
        return div;
    }
    var NewButton = L.Control.extend({ //creating the buttons
        options: {
            position: 'topleft'
        },
        onAdd: addFunction
    });
    //add them to the map
    m.addControl(new NewButton());

});
