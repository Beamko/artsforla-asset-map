var $messages = $('#messages'),
	$disciplines = $('.checkbox input'),
	$railLines = $('#rail-lines'),
	//tableName = "cultural_asset_list",
	//cartoViz = "http://cs-chris.cartodb.com/api/v2/viz/7aaa7842-eb50-11e2-ab8e-61f262e10947/viz.json",
	tableName = "lan_data_set",
	cartoViz = "http://cs-chris.cartodb.com/api/v2/viz/1c721cc6-0545-11e3-8ab0-796eb9e49271/viz.json",
	filters = {};

function serialize(filters, layer) {
	var searchTerms = [];
	var query = $.isEmptyObject(filters) ? "SELECT * FROM " + tableName : "SELECT * FROM "+ tableName + " WHERE ";

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
	console.log(query);
	//$messages.html('RESULTS FOR : ' + searchString.toUpperCase() );
	layer.setQuery(query);
}

function createSelector(layer) {	
	var searchTerms = [];

	/*multi-checkbox filter*/
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

	/*standard select filter from cartoDB*/
	$('.js-selectFilter').change(function(e) {

		/*show child-filter, if any*/		
		var filter = $("option:selected",this)[0].dataset;
	    	'target' in filter ? $('#' + filter.target).removeClass('u-isHiddenVisually') : 
	    		$(this).siblings('.js-childFilter').addClass('u-isHiddenVisually');

	    	/*generate query*/  	
	    	var queryColumn = this.dataset.column;
	    	var value = $("option:selected",this).val();
	    	value !== "Any" ? filters[queryColumn] = queryColumn + " ILIKE '%" + value + "%'" : delete filters[queryColumn];
	    	serialize(filters, layer);
	});

	/*standard select child filter from cartoDB*/
	$('.js-childFilter').change(function(e) {
		var queryColumn = this.dataset.column;
	    	var value = $("option:selected",this).val();
	    	value !== "Any" ? filters[queryColumn] = queryColumn + " ILIKE '%" + value + "%'" : delete filters[queryColumn];
	    	serialize(filters, layer);
	});

}

/*instantiate map and add  base layers*/
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


/*rail line selector*/
$('#rail-lines').change(function() {
	var filter = $("option:selected",this)[0].dataset;
	var url = "http://a.tiles.mapbox.com/v3/civservchris.metroLines/{z}/{x}/{y}.png";
	if ( "mblayer" in filter)  url = "http://a.tiles.mapbox.com/v3/civservchris."+filter.mblayer+"/{z}/{x}/{y}.png" ;
	railLines.setUrl( url );
});

/*load cartoDB markers*/
var markerLayer = cartodb.createLayer(map, cartoViz);
markerLayer.addTo(map)
	.on('done', function(layer) {
			layer.setInteraction(true);
			createSelector(layer);
	});



