function openInfowindow(latlng, cartodb_id) {
    console.log(latlng);
    console.log(cartodb_id);
    layers.cartoParcel.trigger('featureClick', null, latlng, null, { cartodb_id: cartodb_id}, 1);
}

function zoomToParcel(item)
{
	var geoJSON = JSON.parse(item.centroid);
	var latlng = [geoJSON.coordinates[1],geoJSON.coordinates[0]];
	openInfowindow(latlng,item.cartodb_id);    
    map.setView(latlng,17);
}

function showMoreInfo(data)
{
    var infoWindow = window.open("/report/index.html");
}