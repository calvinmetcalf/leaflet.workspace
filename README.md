Leaflet Workspace
=====

Drag and drop, or use the upload button to put a geojson file, topojson or a zipped shapefile onto a map. (geojson and topojson can also be zipped)

The shapefile is parsed to GeoJSON using shapefile-js, which I also wrote, which uses DataView and array buffers to parse this mixed endian file. There are also promises used in here, kids these days like promises right?

If you need a file to show [here is a zipped shapefile of the world](http://calvinmetcalf.github.io/shapefile-js/files/TM_WORLD_BORDERS_SIMPL-0.3.zip)

There is a large amount of geojson in these repos

- [Cambridge Open Data (also has topojson)](https://github.com/calvinmetcalf/CambridgeOpenData)
- [Massachusetts GIS](https://github.com/calvinmetcalf/MassGIS)
- [Washington D.C.](https://github.com/where-gov/dc-maps)

Also Uses

- [leaflet for mapping](http://leafletjs.com/)
- [catiline for workers](http://catilinejs.com)
- [shapefile-js](https://github.com/calvinmetcalf/shapefile-js)
- [jsSHA for hashes](http://caligatio.github.com/jsSHA/)
- [bootstrap for styles](https://github.com/twitter/bootstrap) 
- [color specifications and designs developed by Cynthia Brewer ](http://colorbrewer.org/)
- [TopoJSON support from Mike Bostock's library](https://github.com/mbostock/topojson)