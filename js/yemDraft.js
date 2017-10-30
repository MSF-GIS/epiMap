sourceCode.newMap("map", [43.22, 16.12], 8);
function resetMap()	{
	map.getView().setZoom(8);
	map.getView().setCenter(ol.proj.fromLonLat([43.22, 16.12]));
}

$('.layerControl').on('click', function(){
	$("#" + this.parentNode.parentNode.parentNode.id + "_" + this.parentNode.parentNode.dataset.obj).slideToggle({duration:100,easing:"swing"})
	$(this).toggleClass('off');
});
$('.layerSwitcher').on('click', function(){
	var a = sourceCode.layerList[this.parentNode.parentNode.dataset.obj];
	if ($(this).hasClass('off') === false) {
		window[this.parentNode.parentNode.dataset.obj].setStyle(new ol.style.Style({}));
		$(this).toggleClass('off');
		$(this).toggleClass('fa-check-square-o fa-square-o');
	} else {
		window[this.parentNode.parentNode.dataset.obj].setStyle(a.styleDefault);
		$(this).toggleClass('off');
		$(this).toggleClass('fa-check-square-o fa-square-o');		
	}
});
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right'});
map.addControl(sidebar);
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
			CartoDB_Positron: true,
	}, 125);
CartONG_OL3_search('searchTool', 10);
console.log("coucou")
$.getJSON('/bundles/cartongmsf/yemcholera/data/yem_adm2_CENTROIDS.geojson', function(data) {
	console.log(data);
	var styleObject = {
		fieldForText 		: 	"sizeChart",
		textMaxReso	 		: 	15000,
		font				:	'Arial',
		offsetX				:	0,
		offsetY				:	0,
		textScale			:	1,
		rotateWithView		:	false,
		rotation			:	0,
		textAlign			:	'center',
		textBaseline		:	'middle',
		fill				:	'rgba(255,255,255,1)',
		stroke				:	'rgba(0,0,0,0)',
		textStrokeWidth		:	1,
		textDisplay			:	'wrap',
	};
	
	var styleObjectPolygons = {
		fieldForText	:	"admin2Name",
		textMaxReso	 	: 	1500,		
		fillColor 		:	"rgba(0,0,0,0)",
		strokeColor 	:	"rgba(231,0,0,0.3)",
	};
	$.getJSON('/bundles/cartongmsf/yemcholera/data/yem_adm2.geojson', function(data2) {
		function filterAdmin(a){
			console.log(a);
			if (a.properties.admin2Pcod.substring(0,4) === "YE17" || a.properties.admin2Pcod === "YE1801" || a.properties.admin2Pcod === "YE1802"){
				return a;
			}
		}
		var array = data2.features.filter(filterAdmin);
		data2.features = array;
		console.log(array);
		var layerPolygon = new sourceCode.newLayer("yem_adm2", "Districts", styleObjectPolygons, GeoJsonFormat, false, false, data2);
			var dsv = d3.dsv(";");
			dsv("/bundles/cartongmsf/yemcholera/data/Hajjah - Cholera_Export.csv", function(response) {
				var processedData = data;
				// sourceCode.utilsFunctions.filterLayer(cod_hltbnd_lvl2_a_msf_CENTROIDS, [{evalNb : [0]}], "Remove");
				sourceCode.domFunctions.setFilters(yem_adm2, processedData.features, ["admin2Name"], "layer1_filter")
				sourceCode.domFunctions.displayLegend(yem_adm2, "layer1_legend")
				sourceCode.setStyleControl("layer1_styleControl", yem_adm2);

				// var cf_activites = crossfilter(clusterSourceVector.getFeatures());
				window["cf_activites"] = crossfilter(response);
				function reduceAdd(key) {
					return function(p, v){
						if(v[key] === null && p === null){ return null; }
						p += v[key];
						return p;
					}
				}
				function reduceRemove(key) {
					return function(p, v){
						if(v[key] === null && p === null){ return null; }
						p -= v[key];
						return p;
					}
				}
				function reduceInit(key) {
					return null;
				}
	
				var Week_dim = cf_activites.dimension(function(d) {return d.Week;});
				var Week_dim2 = cf_activites.dimension(function(d) {return d.Week;});
				var Total_casesDim = cf_activites.dimension(function(d) {return d.Total_cases;});
				var Cumulative_casesDim = cf_activites.dimension(function(d) {return d.Cumulative_cases;});
				var lonDim = cf_activites.dimension(function(d) {return d.Adm2_code;});
				
				var dateMax = parseInt(Week_dim.top(1)[0].Week);
				var dateMin = parseInt(Week_dim.bottom(1)[0].Week)

				var Week_dim_group = Week_dim.group();
				var Total_casesDim_group = Total_casesDim.group();
				var Cumulative_casesDim = Cumulative_casesDim.group().reduceCount();
				var lonDim_group = lonDim.group();
				var all = cf_activites.groupAll();
				
//////////////// CHARTS SETUP
var dataCount = dc.dataCount('#data-count');
	dataCount
        .dimension(cf_activites)
        .group(all)
        // (_optional_) `.html` sets different html when some records or all records are selected.
        // `.html` replaces everything in the anchor with the html given using the following function.
        // `%filter-count` and `%total-count` are replaced with the values obtained.
        .html({
            some: '<span class="filter-count badge">%filter-count</span><span style="font-size:12px"> activités sélectionnées sur un total de <span class="total-count"><strong>%total-count</strong></span></span>' +
				  ' | <a href=\'javascript:dc.filterAll(); dc.renderAll(); resetMap();\'><i class="fa fa-refresh"></i></a>',
            all:  '<span class="filter-count badge">%filter-count</span><span style="font-size:12px"> activités sélectionnées sur un total de <span class="total-count"><strong>%total-count</strong></span></span>' +
				  ' | <a><i class="fa fa-refresh" style="color:#BDBDBD"></i></a>',
        });
	  
var pieChart = dc.pieChart('#pieChartAnchor');						
    pieChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(140)
    // (optional) define chart height, `default = 200`
        .height(140)
    // Define pie radius
        .radius(62.2)
    // Set dimension
        .dimension(Week_dim)
		.transitionDuration(75)
    // Set group
        .group(Total_casesDim_group)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
        .label(function (d) {
            return sourceCode.stringFunctions.toProperCase(d.key);
        })
		// .ordinalColors(["rgba(221, 141, 26, 1)", "rgba(0, 51, 102, 1)"])
		.colors(d3.scale.ordinal().domain(["intervention", "evaluation"]).range(["rgba(221, 141, 26, 1)", "rgba(0, 51, 102, 1)"]))
		.colorAccessor(function(d){return d.key;})
		.renderLabel(true)

		
		// .colors(['#3182bd', '#6baed6'])
		/*
        // (_optional_) whether chart should render labels, `default = true`
        
        // (_optional_) if inner radius is used then a donut chart will be generated instead of pie chart
        // .innerRadius(40)
        // (_optional_) define chart transition duration, `default = 350`
        // .transitionDuration(500)
        // (_optional_) define color array for slices
        // .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        // (_optional_) define color domain to match your data domain if you want to bind data or color
        // .colorDomain([-1750, 1644])
        // (_optional_) define color value accessor
        // .colorAccessor(function(d, i){return d.value;})
		*/
		.on("filtered", function(){
			clusterSourceVector.clear();
			clusterSourceVector.addFeatures(testCf_dim.top(Infinity));
		})
		;				
				
var timeChart = dc.barChart('#timeChartAnchor');
    timeChart.width(500) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(100)
        .margins({top: 10, right: 50, bottom: 20, left: 40})
        .dimension(Week_dim)
        .group(Week_dim_group)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([1, 52]))
		// .y(d3.scale.linear().domain([0, 40]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
		.elasticY(false)
        .xUnits(d3.time.weeks)
		.yAxis().ticks(5);
		
	timeChart.on("filtered", function(){
			clusterSourceVector.clear();
			clusterSourceVector.addFeatures(Week_dim.top(Infinity));
		});
		

    dc.renderAll();	

	function setSelectorZS(divID, field, data){
		var htmlStr = '<select id="sumo_' + divID + '" class="" style="margin-top:10px;">';
		if (!window["ZsDict"]) {
			window["ZsDict"] = {};
			$.each(data, function(i, v){
				if(!window["ZsDict"][v.properties.pcode]){
					window["ZsDict"][v.properties.pcode] = sourceCode.stringFunctions.toProperCase(v.properties.name)					
				}
			});	
		}
		htmlStr += '<option value="all">Sélectionner zone...</option>';
		$.each(ZsDim_group.top(Infinity), function(i, v){
			htmlStr += '<option value="' + v.key + '">' + window["ZsDict"][v.key] + '</option>';
		});
		htmlStr += '</select>';
		$("#" + divID).html(htmlStr);
		$("#sumo_" + divID).SumoSelect({
			csvDispCount: 3,
			search : true,
			searchText : 'Rechercher...',
			floatWidth: 500
		});	
		$("#sumo_" + divID)[0].sumo.unSelectAll();
	}
	
function resetChartFunction(obj){
	$.each(dc.chartRegistry.list(), function(i, v){
		if (v.anchorName() === obj){
			v.filterAll();
			dc.redrawAll();
			return false;
		}
	});
}
$('.resetChart').on("click", function(){
	resetChartFunction(this.dataset.obj)
});

	map.on("moveend", function(){
		var a = map.getView().calculateExtent();
		lonDim.filterAll();
		latDim.filterAll();
		lonDim.filter([a[0], a[2]]);
		latDim.filter([a[1], a[3]]);
		clusterSourceVector.clear();
		clusterSourceVector.addFeatures(testCf_dim.top(Infinity));
		dc.redrawAll();
	})
		});
	});
})