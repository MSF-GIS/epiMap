//testFunctions.js
Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    var millisecsInDay = 86400000;
    return Math.ceil((((this - onejan) /millisecsInDay) + onejan.getDay()+1)/7);
};
var transparency = 0.9;	
ol.style.Chart.colors = {	
    "classic":          [	"rgba(221, 141, 26, " + transparency + ")",
                                "rgba(0, 51, 102, " + transparency + ")",							
                                "rgba(255, 0, 0, " + transparency + ")",
                                "rgba(128, 0, 0, " + transparency + ")",
                                "rgba(0, 0, 255, " + transparency + ")",
                                "rgba(255, 0, 255, " + transparency + ")",
                                "rgba(255, 255, 0, " + transparency + ")",
                                "rgba(0, 255, 0, " + transparency + ")"	
			]
};
var sourceCode = {
	layerList: {},
	defaultValues: {
		defaultGeomStyle: function(){
			this.strokeColor			= 	'rgba(51,153,204,1)';
			this.strokeWidth			= 	1.2;
			this.fillColor 				= 	'rgba(255,255,255,0.4)';
			this.lineDash				= 	[];
			this.radius					= 	5;	
		},
		defaultChartStyle: function(){
			this.chartStrokeColor 		= 	'rgba(0,0,0,0.8)';
			this.chartStrokeWidth 		= 	1;
			this.chartDefaultSize 		= 	10;
			this.chartFactorSize 		= 	100;
			this.chartSizeFunction 		= 	function(feature, resolution, refFactor){var size = feature.get("sizeChart"); var r = Math.sqrt((size*refFactor)/Math.PI); return r;};
			this.chartLineDash			= 	[];
			this.chartType				= 	"pie";
			this.chartRotateWithView	= 	true;
			this.arrayOfColors 			= 	[
				"#7fc97f",
				"#e41a1c",
				"#aab7e2",
				"#204398",
				"#dadc09",
				"#ff7f00",
				"#ffff33",
				"rgb(255, 0, 255)"
			];
		},
		defaultIconStyle: function(){
			this.anchor					= 	[0.5, 0];
			this.anchorOrigin			= 	'bottom-right';
			this.anchorXUnits 			= 	'fraction';
			this.anchorYUnits			= 	'fraction';
			this.opacity				= 	1;	
			this.scale					= 	1;
			this.color					=	undefined;
			this.src					= 	'img/1488849303_map-marker2.svg';	
		},
		defaultLabelStyle: function(){
			this.font					=	'Arial';
			this.offsetX				=	0;
			this.offsetY				=	0;
			this.textScale				=	1;
			this.rotateWithView			=	false;
			this.rotation				=	0;
			this.textAlign				=	'center';
			this.textBaseline			=	'middle';
			this.fill					=	'rgba(0,0,0,1)';
			this.stroke					=	'rgba(0,0,0,0)';
			this.textStrokeWidth		=	1;
			this.textDisplay			=	'wrap';
			this.textMaxReso			=	1500;
			this.fieldForText			=	"name";
		},
	},
	stringFunctions: {
		toProperCase: function(s) {
			return s.toLowerCase().replace(/^(.)|\s(.)|\u002D(.)|\u0027(.)/g, 
				function($1) { return $1.toUpperCase(); });
		},
		stringDivider: function(str, width, spaceReplacer) {
        if (str.length > width) {
          var p = width;
          while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
            p--;
          }
          if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
              left = str.substring(0, p + 1);
            } else {
              left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + sourceCode.stringFunctions.stringDivider(right, width, spaceReplacer);
          }
        }
        return str;
      },
	},
	utilsFunctions: {
		getText: function(feature, resolution, name) {
			var field = sourceCode.layerList[name].styleOptions.fieldForText;
			var type = sourceCode.layerList[name].styleOptions.textDisplay;
			var maxResolution = sourceCode.layerList[name].styleOptions.textMaxReso;
			var fromField = feature.get(field);
			var forText = isNaN(fromField) === true ? fromField : fromField.toString();
			var text = sourceCode.stringFunctions.toProperCase(forText);
			if (resolution > maxResolution) {
				text = '';
			} else if (type === 'hide') {
				text = '';
			} else if (type === 'wrap') {
				text = sourceCode.stringFunctions.stringDivider(text, 8, '\n');
			}
			return text;
		},
		filterLayer: function(layerVar, arrayOfFilters, addOrRemove) {
			var source;
			$.each(arrayOfFilters, function(i, v) {
				var a = [];
				var b = layerVar.getSource().getFeatures();
				var field = Object.keys(v)[0];
				if (addOrRemove === 'add') {
					for (var y in b){
						var value = b[y].get(field);
						if (v[field].indexOf(value) !== -1){
							a.push(b[y])
						}
					}
				} else {
					for (var y in b){
						var value = b[y].get(field);
						if (v[field].indexOf(value) === -1){
							a.push(b[y])
						}
					}
				}
				b = a;
				source = b;
				layerVar.getSource().clear();				
				layerVar.getSource().addFeatures(source);					
			})
		},
		resetLayerFilter: function(layerVar) {
			var layerRef = layerVar.get("name");
			layerVar.getSource().clear();
			layerVar.getSource().addFeatures(sourceCode.layerList[layerRef].source);
		},
		getFeatureType: function(feature) {
			var test; 
			switch(feature){
				case "Point"			:	test = "Point";
					break;
				case "LineString"		:	test = "Line";
					break;
				case "LinearRing"		:	test = "Point";
					break;
				case "Polygon"			:	test = "Polygon";
					break;
				case "MultiPoint"		:	test = "Point";
					break;
				case "MultiLineString"          :	test = "Line";
					break;
				case "MultiPolygon"		:	test = "Polygon";
					break;
				case "Circle"			:	test = "Point";
					break;
				default				:	test = "Other";		
			}
			return test
		},
	},	
	domFunctions: {
		setFilters : function(layerVar, data, arrayOfFields, divID, fieldsDictionnary) {
			//Global objects 'window["dataFilters"]' and 'window["dataFeatureCount"]' declared in sourceCode.newMap()
			var layerRef = layerVar.get('name');
			dataFilters[layerRef] = {};
			var fieldsDic;
			if(!fieldsDictionnary){
				fieldsDic = {};
				$.each(arrayOfFields, function(i, v) {
					fieldsDic[v] = v
				});
			} else {
				fieldsDic = fieldsDictionnary;
			}
			var title = sourceCode.layerList[layerRef].alias;
			$('#' + divID).append('<div class="row"><div class="col-sm-12"><div class="row"><span style="font-size:14pt;font-weight:700;float:center;color:#d12121">' + title + '</span></div><br>');
			$.each(arrayOfFields, function(i){
				htmlStr = 
					'<div class="form-group">' + 
					'<span class="control-label col-sm-3" for="filter' + arrayOfFields[i] + '">' + fieldsDic[arrayOfFields[i]] + '</span>' +
					'<div class="col-sm-8">' +
					'<select id="filterSelect_' + arrayOfFields[i] + '" multiple="multiple" name="' + layerRef + '" class="form-control filterControl pointer">';

				var a = sourceCode.listUniqueFieldValuesGeoJSON(data, [arrayOfFields[i]]);
				dataFilters[layerRef][arrayOfFields[i]] = a[arrayOfFields[i]];
				a[arrayOfFields[i]].sort();
				window["dataFeatureCount"]["count_" + layerRef + "_" + arrayOfFields[i]] = {
					initial : a[arrayOfFields[i]].length,
					temp : a[arrayOfFields[i]].length
				}
				$.each(a[arrayOfFields[i]], function(j){
					htmlStr += '<option value="' + a[arrayOfFields[i]][j] + '" hidden>' + a[arrayOfFields[i]][j] + '</option>';
				});
				
				htmlStr += '</select></div><i id="filterSymbol_' + arrayOfFields[i] + '" class="fa fa-filter noselect filterSymbolDisabled" data-filter="' + layerRef + '" aria-hidden="true"></i></div></br>';
				
				$('#' + divID).append(htmlStr);

				$('select[id="filterSelect_' + arrayOfFields[i] + '"][name="' + layerRef + '"]').SumoSelect({
					csvDispCount: 3,
					search : true,
					captionFormat: '{0} Selected',
					captionFormatAllSelected: 'all selected ({0})',
					floatWidth: 500
				});
				$('select[id="filterSelect_' + arrayOfFields[i] + '"][name="' + layerRef + '"]')[0].sumo.selectAll();
				$('select[id="filterSelect_' + arrayOfFields[i] + '"][name="' + layerRef + '"]').on('change', function(){
					var layer = window[this.name];
					var layerName = this.name;
					var field = (this.id).substring(13);
					if (isNaN(Number(dataFilters[layerName][field][0])) === true) {
						dataFilters[layerName][field] = $(this).val();							
					} else {
						var a = [];
						var b = $(this).val();
						$.each(b, function(i) {
							a.push(parseInt(b[i]))
						});
						dataFilters[layerName][field] = a;
					}
					var l = $(this).val().length;
					var count = "count_" + layerName + "_" + field;
					window["dataFeatureCount"][count]["temp"] = l;
					if (window["dataFeatureCount"][count]["temp"] < window["dataFeatureCount"][count]["initial"]) {
						$('i[id="filterSymbol_' + field + '"][data-filter="' + layerName + '"]').removeClass('filterSymbolDisabled').addClass('filterSymbolEnabled');
						$('.filterSymbolEnabled').on('click', function(){var a = (this.id).substring(13); var b = this.dataset.filter; $('select[id="filterSelect_' + a + '"][name="' + b + '"]')[0].sumo.selectAll()});
					} else {
						$('i[id="filterSymbol_' + field + '"][data-filter="' + layerName + '"]').removeClass('filterSymbolEnabled').addClass('filterSymbolDisabled');
					}
					var array = [];
					$.each(dataFilters[layerName], function(k, v){
						var obj = {};
						obj[k] = v;
						array.push(obj);
					});
					sourceCode.utilsFunctions.resetLayerFilter(layer);
					sourceCode.utilsFunctions.filterLayer(layer, array, "add");
				})
			})
//			$('#' + divID).append('</div></div>');
			if($("#resetFilters").length){$("#resetFilters").remove()};
			$('#' + divID).append('<div class="col-sm-11"><div style="float:right;"><button type="button" class="btn btn-default" id="resetFilters">Reset values filters</button></div></div><br>');
			$('#' + divID).append('</div></div>');
			$('#resetFilters').on('click', function() {
				$.each(dataFilters, function(k, v) {
					sourceCode.utilsFunctions.resetLayerFilter(window[k]);					
				})				
				$.each($('.filterControl'), function(){
					var a = this.id;
					var b = this.name;
					$('select[id="' + a + '"][name="' + b + '"]')[0].sumo.selectAll();
				});
			});
		},
//////////////////////////////////////////////////////////////// TO DO		
		displaySwitcher : function(divID) {
			var htmlStr = "<br>";
			$.each(sourceCode.layerList, function(k){
				var obj = sourceCode.layerList[k];
				var values = {};
				if (obj.valuesForLegend) {
					$.each(obj.valuesForLegend, function(k, v){
						values[k] = v;
					})
				} else {
					values = ''; 
				}

				if (typeof(values) === 'object') {
					htmlStr += '<span id="Switch_' + obj.nameVar + '" class="layerSwitcher_element noselect switchedOn" ><i class="fa fa-check-square-o switcherIcon"></i>&nbsp' + obj.nameTitle + '</span><br>';						
					$.each(values, function(k, l){
						var style = obj.styleForLegend;
						var s = 'rect x="10" y="10" width="50" height="20"';
						var s2 = 'path d="M5 20 l115 0"';
						var s3 = 'circle cx="5" cy="5" r="' + style.radius + '"';
						var width = "75";
						var height = "30";
						var vDash = '';
						if (style.lineDash) {
							$.each(style.lineDash, function(i, v) {
								vDash += v + ',';
							})
							vDash = vDash.substr(0, vDash.length - 1);
						}
						var stroke_dasharray = style.lineDash ? 'stroke-dasharray="' + vDash + '";' : "";
						var fillColor = l;
	//							var fillColor = style.fill ? 'fill:' + style.fill + ';' : 'fill:rgba(0, 0, 0, 0);';
						
						var strokeWidth = style.width ? 'stroke-width:' + style.width*1.2 + ';' : "";
						var strokeColor = style.color ? 'stroke:' + style.color + ';' : "";
						
	// Old						htmlStr += '<svg width="10" height="10" style="margin-left:1em;"><'+ s3 + stroke_dasharray + ' "style="' + fillColor + strokeWidth + strokeColor +'" /></svg>&nbsp' + k + '<br>';							
	// Circle Symbol			htmlStr += '<svg width="10" height="10" style="margin-left:1em;"><'+ s3 + stroke_dasharray + ' fill="' + fillColor + '" stroke="' + style.strokeColor + '" stroke-width="' + style.strokeWidth + '" /></svg>&nbsp' + k + '<br>';							
						htmlStr += '<span class="legendObject"><svg height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><g transform="translate(0 -1028.4)"><path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" fill="' + l + '" transform="translate(0 1028.4)"/><path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" fill="#696969" transform="translate(0 1028.4)"/></g></svg>&nbsp' + k + '</span><br>';
					});
					htmlStr += '<br>';
				} else {
						var style = obj.styleOptions;
						var s = 'rect x="10" y="10" width="50" height="20"';
						var s2 = 'path d="M5 20 l115 0"';
						var vDash = '';
						if (style.lineDash) {
							$.each(style.lineDash, function(i, v) {
								vDash += v + ',';
							})
							vDash = vDash.substr(0, vDash.length - 1);
						}
						var stroke_dasharray = style.lineDash ? 'stroke-dasharray="' + vDash + '";' : "";
						var fillColor = style.fill ? 'fill:' + style.fill + ';' : 'fill:rgba(0, 0, 0, 0);';
						var strokeWidth = style.width ? 'stroke-width:' + style.width*1.2 + ';' : "";
						var strokeColor = style.color ? 'stroke:' + style.color + ';' : "";
						
						htmlStr += '<span id="Switch_' + obj.nameVar + '" class="layerSwitcher_element noselect switchedOn" ><i class="fa fa-check-square-o switcherIcon"></i>&nbsp' + obj.nameTitle + '</span><br><svg width="75" height="30"><'+ s + stroke_dasharray + ' style="' + fillColor + strokeWidth + strokeColor +'" /></svg><br><br>';							

	//							htmlStr += '<span id="Switch_' + obj.nameVar + '" class="layerSwitcher_element noselect switchedOn" ><i class="fa fa-check-square-o switcherIcon"></i>&nbsp' + obj.nameTitle + '</span><br>';						
				}
			});
			$("#" + divID).append(htmlStr);

			$(".layerSwitcher_element").on('click', function() {
				var a = (this.id).substring(7);
				var b = sourceCode.layerList[a];
				if ($(this).hasClass('switchedOn')) {
					window[b.nameVar].setStyle(new ol.style.Style({}));
				} else {
					window[b.nameVar].setStyle(b.defaultStyle);
				}
				$(this).toggleClass('switchedOn switchedOff');
				$(this).children().toggleClass('fa-check-square-o fa-square-o');
			});
			$(".layerSwitcher_element").on('mouseover', function() {
				$(this).children().toggleClass('faDisplay faMouseOver');	
			});
			$(".layerSwitcher_element").on('mouseout', function() {
				$(this).children().toggleClass('faDisplay faMouseOver');	
			});					
		},
		displayLegend : function(layerVar, divID){
			var layer = layerVar.get("name");
			var style = layerVar.getStyle();
			// console.log(sourceCode.layerList[layer])
			var a = sourceCode.layerList[layer].styleOptions;
			var d = sourceCode.layerList[layer].display;
			var g = sourceCode.layerList[layer].geometryType;
			var f = sourceCode.layerList[layer].source[0].clone();
			var styleObject = {};
			$.each(a, function(k, v){
				if(typeof(v) !== "function"){
					styleObject[k] = v;
				} else {
					styleObject[k] = v(f);
				}
			})
			var htmlStr = '';
			var sumHeight = 33;
			var figure = '';

			var findDash = function(obj){
				var dash = '';
				if (obj.lineDash) {
					$.each(obj.lineDash, function(i, v) {
						dash += v + ',';
					})
					dash = dash.substr(0, dash.length - 1);
				}
				return 'stroke-dasharray="' + dash + '" ';
			}
			
			if(d === "Icon"){
				figure = function(obj) {
					$.get("img/1488849303_map-marker2.svg", function(data) {
						var svg_data = data.childNodes;

						var el = $(svg_data).find('path')[0];
						el.attributes.fill = '#7fc97f';
						$(el).attr('fill', '#7fc97f')
//							$("#testButton12").html(svg_data);
							$("#testButton1").on('click', function(){
								var forEach = Array.prototype.forEach;

								var divs = $('path');
								var firstDiv = divs[ 0 ];
								// console.log(divs)
								// console.log(typeof(firstDiv))
								forEach.call(firstDiv.childNodes, function( divChild ){
									// console.log("lalala")
								  divChild.parentNode.style.color = '#0F0';
								});
							})
						var str =
							  svg_data;
						$('#testButton13').hide();
						$('#testButton13').append(str)
						str = $('#testButton13').children()[0].outerHTML;
						return str;							
					});
				}
			} else {
				if(g === "Point") {
					figure = function(obj){
						var stroke_dasharray = findDash(obj);
						var str =
							'<circle ' +
								'cx="50" ' +
								'cy="16.5" ' +
								// 'r="' + obj.radius + '" ' +
								'r="10" ' +
								stroke_dasharray +
								'stroke="' + obj.strokeColor + '" ' +
								'stroke-width="' + obj.strokeWidth + '" ' +
								'fill="' + obj.fillColor + '" />';
						return str;
					}
				} else if (g === "Polygon") {
					figure = function(obj){
						var stroke_dasharray = findDash(obj);
						var str =
							'<rect ' +
								'x="25" ' +
								'y="6.5" ' +
								'width="50" ' +
								'height="20" ' +
								stroke_dasharray +
								'stroke="' + obj.strokeColor + '" ' +
								'stroke-width="' + obj.strokeWidth + '" ' +
								'fill="' + obj.fillColor + '" />';
						return str;
					}
				} else if (g === "Line") {
					figure = function(obj){
						var stroke_dasharray = findDash(obj);
						var str =
							'<path ' +
								'd="M10 16.5 l80 0" ' +
								stroke_dasharray +
								'stroke="' + obj.strokeColor + '" ' +
								'stroke-width="' + obj.strokeWidth + '" ' +
								'fill="' + obj.fillColor + '" />';

/*						var str =
							'<line ' +
								'x1="0" ' +
								'y1="0" ' +
								'x2="200" ' +
								'y2="0" ' +
								
//								stroke_dasharray +
								'style="'+
								'stroke:' + obj.strokeColor + ';' +
//								'stroke-width:' + obj.strokeWidth + ';' +
								'stroke-width:2.4;' +
								'fill:' + obj.fillColor + '" />';								
*/						return str;
					}
				}
			}
			htmlStr += figure(styleObject);
			// var label = '<text x="' + (150) + '" y="' + (16.5 + 4) + '" style="fill:rgba(0,0,0,1);font-size:11px;">' + sourceCode.layerList[layer].alias + '</text>';
			var label = '<text x="' + (100) + '" y="' + (16.5 + 4) + '" style="fill:rgba(0,0,0,1);font-size:11px;">' + sourceCode.layerList[layer].alias + '</text>';
			htmlStr += label;
			// console.log(htmlStr)
			// console.log(arguments)
			htmlStr += '</svg>';
			var htmlTag = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="' + sumHeight + '">';			
			var toBeReturned = '<div id="legend_' + layer + '" class="row" style="height:' + sumHeight + 'px">' + htmlTag + htmlStr + '</div>';
			if ($("#legend_" + layer).length){
				$("#legend_" + layer).replaceWith(toBeReturned);				
			} else {
				$("#" + divID).append(toBeReturned);				
			}
						
			var a = function(p1, p2){sourceCode.domFunctions.displayLegend(p1, p2)};
			$("#legend_" + layer).data('updateFunction', a)
			$("#legend_" + layer).data('updateParam1', layerVar)
			$("#legend_" + layer).data('updateParam2', divID)
			// if(typeof(sourceCode.layerList[layer].styleOptions.radius) === "function") {
				// function Feature(){
					// this.get = function(a){console.log(arguments); return 500;};
				// }
				// var f = new Feature();
				// var test = sourceCode.layerList[layer].styleOptions.radius(f);
				// console.log(test)				
			// }
			// console.log($("#imageEnQuestion"))
		}
//////////////////////////////////////////////////////////////// TO BE DONE		
	},
	newList: function(obj) {
		var a = {
			
		};
	},
	newMap: function (divID, lonLat, zoom, name) {
		if(!lonLat){var lonLat = [0, 0];}
		if(!zoom){var zoom = 2;}
		if(!name){var name = "map";}
		window["dataFilters"] = {};				
		window["dataFeatureCount"] = {};				
		window['tileLayer'] = new ol.layer.Tile({
								// preload: Infinity,
								source: new ol.source.XYZ({
									// url: 'https://stamen-tiles-a.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
									url: 'http://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                                    crossOrigin: 'anonymous'
									// url: 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
								}),
								wrapX:false,
								crossOrigin: 'anonymous'								
							});
		window[name] = new ol.Map({
			target: divID,
///// To be commented to allow .pdf export
			layers: [
				tileLayer
			],
/////
			controls: ol.control.defaults({attribution: false}),
			view:
				new ol.View({
					center: ol.proj.fromLonLat(lonLat),
					zoom: zoom,					
				})
		  });
		window["GeoJsonFormat"] = new ol.format.GeoJSON();
		window["TopoJsonFormat"] = new ol.format.TopoJSON();
		window["EsriJsonFormat"] = new ol.format.EsriJSON();
/*		setInterval(function(){
			window[name].render();
			window[name].updateSize();
		}, 3000);
*/	},	
	newLayer: function(name, alias, styleOptions, format, type, label, data, map) {
		sourceCode.layerList[name] = {};
		sourceCode.layerList[name].label = label;
		sourceCode.layerList[name].alias = alias;
		sourceCode.layerList[name].display = type !== "icon" ? "Geometry" : "Icon";
		if(type !== "icon" && type !== "chart") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultGeomStyle;			
		} else if (type === "icon") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultIconStyle;
		} else if (type === "chart") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultChartStyle;
		}
		if(label === true) {
			var obj = new sourceCode.defaultValues.defaultLabelStyle;
			$.each(obj, function(k, v) {
				sourceCode.layerList[name].styleOptions[k] = v;
			})
		}
		if(typeof(styleOptions) === 'object'){
			$.each(styleOptions, function(k, v) {
				sourceCode.layerList[name].styleOptions[k] = v;
			})
		}
		
		this.setLayerGeomStyle = function(feature, resolution) {
			var a = sourceCode.layerList[name].styleOptions;
			var stroke = new ol.style.Stroke({
				color: 				typeof(a.strokeColor) === "function" ? a.strokeColor.apply(this, arguments) : a.strokeColor,
				lineCap: 			typeof(a.lineCap) === "function" ? a.lineCap.apply(this, arguments) : a.lineCap,
				lineJoin:			typeof(a.lineJoin) === "function" ? a.lineJoin.apply(this, arguments) : a.lineJoin,
				lineDash: 			typeof(a.lineDash) === "function" ? a.lineDash.apply(this, arguments) : a.lineDash,
				lineDashOffset: 	typeof(a.lineDashOffset) === "function" ? a.lineDashOffset.apply(this, arguments) : a.lineDashOffset,
				width: 				typeof(a.strokeWidth) === "function" ? a.strokeWidth.apply(this, arguments) : a.strokeWidth,
			});
			var fill = new ol.style.Fill({
				color: 				typeof(a.fillColor) === "function" ? a.fillColor.apply(this, arguments) : a.fillColor
			});
			var radius = 			typeof(a.radius) === "function" ? a.radius.apply(this, arguments) : a.radius;
			var style = new ol.style.Style({
				image: new ol.style.Circle({
					fill: 	fill,
					stroke: stroke,
					radius: radius,
				}),
				fill: 	fill,
				stroke: stroke,
			})
			if(sourceCode.layerList[name].label === true) {
				var field = sourceCode.layerList[name].styleOptions.fieldForText;
				var type = sourceCode.layerList[name].styleOptions.textDisplay;
				var maxResolution = sourceCode.layerList[name].styleOptions.textMaxReso;				
				function getText(feature, resolution) {
					var fromField = feature.get(field);
					var forText = isNaN(fromField) === true ? fromField : fromField.toString();
					var text = sourceCode.stringFunctions.toProperCase(forText);
					if (resolution > maxResolution) {
						text = '';
					} else if (type === 'hide') {
						text = '';
					} else if (type === 'wrap') {
						text = sourceCode.stringFunctions.stringDivider(text, 8, '\n');
					}
					return text;
				}
				var text = new ol.style.Text({
					font:				typeof(a.font) === "function" ? a.font.apply(this, arguments) : a.font,
					offsetX:			typeof(a.offsetX) === "function" ? a.offsetX.apply(this, arguments) : a.offsetX,
					offsetY:			typeof(a.offsetY) === "function" ? a.offsetY.apply(this, arguments) : a.offsetY,
					scale:				typeof(a.textScale) === "function" ? a.textScale.apply(this, arguments) : a.textScale,
					rotateWithView:		typeof(a.rotateWithView) === "function" ? a.rotateWithView.apply(this, arguments) : a.rotateWithView,
					rotation:			typeof(a.rotation) === "function" ? a.rotation.apply(this, arguments) : a.rotation,
					text:				getText(feature, resolution, name),
					textAlign:			typeof(a.textAlign) === "function" ? a.textAlign.apply(this, arguments) : a.textAlign,
					textBaseline:		typeof(a.textBaseline) === "function" ? a.textBaseline.apply(this, arguments) : a.textBaseline,
					fill:				typeof(a.fill) === "function" ? a.fill.apply(this, arguments) : new ol.style.Fill({color: a.fill}),
					stroke:				typeof(a.stroke) === "function" ? a.stroke.apply(this, arguments) : new ol.style.Stroke({color: a.stroke, width: 0}),		
				});
				style.setText(text);
			}
			return style
		},
		this.setLayerChartStyle = function(feature, resolution) {
			/** Every feature must have these two following properties : dataChart as an Array of values (one for each category of the chart) and sizeChart as a number (for size - refers to chartDefaultSize if not set) */
			var a = sourceCode.layerList[name].styleOptions;
			var stroke = new ol.style.Stroke({
				color: 				typeof(a.chartStrokeColor) === "function" ? a.chartStrokeColor.apply(this, arguments) : a.chartStrokeColor,
				lineCap: 			typeof(a.chartLineCap) === "function" ? a.chartLineCap.apply(this, arguments) : a.chartLineCap,
				lineJoin:			typeof(a.chartLineJoin) === "function" ? a.chartLineJoin.apply(this, arguments) : a.chartLineJoin,
				lineDash: 			typeof(a.chartLineDash) === "function" ? a.chartLineDash.apply(this, arguments) : a.chartLineDash,
				lineDashOffset: 	typeof(a.chartLineDashOffset) === "function" ? a.chartLineDashOffset.apply(this, arguments) : a.chartLineDashOffset,
				width: 				typeof(a.chartStrokeWidth) === "function" ? a.chartStrokeWidth.apply(this, arguments) : a.chartStrokeWidth,
			});

			var c = 'classic'; // Defined like this in order to be compatible with ol3-ext.js 
			if (a.chartType === "pie") {
				/** Finds charts with only one category in order to avoid useless stroke */
				var array = feature.get("dataChart");
				function filterTest(val){
					return val !== 0
				}
				var testedArray = array.filter(filterTest);
				var testForStroke = testedArray.length === 1 ? true : false;
				if (testForStroke === false) {
					var style = new ol.style.Style({
						image: new ol.style.Chart({
							type: a.chartType,
							radius: isNaN(a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize])) === false ? a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize]) : a.chartDefaultSize, 
							data: array, 
							colors: /,/.test(c) ? c.split(",") : c,
							rotateWithView: a.chartRotateWithView,
							stroke: stroke
						})
					});			
				} else {
					var arrayIndex = array.indexOf(testedArray[0]);
					var style = new ol.style.Style({
						image: new ol.style.Circle({
							radius: isNaN(a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize])) === false ? a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize]) : a.chartDefaultSize, 
							stroke: stroke,
							fill: new ol.style.Fill({
								color: ol.style.Chart.colors.classic[arrayIndex]
							})
						})
					});
				}				
			} else {
				var style = new ol.style.Style({
					image: new ol.style.Chart({
						type: a.chartType,
						radius: isNaN(a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize])) === false ? a.chartSizeFunction.apply(this, [feature, resolution, a.chartFactorSize]) : a.chartDefaultSize, 
						data: array, 
						colors: /,/.test(c) ? c.split(",") : c,
						rotateWithView: a.chartRotateWithView,
						stroke: stroke
					})
				});
			}
			
			if(sourceCode.layerList[name].label === true) {
				var field = sourceCode.layerList[name].styleOptions.fieldForText;
				var type = sourceCode.layerList[name].styleOptions.textDisplay;
				var maxResolution = sourceCode.layerList[name].styleOptions.textMaxReso;				
				function getText(feature, resolution) {
					var fromField = feature.get(field);
					var forText = isNaN(fromField) === true ? fromField : fromField.toString();
					var text = sourceCode.stringFunctions.toProperCase(forText);
					if (resolution > maxResolution) {
						text = '';
					} else if (type === 'hide') {
						text = '';
					} else if (type === 'wrap') {
						text = sourceCode.stringFunctions.stringDivider(text, 8, '\n');
					}
					return text;
				}
				var text = new ol.style.Text({
					font:				typeof(a.font) === "function" ? a.font.apply(this, arguments) : a.font,
					offsetX:			typeof(a.offsetX) === "function" ? a.offsetX.apply(this, arguments) : a.offsetX,
					offsetY:			typeof(a.offsetY) === "function" ? a.offsetY.apply(this, arguments) : a.offsetY,
					scale:				typeof(a.textScale) === "function" ? a.textScale.apply(this, arguments) : a.textScale,
					rotateWithView:		typeof(a.rotateWithView) === "function" ? a.rotateWithView.apply(this, arguments) : a.rotateWithView,
					rotation:			typeof(a.rotation) === "function" ? a.rotation.apply(this, arguments) : a.rotation,
					text:				getText(feature, resolution, name),
					textAlign:			typeof(a.textAlign) === "function" ? a.textAlign.apply(this, arguments) : a.textAlign,
					textBaseline:		typeof(a.textBaseline) === "function" ? a.textBaseline.apply(this, arguments) : a.textBaseline,
					fill:				typeof(a.fill) === "function" ? a.fill.apply(this, arguments) : new ol.style.Fill({color: a.fill}),
					stroke:				typeof(a.stroke) === "function" ? a.stroke.apply(this, arguments) : new ol.style.Stroke({color: a.stroke, width: 0}),		
				});
				style.setText(text);
			}
			return style
		},		
		this.setLayerIconStyle = function(feature, resolution) {
			var a = sourceCode.layerList[name].styleOptions;
			var image = new ol.style.Icon({
				anchor:				typeof(a.anchor) === "function" ? a.anchor.apply(this, arguments) : a.anchor,
				anchorOrigin:                   typeof(a.anchorOrigin) === "function" ? a.anchorOrigin.apply(this, arguments) : a.anchorOrigin,
				anchorXUnits:                   typeof(a.anchorXUnits) === "function" ? a.anchorXUnits.apply(this, arguments) : a.anchorXUnits,
				anchorYUnits:                   typeof(a.anchorYUnits) === "function" ? a.anchorYUnits.apply(this, arguments) : a.anchorYUnits,
				opacity:			typeof(a.opacity) === "function" ? a.opacity.apply(this, arguments) : a.opacity,
				scale:				typeof(a.scale) === "function" ? a.scale.apply(this, arguments) : a.scale,
				color:				typeof(a.color) === "function" ? a.color.apply(this, arguments) : a.color,
				src:				typeof(a.src) === "function" ? a.src.apply(this, arguments) : a.src,
			});
			var style = new ol.style.Style({
				image: image
			})
			if(sourceCode.layerList[name].label === true) {
				var field = sourceCode.layerList[name].styleOptions.fieldForText;
				var type = sourceCode.layerList[name].styleOptions.textDisplay;
				var maxResolution = sourceCode.layerList[name].styleOptions.textMaxReso;				
				function getText(feature, resolution) {
					var fromField = feature.get(field);
					var forText = isNaN(fromField) === true ? fromField : fromField.toString();
					var text = sourceCode.stringFunctions.toProperCase(forText);
					if (resolution > maxResolution) {
						text = '';
					} else if (type === 'hide') {
						text = '';
					} else if (type === 'wrap') {
						text = sourceCode.stringFunctions.stringDivider(text, 8, '\n');
					}
					return text;
				}
				var text = new ol.style.Text({
					font:				typeof(a.font) === "function" ? a.font.apply(this, arguments) : a.font,
					offsetX:			typeof(a.offsetX) === "function" ? a.offsetX.apply(this, arguments) : a.offsetX,
					offsetY:			typeof(a.offsetY) === "function" ? a.offsetY.apply(this, arguments) : a.offsetY,
					scale:				typeof(a.textScale) === "function" ? a.textScale.apply(this, arguments) : a.textScale,
					rotateWithView:                 typeof(a.rotateWithView) === "function" ? a.rotateWithView.apply(this, arguments) : a.rotateWithView,
					rotation:			typeof(a.rotation) === "function" ? a.rotation.apply(this, arguments) : a.rotation,
					text:				getText(feature, resolution, name),
					textAlign:			typeof(a.textAlign) === "function" ? a.textAlign.apply(this, arguments) : a.textAlign,
					textBaseline:                   typeof(a.textBaseline) === "function" ? a.textBaseline.apply(this, arguments) : a.textBaseline,
					fill:				typeof(a.fill) === "function" ? a.fill.apply(this, arguments) : new ol.style.Fill({color: a.fill}),
					stroke:				typeof(a.stroke) === "function" ? a.stroke.apply(this, arguments) : new ol.style.Stroke({color: a.stroke, width: a.textStrokeWidth}),		
				});
				style.setText(text);
			}			
			return style
		},
		this.set = function(name, alias, styleOptions, format, type, label, data, map) {
			if(!map) {
				var map = window['map'];
			}
			var layerStyle;
			switch (type) {
				case "icon" : layerStyle = this.setLayerIconStyle;
					break;
				case "chart" : layerStyle = this.setLayerChartStyle;
					break;
				default : layerStyle = this.setLayerGeomStyle;
					break;
			}
			window[name] = new ol.layer.Vector({
				name: name,
				source: new ol.source.Vector({}),
				style: layerStyle,
			});
			sourceCode.layerList[name].styleDefault = window[name].getStyle();		
			window[name].getSource().addFeatures(format.readFeatures(data));
			sourceCode.layerList[name].source = window[name].getSource().getFeatures();
			sourceCode.layerList[name].geometryType = sourceCode.utilsFunctions.getFeatureType(sourceCode.layerList[name].source[0].getGeometry().getType());
			map.addLayer(window[name]);
		}
		this.set.apply(this, arguments);
	},
	newClusteredLayer : function(name, alias, styleOptions, format, type, label, data, map){
		var _this = this;
		sourceCode.layerList[name] = {};
		sourceCode.layerList[name].label = label;
		sourceCode.layerList[name].alias = alias;
		sourceCode.layerList[name].display = type !== "icon" ? "Geometry" : "Icon";
		if(type !== "icon" && type !== "chart") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultGeomStyle;			
		} else if (type === "icon") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultIconStyle;
		} else if (type === "chart") {
			sourceCode.layerList[name].styleOptions = new sourceCode.defaultValues.defaultChartStyle;
		}
		if(label === true) {
			var obj = new sourceCode.defaultValues.defaultLabelStyle;
			$.each(obj, function(k, v) {
				sourceCode.layerList[name].styleOptions[k] = v;
			})
		}
		if(typeof(styleOptions) === 'object'){
			$.each(styleOptions, function(k, v) {
				sourceCode.layerList[name].styleOptions[k] = v;
			})
		}
		this.setLayerIconStyle = function(feature, resolution) {
			var a = sourceCode.layerList[name].styleOptions;
			var image = new ol.style.Icon({
				anchor:				typeof(a.anchor) === "function" ? a.anchor.apply(this, arguments) : a.anchor,
				anchorOrigin:		typeof(a.anchorOrigin) === "function" ? a.anchorOrigin.apply(this, arguments) : a.anchorOrigin,
				anchorXUnits:		typeof(a.anchorXUnits) === "function" ? a.anchorXUnits.apply(this, arguments) : a.anchorXUnits,
				anchorYUnits:		typeof(a.anchorYUnits) === "function" ? a.anchorYUnits.apply(this, arguments) : a.anchorYUnits,
				opacity:			typeof(a.opacity) === "function" ? a.opacity.apply(this, arguments) : a.opacity,
				scale:				typeof(a.scale) === "function" ? a.scale.apply(this, arguments) : a.scale,
				color:				typeof(a.color) === "function" ? a.color.apply(this, arguments) : a.color,
				src:				typeof(a.src) === "function" ? a.src.apply(this, arguments) : a.src,
			});
			var style = new ol.style.Style({
				image: image
			})
			if(sourceCode.layerList[name].label === true) {
				var field = sourceCode.layerList[name].styleOptions.fieldForText;
				var type = sourceCode.layerList[name].styleOptions.textDisplay;
				var maxResolution = sourceCode.layerList[name].styleOptions.textMaxReso;				
				function getText(feature, resolution) {
					var fromField = feature.get(field);
					var forText = isNaN(fromField) === true ? fromField : fromField.toString();
					var text = sourceCode.stringFunctions.toProperCase(forText);
					if (resolution > maxResolution) {
						text = '';
					} else if (type === 'hide') {
						text = '';
					} else if (type === 'wrap') {
						text = sourceCode.stringFunctions.stringDivider(text, 8, '\n');
					}
					return text;
				}
				var text = new ol.style.Text({
					font:				typeof(a.font) === "function" ? a.font.apply(this, arguments) : a.font,
					offsetX:			typeof(a.offsetX) === "function" ? a.offsetX.apply(this, arguments) : a.offsetX,
					offsetY:			typeof(a.offsetY) === "function" ? a.offsetY.apply(this, arguments) : a.offsetY,
					scale:				typeof(a.textScale) === "function" ? a.textScale.apply(this, arguments) : a.textScale,
					rotateWithView:		typeof(a.rotateWithView) === "function" ? a.rotateWithView.apply(this, arguments) : a.rotateWithView,
					rotation:			typeof(a.rotation) === "function" ? a.rotation.apply(this, arguments) : a.rotation,
					text:				getText(feature, resolution, name),
					textAlign:			typeof(a.textAlign) === "function" ? a.textAlign.apply(this, arguments) : a.textAlign,
					textBaseline:		typeof(a.textBaseline) === "function" ? a.textBaseline.apply(this, arguments) : a.textBaseline,
					fill:				typeof(a.fill) === "function" ? a.fill.apply(this, arguments) : new ol.style.Fill({color: a.fill}),
					stroke:				typeof(a.stroke) === "function" ? a.stroke.apply(this, arguments) : new ol.style.Stroke({color: a.stroke, width: a.textStrokeWidth}),		
				});
				style.setText(text);
			}
			return style
		}
		this.clusterStyle = function(feature, resolution){
			if(!window[name + "_styleCache"]){
				window[name + "_styleCache"] = {};
			}
			var size = feature.get('features').length;
			var features = feature.get('features');
			if (feature.get('features').length > 1) {
				var array = feature.get("features");
				var clusterData = [0, 0];
				$.each(array, function(i, v){
					var val = v.get('attached').GeoKM_Type;
					if (val === "intervention"){
						clusterData[0] += 1;
					} else if (val === "evaluation"){
						clusterData[1] += 1;
					}
				});
				var c = 'classic';
				var style = window[name + "_styleCache"][clusterData];
				if(!style){
					var radius = Math.sqrt((size*(110 - (10*(Math.log(size)*2))))/Math.PI) + 1;
					var test = clusterData.filter(function(a){return a !== 0});
					var onlyOneValue = test.length === 1 ? true : false;
					if(onlyOneValue === false){
						style = window[name + "_styleCache"][clusterData] = new ol.style.Style({
							image: new ol.style.Chart({
								type: 'pie',
								data: clusterData,
								colors: /,/.test(c) ? c.split(",") : c,
								radius: radius,
								stroke: new ol.style.Stroke({
									color: 'rgba(255,255,255,1)',
									width: 1,
								}),
							})
						});						
					} else {
						var index = clusterData.indexOf(test[0]);
						style = window[name + "_styleCache"][clusterData] = new ol.style.Style({
							image: new ol.style.Circle({
								radius: radius,
								fill: new ol.style.Fill({
									color: ol.style.Chart.colors.classic[index],
								}),
								stroke: new ol.style.Stroke({
									color: 'rgba(255,255,255,1)',
									width: 1,
								}),
							})
						});
					}

				}
				return [style];
			} else {
				var a = _this.setLayerIconStyle.apply(this, arguments)
				return [a];
			}				
		}	
		this.set = function(name, alias, styleOptions, format, type, label, data, map){
			if(!map) {
				var map = window['map'];
			}
			window["clusterSourceVector"] = new ol.source.Vector({});
			clusterSourceVector.addFeatures(format.readFeatures(data))
			var clusterSource = new ol.source.Cluster({
				distance: 25,
				source: clusterSourceVector
			});
			window[name] = new ol.layer.AnimatedCluster({
				name: name,
				source: clusterSource,
				// animationDuration: 700,
				animationDuration: 700,
				style: this.clusterStyle
			})
			sourceCode.layerList[name].styleDefault = window[name].getStyle();
			sourceCode.layerList[name].source = window[name].getSource().getFeatures();
			sourceCode.layerList[name].geometryType = "point";
			map.addLayer(window[name]);
			var img = new ol.style.Circle({
				radius: 3,
				stroke: new ol.style.Stroke({
					color: "#696969", 
					width: 0.5
				}),
				fill: new ol.style.Fill({
					color: "#FEFEFE",
				})
			});
			var style1 = new ol.style.Style({	
				image: img,
				stroke: new ol.style.Stroke({
					color:"#000000", 
					width:1,
					lineDash: [.3, 3],
				}) ,
			});
			window["selectCluster"] = new ol.interaction.SelectCluster({
				layers:[window[name]],
				pointRadius:15,
				animate: true,
				featureStyle: function(){return [style1]},
				style: function(f,res) {
					var cluster = f.get('features');
					if (cluster.length>1) {
						// var s = _this.clusterStyle.apply(this, arguments);
						var s = _this.clusterStyle(f,res);
						return s;
					} else {
						var a = _this.setLayerIconStyle(f,res);
						return a;
					}
				}
			});
			map.addInteraction(selectCluster);	
			selectCluster.getFeatures().on(['add'], function (e) {
				var c = e.element.get('features');
					if (c.length > 1) {
						for (var i in c){
							var style = _this.setLayerIconStyle(c[i]);
							c[i].setStyle(style);
						}
					} else if (c.length === 1 && e.element.j !== undefined) {
						var value = e.element.get('features')[0].get(field)
						var fillColor2 = CartONG_ol3Functions.config.setClusteredLayer.markerSymbology.applySymbology(data.features, value);
						e.element.setStyle(new ol.style.Style(config.setSelection(config, display, fillColor2)))
					}
			})
			selectCluster.getFeatures().on(['remove'], function (e) {
				// if (e.element.j !== undefined) {
					// var value = e.element.get('features')[0].get(field)
					// var fillColor = CartONG_ol3Functions.config.setClusteredLayer.markerSymbology.applySymbology(data.features, value);
					// e.element.setStyle(new ol.style.Style(config.setDisplay(config, display, fillColor)))				
				// }
			});			
		}
		this.set.apply(this, arguments);
	},
	listUniqueFieldValuesGeoJSON: function (data, fieldArray){
		/* Retrieve every unique value of a given feature data field from a GeoJSON and return an array*/
		var heading = "attributes";
		if (data[0].attributes === undefined){
			heading = "properties";
		}
		var obj = {};
		$.each(fieldArray, function(i){
			obj[fieldArray[i]] = [];
		});
		$.each(data, function(i){
			$.each(fieldArray, function(j){
				var value = data[i][heading][fieldArray[j]];
				if (obj[fieldArray[j]].indexOf(value) === -1) {
					obj[fieldArray[j]].push(value);
				}
			});
		});
		return obj;
	},
