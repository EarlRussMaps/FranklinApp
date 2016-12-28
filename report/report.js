function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function toTitleCase(str)
{	
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function isString(str)
{
	return str.match(/[a-z]/i);
}



function throwError()
{
	//Error handler for missing parcel
}

function populateData(data)
{
	console.log(data);
	Object.keys(data).forEach(function(key,index)
	{
		var val = data[key];
		if (typeof val == "string")
		{
			if (isString(val))
			{
				val = toTitleCase(val);
			}
			
			$("[data-key='" + key +"']").text(val);
		}
		
		if (typeof val == "number")
		{
			$("[data-key='" + key +"']").text(val);
		}
	});

}

var mMap;
function createMap(latLong,polygon)
{
	var coords = JSON.parse(polygon).coordinates;
	mMap = L.map('mapid');
	 mapboxSAT = L.tileLayer("http://{s}.tiles.mapbox.com/v3/spatialnetworks.map-xkumo5oi/{z}/{x}/{y}.jpg", {
                maxZoom: 20,
                subdomains: ["a", "b", "c", "d"],
                attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
            });
	mMap.addLayer(mapboxSAT);
	mMap.setView(latLong,16);
	
	var geojsonFeature = {
    "type": "Feature",
    "properties": {
    },
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": coords
    }
};
	var bounds = L.latLngBounds([]);
	var feature = L.geoJSON(geojsonFeature,
	{
		onEachFeature: function (feature, layer) {
			var layerBounds = layer.getBounds();
			// extend the bounds of the collection to fit the bounds of the new feature
				bounds.extend(layerBounds);
    }
	});
	feature.addTo(mMap);
	mMap.fitBounds(bounds,{
	maxZoom: 19});
	
}



function getData()
{
	var pNum = get("parcelnumber");
	if (!pNum)
	{
		throwError();
		return;
	}
	
	
	var sql = new cartodb.SQL({ user: 'cartomike' });
	var mQ = 'SELECT *,ST_AsGeoJSON(ST_Centroid(the_geom)),ST_AsGeoJSON(the_geom) AS geom FROM parcels_carto WHERE parcelnumber = \'' + pNum + '\';';
	console.log(mQ);
	$.ajax({
		method: "POST",
		url: "https://cartomike.carto.com/api/v2/sql/",
		data: { q: mQ}
		})
  .done(function( data) {
    	//console.log(data);
		if (data.rows[0])
		{
			populateData(data.rows[0]);
			
			
			var geoJSON = JSON.parse(data.rows[0].st_asgeojson);
			var latlng = [geoJSON.coordinates[1],geoJSON.coordinates[0]];
			createMap(latlng,data.rows[0].geom);
			
		}
  });
  
  
	
}

getData();