var configFile = {
    // Set the initial view (coordinates of the center and zoom level)
    mapViewInit : {
        center : {
            x : 43.22,
            y : 16.12
        },
        zoomLevel : 8,
        zoomLevelMax : 28,
        zoomLevelMin : 0
    },
    data : {
        analysisLayer : {
            geometry : {
                // display (BOOLEAN) - Choose to display the layer or not.
                display: true,                
                name    : "Districts",                
                source  : "data/yem_adm2.json",
                // format (STRING) - Set the format of the dataset. Can be either "TopoJSON", "GeoJSON" or "EsriJSON".
                format  : "TopoJSON",
                // Joined field ('p' code).
                geoCode : "admin2Pcod",
                // Matching names for labels.
                geoName : "admin2Name"
            },
            geometryPoints : {
                // display (BOOLEAN) - Choose to display the layer or not.
                display: true,                
                name    : "Districts",                
                source  : "data/yem_centroids_adm2.json",
                // format (STRING) - Set the format of the dataset. Can be either "TopoJSON", "GeoJSON" or "EsriJSON".
                format  : "TopoJSON",
                // Joined field ('p' code).
                geoCode : "admin2Pcod",
                // Matching names for labels.
                geoName : "admin2Name"
            },            
            epiDataset : {
                // Set the source of the EPI Dataset to be linked with above geometry. Must be a "Delimiter-separated values" file (.csv, .txt, ...).
                source : "data/export_yemcholera.csv",
                delimiter : ",",
                // Remote source, to set as 'false' to avoid CORS issues for local use.
                remote : true,
                // Set the request header for password-protected remote sources - Leave blank for local source.
                XMLHttpRequestHeader : {
                    header : "Authorization",
                    value  : "253719af-9259-40f5-a003-6f0de8711c8f"
                },
                fieldsForAnalysis : {                    
                    // Temporal dimension, for the filter slider.
                    dimTime : "Week",
                    // Bound the temporal dimension : set a number for defined value, write a string for automatic value.
                    timeMin : 13,
                    timeMax : "",
                    defaultTime : "",
                    // Geographical dimension, usually 'p' codes. Joins to geometry.
                    dimGeo : "Adm2_code",
                    // Measure (cases : t1, t2, t3, ...).
                    measure : "Total_cases",
                    // Cumulative measure (cases : t1, t1 + t2, t1 + t2 + t3, ...).
                    cumulative : "Cumulative_cases",
                    // Rate
                    rate : "WIR_x10000",
                    // Cumulative rate
                    cumulRate : "AR_x10000"
                }
            }
        },
        otherLayers : [
            {
                name    : "Governorates",
                source  : "data/yem_adm1.json",
                // format (STRING) - Set the format of the dataset.
                format  : "TopoJSON",              
                style   : {
                    fillColor   : "rgba(0,0,0,0)",
                    strokeColor : "rgba(0,0,0,1)",
                    strokeWidth : 1
                },
                display : true
            }      
        ]
    },
    // Customise the content of the layout.
    layout : {
        // Set the title of the webmap.
        appTitle : "YEMEN - 2017 Cholera outbreak",
        // Section title for analysis selector.
        analysisSectionTitle : "Map analysis",
        // Description below analysis title (Use HTML tags for formatting).
        analysisDescription : "<i>Choose the analysis you want to be shown on the map using the drop down-list below. The <b>weekly incidence rate</b> represents the ratio of new cases among the district's population for a given week. The <b>attack rate</b> represents the proportion of the week's cumulated cases in the district's population.</i>",
        // Title for the dimension used to filter the data with the slider.
        dimensionTitle : "Filter by week",
        // Description above the filter slider (Use HTML tags for formatting).
        dimensionDescription : "<i>Choose the week's data you want to be displayed on the map by moving this slider. It starts at week 13 as no case has been reported before that week.</i>",
        // Label that goes along with the filtering value.
        dimensionIndicator : "Week",
        // Title for the feature selection.
        selectionTitle : "Information",
        // Description above the selection's drop-down list (Use HTML tags for formatting).
        selectionDescription : "<i>Select an administrative area using the drop-down list below or by clicking on the map.</i>",
        // Define default text for selector (displayed when no features are selected).
        selectionDefault : "Select an administrative area...",
        // Hide or show map settings (use boolean : true or false).
        appDisclaimer : "This page displays incomplete data for educationnal purposes only",
        displayAppDisclaimer : true,
        mapSettings : true
    },
    analysisFunctions : {
        // Style of the polygons in the analysis layer.
        style : {
            // Define the outline of the polygons (doesn't depend on the analysis).
            outline : {
                strokeColor : "rgba(0,0,0,0.4)",
                strokeWidth : 1
            },
            // Define the default transparency for the analysis layer. Also set the defaut color for the zero value.
            colors : {
                transparency : "0.8",
                class0 : "rgba(0,0,0,0)",
                glob : {}
            },
            circles : {
                analysis_1 : {
                    minArea : 1,
                    maxArea : 600                    
                },
                analysis_2 : {
                    minArea : 5,
                    maxArea : 5000
                }
            }
        },
        types : {
            rates : {
                /* For each rate analysis
                 * "config" object properties :
	                 * name : Name of the indicator to be displayed in the Map analysis selector.
	                 * abbreviation : Abbreviated indicator - displayed in the legend and in the pop-ups.
	                 * fieldRate : Field that contains the rate indicator in the epi dataset.
	                 * fieldAbsolute : Field that contains the absolute indicator in the epi dataset.
	                 * otherName : Other way to mention the indicator - displayed in the legend
	                 * printName : Name of the indicator as it appears in the exported .pdf file.
	                 * 
                 * "classes" object :
	                 * Define the ranges for the analysis by replacing the following values.
	                 *      - *_less : Includes the values stricly inferior to the number, e.g : values < 5.
	                 *      - *_between : Includes the values superior or equal to the first number and strictly inferior to the second number, e.g : 5 =< values < 10.
	                 *      - *_more : Includes the values superior or equal to the number, e.g : values >= 150.
	                 *      
	                 * Colors are set in RGB as they will be automatically converted to RGBA once running the scripts.
	                 * 
                 */            	
                analysis_1 : {
                    config : {
                        name            :   "Weekly incidence rate (x 10000)",
                        abbreviation    :   "WIR",
                        fieldRate       :   "WIR_x10000",
                        fieldAbsolute   :   "Total_cases",
                        otherName       :   "Weekly Incidence Rate",
                        printName       :   "Weekly Incidence Rate (x 10000)"
                    },
                    classes : {
                        class1_less     :   {value : 5,             color : "rgb(254,229,217)"},
                        class2_between  :   {value : [5, 10],       color : "rgb(252,187,161)"},
                        class3_between  :   {value : [10, 50],      color : "rgb(252,146,114)"},
                        class4_between  :   {value : [50, 100],     color : "rgb(251,106,74)"},
                        class5_between  :   {value : [100, 150],    color : "rgb(222,45,38)"},
                        class6_more     :   {value : 150,           color : "rgb(165,15,21)"}                   
                    }
                },
                analysis_2 : {
                    config : {
                        name            :   "Attack rate (x 10000)",
                        abbreviation    :   "AR",
                        fieldRate       :   "AR_x10000",
                        fieldAbsolute   :   "Cumulative_cases",
                        otherName       :   "Attack Rate",
                        printName       :   "Attack Rate (x 10000)"
                    },
                    classes : {
                        class1_less     :   {value : 7,             color : "rgb(254,229,217)"},
                        class2_between  :   {value : [7, 10],       color : "rgb(252,187,161)"},
                        class3_between  :   {value : [10, 50],      color : "rgb(252,146,114)"},
                        class4_between  :   {value : [50, 100],     color : "rgb(251,106,74)"},
                        class5_between  :   {value : [100, 300],    color : "rgb(222,45,38)"},
                        class6_more     :   {value : 300,           color : "rgb(165,15,21)"}
                    }
                }
            },
            cases : {
                titleForLegend : "Cases (by districts)",
                fill : {
                    color : "rgba(200,0,0,0.3)"
                },
                stroke : {
                    color : "rgba(0,0,0,1)",
                    width : 1
                },
                sliderSizeStart : [1, 600]
            }
        },       
        legendParam : {            
            forGeometryTitle : "name",			// Choose which property of the geometry object will be used to display the geometry title.
            forAnalysisTitle : "otherName",		// Choose which property of the analysis object will be used to display the analysis title.
            verticalGap : 6,            		// Set space between two features (between classes).            
            horizontalGap : 15, 				// Set space between a graphic element and its label.         
            rectangleHeight : 10,				// Define the height of the graphic rectangles.
            rectangleWidth  : 25,				// Define the width of the graphic rectangles.
            labelSize   : 11,            		// Define label font size.
            labelColor  : "rgba(0,0,0,1)",		// Define label font color.
            labelShift  : 8,	            	// Arrange label vertical gap with the rectangles.            
            otherSectionTitle   : "Context"		// Title for the other layers' section.
        },
        chartsLayout : {
            cumulative : {
                title   : "Attack Rate (x 10000)",
                legend  : "Attack Rate (x 10000)",
                axis    : "Rates",
                tooltip : "Attack rate"
            },
            measure : {
                title   : "Weekly Incidence Rate (x 10000)",                
                legend  : "Weekly Incidence Rate (x 10000)",
                axis    : "Rates",
                tooltip : "Weekly incidence rate"                
            },
            combined : {
                title   : "Cases",
                bars : {
                    legend  : "Bars : New weekly cases",
                    axis    : "New weekly cases",
                    tooltip : "new cases"                    
                },
                line : {
                    legend  : "Line : Cumulated cases",
                    axis    : "Cumulated cases",
                    tooltip : "cumulated cases"                    
                }                
            }
        },
        chartTooltipFunction : function(toolTip, obj) {
            var value = obj.value.avg ? obj.value.avg : obj.value;
            if (isNaN(value)) value = 0;
            var str = configFile.layout.dimensionIndicator + " " + obj.key + " - " + toolTip + " : " + obj.value;
            return str;   
        },
        cacheObj : {
            polygons : {},
            points : {}
        },
        // runAnalysis(a, v) : Used to define the feature style. Run inside OL setStyle() function.
         runAnalysis  : function(val, layerType, analysis) {
            var range;
            var style;
            var color;            
            var cacheObj;
            var a = this.style.colors;
            if (layerType === "polygons") {
                var cacheObj = this.cacheObj.polygons;
                if (!cacheObj[analysis]){
                   cacheObj[analysis] = {};
                }
                if (!cacheObj[analysis][val]){
                   
                       $.each(this.types.rates[analysis].classes, function(k, v){
                           if (val !== 0) {
                                var b = k.substring(6, k.length);
                                var c = k.substring(0, 6);
                                if (b === "_less") {
                                    if (val < v.value) {
                                        range = c;
                                        return false;
                                    }
                                } else if (b === "_between") {
                                    if (val >= v.value[0] && val < v.value[1]) {
                                        range = c;
                                        return false;                            
                                    }
                                } else if (b === "_more") {
                                    if (val >= v.value) {
                                        range = c;
                                        return false;                           
                                    }
                                }
                           } else {
                               range = "class0";
                           }
                       });

                   color = a.glob[analysis][a.transparency.replace(".","")][range];

                   cacheObj[analysis][val] = new ol.style.Style({
                        fill : new ol.style.Fill({
                            color: a.glob[analysis][a.transparency.replace(".","")][range]
                        }),
                        stroke : new ol.style.Stroke({
                            color: configFile.analysisFunctions.style.outline.strokeColor
                        }),
                        zIndex : 0
                    });                    
                }
                style = cacheObj[analysis][val];      
            } else {
                var cacheObj = this.cacheObj.points;
                if (!cacheObj[analysis]){
                    cacheObj[analysis] = {};
                }
                if (!cacheObj[analysis][val]){
                    var minArea = configFile.paramObject.param[analysis].cS[0];
                    var maxArea = configFile.paramObject.param[analysis].cS[1];
                    var minVal = configFile.initStats[this.types.rates[analysis].config.fieldAbsolute][0];
                    var maxVal = configFile.initStats[this.types.rates[analysis].config.fieldAbsolute][1];
                    var area = (maxArea - 1)*((val - minVal)/(maxVal - minVal)) + minArea;
                    var obj = configFile.paramObject.param[analysis];
                    radius = Math.sqrt(area/Math.PI);
                    cacheObj[analysis][val] = new ol.style.Style({
                        image : new ol.style.Circle({
                            radius : radius,
                            stroke : new ol.style.Stroke({
                                color : val !== 0 ? obj.cO : "rgba(0,0,0,0)",
                                width : parseFloat(obj.cW)
                            }),
                            fill : new ol.style.Fill({
                                color : val !== 0 ? obj.cF : "rgba(0,0,0,0)"
                            })                            
                        }),
                        zIndex : 200 - val
                    });                    
                }
                style = cacheObj[analysis][val];            
            }
            return style;
        },
        // listColors(r) : add transparency to all ranges color and list them as properties of this.style.colors.
        listColors : function(ranges, analysis){
            var col = this.style.colors;
            var t = configFile.paramObject.gen.t;
            var tr = t.toString().replace(".", "");
            var obj = col.glob;            
            $.each(this.types.rates, function(k, v){
                var analysis = k;
                if (!obj[analysis]){
                    obj[analysis] = {};
                }
                if(!obj[analysis][tr]){
                    obj[analysis][tr] = {};
                    obj[analysis][tr]["class0"] = col.class0; 
                    $.each(v.classes, function(k, v){
                        var a = k.substring(0, 6);
                        var b = v.color;
                        var c = "," + t + ")";
                        obj[analysis][tr][a] = b.replace("rgb", "rgba").replace(")", c);
                    });                        
                }                  
            });                    
        },
        matchAbbAnalysis :{},
        listAnalysis : function(analysis){
            var a = this.matchAbbAnalysis;
            $.each(analysis, function(k, v) {
                a[v.config.abbreviation] = {};
                a[v.config.abbreviation]["name"] = k;
                a[v.config.abbreviation]["fieldRate"]= v.config.fieldRate;
                a[v.config.abbreviation]["fieldAbsolute"]= v.config.fieldAbsolute;
            });
        },
        drawLegendRates : function(analysis) {
            var lP = this.legendParam;
            var tr = this.style.colors.transparency.replace(".", "");
            var tr = configFile.paramObject.gen.t.toString().replace(".", "");
            var col = this.style.colors.glob[analysis][tr];
            var geometryTitle = configFile.data.analysisLayer.geometry[lP.forGeometryTitle];
            var analysisTitle = this.types.rates[analysis].config[lP.forAnalysisTitle];
            var ab = this.types.rates[analysis].config.abbreviation;
            var vG = lP.verticalGap;
            var hG = lP.horizontalGap;
            var rH = lP.rectangleHeight;
            var rW = lP.rectangleWidth;
            var lS = lP.labelSize;
            var lC = lP.labelColor;
            var lT = lP.labelShift;
            var sC = this.style.outline.strokeColor;
            var sW = this.style.outline.strokeWidth;
            var htmlStr = '<rect fill="' + col.class0 + '" x="1" y="10" width="' + rW + '" height="' + rH + '" stroke="' + sC + '" stroke-width="' + sW + '"/>';
                htmlStr += '<text x="' + (rW + hG) + '" y="' + (10 + lT) + '" style="fill:' + lC + ';font-size:' + lS + 'px;">No data</text>';
            var sumV = (rH + vG);
            $.each(this.types.rates[analysis].classes, function(k, v){
                var op = k.substring(6, k.length);
                var cl = k.substring(0, 6);
                var val = "";
                switch(op) {
                    case "_less"    : val = ab + " < " + v.value;
                        break;
                    case "_between" : val = v.value[0] + " =< " + ab + " < " + v.value[1];
                        break;
                    case "_more"    : val = ab + " >= " + v.value;
                        break;
                }
                htmlStr += '<rect fill="' + col[cl] + '" x="1" y="' + (rH + sumV) + '" width="' + rW + '" height="' + rH + '" stroke="' + sC + '" stroke-width="' + sW + '"/>';
                htmlStr += '<text x="' + (rW + hG) + '" y="' + (rH + sumV + lT) + '" style="fill:' + lC + ';font-size:' + lS + 'px;">' + val + '</text>';
                sumV += (rH + vG);
            });
            var htmlHeader = '<br><span>' + geometryTitle + ' - ' + analysisTitle + '<span>';
                htmlHeader += '<div  id="legendRates">';
                htmlHeader += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="216px" height="' + (sumV + 10) + 'px">';
            
            var htmlFooter = '</svg>';
                htmlFooter += '</div>';

            var result = htmlHeader + htmlStr + htmlFooter;
            return result;
        },
        drawLegendCases : function(analysis){
            var result;
            var htmlStr;
            var minVal = configFile.initStats[this.types.rates[analysis].config.fieldAbsolute][0];
            var maxVal = configFile.initStats[this.types.rates[analysis].config.fieldAbsolute][1];
            var minArea = configFile.paramObject.param[analysis].cS[0];
            var maxArea = configFile.paramObject.param[analysis].cS[1];
            var diff = maxVal - minVal;
            var denominator = 4;
            var fraction = diff/denominator;
            var lP = this.legendParam;
            var lS = lP.labelSize;
            var lC = lP.labelColor;
            var lT = lP.labelShift;
            var arrayOfVal = [];
            arrayOfVal.push(Math.ceil(Math.round(minVal) / 10) * 10);
            for (i = 1;i < (denominator - 2);i++) {
                var a =  minVal + (i * fraction);
                var b = Math.round(a);
                arrayOfVal.push(Math.ceil(Math.round(a) / 10) * 10);
            }
            arrayOfVal.push(Math.ceil(Math.round(maxVal) / 10) * 10);
            var area;
            var radius;
            var mRadius = 0;
            arrayOfVal.reverse();
            var obj = configFile.paramObject.param[analysis];
            $.each(arrayOfVal, function(i, v) {
                var fillColor;
                area = (maxArea - 1)*((v - minVal)/(maxVal - minVal)) + minArea;
                radius = Math.sqrt(area/Math.PI);
                if (i === 0) {
                    mRadius = radius;
                    fillColor = obj.cF;
                } else {
                    fillColor = "rgba(0,0,0,0)";
                }
                htmlStr += '<circle cx="' + (mRadius + 1 + obj.cW) + '" cy="' + (15 + (mRadius*2) - radius) + '" r="' + radius + '" stroke="' + obj.cO + '" stroke-width="' + parseFloat(obj.cW) + '" fill="' + fillColor + '" />';
                htmlStr += '<line x1="' + (mRadius + 2 + obj.cW) + '" y1="' + (15 + (mRadius*2) - (radius*2)) + '" x2="' + ((mRadius*2) + 20 + + obj.cW) + '" y2="' + (15 + (mRadius*2) - (radius*2)) + '" style="stroke:rgba(100,100,100,1);stroke-width:0.5" />';
                htmlStr += '<text x="' + ((mRadius*2) + 25 + obj.cW) + '" y="' + (15 + (mRadius*2) - (radius*2) + (lT-(lT/2))) + '" style="fill:' + lC + ';font-size:' + (lS - 1) + 'px;">' + v + '</text>';
            });
            var htmlHeader = '<br><span>' + this.types.cases.titleForLegend + '<span>';
                htmlHeader += '<div id="legendCases">';
                htmlHeader += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="216px" height="' + ((mRadius * 3) + 10) + 'px">';
            
            var htmlFooter = '</svg>';
                htmlFooter += '</div>';

            var result = htmlHeader + htmlStr + htmlFooter;
            return result;            
        },
        drawLegendOthers : function() {
            var lP = this.legendParam;
            var sectionTitle = lP.otherSectionTitle;
            var vG = lP.verticalGap;
            var hG = lP.horizontalGap;
            var rH = lP.rectangleHeight;
            var rW = lP.rectangleWidth;
            var lS = lP.labelSize;
            var lC = lP.labelColor;
            var lT = lP.labelShift;
            var htmlStr = "";
            var sumV = 0;            
            $.each(configFile.data.otherLayers, function(i, v){
                if (v.display) {
                    htmlStr += '<rect fill="' + v.style.fillColor + '" x="1" y="' + (rH + sumV) + '" width="' + rW + '" height="' + rH + '" stroke="' + v.style.strokeColor + '" stroke-width="' + v.style.strokeWidth + '"/>';
                    htmlStr += '<text x="' + (rW + hG) + '" y="' + (rH + sumV + lT) + '" style="fill:' + lC + ';font-size:' + lS + 'px;">' + v.name + '</text>';               
                    sumV += (rH + vG);
                }
            });
            if (sumV > 0){
                var htmlHeader = '<span>' + sectionTitle + '<span>';
                    htmlHeader += '<div  id="legendOthers">';
                    htmlHeader += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="216px" height="' + (sumV + 10) + 'px">';
                var htmlFooter = '</svg>';
                    htmlFooter += '</div>';       
                var result = htmlHeader + htmlStr + htmlFooter;
                return result;
            }
        }
        
    },
    paramObject : {
        param : {},
        gen : {
            a : "default",
            c : "default",
            f : "default",
            z : "default",
            b : "default"
        },
        paramString : {
            all : "default",
            legend : "default"
        },
        method : function(a){
            var p = this.param;
            var g = this.gen;
            var strLgd = "";
            var an = "a=" + g.a + "&";
            $.each(p[a], function(k, v) {
                strLgd += k + "=" + v + "&";
            });
            strLgd += "t=" + g.t + "&" + "b=" + g.b;
            this.paramString.legend = an + strLgd;
            var strMap = "c=" + g.c + "&" + "z=" + g.z + "&" + "f=" + g.f + "&";
            this.paramString.all = an + strMap + strLgd;
            window.location.hash = this.paramString.all;
        },
        setup : function (){
            var c = configFile.analysisFunctions;
            var p = this.param;
            var g = this. gen;
            var m = configFile.mapViewInit;
            var a = c.types;
            g.c = [m.center.x, m.center.y];
            g.z = m.zoomLevel;
            g.f = configFile.data.analysisLayer.epiDataset.fieldsForAnalysis.defaultTime;
            g.t = c.style.colors.transparency;
            $.each(a.rates, function(k, v){
                p[k] = {};
                p[k].cS = [c.style.circles[k].minArea, c.style.circles[k].maxArea];
                p[k].cF = a.cases.fill.color;
                p[k].cO = a.cases.stroke.color;
                p[k].cW = a.cases.stroke.width;
            });
        }

    },
    format : []
};



