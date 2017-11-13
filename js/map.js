/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global configFile, ol */

(function(){
    var m = configFile.mapViewInit;
    var p = configFile.paramObject.gen;
    // Set OL map with user-defined parameters.
    window["map"] = new ol.Map({
            target: "map",
            controls: ol.control.defaults({attribution: false}),
            view:
                new ol.View({
                    center: ol.proj.fromLonLat([p.c[0], p.c[1]]),
                    zoom: p.z,
                    maxZoom: m.zoomLevelMax,
                    minZoom: m.zoomLevelMin
                })
      });
      CartONG_OL3_basemaps("basemaps", 	{
			OpenMapSurfer_Roads: true,
			OpenStreetMap_Mapnik : true,
			OpenStreetMap_France : true,
			OpenStreetMap_HOT : true,
			Stamen_TonerLite: true,
			Esri_WorldStreetMap: true,
			Esri_WorldGrayCanvas: true,
			World_Dark_Gray_Base: true,
			World_Ocean_Base: true,
			Esri_WorldTopoMap: true,
			Esri_WorldImagery: true,
			CartoDB_Positron: true
	}, 100);
var b = configFile.paramObject.gen.b;

$('.CartONG_OL3_basemaps_Thumbnail').on('click', function(){
    configFile.paramObject.gen.b = this.name;
    configFile.paramObject.method(analysisType);
});        
if (b !== "default") {
    $.each($('.CartONG_OL3_basemaps_Thumbnail'), function(i, v) {
        if (v.name === configFile.paramObject.gen.b) {
//            $(".CartONG_OL3_basemaps_Thumbnail:eq(7)").trigger('click');
            $(this).trigger('click');
            return false;
        }
    });
} else {
    $.each($('.CartONG_OL3_basemaps_Thumbnail'), function(i, v) {
        if (v.dataset.displayed === "1") {
            configFile.paramObject.gen.b = v.name;
            return false;
        }
    }); 
}
configFile.paramObject.method(analysisType);
    map.on('moveend', function(){
//        p.c = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
        var c = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
        p.c = [c[0].toFixed(6), c[1].toFixed(6)];
        p.z = map.getView().getZoom();
        configFile.paramObject.method(analysisType);
    });
})();



function resetMap(){
    map.getView().setZoom(configFile.mapViewInit.zoomLevel);
    map.getView().setCenter(ol.proj.fromLonLat([configFile.mapViewInit.center.x, configFile.mapViewInit.center.y]));
}
    


