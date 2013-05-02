var directionsDisplay;
var directionsService;
var dailyTrack;
var trackWindowInfo;
var startPoint;
var distance;
//var lineLayer = new OpenLayers.Layer.Vector("Line Layer"); 

$(document).ready(function() {
    $("#inputform").draggable();
//    initialize();
    $("#search").click(calcRoute);
    $("#generateLongTrack").live("click", function() {
        alert("toto!");
    });
    
});

function initialize() {

    var options = {
        controls: [],
        projection: new OpenLayers.Projection("EPSG:900913"),
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: 'm'
    };

    map = new OpenLayers.Map('map', options);
    
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    // Create a map and center it on geolocalisation (if it works).
//    var mapOptions = {
//        zoom: 6,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
//    trackMap = new google.maps.Map(document.getElementById('map'), mapOptions);

    // NAVIGATION
    // - plus, minus and arrows keys
    //map.addControl(new OpenLayers.Control.KeyboardDefaults());
    // - dragpan, zoombox, wheel, dbl-click
    map.addControl(new OpenLayers.Control.Navigation());

    // - les deux panels par défaut
    //map.addControl(new OpenLayers.Control.PanZoom());

    // - pan et zoom avec barre des niveaux
    map.addControl(new OpenLayers.Control.PanZoomBar());
    // - coordonnées de la position de souris (selon map.displayProjection)
    //map.addControl(new OpenLayers.Control.MousePosition());
    // - affichage d'échelle de carte
    //map.addControl(new OpenLayers.Control.Scale());
    //map.addControl(new OpenLayers.Control.ScaleLine());

    // LAYER CTRL
    map.addControl(new OpenLayers.Control.LayerSwitcher({"roundedCornerColor": "white"}));

    var panel;

    // CREATE CUSTOM BUTTON
    button1 = new OpenLayers.Control.Button({
        trigger: function() {
            map.setBaseLayer(osm);
            console.log(panel.controls[0].active + " " + panel.controls[1].active + " " + panel.controls[2].active);
            panel.controls[0].activate();
            panel.controls[1].deactivate();
            panel.controls[2].deactivate();
        },
        title: "OpenStreetMap.org",
        displayClass: "button1"
    });


    button2 = new OpenLayers.Control.Button({
        trigger: function() {
            map.setBaseLayer(groad);
            console.log(panel.controls[0].active + " " + panel.controls[1].active + " " + panel.controls[2].active);
            panel.controls[0].deactivate();
            panel.controls[1].activate();
            panel.controls[2].deactivate();
        },
        title: "Google RoadMap",
        displayClass: "button2"
    });

    button3 = new OpenLayers.Control.Button({
        trigger: function() {
            map.setBaseLayer(gsat);
            console.log(panel.controls[0].active + " " + panel.controls[1].active + " " + panel.controls[2].active);
            panel.controls[0].deactivate();
            panel.controls[1].deactivate();
            panel.controls[2].activate();
        },
        title: "Google Satellite",
        displayClass: "button3"
    });

    panel = new OpenLayers.Control.Panel({defaultControl: button2});

    panel.addControls([button1, button2, button3]);
    map.addControl(panel);

    var osm = new OpenLayers.Layer.OSM();
    map.addLayer(osm);

    var groad = new OpenLayers.Layer.Google(
            "Google RoadMap",
            {
                type: google.maps.MapTypeId.ROADMAP,
                sphericalMercator: 'true'
            }
    );
    map.addLayer(groad);

    var gsat = new OpenLayers.Layer.Google(
            "Google Satellite",
            {
                type: google.maps.MapTypeId.SATELLITE,
                sphericalMercator: 'true'
            }
    );
    map.addLayer(gsat);

    dailyTrack = new OpenLayers.Layer.Vector("Your daily track");
    map.addLayer(dailyTrack);

    var cities = new OpenLayers.Layer.WMS(
            "Some big cities (mostly capitals) over the world",
            myWMS,
            {
                layers: 'ogo:cities',
                styles: '',
                format: 'image/png',
                transparent: 'true'
            }
    );

//    $("#zoomslider").slider({
//        animate: true,
//        orientation: "vertical",
//        value: 8,
//        min: 2,
//        max: 20,
//        step: 1,
//        slide: function(event, ui) {
//            map.setCenter(map.getCenter(), ui.value);
//        }
//    });
//
//    map.events.register('zoomend', map, function() {
//        $("#zoomslider").slider('value', map.getZoom());
//    });

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);

            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
    
    directionsDisplay.setMap(map);

    $("#search").click(calcRoute);
