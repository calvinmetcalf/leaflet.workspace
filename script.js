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
        data: function(data, cb) {

            this.shp(data).then(cb, function(e) {
                console.log('shit', e)
            });

        },
        json: function(data) {
            importScripts('js/topojson.v1.min.js');
            var name = data[1];
            //console.log(name);
            function makeString(buffer) {
                var array = new Uint8Array(buffer);
                var len = array.length;
                var outString = "";
                var i = 0;
                while (i < len) {
                    outString += String.fromCharCode(array[i++]);
                }
                return outString;
            }
            var json = data.length === 2 ? JSON.parse(makeString(data[0])) : data[0];
            var nom;
            if (json.type === 'Topology') {
                for (nom in json.objects) {
                    this.fire('json', [topojson.feature(json, json.objects[nom]), nom]);
                }
            }
            else {
                this.fire('json', [json, name]);
            }
        },
        base: cw.makeUrl('.')
    });
    L.Control.Layers.prototype._addItem = function(obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
        }
        else {
            input = this._createRadioElement('leaflet-base-layers', checked);
        }

        input.layerId = L.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;

        label.appendChild(input);
        label.appendChild(name);
        label.className = obj.overlay ? "checkbox" : "radio";
        var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        container.appendChild(label);

        return label;
    }
    var m = L.map("map", {
        zoomControl: false
    });
    if (!location.hash) {
        m.setView([32.69, 10.55], 3);
    }
    m.addHash();
    var url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg';

    var attributionText = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    var mapquestSubdomains = '1234';

    var optionsObject = {
        attribution: attributionText,
        subdomains: mapquestSubdomains
    }

    var mq = L.tileLayer(url, optionsObject);
    var watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    })
    watercolor.addTo(m);
    var lc = L.control.layers({
        "Stamen Watercolor": watercolor,
        "Map Quest Open": mq
    }).addTo(m);
    //make the map
    var options = {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        },
        style: function(feature) {
            return {
                opacity: 1,
                fillOpacity: 0.7,
                radius: 6,
                color: colorbrewer.Spectral[11][parseInt((new jsSHA(JSON.stringify(feature), "TEXT")).getHash("SHA-512", "HEX").slice(0, 16), 16) % 11]
            }
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                opacity: 1,
                fillOpacity: 0.7,
                color: colorbrewer.Spectral[11][parseInt((new jsSHA(JSON.stringify(feature), "TEXT")).getHash("SHA-512", "HEX").slice(0, 16), 16) % 11]
            });
        }
    };


    var NewButton = L.Control.extend({ //creating the buttons
        options: {
            position: 'topleft'
        },
        onAdd: function(map) {
            // create the control container with a particular class name
            var div = L.DomUtil.create('form', 'bgroup');
            div.id = "dropzone";
            var upButton = L.DomUtil.create('input', 'upStuff', div);
            upButton.type = "file";
            upButton.id = "input";
            worker.on('json', function(e) {
                m.spin(false);
                lc.addOverlay(L.geoJson(e[0], options).addTo(m), e[1]);
            });
            worker.on('error', function(e) {
                console.warn(e);
            });
            var doneButton = L.DomUtil.create('button', "btn  btn-primary span3", div);
            doneButton.type = "button";
            doneButton.innerHTML = "Upload File<br />(or Drag and Drop Anywhere)<br />GeoJSON, TopoJSON, or Zipped Shapefile Work";
            L.DomEvent.addListener(doneButton, "click", function() {
                upButton.click();
            });
            upButton.onchange = function() {
                var file = document.getElementById("input").files[0];

                handleFile(file);
            };

            function handleFile(file) {

                m.spin(true);
                if (file.name.slice(-3) === 'zip') {
                    return handleZipFile(file);
                }
                var reader = new FileReader();
                reader.onload = function() {
                    var ext, control = {};
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

            function handleZipFile(file) {
                var addIt = function(geoJson) {
                    if (geoJson.type === 'Topology') {
                        worker.json([geoJson, geoJson.fileName, true]);
                    }
                    else {
                        m.spin(false);
                        lc.addOverlay(L.geoJson(geoJson, options).addTo(m), geoJson.fileName);
                    }
                }
                var reader = new FileReader();
                reader.onload = function() {
                    if (reader.readyState !== 2 || reader.error) {
                        return;
                    }
                    else {
                        worker.data(reader.result, [reader.result]).then(function(geoJson) {
                            if (Array.isArray(geoJson)) {
                                geoJson.forEach(addIt)
                            }
                            else {
                                addIt(geoJson);
                            }
                        }, function(a) {
                            console.warn(a)
                        });
                    }
                };
                reader.readAsArrayBuffer(file);
            }

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
    });
    //add them to the map
    m.addControl(new NewButton());

});
