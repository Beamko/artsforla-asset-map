var $messages = $('#messages');
var $disciplines = $('.checkbox input');
var $orgType = $('#org-type');
var $activities = $('#arts-activities');
var filters = {};

function serialize(filters, layer) {
	var searchTerms = [];
	var query = $.isEmptyObject(filters) ? "SELECT * FROM cultural_asset_list_2" : "SELECT * FROM cultural_asset_list_2 WHERE ";
	console.log('object count', Object.keys(filters).length);
	/*add filter properties to query string*/
	if ( Object.keys(filters).length ) {
		for (key in filters) {
			searchTerms.push(filters[key]);
		}
	}

	if ( searchTerms.length ) {
		for ( i = 0; i < searchTerms.length; i++ ) {
			if ( i < searchTerms.length-1 ) {
				query += searchTerms[i]+" AND ";
			} else {
				query += searchTerms[i];
			}
		}
	}
	console.log('query ', query);
	//$messages.html('RESULTS FOR : ' + searchString.toUpperCase() );
	layer.setQuery(query);
}

function createSelector(layer) {	
	var searchTerms = [];

	$disciplines.click(function(e) {
		var searchString = "";
		
		if ( e.currentTarget.checked ) {
			searchTerms.push(e.currentTarget.value) 
		} else {
			var index = searchTerms.indexOf(e.currentTarget.value); 
			searchTerms.splice(index,1);
		}

		if ( searchTerms.length ) {
			var discipline = "disciplines ILIKE ANY (ARRAY[ ";
				for ( i = 0; i < searchTerms.length; i++ ) {
					discipline += "'%"+searchTerms[i]+"%'";
					if ( i < searchTerms.length-1 ) { discipline += "," }
					searchString = searchString + " " + searchTerms[i];
				}
			discipline += "])";
			filters.discipline = discipline;
		} else {
			delete filters.discipline;
		}
		serialize(filters, layer);
	});
	
	$orgType.change( function (e) {
		var orgType = $("option:selected",this).val();
		if (orgType !== "Any" ) {
			filters.orgType = "organizational_type_s ILIKE '%" +orgType + "%'";
		} else {
			delete filters.orgType;
		}
		serialize(filters, layer);
	});

	$activities.change( function (e) {
		var activities = $("option:selected",this).val();
		if (activities !== "Any" ) {
			filters.activities = "art_activities ILIKE '%"+activities+"%'";
		} else {
			delete filters.activities;
		}
		serialize(filters, layer);
	});

}

 var map = new L.Map('map', {
		center: [34.056,-118.235],
		zoom: 11
	});

	L.tileLayer('http://a.tiles.mapbox.com/v3/examples.map-zgrqqx0w/{z}/{x}/{y}.png', {
					attribution: 'Mapbox'
				}).addTo(map);

	var railLines = L.tileLayer('http://a.tiles.mapbox.com/v3/civservchris.metroLines/{z}/{x}/{y}.png', {
					attribution: 'Mapbox'
				});
	railLines.addTo(map);

var markerLayer = cartodb.createLayer(map, 'http://cs-chris.cartodb.com/api/v2/viz/7aaa7842-eb50-11e2-ab8e-61f262e10947/viz.json');
markerLayer.addTo(map)
	.on('done', function(layer) {
			layer.setInteraction(true);
			createSelector(layer);
	});

$('#rail-lines').change(function() {
	var searchTerm = $("option:selected",this).val();
	var url;
	if ( searchTerm == "any") {
		console.log(searchTerm);
		url = 'http://a.tiles.mapbox.com/v3/civservchris.metroLines/{z}/{x}/{y}.png';
		$('#rail-stops').css('display','none');
	} else {
		var url = "http://a.tiles.mapbox.com/v3/civservchris."+searchTerm+"/{z}/{x}/{y}.png";
		$('#rail-stops').css('display','block');
	}
	railLines.setUrl( url );
});