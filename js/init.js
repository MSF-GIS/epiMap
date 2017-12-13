configFile.paramObject.setup();
configFile.analysisFunctions.listAnalysis(configFile.analysisFunctions.types.rates);
var sourceObj = configFile.analysisFunctions.matchAbbAnalysis;

if (window.location.hash) {
    var hash = window.location.hash.substring(1);
    var testObj = {};
    $.each(hash.split("&"), function(i, v) {
        var a = v.split("=");
        testObj[a[0]] = a[1];
    });

    function checkRgb (rgb) {
        var rxValidRgb = /([R][G][B][A]?[(]\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(\s*,\s*((0\.[0-9]{1})|(1\.0)|(1)))?[)])/i
        if (rxValidRgb.test(rgb)) {
            return true;
        } else {
            return false;
        }
    }
    var pass;
    var tR;    
    var p = configFile.paramObject;
    if (testObj.a) {
        if (sourceObj[testObj.a]) {
            var a = sourceObj[testObj.a]["name"];
            p.param[a] = {};
            configFile.paramObject.gen.a = testObj.a;
            $.each(testObj, function(k, v) {
                if (k.length === 1) {
                    switch(k){
                        case "b" : tR = v; pass = true;
                            break;
                        case "c" : tR = [parseFloat(v.split(",")[0]), parseFloat(v.split(",")[1])]; pass = true;
                            break;
                        case "f" : tR = v; pass = true;
                            break;
                        case "z" : tR = v; pass = true;
                            break;
                        case "t" : tR = parseFloat(v); pass = true;
                            break;
                        default : pass = false;
                    }
                    if (pass === true) {                        
                        p.gen[k] = tR;
                    }
                } else if (k.length === 2) {
                    switch(k){
                        case "cS" : tR = [parseInt(v.split(",")[0]), parseInt(v.split(",")[1])]; if(tR[0] >= 0 && tR[1] <= 5000) {pass = true;};
                            break;
                        case "cF" : tR = v; pass = true;
                            break;
                        case "cO" : tR = v; pass = true;
                            break;
                        case "cW" : tR = parseFloat(v); pass = true;
                            break;
                        default : pass = false;
                    }
                    if (pass === true) {
                        p.param[a][k] = tR;
                    }
                }
            });
        }
    }
}
configFile.analysisFunctions.listColors();

$("#selectorAnalysis").attr("data-param", "");
$.each(configFile.analysisFunctions.types.rates, function(k, v) {
    $("#selectorAnalysis").append('<option value=' + v.config.abbreviation + '>' + v.config.name + '</option>');
});
if (configFile.paramObject.gen.a === "default") {
    $("#selectorAnalysis").val(Object.keys(sourceObj)[0]);
    configFile.paramObject.gen.a = $("#selectorAnalysis").val();
    configFile.paramObject.method(sourceObj[$("#selectorAnalysis").val()]["name"]);
} else {
    $("#selectorAnalysis").val(configFile.paramObject.gen.a);
}

window["analysisType"] = sourceObj[$("#selectorAnalysis").val()]["name"];


