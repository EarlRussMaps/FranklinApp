

//function setupSearchBox()
//{
//    $('#searchbox').typeahead(
//    {
//        source: asyncCartoName,
//		afterSelect: itemSelected,
//		matcher: function(item){return itemMatcher(item,this.query);},
//		displayText: function(item){ return itemDisplayer(item,this.query); },
//		highlighter: itemHighlighter
//	});
//}


var searchBox;
var resultsDiv;
var searchData = [];
searchData.push({name: "myname", address: "theaddress"});
searchData.push({name: "xx", address: "43434"});


function inputChange()
{
    var input = searchBox.val();
    search(input);
}

function updateView()
{
    var template = '<li><h4 data-field="name"></h4><p data-field="address"></p></li>';
    resultsDiv.empty();
    searchData.forEach(function(element)
    {
        var el = $(template);
        el.find('[data-field="name"]').text(element.ownername);
        el.find('[data-field="address"]').text(element.fulladdress);
        resultsDiv.append(el);;

    });
}

function setupSearchBox()
{
    searchBox = $('#searchbox');
    resultsDiv = $('#results_list');
    searchBox.on("input",inputChange);
}

function search(name)
{
    var sql = new cartodb.SQL({ user: 'cartomike' });
     var endpoint = "https://cartomike.carto.com/api/v2/sql/";
     var ownerQ = "OWNERNAME ILIKE '%"+name+"%'"
    // ownerQ = ownerQ.split("{NAME}").join(name);
     var myQuery = "SELECT *,ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid FROM parcels_carto WHERE " + ownerQ + " ORDER BY OWNERNAME LIMIT 25";


     $.getJSON(
     endpoint,
     { q: myQuery },
     function (data) {                                
         searchData = data.rows;
         updateView();
     });
}