/////////////////////////////////////////////////////////////////////// à finir : être plus explicit sur les éléments à afficher dans la popup
	setInteractions: function(mapDivID, layerVar, field, mapVar){
		if(!mapVar){
			var _map = map;
		} else {
			var _map = mapVar;
		}
		if(!$("#popup").length){
			var htmlPopup =
				'<div id="popup" class="ol-popup">' +
					'<span style="float:right;padding-top:5px;"><i class="fa fa-window-close noselect popupClose"></i></span>' +
					'<div id="popup-content"></div>' +
				'</div>';
			$("#" + mapDivID).append(htmlPopup);
		}
		var element_popup = $('#popup')[0];
		var content_popup = $('#popup-content')[0];
		var popup = new ol.Overlay({
			element: element_popup,
			autoPan: true,
			autoPanAnimation: {
			  duration: 250
			}
		});
		_map.addOverlay(popup);
		$('.ol-popup').css("visibility", "visible"); 
		$('.popupClose').on('click', function(){
		  popup.setPosition(undefined);
/*		  var a = selectCluster.getFeatures().getArray();
		  selectCluster.getFeatures().remove(a[0]);
*/		});
		var cursorHoverStyle = "pointer";
		var target = map.getTarget();
		var jTarget = typeof target === "string" ? $("#"+target) : $(target);
		_map.on("pointermove", function(evt) {
			var mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];
			var hit = map.forEachFeatureAtPixel(mouseCoordInMapPixels, function (feature, layer) {
				if (layer === layerVar/* || feature.j !== undefined*/) {
					return true;					
				}
			});					
			if (hit) {
				jTarget.css("cursor", cursorHoverStyle);
			} else {
				jTarget.css("cursor", "");
			}
		});
		window["featureTemp"];
