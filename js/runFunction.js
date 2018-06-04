function runEpiMap(epiData, dsv, geoPoints, geoPolygons, remote){
	var data3;
	if (remote){
		data3 = dsv.parse(epiData);
	} else {
		data3 = epiData;		
	}
 
    if (geoPolygons) {
        // Initialise 'polygons' layer.
        var analysisLayer = new ol.layer.Vector({
            name: "analysisLayer",
            source: new ol.source.Vector({}),
            zIndex: 0
        });	
        
        var formatPolygons = configFile.data.analysisLayer.geometry.format
        if(configFile.format.indexOf(formatPolygons) === -1){
            window[formatPolygons] = new ol.format[formatPolygons];
            configFile.format.push(formatPolygons);
        }
        analysisLayer.getSource().addFeatures(window[formatPolygons].readFeatures(geoPolygons));
        $.each(analysisLayer.getSource().getFeatures(), function(i, v) {
            v.setId("aL" + i);
        });
        map.addLayer(analysisLayer);
    }

    if (geoPoints) {
        // Initialise 'points' layer.
        var analysisLayerPoints = new ol.layer.Vector({
            name: "analysisLayerPoints",
            source: new ol.source.Vector({}),
            zIndex: 1
        });	
        
        var formatPoints = configFile.data.analysisLayer.geometryPoints.format
        if(configFile.format.indexOf(formatPoints) === -1){
            window[formatPoints] = new ol.format[formatPoints];
            configFile.format.push(formatPoints);
        }    
        analysisLayerPoints.getSource().addFeatures(window[formatPoints].readFeatures(geoPoints));
        $.each(analysisLayerPoints.getSource().getFeatures(), function(i, v) {
            v.setId("aLP" + i);
        });        
        map.addLayer(analysisLayerPoints);
    }

    // Initialise crossfilter. 'cf1' used for mapping, 'cf2' used for graphs.
    var cf1 = crossfilter(data3);
    var cf2 = crossfilter(data3);

    var config      = configFile.data.analysisLayer.epiDataset.fieldsForAnalysis;

    var dim1Time    = cf1.dimension(function(d){return parseInt(d[config.dimTime]);});
    var dim1Geo     = cf1.dimension(function(d){return d[config.dimGeo];});
    var dim2Time    = cf2.dimension(function(d){return parseInt(+d[config.dimTime]);});
    var dim2Geo     = cf2.dimension(function(d){return d[config.dimGeo];});       
    var groupM      = dim2Time.group().reduceSum(function(d){return parseInt(d[config.measure]);});
    var groupCM     = dim2Time.group().reduceSum(function(d){return parseInt(d[config.cumulative]);});
    if (config.rate) {      
        var groupR      = dim2Time.group().reduceSum(function(d){return parseFloat(d[config.rate]);});
    }
    if (config.cumulRate) {
        var groupCR     = dim2Time.group().reduceSum(function(d){return parseFloat(d[config.cumulRate]);});
    }
    var groupGeo    = dim2Geo.group();
    var dTimeMax    = parseInt(config.timeMax) <= dim1Time.top(1)[0][config.dimTime] ? config.timeMax : dim1Time.top(1)[0][config.dimTime];
    var dTimeMin    = parseInt(config.timeMin) >= dim1Time.bottom(1)[0][config.dimTime] ? config.timeMin : dim1Time.bottom(1)[0][config.dimTime];

    // Get unique geo values (pcodes) from EPI dataset.
    var testGeo = [];
    $.each(groupGeo.top(Infinity), function(i, v){
        testGeo.push(v.key);
    });
    
    // Get min/max values for proportional circles.
    function findRangeOfValues(array, key) {
        var testArray = jQuery.extend([], array);
        var minVal;
        var result = [];    
        testArray.sort(function(a,b) {return (Number(a[key]) > Number(b[key])) ? 1 : ((Number(b[key]) > Number(a[key])) ? -1 : 0);} );
        $.each(testArray,function(i, v){
           if (Number(v[key]) !== 0) {
               minVal = Number(v[key]);
               return false;
           }
        });
        result.push(minVal);
        result.push(Number(testArray[testArray.length - 1][key]));
        return result;
    }
    var locFields = configFile.data.analysisLayer.epiDataset.fieldsForAnalysis;
    configFile.initStats = {};
    configFile.initStats[locFields.measure] = findRangeOfValues(cf2.all(), locFields.measure);
    configFile.initStats[locFields.cumulative] = findRangeOfValues(cf2.all(), locFields.cumulative);     

// TODO : Fix adminSource
    var adminSource
    if (geoPolygons) {
        adminSource = analysisLayer;
    } else {
        adminSource = analysisLayerPoints;
    }
    

//GLOBAL VARs
    window["appAnalysis"] = $("#selectorAnalysis").val();
    window["analysisType"] = sourceObj[$("#selectorAnalysis").val()]["name"];      
    window["analysisField"] = sourceObj[$("#selectorAnalysis").val()]["fieldRate"];
    window["analysisAbsoluteField"] = sourceObj[$("#selectorAnalysis").val()]["fieldAbsolute"];
    
    
    
    
    $("#selectorAnalysis").SumoSelect({
       floatWidth: 500
    });
    $("#selectorAnalysis").on('change', function(){
        clickArea.getFeatures().clear();
        
        // GLOBAL VARs
        window["appAnalysis"] = this.value;                        
        window["analysisType"] = sourceObj[this.value]["name"];
        window["analysisField"] = sourceObj[this.value]["fieldRate"];
        window["analysisAbsoluteField"] = sourceObj[this.value]["fieldAbsolute"];     
        
        configFile.paramObject.gen.a = this.value;
        configFile.paramObject.method(analysisType);
        
        // GLOBAL VARs
        window["appAnalysis"] = analysisType;  
        
        displayAnalysis(analysisType);            
        $("#selectorAdmin")[0].sumo.selectItem('default');
        sliderSize.noUiSlider.set([configFile.paramObject.param[analysisType].cS[0], configFile.paramObject.param[analysisType].cS[1]]);
    });

    $("#selectorAdmin").append('<option value="default">' + configFile.layout.selectionDefault + '</option>');

    var geoFields = adminSource === analysisLayer ? configFile.data.analysisLayer.geometry : configFile.data.analysisLayer.geometryPoints;

    var sortedAdmin = adminSource.getSource().getFeatures().sort(function(a,b) {return (a.get(geoFields.geoName) > b.get(geoFields.geoName)) ? 1 : ((b.get(geoFields.geoName) > a.get(geoFields.geoName)) ? -1 : 0);});
    $.each(sortedAdmin, function(i, v){
        var name = v.get(geoFields.geoName);
        var code = v.get(geoFields.geoCode);
        if(testGeo.indexOf(code) !== -1){
            $("#selectorAdmin").append('<option value="' + code + '">' + name + '</option>');				
        }
    });

    $("#selectorAdmin").SumoSelect({
            search: true,
            floatWidth: 500
    });

    var chartTooltipFunction = configFile.analysisFunctions.chartTooltipFunction;
    var chartsLayout = configFile.analysisFunctions.chartsLayout;

// Define DC.js charts
    // For given geo feature : Chart for rates based on cumulative values.
    if (config.cumulRate) {
        var geoSelectedChart_Cumulative = dc.lineChart('#geoSAnchorCumulative');
            geoSelectedChart_Cumulative
                .width(400)
                .height(200)
                .ordinalColors(['orange'])
                .margins({top: 50, right: 40, bottom: 40, left: 50})
                .dimension(dim2Time)
                .mouseZoomable(false)
                .renderHorizontalGridLines(true)
                .legend(dc.legend().x(0).y(10).itemHeight(13).gap(15))	
                .group(groupCR, chartsLayout.cumulative.legend)
                .title(function(d){return chartTooltipFunction(chartsLayout.cumulative.tooltip, d);})
                .yAxisLabel(chartsLayout.cumulative.axis)
                .xAxisLabel(configFile.layout.dimensionIndicator)
                .brushOn(false)
                .x(d3.scale.linear().domain([parseInt(dTimeMin), parseInt(dTimeMax) + 1]))
                .elasticY(true)
                .yAxis().ticks(5);
                geoSelectedChart_Cumulative.on("renderlet.somename", function(chart) {
                    geoSelectedChart_Cumulative.selectAll('circle').on("click", function(d) {
                        sliderWeek.noUiSlider.set(d.data.key);
                    });
                });    
    }
    // For given geo feature : Chart for rates based on values (non-cumulative).
    if (config.rate) {
        var geoSelectedChart_Measure = dc.lineChart('#geoSAnchorMeasure');
            geoSelectedChart_Measure
                .width(400)
                .height(200)
                .ordinalColors(['green'])
                .margins({top: 50, right: 40, bottom: 40, left: 50})
                .dimension(dim2Time)
                .mouseZoomable(false)
                .renderHorizontalGridLines(true)
                .legend(dc.legend().x(0).y(10).itemHeight(13).gap(15))				
                .group(groupR, chartsLayout.measure.legend)
                .title(function(d){return chartTooltipFunction(chartsLayout.measure.tooltip, d);})				
                .yAxisLabel(chartsLayout.measure.axis)
                .xAxisLabel(configFile.layout.dimensionIndicator)
                .brushOn(false)
                .x(d3.scale.linear().domain([parseInt(dTimeMin), parseInt(dTimeMax) + 1]))
                .elasticY(true)
                .yAxis().ticks(5);
                geoSelectedChart_Measure.on("renderlet.somename", function(chart) {
                    geoSelectedChart_Measure.selectAll('circle').on("click", function(d) {
                        sliderWeek.noUiSlider.set(d.data.key);
                    });
                });
    }
    // For given geo feature : Chart for absolutes values (cumulative and non-cumulative).
    var geoSelectedChart_Combined = dc.compositeChart("#geoSAnchorCombined");
        geoSelectedChart_Combined
            .width(400)
            .height(200)
            .margins({top: 60, right: 65, bottom: 35, left: 55})
            .dimension(dim2Time)
            .shareTitle(false)
            .x(d3.scale.linear().domain([parseInt(dTimeMin), parseInt(dTimeMax) + 1]))
            .legend(dc.legend().x(0).y(10).itemHeight(13).gap(5))
            .compose([
                dc.barChart(geoSelectedChart_Combined)
                    .group(groupM, chartsLayout.combined.bars.legend)
                    .valueAccessor(function(d) {return d.value;})
                    .centerBar(true)
                    .title(function(d){return chartTooltipFunction(chartsLayout.combined.bars.tooltip, d);})
                    .ordinalColors(["rgba(209,33,33,0.7)"]),
                dc.lineChart(geoSelectedChart_Combined)
                    .group(groupCM, chartsLayout.combined.line.legend)
                    .valueAccessor(function(d) {return d.value;})
                    .title(function(d){return chartTooltipFunction(chartsLayout.combined.line.tooltip, d);})						
                    .ordinalColors(["rgba(255,191,0,1)"])
                    .useRightYAxis(true)							
            ])
            .yAxisLabel(chartsLayout.combined.bars.axis)
            .brushOn(false)
            .rightYAxisLabel(chartsLayout.combined.line.axis)
            .renderHorizontalGridLines(true)
            .elasticY(true)
            .xAxisLabel(configFile.layout.dimensionIndicator)
            .yAxis().ticks(5).tickFormat(d3.format("d"));
            geoSelectedChart_Combined.rightYAxis().ticks(5);
            geoSelectedChart_Combined.on("renderlet.somename", function(chart) {
                geoSelectedChart_Combined.selectAll('rect').on("click", function(d) {
                    sliderWeek.noUiSlider.set(d.data.key);
                });
                geoSelectedChart_Combined.selectAll('circle').on("click", function(d) {
                    sliderWeek.noUiSlider.set(d.data.key);
                });
            });

    // For all geo features : Chart for absolutes values (cumulative and non-cumulative).
    var geoAllChart_Combined = dc.compositeChart("#geoAllAnchorCombined");
        geoAllChart_Combined
            .width(400)
            .height(200)
            .margins({top: 60, right: 65, bottom: 35, left: 55})
            .dimension(dim2Time)
            .shareTitle(false)
            .x(d3.scale.linear().domain([parseInt(dTimeMin), parseInt(dTimeMax) + 1]))
            .legend(dc.legend().x(0).y(10).itemHeight(13).gap(5))
            .compose([
                dc.barChart(geoAllChart_Combined)
                    .group(groupM, chartsLayout.combined.bars.legend)
                    .valueAccessor(function(d) {return d.value;})
                    .centerBar(true)
                    .title(function(d){return chartTooltipFunction(chartsLayout.combined.bars.tooltip, d);})
                    .ordinalColors(["rgba(209,33,33,0.7)"]),
                dc.lineChart(geoAllChart_Combined)
                    .group(groupCM, chartsLayout.combined.line.legend)
                    .valueAccessor(function(d) {return d.value;})
                    .title(function(d) {return chartTooltipFunction(chartsLayout.combined.line.tooltip, d);})							
                    .ordinalColors(["rgba(255,191,0,1)"])
                    .useRightYAxis(true)							
            ])
            .yAxisLabel(chartsLayout.combined.bars.axis)
            .brushOn(false)
            .rightYAxisLabel(chartsLayout.combined.line.axis)
            .renderHorizontalGridLines(true)
            .elasticY(true)
            .xAxisLabel(configFile.layout.dimensionIndicator)
            .yAxis().ticks(5);
            geoAllChart_Combined.rightYAxis().ticks(5);
            geoAllChart_Combined.on("renderlet.somename", function(chart) {
                geoAllChart_Combined.selectAll('rect').on("click", function(d) {
                    sliderWeek.noUiSlider.set(d.data.key);
                });
                geoAllChart_Combined.selectAll('circle').on("click", function(d) {
                    sliderWeek.noUiSlider.set(d.data.key);
                });
            });
            
/////////////	ANALYSIS - start
// 
function displayAnalysis(analysis){
    clickArea.getFeatures().clear();        
    popup.setPosition(undefined);
    if (geoPolygons) {
        $.each(analysisLayer.getSource().getFeatures(), function(i, v) {
            var value = function(){
                dim1Geo.filter(null);
                dim1Geo.filter(v.get(geometryFile.geoCode));
                var val1;
                if(dim1Geo.top(Infinity).length !== 0){						
                    val1 = parseFloat(dim1Geo.top(Infinity)[0][analysisField]);							
                } else {
                    val1 = 0;
                }
                return val1;
            };
            v.set(analysisField, value());
            v.set("layerType", "polygons");
        });
    }
    if (geoPoints) {
        $.each(analysisLayerPoints.getSource().getFeatures(), function(i, v) {
            var value = function(){
                dim1Geo.filter(null);
                dim1Geo.filter(v.get(geometryFile.geoCode));
                var val1;
                if(dim1Geo.top(Infinity).length !== 0){						
                    val1 = parseFloat(dim1Geo.top(Infinity)[0][analysisAbsoluteField]);							
                } else {
                    val1 = 0;
                }               
                return val1;
            };
            v.set(analysisAbsoluteField, value());
            v.set("layerType", "points");
        });
    }
    if ($('#selectorAnalysis')[0].dataset.param !== configFile.paramObject.paramString.legend) {
        if (geoPolygons) {
            $('#legendContent').html(configFile.analysisFunctions.drawLegendRates(analysisType));
        }
        if (geoPoints) {
            $('#legendContent').append(configFile.analysisFunctions.drawLegendCases(analysisType));
        }
        if (geoPoints && !geoPolygons) {
            $('#legendContent').html(configFile.analysisFunctions.drawLegendCases(analysisType));
        }
        $('#legendContent').append(configFile.analysisFunctions.drawLegendOthers());
        $('#selectorAnalysis')[0].dataset.param = configFile.paramObject.paramString.legend;
    }

    if (geoPolygons) {
        analysisLayer.setStyle(function(feature){
            var val = feature.get(analysisField);
            var layerType = feature.get("layerType");
            return configFile.analysisFunctions.runAnalysis(val, layerType, analysisType);
        });
    }
    if (geoPoints) {
        analysisLayerPoints.setStyle(function(feature){
            var val = feature.get(analysisAbsoluteField);
            var layerType = feature.get("layerType");
            return configFile.analysisFunctions.runAnalysis(val, layerType, analysisType);     
        });
    }
}


/////////////	ANALYSIS - end	

/////////////	MAP INTERACTION - start

    window["yemcholera_clickFlag"] = false;
    var layersInteraction = []
    if (geoPolygons) {layersInteraction.push(analysisLayer)}
    if (geoPoints) {layersInteraction.push(analysisLayerPoints)}
    var clickArea = new ol.interaction.Select({
        layers: layersInteraction,
        multi: false,
        style: function(feature){
            if (testGeo.indexOf(feature.get(configFile.data.analysisLayer.geometry.geoCode)) !== -1) {
                var layerType = feature.get("layerType");
                var val;
                if (layerType === "polygons"){
                    val = feature.get(analysisField);   
                } else {
                    val = feature.get(analysisAbsoluteField);
                }                    
                var style = configFile.analysisFunctions.runAnalysis(val, layerType, analysisType);
                var cloneStyle = style.clone();
                if (layerType === "polygons"){
                    cloneStyle.getStroke().setWidth(configFile.analysisFunctions.style.outline.strokeWidth * 2);                    
                    cloneStyle.getStroke().setColor("rgb(30,144,255)");
                    cloneStyle.setZIndex(0);
                } else {                        
                    var cloneStyle = new ol.style.Style({
                        image : new ol.style.Circle({
        //                    snapToPixel : "",
                            radius : style.getImage().getRadius(),
                            stroke : new ol.style.Stroke({
                                color : "rgb(30,144,255)",
                                width : (configFile.paramObject.param[analysisType].cW * 2)
                            }),
                            fill : new ol.style.Fill({
                                color : configFile.paramObject.param[analysisType].cF
                            })
                        }),
                        zIndex : 1                        
                    }); 
                }
                return cloneStyle;
            }
        }
    });
    map.addInteraction(clickArea);
    
	var element_popup = $('#popup')[0];
var content_popup = $('#popup-content')[0];

var popup = new ol.Overlay({
        element: element_popup,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
});

map.addOverlay(popup);

    $('.ol-popup').css("visibility", "visible"); 

    $('.popupClose').on('click', function(){
            popup.setPosition(undefined);
            var a = clickArea.getFeatures().getArray();
            clickArea.getFeatures().remove(a[0]);
            $("#selectorAdmin")[0].sumo.selectItem('default');
//            $("#infoAdmin").html('');
            $("#adminRow").hide(500);                
    });

    clickArea.on('select', function(e){
        var test = map.getPixelFromCoordinate(e.mapBrowserEvent.coordinate);
        yemcholera_clickFlag = true;
        popup.setPosition(undefined);  
        var a = $('#selectorAnalysis').val();
        if (hoovered.length !== 0) {
            var h = hoovered[0];
            var lT = h.get("layerType");
            var field = lT === "polygons" ? configFile.analysisFunctions.matchAbbAnalysis[a].fieldRate : configFile.analysisFunctions.matchAbbAnalysis[a].fieldAbsolute;                
            var style = configFile.analysisFunctions.cacheObj[lT][analysisType][h.get(field)];
            h.setStyle(style);    
            var cloneStyle = style.clone();
            if (lT === "polygons") {
                cloneStyle.getStroke().setWidth(configFile.analysisFunctions.style.outline.strokeWidth * 2);                    
                cloneStyle.getStroke().setColor("rgb(30,144,255)");
                cloneStyle.setZIndex(0);
                h.setStyle(cloneStyle);
            } else {
                var cloneStyle = new ol.style.Style({
                    image : new ol.style.Circle({
                        radius : style.getImage().getRadius(),
                        stroke : new ol.style.Stroke({
                            color : "rgb(30,144,255)",
                            width : (configFile.paramObject.param[analysisType].cW * 2)
                        }),
                        fill : new ol.style.Fill({
                            color : configFile.paramObject.param[analysisType].cF
                        })
                    }),
                    zIndex : 1                        
                }); 
                h.setStyle(cloneStyle);                      
            }
            hoovered = [];                
        };                   
//        if (e.selected.length > 0) {
//            if (e.selected[0] !== undefined && ((e.selected[0].get(analysisField) > 0 || e.selected[0].get(analysisAbsoluteField) > 0))){
//                var f = e.selected[0];
//                var lT = f.get("layerType");
//                var field = lT === "polygons" ? configFile.analysisFunctions.matchAbbAnalysis[a].fieldRate : configFile.analysisFunctions.matchAbbAnalysis[a].fieldAbsolute;
//                var style = configFile.analysisFunctions.cacheObj[lT][analysisType][f.get(field)];
//                var cloneStyle = style.clone();
//                if (lT === "polygons") {
//                    cloneStyle.getStroke().setWidth(configFile.analysisFunctions.style.outline.strokeWidth * 2);                    
//                    cloneStyle.getStroke().setColor("rgb(30,144,255)");
//                    cloneStyle.setZIndex(0);
//                    f.setStyle(cloneStyle);
//                } else {
//                    cloneStyle = new ol.style.Style({
//                        image : new ol.style.Circle({
//                            radius : style.getImage().getRadius(),
//                            stroke : new ol.style.Stroke({
//                                color : "rgb(30,144,255)",
//                                width : (configFile.paramObject.param[analysisType].cW * 2)
//                            }),
//                            fill : new ol.style.Fill({
//                                color : configFile.paramObject.param[analysisType].cF
//                            })
//                        }),
//                        zIndex : 1                        
//                    }); 
//                    f.setStyle(cloneStyle);                    
//                }  
//            }
//        }
//        if (e.deselected.length > 0) {
//            if (e.deselected[0] !== undefined && ((e.deselected[0].get(analysisField) > 0 || e.deselected[0].get(analysisAbsoluteField) > 0))){
//                var f = e.deselected[0];
//                var lT = f.get("layerType");
//                var field = lT === "polygons" ? configFile.analysisFunctions.matchAbbAnalysis[a].fieldRate : configFile.analysisFunctions.matchAbbAnalysis[a].fieldAbsolute;
//                var style = configFile.analysisFunctions.cacheObj[lT][analysisType][f.get(field)];
//                f.setStyle(style);
//            }
//        }     

//        var analysisField = configFile.analysisFunctions.matchAbbAnalysis[a]["fieldRate"];  

        var selected = e.target.getFeatures().getArray()[0];
        if (selected) {
            if(testGeo.indexOf(selected.get(geoFields.geoCode)) !== -1){
                var lT = selected.get("layerType");
                var field = lT === "polygons" ? configFile.analysisFunctions.matchAbbAnalysis[a].fieldRate : configFile.analysisFunctions.matchAbbAnalysis[a].fieldAbsolute;                    
                var loc = selected.get(geoFields.geoCode);
                var loc_selected = selected.get(geoFields.geoName);
                var val_selected = selected.get(field);
                var text;
                if (lT === "polygons") {
                    text = a + " : " + val_selected;
                } else {
                    text = val_selected + " cases";
                }
                content_popup.innerHTML = '<div><b>'+loc_selected+'</b><br>' + text + '</div>';
                popup.setPosition(e.mapBrowserEvent.coordinate);
                $("#selectorAdmin")[0].sumo.selectItem(loc);	
            } else {
                $("#selectorAdmin")[0].sumo.selectItem('default');
                $("#adminRow").hide(500);
                clickArea.getFeatures().clear();
            }
        } else {
            $("#selectorAdmin")[0].sumo.selectItem('default');
            $("#adminRow").hide(500);
        }
    });
    $("#selectorAdmin").on('click', function(){
        yemcholera_clickFlag = false;
    });

    $("#selectorAdmin").on('change', function(){
            var test = true;
            if(clickArea.getFeatures().getArray().length !== 0){
                var feature = clickArea.getFeatures().getArray()[0];
                var field = feature.get("layerType") === "polygons" ? configFile.data.analysisLayer.geometry.geoCode : configFile.data.analysisLayer.geometryPoints.geoCode;
                if (feature.get(field) !== this.value){
                    clickArea.getFeatures().clear();
                } else {
                    test = false;
                }
            }
            var an = $('#selectorAnalysis').val();
            var analysisField = configFile.analysisFunctions.matchAbbAnalysis[an]["fieldRate"];
            if (!analysisField) {
                analysisField = configFile.analysisFunctions.matchAbbAnalysis[an]["fieldAbsolute"];
            }       
            if($("#selectorAdmin").val() !== "default"){
                function filterAdm(a){
                    var Adm = $("#selectorAdmin").val();
                    return a.get(geoFields.geoCode) === Adm;
                }
                var e = adminSource.getSource().getFeatures().filter(filterAdm);
                if (test === true) {
                    clickArea.getFeatures().push(e[0]);                        
                }       
                if (yemcholera_clickFlag === false) {
                    
                    var loc_selected = e[0].get(geoFields.geoName);
                    var val_selected = e[0].get(analysisField);
                    if (!val_selected) {
                        val_selected = e[0].get(analysisAbsoluteField);
                    }
                    var text = an + " : " + val_selected;
                    content_popup.innerHTML = '<div><b>' + loc_selected + '</b><br>' + text + '</div>';
                    var zoom = map.getView().getZoom();
                    var extent = e[0].getGeometry().getExtent();
                    var coord = [((extent[2] - extent[0])/2 + extent[0]), ((extent[3] - extent[1])/2 + extent[1])];
                    popup.autopan = false;
                    popup.setPosition([coord[0], extent[3]]);
                    map.getView().animate({
                        center : coord,
                        zoom : zoom,
                        duration : 500
                    });
                }

                dim2Geo.filter(null);
                dim2Geo.filter(e[0].get(geoFields.geoCode));
                
                $("#weeklyChartTitle").html('<strong>' + e[0].get(geoFields.geoName) + ' - ' + chartsLayout.combined.title + '</strong>');
                if (config.cumulRate) {
                    $("#weeklyChartTitle_AR").html('<strong>' + e[0].get(geoFields.geoName) + ' - ' + chartsLayout.cumulative.title + '</strong>');
                }
                if (config.rate) {
                    $("#weeklyChartTitle_WIR").html('<strong>' + e[0].get(geoFields.geoName) + ' - ' + chartsLayout.measure.title + '</strong>');
                }

                geoSelectedChart_Combined.redraw();
                if (config.cumulRate) {
                    geoSelectedChart_Cumulative.redraw();
                }
                if (config.rate) {
                    geoSelectedChart_Measure.redraw();
                }
                $("#adminRow").show(500);

            } else {
                $("#adminRow").hide(500);
            }
    });
    

    var cursorHoverStyle = "pointer";
    var target = map.getTarget();
    var jTarget = typeof target === "string" ? $("#"+target) : $(target);
    var hoovered = [];
    
    
    
    
    map.on('pointermove', function(e){
        if (hoovered.length !== 0){
            var h = hoovered[0];
            h.setStyle(configFile.analysisFunctions.cacheObj[h.get("layerType")][analysisType][h.get(field)]);
            hoovered = [];
        };

        var mouseCoordInMapPixels = [e.originalEvent.offsetX, e.originalEvent.offsetY];
        var f;
        // Detect feature at mouse position.
        var hit = map.forEachFeatureAtPixel(mouseCoordInMapPixels, function (feature, layer) {
            if (feature !== undefined && ((feature.get(analysisField) > 0 || feature.get(analysisAbsoluteField) > 0))) {
                    f = feature;    
                    return true;					
                }
        });
        if (hit) {
            jTarget.css("cursor", cursorHoverStyle);
//            var field;
//            var layerType = f.get("layerType");
//            if (layerType === "polygons") {
//                field = analysisField;
//            } else {
//                field = analysisAbsoluteField;
//            }
//            console.log(f.get(field));
//            var validate = true;
//            if (clickArea.getFeatures().getArray().length > 0){
//                if (f.getId() === clickArea.getFeatures().getArray()[0].getId()) {
//                    validate = false;
//                }
//            }
//            if (validate) {
//                console.log(configFile.analysisFunctions.cacheObj[f.get("layerType")][analysisType]);
//                var style = configFile.analysisFunctions.cacheObj[f.get("layerType")][analysisType][f.get(field)];
//                var cloneStyle = style.clone();                        
//                if (f.get("layerType") === "polygons") {
//                    cloneStyle.getStroke().setColor([0,0,0,1]);
//                    cloneStyle.getStroke().setWidth(configFile.analysisFunctions.style.outline.strokeWidth * 1.5);
//                    cloneStyle.setZIndex(2);
//                    f.setStyle(cloneStyle);
//                } else {
//                    cloneStyle = new ol.style.Style({
//                        image : new ol.style.Circle({
//                            radius : style.getImage().getRadius(),
//                            stroke : new ol.style.Stroke({
//                                color : configFile.paramObject.param[analysisType].cO,
//                                width : (configFile.paramObject.param[analysisType].cW * 2)
//                            }),
//                            fill : new ol.style.Fill({
//                                color : configFile.paramObject.param[analysisType].cF
//                            })
//                        }),
//                        zIndex : 15                       
//                    });                         
//                    f.setStyle(cloneStyle);
//                } 
//                hoovered[0] = f;
//            }
        } else {             
            jTarget.css("cursor", "");
        }
    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

/////////////	MAP INTERACTION - end

/////////////	SLIDERS - start

    var sliderWeek = $('#selectWeek')[0];
    noUiSlider.create(sliderWeek, {
        start: parseInt(configFile.paramObject.gen.f) <= parseInt(dTimeMax) && parseInt(configFile.paramObject.gen.f) >= parseInt(dTimeMin) ? parseInt(configFile.paramObject.gen.f) : parseInt(dTimeMax),
        tooltips: false,
        range: {
            'min': parseInt(dTimeMin),
            'max': parseInt(dTimeMax)
        },
        step: 1
    });

    function updateValues(){
        $('#selectWeek_value').html("<i>" + configFile.layout.dimensionIndicator + " " + parseInt($('#selectWeek')[0].noUiSlider.get()) + "</i>");
    };
    updateValues();

    $('.slider_move').on('click', function(){
        var slider = $('#' + this.dataset.slider)[0].noUiSlider;
        var sliderValue = slider.get();
        if(Array.isArray(sliderValue) === false){
            if($(this).hasClass('glyphicon-circle-arrow-left') === true){
                if(sliderValue > slider.options.range.min){
                    slider.set(parseInt(sliderValue) - 1);							
                }
            } else {
                if(sliderValue < slider.options.range.max){						
                    slider.set(parseInt(sliderValue) + 1);
                }
            }
        } else {
            if($(this).hasClass('glyphicon-circle-arrow-right') === true){
                if(sliderValue[0] > slider.options.range.min){
                    slider.set([parseInt(sliderValue[0]) - 1, parseInt(sliderValue[1]) - 1]);							
                }
            } else {
                if(sliderValue[1] < slider.options.range.max){						
                    slider.set([parseInt(sliderValue[0]) + 1, parseInt(sliderValue[1]) + 1]);							
                }
            }				
        }
    });

    dc.renderAll();
    
    sliderWeek.noUiSlider.on('update', function(value){
        updateValues();
        dim1Time.filter(null);					
        dim1Time.filter(parseInt(value));
        configFile.paramObject.gen.f = parseInt(value);
        configFile.paramObject.method(analysisType);
        displayAnalysis($("#selectorAnalysis").val());
        if (configFile.data.analysisLayer.geometry.draw) {
            clickArea.getFeatures().clear();
        }
//        $("#infoAdmin").html('');
    });
/////////////	SLIDERS - end
    $("#container").show();
    $("#sideLegend").show();		
    $("#forExport").show();
    $("#overallRow").show();	

//////////////// EXPORT - PDF

setExportPdf(config);

    var sliderTransparency = $('#transparencySlider')[0];
    noUiSlider.create(sliderTransparency, {
        start: parseFloat(configFile.paramObject.gen.t),
        tooltips: false,
        range: {
            'min': 0,
            'max': 1
        },
        format: wNumb({
            decimals: 1
        }),
        step: 0.1
    });

    sliderTransparency.noUiSlider.on('update', function(value){
        configFile.analysisFunctions.style.colors.transparency = value[0];
        configFile.paramObject.gen.t = value[0];
        configFile.paramObject.method(analysisType);            
        configFile.analysisFunctions.listColors(configFile.analysisFunctions.analysis_1, "analysis_1");
        configFile.analysisFunctions.cacheObj.polygons = {};
        $("#transparencyVal").html("Opacity " + value);
        displayAnalysis($("#selectorAnalysis").val());
    });

    var sliderSize = $('#sizeSlider')[0];
    noUiSlider.create(sliderSize, {
        start: [parseInt(configFile.paramObject.param[analysisType].cS[0]), parseInt(configFile.paramObject.param[analysisType].cS[1])],
        tooltips: false,
        range: {
            'min': 0,
            'max': 5000
        },
        step: 1
    });

    sliderSize.noUiSlider.on('update', function(value){
        configFile.analysisFunctions.cacheObj.points = {};
        var val1 = parseInt(value[0]) !== 0 ? parseInt(value[0]) : 1;
        var val2 = parseInt(value[1]);
        configFile.paramObject.param[analysisType].cS = [val1, val2];
        configFile.paramObject.method(analysisType);
        displayAnalysis($("#selectorAnalysis").val());
    });    
    
	var sliderWidth = $('#selectWidth')[0];
	noUiSlider.create(sliderWidth, {
		start: parseFloat(configFile.paramObject.param[analysisType].cW),
		tooltips: false,
		range: {
			'min': 0.1,
			'max': 4
		},
		behaviour: 'drag',
		step: 0.1
	});
	
	sliderWidth.noUiSlider.on('update', function(value){
	        configFile.analysisFunctions.cacheObj.points = {};
	        $("#Pick_strokeWidth").html(value);
	        configFile.paramObject.param[analysisType].cW = parseFloat(value[0]);
	        configFile.paramObject.method(analysisType);
	        displayAnalysis($("#selectorAnalysis").val());
	});
	    
	$(".minicolors-input").on('change', function() {
	    configFile.analysisFunctions.cacheObj.points = {};
	    configFile.paramObject.param[analysisType][this.dataset.obj] = this.value.replace(/ /g,'');
	    configFile.paramObject.method(analysisType);
	    displayAnalysis($("#selectorAnalysis").val());            
	});
	
	if (configFile.layout.displayAppDisclaimer) {
	    $("#inAppDisclaimer").html('<i>' + configFile.layout.appDisclaimer + '</i>');
	    $("#inAppDisclaimerRow").show();
	};

}