//    $("#randomLongTrack").live("click", function() {});
}

function handleNoGeolocation(errorFlag) {

    var content;
    if (errorFlag) {
        content = 'Error: The Geolocation service failed.';
    } else {
        content = 'Error: Your browser doesn\'t support geolocation.';
    }

    // Localisation basée sur la Suisse
    var options = {
        map: map,
        position: new google.maps.LatLng(47, 7),
        content: content
    };

    new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

function calcRoute() {

    // Retrieve the start and end locations and create
    // a DirectionsRequest using DRIVING directions.
    var start = $("#start").val()
    var end = $("#end").val();
    if (start !== null) {
        if (end !== null) {
            var request = {
                origin: start,
                destination: end,
                //                avoidHighways: false,
                //                avoidTolls: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            };
                                       
            displayRoute(request);
        } else
            alert("You have to define a destination");
    } else
        alert("You have to define a start");
}

function displayRoute(request) {
    
    // Route the directions and pass the response to a
    // function to create markers for each step.
    directionsService.route(request, function(result, status) {

        if (status == google.maps.DirectionsStatus.OK) {
            //directionsDisplay.setDirections(result);
            var route = result.routes[0];
            //alert("lol");

            // Récupérer un tracé OpenLayers de type LineString
            var ligne = extractPoints(result);
            
            // Définir le style du tracé à afficher
            var lineSymbolizer = new OpenLayers.Symbolizer.Line({strokeWidth: 3, strokeColor: "#ff0000"});
            var rule = new OpenLayers.Rule({ symbolizer: lineSymbolizer });
            var redLine = new OpenLayers.Style();
            redLine.addRules([rule]);

            // Créer le Feature
            track = new OpenLayers.Feature.Vector(ligne, {
                distance: route.legs[0].distance.value,
                units: "km"
            });
            
            dailyTrack.removeAllFeatures();
            dailyTrack.addFeatures([track]);

            // Sauvegarder la valeur de la distance reçue
            distance = route.legs[0].distance.value;

            // Convertir le lieu de départ en coordonnées latitude/longitude
            startPoint = new google.maps.LatLng(result.routes[0].overview_path[0].hb,
                                                result.routes[0].overview_path[0].ib);
            console.log(startPoint);
            // Apporter des informations supplémentaires au formulaire
            $("#result").html("Longueur du parcours quotidien: " + route.legs[0].distance.text);
            var button = $("<button/>").addClass("generateLongTrack").attr("type", "button");
            button.appendTo($("#result"));
//            $("#inputform").append("Longueur du parrcours quotidien: " + route.legs[0].distance.text);
            // newRoute(pointsArray);
        }

    });
}

function extractPoints(result) {
    var point;
    var pointList = [];
    var lng, lat
    for (var i = 0; i < result.routes[0].overview_path.length-1; i++) {
        lng = result.routes[0].overview_path[i].ib;
        lat = result.routes[0].overview_path[i].hb;
        
        
        point = new OpenLayers.Geometry.Point(lng, lat);
        console.log(result.routes[0].overview_path[i]);
        pointList.push(point);
    }
    ligne = new OpenLayers.Geometry.LineString(pointList);
    return ligne.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
}

google.maps.event.addDomListener(window, 'load', initialize);