$("#inAppTitle").html(configFile.layout.appTitle).show();
$("#analysisSectionTitle").html('<strong>' + configFile.layout.analysisSectionTitle + '</strong>').show();
$("#dimensionTitle").html('<strong>' + configFile.layout.dimensionTitle + '</strong>').show();
$("#selectionTitle").html('<strong>' + configFile.layout.selectionTitle + '</strong>').show();
$("#analysisDescription").html(configFile.layout.analysisDescription).show();
$("#dimensionDescription").html(configFile.layout.dimensionDescription).show();
$("#selectionDescription").html(configFile.layout.selectionDescription).show();
if (configFile.layout.mapSettings) {
    $("#toggleSettings").html('<div id="tSLabel" class="col-md-2 pull-right toggleSettingsSpanClose"><span><i class="glyphicon glyphicon-cog" style="top:1.5px"></i> Map settings  <i id="caretToggle" class="glyphicon glyphicon-triangle-bottom" style="top:1px;font-size:8px"></i></span></div>');
    $("#toggleSettings").show();

    var htmlStr = '<br><div class="row">';
            htmlStr += '<div class="col-md-6">';
                htmlStr += '<div class="row noselect"><strong>Select basemap</strong></div><br>';
                htmlStr += '<div id="basemaps" class="row"></div>';
            htmlStr += '</div>';
            htmlStr += '<div class="col-md-6 noselect">';
                htmlStr +=  '<div class="row"><strong>Adjust opacity</strong></div><br>';
                htmlStr +=  '<div id="transparencySlider" class="row"></div><br>';         
                htmlStr +=  '<div id="transparencyVal" style="float:right;font-size:9pt;color:rgba(120,120,120,1);font-weight:700;" class="row"></div>';         
                htmlStr +=  '<br>';
                htmlStr +=  '<div class="row"><strong>Adjust size</strong></div><br>';
                htmlStr +=  '<div id="sizeSlider" class="row"></div><br>';
                htmlStr +=  '<div class="row">';
                htmlStr +=      '<div class="col-md-4 noselect" style="padding-left:0px;">';	
                htmlStr +=          '<span style="font-weight:700;float:left;">Fill color</span>&nbsp&nbsp';
                htmlStr +=      '</div>';                
                htmlStr +=      '<div class="col-md-2">';	
                htmlStr +=          '<input id="Pick_fillColor" type="hidden" data-obj="cF" class="form-control minicolors-input" value="' + configFile.paramObject.param[analysisType].cF + '" style="height:40px;"></input>';
                htmlStr +=      '</div>';	
                htmlStr +=  '</div>';
                htmlStr +=  '<br>';
                htmlStr +=  '<div class="row">';
                htmlStr +=      '<div class="col-md-4 noselect" style="padding-left:0px;">';
                htmlStr +=          '<span style="font-weight:700;float:left;">Stroke color</span>&nbsp&nbsp';
                htmlStr += 	'</div>';                
                htmlStr += 	'<div class="col-md-2">';	
                htmlStr +=          '<input id="Pick_strokeColor" type="hidden" data-obj="cO" class="form-control minicolors-input" value="' + configFile.paramObject.param[analysisType].cO + '" style="max-height:10px;"></input>';
                htmlStr += 	'</div>';
                htmlStr +=  '</div>';
                htmlStr +=  '<br>';
                htmlStr +=  '<div id="forPick_strokeWidth" class="row">';
                htmlStr +=      '<div class="col-md-4 noselect"style="padding-left:0px;">';
                htmlStr +=          '<span style="font-weight:700;float:left;">Stroke width</span>&nbsp&nbsp';
                htmlStr += 	'</div>';                
                htmlStr += 	'<div class="col-md-2">';	
                htmlStr +=          '<span id="Pick_strokeWidth" class="noselect" style="font-size:9pt;color:rgba(120,120,120,1);font-weight:700;width:28px;height:20px;cursor:default;">' + configFile.paramObject.param[analysisType].cW + '</span>';
                htmlStr += 	'</div>';
                htmlStr += 	'<div id="forSelectWidth" class="col-md-6">';
                htmlStr +=          '<div class="col-md-12">';	
                htmlStr +=              '<div id="selectWidth"></div>';
                htmlStr +=          '</div>';
                htmlStr += 	'</div>';	
                htmlStr +=  '</div>';                
            htmlStr += '</div>';        
        htmlStr += '</div><br>';
    $("#settingsContainer").html(htmlStr);
    
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
	$("#Pick_fillColor").minicolors();
	$("#Pick_strokeColor").minicolors();    
    
    $("#toggleSettings").on('click', function(){
       $("#settingsContainer").toggle(500);
       $("#caretToggle").toggleClass('glyphicon-triangle-bottom glyphicon-triangle-top');
       $("#tSLabel").toggleClass('toggleSettingsSpanClose toggleSettingsSpanOpen');
    });    
}