/*		_map.on("pointermove", function(evt) {
			var feature = map.forEachFeatureAtPixel(evt.pixel,
				function(feature, layer){
					if(layer === layerVar){
						return feature
					}
				}
			);
			var featureStyle = sourceCode.layerList[layerVar.get("name")].defaultStyle;
			if(feature){
				if(window["featureTemp"] === undefined){
					featureTemp = feature;
				} else if (featureTemp !== feature){
					featureTemp.setStyle(featureStyle);
					featureTemp = feature;
				}
			} else {
				if(window["featureTemp"]){
					featureTemp.setStyle(featureStyle);					
				}
			}
		});
*/		_map.on('click', function(evt) {
			popup.setPosition(undefined);
			var feature = map.forEachFeatureAtPixel(evt.pixel,
				function(feature, layer){
					if(layer === layerVar){
						return feature;							
					}
				}
			);			
			if(feature && feature.getProperties().features) {
				if (feature.getProperties().features.length > 1 ){
					window["markerSelected"] = feature;
					var features = feature.getProperties();
					var loc_selected = features.features[0].get(field);
					var size_selected = features.features.length;					
					var coordinates = evt.coordinate;
					content_popup.innerHTML = '<div><b>'+loc_selected+'</b><br>'+size_selected+' cases</div>';
					setTimeout(function(){popup.setPosition(coordinates)}, 250);
				}
				else if (feature.getProperties().features.length == 1) {
					window["markerSelected"] = feature;
					var features = feature.getProperties()
					var loc_selected = features.features[0].get(field);
					var size_selected = 1;					
					var coordinates = evt.coordinate;
					content_popup.innerHTML = '<div><b>'+loc_selected+'</b><br>'+size_selected+' case</div>';
					setTimeout(function(){popup.setPosition(coordinates)}, 250);
				}				
			} else if(feature){
				window["markerSelected"] = feature;
				var loc_selected = feature.get(field);
				var size_selected = 1;					
				var coordinates = evt.coordinate;
				content_popup.innerHTML = '<div><b>'+loc_selected+'</b><br>'+size_selected+' case</div>';
				setTimeout(function(){popup.setPosition(coordinates)}, 250);
			} else {
				setTimeout(function(){popup.setPosition(undefined)}, 250);
			}
		}); 
	},
