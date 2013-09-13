require(['lodash','jquery','bootstrap-amd','chosen-js','geojson/blueLine','geojson/expoLine','geojson/goldLine','geojson/greenLine','geojson/redLine'], function (_,$,BlueLine,ExpoLine,GoldLine,GreenLine,RedLine) {

	var $messages = $('#messages'),
		$disciplines = $('.checkbox input'),
		$railLines = $('#rail-lines'),
		//tableName = "cultural_asset_list",
		//cartoViz = "http://cs-chris.cartodb.com/api/v2/viz/7aaa7842-eb50-11e2-ab8e-61f262e10947/viz.json",
		tableName = "lan_data_set",
		cartoViz = "http://cs-chris.cartodb.com/api/v2/viz/ab1e8ce0-18c1-11e3-9831-5532403f69e3/viz.json",
		filters = {},
		selectedLine = "",
		self=this;

	function serialize(filters, layer) {
		var searchTerms = [];
		var query = $.isEmptyObject(filters) ? "SELECT * FROM " + tableName : "SELECT * FROM "+ tableName + " WHERE ";

		/*add filter properties to query string*/
		if ( Object.keys(filters).length ) {
			for (var key in filters) {
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
				searchTerms.push(e.currentTarget.value);
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
			console.log($(this).siblings('.js-childFilter'));
			/*show child-filter, if any*/		
			var filter = $("option:selected",this)[0].dataset;
			$(this).siblings('.js-childFilter').addClass('u-isHiddenVisually');
		  	if ('target' in filter ) $('.' + filter.target).removeClass('u-isHiddenVisually');

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

		/*rail line selector*/
		$railLines.change(function() {
			/*show stops selector*/
			var filter = $("option:selected",this)[0].dataset;
			$('.js-metroChildFilter').addClass('u-isHiddenVisually');
			if ('target' in filter) $('.' + filter.target).removeClass('u-isHiddenVisually'); 
	    		
			
			/*draw rail line*/
			var url = "http://a.tiles.mapbox.com/v3/civservchris.metroLines/{z}/{x}/{y}.png";
			if ( "mblayer" in filter)  url = "http://a.tiles.mapbox.com/v3/civservchris."+filter.mblayer+"/{z}/{x}/{y}.png" ;
			railLines.setUrl( url );

			/*submit query*/
			if ("station" in filters) delete filters.station;
			var railLine = $("option:selected",this).val(),
				query = "ST_Distance(the_geom::geography, ST_GeomFromText('LINESTRING(";
			if ( railLine !== "Any" ) { 
				_.forEach(self[railLine].features, function(data) {
				 	query += data.properties.POINT_X + " " + data.properties.POINT_Y +",";
				});
				query = query.substr(0, query.length - 1);
				query += ")', 4326)::geography) < 1609.344";
				SelectedLine = query;
				filters.line = query; 
			} else { 
				delete filters.line;
			}
			serialize(filters, layer);
		});
		/*rail line child filter*/
		$('.js-metroChildFilter').change(function() {
			if ("line" in filters) delete filters.line; 
			var queryColumn = this.dataset.column, 
				railLine = this.dataset.line,
				value = $("option:selected",this).val(),
				stop = _.find(self[railLine].features, {"properties" : {'STATION' : value } });

			if ( value !== "Any" ) { 
				filters.station = "ST_Distance(the_geom::geography, ST_PointFromText('POINT(" +stop.properties.POINT_X+" " + stop.properties.POINT_Y + ")', 4326)::geography) < 1609.344" 
			} else {
				delete filters.station;
				filters.line = SelectedLine;
			}

			serialize(filters, layer);
		});

	}

	/*instantiate map and add  base layers*/
	 var map = new L.Map('map', {
		center: [34.056,-118.235],
		zoom: 11,
		zoomControl : false
	});
	new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

	L.tileLayer('http://a.tiles.mapbox.com/v3/examples.map-zgrqqx0w/{z}/{x}/{y}.png', {
		attribution: 'Mapbox'
	}).addTo(map);

	var railLines = L.tileLayer('http://a.tiles.mapbox.com/v3/civservchris.metroLines/{z}/{x}/{y}.png', {
		attribution: 'Mapbox'
	});
	railLines.addTo(map);

	/*load cartoDB markers*/
	var markerLayer = cartodb.createLayer(map, cartoViz);
	markerLayer.addTo(map)
		.on('done', function(layer) {
			var sublayer = layer.getSubLayer(0);
			sublayer.infowindow.set('template', $('#infowindow_afla').html());
			sublayer.on('featureClick', function(e,p,l,data){
				console.log(data);
				$('.cartodb-infowindow').on("click", function(e){
					console.log(e.target);
					if ($(e.target).hasClass('flip-toggle') ) {
						/*custom toggle code here*/
						// var toggle = e.target,
						// 	front = $('#flip-this')[0],
						// 	back = $('#flip-back').html();
						// console.log('front',front);
						// console.log('back',back);
						// flippant.flip(front,back,'card');
					}
				});
			});
			//layer.setInteraction(true);
			createSelector(layer);
		});

	function onMapClick(e) {
	    console.log(e);
	}

	map.on('click', onMapClick);



	/*********************
	 CONTROLLER FORM 
	*********************/
	$('.legend-row').tooltip({
	      selector: "a[data-toggle=tooltip]",
	      trigger : 'click'
	    });

	$('.chosen').chosen({disable_search:true, inherit_select_classes:true});

});



