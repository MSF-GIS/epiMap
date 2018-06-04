var geometryFile = configFile.data.analysisLayer.geometry;
var datasetFile  = configFile.data.analysisLayer.epiDataset.fieldsForAnalysis;

// Draw layers listed in the 'otherLayers' config object.
$.each(configFile.data.otherLayers, function(i, v){
    if (v.display) {
        $.getJSON(v.source, function(data){
            var name = "otherLayer" + i;
            window[name] = new ol.layer.Vector({
                name: name,
                source: new ol.source.Vector({}),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: v.style.fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: v.style.strokeColor,
                        width: v.style.strokeWidth
                    })
                }),
                zIndex : 1
            });	
            var formatOthers = v.format;
            if(configFile.format.indexOf(formatOthers) === -1){
            	window[formatOthers] = new ol.format[formatOthers];
            	configFile.format.push(formatOthers);
            }            
            window[name].getSource().addFeatures(window[formatOthers].readFeatures(data));
            map.addLayer(window[name]);    
        });
    }
});

function setSource (points, polygons, epi) {
    var dsv = d3.dsv(configFile.data.analysisLayer.epiDataset.delimiter);
    if (configFile.data.analysisLayer.epiDataset.remote) {
        runEpiMap(epi, dsv, points, polygons, true);
    } else {
        runEpiMap(epi, dsv, points, polygons, false)
    }
}

var remainingSources = 1
var points, polygons, epi
if (configFile.data.analysisLayer.geometryPoints.display) {
    remainingSources ++
    $.getJSON(configFile.data.analysisLayer.geometryPoints.source, function(data) {
        points = data
        remainingSources--
        if (remainingSources === 0) {
            setSource(points, polygons, epi)
        }
    })
} else {
    points = false
}
if (configFile.data.analysisLayer.geometry.display) {
    remainingSources ++
    $.getJSON(configFile.data.analysisLayer.geometry.source, function(data) {
        polygons = data
        remainingSources--
        if (remainingSources === 0) {
            setSource(points, polygons, epi)
        }
    })
} else {
    polygons = false
}








var dsv = d3.dsv(configFile.data.analysisLayer.epiDataset.delimiter);
var remoteSource = configFile.data.analysisLayer.epiDataset.remote;
if (remoteSource) {
    $.ajax({
        type: "GET",
        url: configFile.data.analysisLayer.epiDataset.source,
        // Set header for ajax request (to be used for password-protected datasets on CKAN).
        beforeSend: function (xhr) {
            xhr.setRequestHeader (configFile.data.analysisLayer.epiDataset.XMLHttpRequestHeader.header, configFile.data.analysisLayer.epiDataset.XMLHttpRequestHeader.value);
        },
        success : function(data3raw) {
            epi = data3raw
            remainingSources--
            if (remainingSources === 0) {
                setSource(points, polygons, epi)
            }
        },
        error: function(){console.log("error : counldn't retrieve data from remote repository");}		
    });      	
} else {
    dsv(configFile.data.analysisLayer.epiDataset.source, function(data3raw){
        epi = data3raw
        remainingSources--
        if (remainingSources === 0) {
            setSource(points, polygons, epi)
        }
    });
}


// // Interlocks requests to data.
// //  1 - Get the 'points' layer for analysis.
// $.getJSON(configFile.data.analysisLayer.geometryPoints.source, function(data) {
//     //  2 - Get the 'polygons' layer for analysis.
//     $.getJSON(configFile.data.analysisLayer.geometry.source, function(data2) {
//         // 3 - Get EPI dataset from .csv file.
//         // Define delimiter for .csv file parser.
        
// //        console.log(data2)
// //        var testObjAdm = [];
// //        $.each(data2.objects.cod_hltbnd_lvl2_a_msf.geometries, function(i, v){
// //            if (testObjAdm.indexOf(v.properties.pcode) === -1){
// //                testObjAdm.push(v.properties.pcode);
// //            } else {
// //                console.log(v.properties.pcode);
// //            }
// //        });
        
        
        
        
//         var dsv = d3.dsv(configFile.data.analysisLayer.epiDataset.delimiter);
//         var remoteSource = configFile.data.analysisLayer.epiDataset.remote;
//         if (remoteSource) {
// 	        $.ajax({
// 		        type: "GET",
// 		        url: configFile.data.analysisLayer.epiDataset.source,
// 		        // Set header for ajax request (to be used for password-protected datasets on CKAN).
// 		        beforeSend: function (xhr) {
// 		            xhr.setRequestHeader (configFile.data.analysisLayer.epiDataset.XMLHttpRequestHeader.header, configFile.data.analysisLayer.epiDataset.XMLHttpRequestHeader.value);
// 		        },
// 		        success : function(data3raw) {
// 		        	runEpiMap(data3raw, dsv, data, data2, true);
// 		        },
// 		        error: function(){console.log("error : counldn't retrieve data from remote repository");}		
// 	        });      	
//         } else {
//         	dsv(configFile.data.analysisLayer.epiDataset.source, function(data3raw){
//         		runEpiMap(data3raw, dsv, data, data2, false);
//         	});
//         }

	        
//     });
// });