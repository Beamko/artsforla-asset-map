/*global require, L, cartodb, vex*/
require([
    'lodash',
    'jquery',
    'text!tpl/welcome.html',
    'bootstrap-amd',
    'geojson/blueLine','geojson/expoLine','geojson/goldLine','geojson/greenLine','geojson/redLine'
], function (_,$,welcome_text) {
    var $disciplines = $('.checkbox input'),
        $railLines = $('#rail-lines'),
        $search_results = $('.search-results'),
        default_search_text = "SELECT A SEARCH FILTER TO DISPLAY CULTURAL ORGANIZATIONS",
        $reset = $('.reset-search-button'),
        tableName = "culturalassetdata_merge",
        cartoViz = "http://artsforla.cartodb.com/api/v2/viz/7f3b21ec-2df7-11e3-98b8-7d88c13e1f97/viz.json",
        filters = {},
        SelectedLine = "",
        self=this;

    function serialize(filters, layer) {
        var searchTerms = [],
            query = "SELECT * FROM "+ tableName + " WHERE ",
            results_count_join = $.isEmptyObject(filters) ? " WHERE " : " AND ";
        query += $.isEmptyObject(filters) ?  "org_name ILIKE '%********%'" : ''; //nasty reset hack

        /*add filter properties to query string*/
        if ( Object.keys(filters).length ) {
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    searchTerms.push(filters[key]);
                }
            }
        }

        if ( searchTerms.length ) {
            for ( var i = 0; i < searchTerms.length; i++ ) {
                if ( i < searchTerms.length-1 ) {
                    query += searchTerms[i]+" AND ";
                } else {
                    query += searchTerms[i];
                }
            }
        }
        update_map_markers(filters, layer, query, results_count_join);
    }

    function update_map_markers(filters, layer, query, results_count_join) {
        console.log(query);
        layer.getSubLayer(0).setSQL(query);
        layer.setOpacity(0.85);
        setTimeout(function(){
            if ($.isEmptyObject(filters) ) {
                $search_results.html(default_search_text);
            } else {
                getResultsCount(query, results_count_join);
            }
        }, 1000);
    }

    function getResultsCount(query, join) {
        $.ajax({
            url: 'http://artsforla.cartodb.com/api/v2/sql',
            type: 'GET',
            dataType: 'json',
            data : {'q' : query+join+'the_geom IS NOT NULL'}
        })
        .done(function(data) {
            $search_results.html('SHOWING ' +data.total_rows+' ORGANIZATIONS');
        })
        .fail(function(e) {
            console.log("error", e);
        });
    }

    function resetFiltersForm() {
        $('input[type="checkbox"]:checked').attr('checked', false);
        $('a.chosen-single>span').html('Any');
        $('.js-childFilter').addClass('u-isHiddenVisually');
        $('.js-metroChildFilter').addClass('u-isHiddenVisually');
        railLines.setUrl( 'http://a.tiles.mapbox.com/v3/arts4la.ArtsForLA_basemap/{z}/{x}/{y}.png' );
    }

    function createSelector(layer) {
        var searchTerms = [];

        $reset.click(function(e){
            e.preventDefault();
            filters = {};
            searchTerms = [];
            resetFiltersForm();
            serialize(filters, layer);
        });

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
                var discipline = "parent_discipline ILIKE ANY (ARRAY[ ";
                for ( var i = 0; i < searchTerms.length; i++ ) {
                    discipline += "'%"+searchTerms[i]+"%'";
                    if ( i < searchTerms.length-1 ) {
                        discipline += ",";
                    }
                    searchString = searchString + " " + searchTerms[i];
                }
                discipline += "])";
                filters.discipline = discipline;
            } else {
                delete filters.discipline;
            }
            serialize(filters,layer);
        });

        /*standard select filter from cartoDB*/
        $('.js-selectFilter').change(function() {
            /*show child-filter, if any*/
            var filter = $("option:selected",this)[0].dataset;
            /*generate query*/
            var queryColumn = this.dataset.column,
                value = $("option:selected",this).val(),
                query = " ILIKE '%" + value + "%'";

            $(this).siblings('.js-childFilter').addClass('u-isHiddenVisually');
            if ('target' in filter ) {
                var $childFilter = $('.' + filter.target);
                $childFilter.removeClass('u-isHiddenVisually');
            }
            console.log(value);
            if (value !== "Any") {
                filters[queryColumn] = queryColumn + query;
            } else {
                delete filters[queryColumn];
            }
            serialize(filters, layer);
        });

        /*standard select child filter from cartoDB*/
        $('.js-childFilter').change(function() {
            var queryColumn = this.dataset.column;
            var value = $("option:selected",this).val();
            var familyValues = []; //refactor
            var familyValuesString = ' ILIKE ANY (ARRAY[';
            $.each($('option',this), function() {
                if ($(this).val() !== 'Any') {
                    familyValues.push($(this).val());
                }
            });
            for ( var i = 0; i < familyValues.length; i++ ) {
                familyValuesString += "'%" + familyValues[i] + "%'";
                if ( i < familyValues.length-1 ) {
                    familyValuesString += ",";
                }
            }
            familyValuesString += '])';

            if (value !== "Any") {
                filters[queryColumn] = queryColumn + " ILIKE '%" + value + "%'" ;
            } else {
                filters[queryColumn] = queryColumn + familyValuesString;
            }
            serialize(filters, layer);
        });

        /*rail line selector*/
        $railLines.change(function() {
            /*show stops selector*/
            var filter = $("option:selected",this)[0].dataset;
            $('.js-metroChildFilter').addClass('u-isHiddenVisually');
            if ('target' in filter) {$('.' + filter.target).removeClass('u-isHiddenVisually');}
            /*draw rail line*/
            var url = "http://a.tiles.mapbox.com/v3/arts4la.ArtsForLA_basemap/{z}/{x}/{y}.png"; //full rail lines layer
            if ( "mblayer" in filter)  {url = "http://a.tiles.mapbox.com/v3/arts4la."+filter.mblayer+"/{z}/{x}/{y}.png" ;}
            railLines.setUrl( url );
            /*submit query*/
            if ("station" in filters) {delete filters.station;}
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
            if ("line" in filters) {delete filters.line;}
          //  var queryColumn = this.dataset.column,
            var railLine = this.dataset.line,
                value = $("option:selected",this).val(),
                stop = _.find(self[railLine].features, {"properties" : {'STATION' : value } });

            if ( value !== "Any" ) {
                filters.station = "ST_Distance(the_geom::geography, ST_PointFromText('POINT(" +stop.properties.POINT_X+" " + stop.properties.POINT_Y + ")', 4326)::geography) < 1609.344";
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
        minZoom : 10,
        maxZoom : 17,
        zoomControl : false,
        scrollWheelZoom : false
    });
    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('http://a.tiles.mapbox.com/v3/arts4la.redLine/{z}/{x}/{y}.png', { //basemap layer
        attribution: 'Mapbox'
    }).addTo(map);

    var railLines = L.tileLayer('http://a.tiles.mapbox.com/v3/arts4la.ArtsForLA_basemap/{z}/{x}/{y}.png', { //full rail lines layer
        attribution: 'Mapbox'
    });
    railLines.addTo(map);

    /*load cartoDB markers*/
    var markerLayer = cartodb.createLayer(map, cartoViz);
    markerLayer
        .addTo(map)
        .on('done', function(layer) {
            layer.setOpacity(0);
            var sublayer = layer.getSubLayer(0);
            sublayer.infowindow.set('template', $('#infowindow_afla').html());
            sublayer.setSQL("SELECT * FROM "+tableName+" WHERE org_name ILIKE '%*********%'"); //null query hack
            sublayer.setInteraction(true);
            sublayer.on('featureClick', function(){
                $('.cartodb-infowindow').on("click", function(e){
                    if ($(e.target).hasClass('popup-toggle-extended')){
                        $('.popup-extended-container').removeClass('u-isHiddenVisually');
                        $('.popup-content').addClass('u-isHiddenVisually');
                        $(e.target).parents('.cartodb-popup').addClass('extended');
                    }
                });
            });
            createSelector(layer);
        });

/*********************
CONTROLLER FORM
*********************/
    $('.legend-row').tooltip({
        selector: "a[data-toggle=tooltip]",
        html : 'true',
    });

    $('.filters-form-container').tooltip({
        selector: "a[data-toggle=tooltip]"
    });

    $('.box-tab-toggle').click(function() {
        var $target = $('.' + this.dataset.target);
        if ($target.hasClass('box-hidden') ) {
            $target.removeClass('box-hidden');
            $(this).children('.ss-icon').text('remove');
        } else {
            $target.addClass('box-hidden');
            $(this).children('.ss-icon').text('add');
        }
    });

    $('.tagline').click(function(e){
        e.preventDefault();
        vex.open({
            content : welcome_text
        });
    });

    vex.open({
        content : welcome_text
    });

});

/*NON-AMD*/
$('.chosen').chosen({disable_search:true, inherit_select_classes:true});