/////////////////////////////////////////////////////////////////
	setStyleControl : function(divID, layerVar){
		var layer = layerVar.get('name');
		var object = sourceCode.layerList[layer].styleOptions;
		// console.log(object)
		var circleStrokeColor = object.strokeColor;
		var circleStrokeWidth = object.strokeWidth;
		var circleFillColor = object.fillColor;	
		var htmlStr;
		htmlStr = 
		'<br>' +
		'<div id="styleControl_' + layer + '" class="row">';
//		'<div id="styleControl_' + layer + '" class="row">' +
//			'<div class="col-sm-3">' +
//				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + 50 + '" height="' + 50 + '">' +
//					'<circle id="objectCircle_' + layer + '" cx="' + 25 + '" cy="' + 25 + '" r="' + 15 + '" stroke="' + circleStrokeColor + '" stroke-width="' + circleStrokeWidth + '" fill="' + circleFillColor + '" />';
		htmlStr +=
//				'</svg>' +
//			'</div>' +
			'<div class="col-sm-9">' +
				'<div class="row reveal">' +
					'<div class="col-sm-2">' +
						'<input id="Pick_fillColor_' + layer + '" type="hidden" class="form-control demo minicolors-input analysisInput" data-layer="' + layer + '" data-obj="fillColor" value="' + circleFillColor + '" style="height:40px;border: 1px solid #D9D9D9"></input>' +
					'</div>' +
					'<div class="col-sm-10 revealText noselect">' +
						'<span style="font-weight:700;float:left;">Fill color</span>&nbsp&nbsp' +
					'</div>' +
				'</div>' +
				'<br>' +
				'<div class="row reveal">' +
					'<div class="col-sm-2">' +
						'<input id="Pick_strokeColor_' + layer + '" type="hidden" class="form-control demo minicolors-input analysisInput" data-layer="' + layer + '" data-obj="strokeColor" value="' + circleStrokeColor + '" style="max-height:10px;border: 1px solid #D9D9D9"></input>' +
					'</div>' +
					'<div class="col-sm-10 revealText noselect">' +
						'<span style="font-weight:700;float:left;">Stroke color</span>&nbsp&nbsp' +
					'</div>' +
				'</div>' +
				'<br>' +
				'<div id="forPick_strokeWidth_' + layer + '" class="row reveal">' +
					'<div class="col-sm-2">' +
						'<span id="Pick_strokeWidth_' + layer + '" class="analysisInput noselect" data-layer="' + layer + '" data-obj="strokeWidth" style="width:28px;height:20px;cursor:default;">' + circleStrokeWidth + '</span>' +
					'</div>' +
					'<div class="col-sm-10 revealText noselect">'+
						'<span style="font-weight:700+float:left+">Stroke width</span>&nbsp&nbsp'+
					'</div>'+
					'<br>'+
					'<br>'+
					'<div id="forSelectWidth_' + layer + '" class="row">'+
						'<div class="col-sm-9">'+	
							'<div id="selectWidth_' + layer + '" data-layer="' + layer + '" data-obj="strokeWidth"></div>'+
						'</div>'+
					'</div>'+	
				'</div>'+
				'<br>'+	
			'</div>'+
		'</div>';
		$("#" + divID).append(htmlStr);
		$.minicolors = {
			defaults: {
				animationSpeed: 50,
				animationEasing: 'swing',
				change: null,
				changeDelay: 0,
				control: 'hue',
				dataUris: true,
				defaultValue: '',
				format: 'rgb',
				hide: null,
				hideSpeed: 100,
				inline: false,
				keywords: '',
				letterCase: 'lowercase',
				opacity: true,
				position: 'top left',
				show: null,
				showSpeed: 100,
				theme: 'default',
				swatches: []
			}
		};
		$('#Pick_fillColor_' + layer + '').minicolors();
		$('#Pick_strokeColor_' + layer + '').minicolors();

		function changeObjects() {
			// $('#objectCircle_' + layer + '').css({
					// 'fill' : sourceCode.layerList[layer].styleOptions.fillColor,
					// 'stroke' : sourceCode.layerList[layer].styleOptions.strokeColor,
					// 'stroke-width' : sourceCode.layerList[layer].styleOptions.strokeWidth,
				// });
			if($("#legend_" + layer).length){
				var a = $("#legend_" + layer).data('updateParam1');
				var b = $("#legend_" + layer).data('updateParam2');
				$("#legend_" + layer).data('updateFunction')(a, b);
			}
			map.renderSync();
		}
		$('.analysisInput[data-layer="' + layer + '"]').on('change', function(e) {	
			var a = this.dataset.obj;
			var c = this.dataset.layer;
			if(a !== 'strokeWidth' && a !== 'forClusterSize'){
				var b = $(this).val();
			} else {
				var b = parseFloat($(this).html());
			}
			sourceCode.layerList[c].styleOptions[a] = b;
			window[c].setStyle(sourceCode.layerList[c].styleDefault)
			changeObjects();
//			setLegend();
		})

		var sliderWidth = $('#selectWidth_' + layer + '')[0];

		noUiSlider.create(sliderWidth, {
			start: object.strokeWidth,
			tooltips: false,
			range: {
				'min': 0.1,
				'max': 4
			},
			behaviour: 'drag',
			step: 0.1,
		});

		sliderWidth.noUiSlider.on('update', function(value){
			$('#Pick_strokeWidth_' + layer + '').html(value);
		});

		sliderWidth.noUiSlider.on('end', function(value){
			var layerName = this.target.dataset.layer;
			var controlType = this.target.dataset.obj;
			$('.analysisInput[data-layer="' + layerName + '"][data-obj="' + controlType + '"]').trigger('change');
		});
	},
	dateFunctions : {
		getJsDateFromExcel : function(excelDate) {
			var date = new Date((excelDate - (25567 + 2))*86400*1000);
			return date.getWeek() + ' - ' + date.getFullYear();
		},
		getJsWeekFromExcel : function(excelDate) {
			var date = new Date((excelDate - (25567 + 2))*86400*1000);
			return date.getWeek();
		},
		getJsYearFromExcel : function(excelDate) {
			var date = new Date((excelDate - (25567 + 2))*86400*1000);
			return date.getFullYear();
		},
		getDateOfISOWeek : function(w, y) {
			var simple = new Date(y, 0, 1 + (w - 1) * 7);
			var dow = simple.getDay();
			var ISOweekStart = simple;
			if (dow <= 4)
				ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
			else
				ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
			return ISOweekStart;
		},
		dateFromMillisecondsToDays : function(d){
			var days = ((((d/1000)/60)/60)/24);
			return days;
		}
	}
}
