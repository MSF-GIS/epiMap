// *** CartONG_OL3_basemaps ***
// Basemap switcher for OpenLayers 3
//
// History : v1 by Leo (13/04/2017)
//              - Added HTML attribute "data-displayed" by Andréas (19/10/2017). Value "1" for current basemap, "0" for the others.
//
// Requires OL3, Jquery and Bootstrap
// To call just after calling the map

/* 
	1. div = id of the div where the basemap switcher will be created
	
	2. b = array of basemaps 
	       list of posibilities :
	{
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
	}
	
	3. w = width in pixel of the thumbnails
	
*/
	
function CartONG_OL3_basemaps(div, b, w){
	
	var CartONG_OL3_basemaps_Dict = [
		{'name':'OpenStreetMap_Mapnik','url':'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'},
		{'name':'OpenStreetMap_BlackAndWhite','url':'http://a.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'},
		{'name':'OpenStreetMap_France','url':'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'},
		{'name':'OpenStreetMap_HOT','url':'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'},
		{'name':'OpenMapSurfer_Roads','url':'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}'},
		{'name':'Stamen_TonerLite','url':'http://stamen-tiles-a.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png'},
		{'name':'Esri_WorldStreetMap','url':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'},
		{'name':'Esri_WorldGrayCanvas','url':'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'},
		{'name':'World_Dark_Gray_Base','url':'https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'},
		{'name':'World_Ocean_Base','url':'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'},
		{'name':'Esri_WorldTopoMap','url':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'},
		{'name':'Esri_WorldImagery','url':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'},
		{'name':'CartoDB_Positron','url':'http://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'},
	];	
	
	var CartONG_OL3_basemaps_Layer = new ol.layer.Group({
        layers: [
            new ol.layer.Tile({
				source: new ol.source.XYZ({
					url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					wrapX:false,
					crossOrigin: 'anonymous'
                })
            }),
			new ol.layer.Tile({
                source: new ol.source.XYZ({
					url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
					wrapX:false,
					crossOrigin: 'anonymous'
                })
            }),
			new ol.layer.Tile({
                source: new ol.source.XYZ({
					url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
					wrapX:false,
					crossOrigin: 'anonymous'
                })
            })  
		]
	});
	
	map.addLayer(CartONG_OL3_basemaps_Layer);
	
	$('#'+div+'').append("<div id='CartONG_OL3_basemaps_Select'></div>");
	
	CartONG_OL3_basemaps_Switch(Object.keys(b)[0]);
	
	for (var key in b){
		if(b[key]==true){
			var imgSrc = "dist/CartONG_OL3_basemaps/img/"+key+'.png';                      
			$('#CartONG_OL3_basemaps_Select').append("<img data-toggle='tooltip' data-placement='top' data-displayed='0' title='"+key+"' width='"+w+"px' class='img-thumbnail CartONG_OL3_basemaps_Thumbnail' name='"+key+"' src='"+imgSrc+"'>");
		}
	};
	
	$('[data-toggle="tooltip"]').tooltip();
	
	$("[name='"+Object.keys(b)[0]+"']").css('box-shadow', 'inset 0 0 4em #D12121');      
        
        $("[name='"+Object.keys(b)[0]+"']")[0].dataset.displayed = '1';
	
	$('.CartONG_OL3_basemaps_Thumbnail').css('cursor','pointer');
	
	$('.CartONG_OL3_basemaps_Thumbnail').on('click',function(e){
		$('.CartONG_OL3_basemaps_Thumbnail').css('box-shadow', 'inset 0 0px 0px blue');
		CartONG_OL3_basemaps_Switch($(this)[0].name);                
                $.each($('.CartONG_OL3_basemaps_Thumbnail'), function(i, v) {
                   v.dataset.displayed = '0';
                });
		$(this).css('box-shadow', 'inset 0 0 4em #D12121');
                this.dataset.displayed = '1';
	});
	
	function CartONG_OL3_basemaps_Switch(v){
		for (var i in CartONG_OL3_basemaps_Dict){
			if (v == CartONG_OL3_basemaps_Dict[i].name){
				var s = new ol.source.XYZ({
						url: CartONG_OL3_basemaps_Dict[i].url,
						wrapX: false,
						crossOrigin: 'anonymous'
					})
				CartONG_OL3_basemaps_Layer.getLayers().getArray()[0].setSource(s)
				if(v=="Esri_WorldImagery"){ 											//adding boundaries and roads if satellite
					CartONG_OL3_basemaps_Layer.getLayers().getArray()[1].setSource(
						new ol.source.XYZ({
							url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
							wrapX:false,
							crossOrigin: 'anonymous'
						})
					)
					CartONG_OL3_basemaps_Layer.getLayers().getArray()[2].setSource(
						new ol.source.XYZ({
							url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
							wrapX:false,
							crossOrigin: 'anonymous'
						})
					)
				}
				else{
					CartONG_OL3_basemaps_Layer.getLayers().getArray()[1].setSource(
					)
					CartONG_OL3_basemaps_Layer.getLayers().getArray()[2].setSource(
					)
				}
			}
		}
	};
}

