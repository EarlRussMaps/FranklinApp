var layers = {}; //Global layers object
var map;

var coords = [34.51575098250388, -87.7177619934082];
var cid = 11610;
function createCartoParcel(onCreated)
{
    var layerUrl = 'https://cartomike.carto.com/api/v2/viz/92b6a26e-a3c9-11e6-a4a5-0ecd1babdde5/viz.json';
 //   layerUrl = oldLayerUrl;
    cartodb.createLayer(map, layerUrl, {infowindow: false}).addTo(map).on('done', function (layer) {
                     layer.setZIndex(10);
                     layers.cartoParcel = layer;

                     layers.cartoParcel.getSubLayer(1).setInteraction(true);
                     layers.cartoParcel.getSubLayer(1).on('featureClick', function(e, latlng, pos, data, layer) {
                           console.log(data);
                        infowindowFromId(data.cartodb_id);
                     });

                     layer.on('mouseover', function() {
                         $('#map').css('cursor','pointer');
                     });
                     layer.on('mouseout', function() {
                         $('#map').css('cursor','');
                     });

                   /* cartodb.vis.Vis.addInfowindow(map, layer.getSubLayer(1), ['cartodb_id','ownername'],{
                        infowindowTemplate: $('#custom_infowindow_template').html(),
                        templateType: 'mustache'
                          layers.cartoParcel.on('featureClick', function(e, latlng, pos, data, layer) {
      console.log(data);
    });

  });*/

              onCreated();
                }).on('error', function () {
                        console.log("Error creating Carto Parcel layer");
                  });

}

function infowindowFromId(id)
{
    var sql = new cartodb.SQL({ user: 'cartomike' });
     var endpoint = "https://cartomike.carto.com/api/v2/sql/";
    // ownerQ = ownerQ.split("{NAME}").join(name);
     var myQuery = "SELECT *,ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid FROM parcels_carto WHERE cartodb_id = " + id;
console.log(id);


     $.getJSON(
     endpoint,
     { q: myQuery },
     function (data) {  
         //console.log(data.rows[0]);  
         openPopup(data.rows[0]);
     });
}

function createMapboxOSM()
{
    layers.mapboxOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/spatialnetworks.map-6l9yntw9/{z}/{x}/{y}.png", {
                maxZoom: 19,
                subdomains: ["a", "b", "c", "d"],
                attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
            });

}

function createMapboxSAT()
{
    layers.mapboxSAT =  L.tileLayer("http://{s}.tiles.mapbox.com/v3/spatialnetworks.map-xkumo5oi/{z}/{x}/{y}.jpg", {
                maxZoom: 20,
                subdomains: ["a", "b", "c", "d"],
                attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
            });

}

function createAnnotations()
{
    layers.annotation = L.esri.dynamicMapLayer({
					url: 'http://8.35.16.158/arcgisserver/rest/services/parcelanno_dyn/MapServer',
					opacity: 1.0
				});
}

function createFloodZones()
{
    var url = "https://cartomike.carto.com/api/v2/viz/5e192bc2-9f8b-11e6-bc84-0ee66e2c9693/viz.json";
      cartodb.createLayer(map,url).on('done', function (layer) {
                     layer.setZIndex(10);
                     layers.cartoFloodZones = layer;
});
}

function createZoning()
{
    var url = "https://cartomike.carto.com/api/v2/viz/06248722-a850-11e6-a7dc-0ee66e2c9693/viz.json";
      cartodb.createLayer(map,url).on('done', function (layer) {
                     layer.setZIndex(9);
                     layers.cartoZoning = layer;
});
}

function createReference()
{
    var url = "https://cartomike.carto.com/api/v2/viz/38839bae-a855-11e6-97fa-0e233c30368f/viz.json";
      cartodb.createLayer(map,url).on('done', function (layer) {
                     layer.setZIndex(8);
                     layers.cartoReference = layer;
});
}


function createLayers(onFinished)
{
    createCartoParcel(function(){
        layers.cartoParcel.addTo(map);
        createMapboxOSM();
        createMapboxSAT();
        createEsriTopo();
        createAnnotations();
        createFloodZones();
		createZoning();
		createReference();
        onFinished();
    });
}

function createEsriTopo()
{
    layers.esriTopo = L.esri.tiledMapLayer({
					url: 'http://tiles.arcgis.com/tiles/I97nVdg0OgwKVCpk/arcgis/rest/services/Basemap/MapServer',
					opacity: 1.0
				});
}

/*function createEsriTopo(onCreated)
{
    layers.esriTopo = L.esri.basemapLayer("Topographic");
}
*/
function addMeasureTool()
{
	var measureControl = new L.control.measure({
		position: 'topright',
		primaryLengthUnit: 'feet',
		secondaryLengthUnit: 'miles',
		primaryAreaUnit: 'acres',
		secondaryAreaUnit: 'sqfeet',
		activeColor: '#ABE67E',
		completedColor: '#C8F2BE'
		});

		measureControl.addTo(map);
}


function createMap()
{
    map = L.map("map", {
        zoom: 11,
        center: [34.4410, -87.8343],
       // layers: [layers.mapboxOSM]
    });
    console.log(map);
    var hash = new L.Hash(map);
}

$(function(){
    createMap();
    createLayers(function(){
       addMeasureTool();
       map.addLayer(layers.mapboxOSM);
    });

})


function getLayerFromId(id)
{
    alert(id);
}


/*

L.esri.dynamicMapLayer({
					url: 'http://8.35.16.158/arcgisserver/rest/services/parcelanno_dyn/MapServer',
					opacity: 0.7
				}).addTo(map);
*/






//Layer toggle

    $("input[name='basemapLayersRadio']").change(function () {


       // Remove unchecked layers
        $("input:radio[name='basemapLayersRadio']:not(:checked)").each(function () {
            var theLayer = layers[$(this).attr('id')];
            if (theLayer && map.hasLayer(theLayer))
            {
                map.removeLayer(theLayer);
            }

        });
                    // Add checked layer
        $("input:radio[name='basemapLayersRadio']:checked").each(function () {
            var theLayer = layers[$(this).attr('id')];
            if (theLayer)
            {
                map.addLayer(theLayer);
            }
        });

    });



    $("input[name='overlayLayers']").change(function () {
                    // Remove unchecked layers
        $("input:checkbox[name='overlayLayers']:not(:checked)").each(function () {
                       var theLayer = layers[$(this).attr('id')];
                        if (theLayer && map.hasLayer(theLayer))
                         {
                            map.removeLayer(theLayer);
                        }
        });


                    // Add checked layer

                    $("input:checkbox[name='overlayLayers']:checked").each(function () {
                        var theLayer = layers[$(this).attr('id')];
                        if (theLayer){
                         map.addLayer(theLayer);
                        }
                    });

                });
