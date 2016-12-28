function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function itemMatcher(item,query)
{
	//Show all matches
	return true;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function itemDisplayer(item, query)
{
	return toTitleCase(item.ownername) + "|" + item.parcelnumber;
}

function itemHighlighter(item)
{
	var d = item.split("|");
	return "<strong>"+d[0]+"</strong><p>"+d[1]+"</p>";
}


function itemSelected(item)
{
	//Zoom to parcel
	zoomToParcel(item);
}


function setupSearchBox()
{
    $('#searchbox').typeahead(
    {
        source: asyncCartoName,
		afterSelect: itemSelected,
		matcher: function(item){return itemMatcher(item,this.query);},
		displayText: function(item){ return itemDisplayer(item,this.query); },
		highlighter: itemHighlighter
	});
}



function asyncCartoName(query,process)
{
    var sql = new cartodb.SQL({ user: 'cartomike' });
    var endpoint = "https://cartomike.carto.com/api/v2/sql/";
   // var regex = "'{NAME}\\w+|\\b{NAME}\\b'";
	
	var ownerQ = "OWNERNAME ILIKE '%{NAME}%'"
    ownerQ = ownerQ.split("{NAME}").join(query);

    var myQuery = "SELECT *,ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid FROM parcels_carto WHERE " + ownerQ + " ORDER BY OWNERNAME LIMIT 25";
    
    var parcelNum = stringToNumber(query);
    if (parcelNum.length > 0)
    {
        var parcelQ = "PARCELNUMBER ~* " + createParcelNoRegex(parcelNum) + " LIMIT 25";
        var second = "(SELECT *,ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid FROM parcels_carto WHERE " + parcelQ + ")";
        
        myQuery = "(" + myQuery + ") UNION " + second + " ORDER BY OWNERNAME LIMIT 25";
    }
	
	console.log("Query: " + myQuery);
    
     return $.getJSON(
            endpoint,
            { q: myQuery },
            function (data) {                                
				console.log(data.rows);
                return process(data.rows);
            });
}


function createParcelNoRegex(str)
{
    var regexSeparator = "\\s*\\.?";    
    return "'^" + str.split('').join(regexSeparator) + "'";
}

function stringToNumber(str)
{
    var ss = str.match(/\d+/g);
    if (ss)
    {
        return ss.join('')
    }
    return "";
}
          

function openInfowindow(latlng, cartodb_id) {
    console.log(latlng);
    console.log(cartodb_id);
    layers.cartoParcel.trigger('featureClick', null, latlng, null, { cartodb_id: cartodb_id}, 0);
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

$('#searchform').submit(function()
{
	zoomToParcel( $('#searchbox').typeahead("getActive"));
	return false;
});

$("#searchButton").click(function(){ $('#searchform').submit(); });

$(function(){
     setupSearchBox();
});
