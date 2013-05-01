var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var trackWindowInfo;
var startPoint;
var distance;

$(document).ready(function() {

    var options = {
        controls: [],
        projection: new OpenLayers.Projection("EPSG:900913"),
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: 'm'
    };

    map = new OpenLayers.Map('map', options);

    // Instantiate a directions service.
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(groad);

    // NAVIGATION
    // - plus, minus and arrows keys
    //map.addControl(new OpenLayers.Control.KeyboardDefaults());
    // - dragpan, zoombox, wheel, dbl-click
    map.addControl(new OpenLayers.Control.Navigation());

    // - les deux panels par défaut
    //map.addControl(new OpenLayers.Control.PanZoom());

    // - pan et zoom avec barre des niveaux
    //map.addControl(new OpenLayers.Control.PanZoomBar());
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

    panel = new OpenLayers.Control.Panel({defaultControl: button1});

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

    var dailyTrack = new OpenLayers.Layer.WMS(
            "Your daily track",
            myWMS,
            {
                layers: 'ogo:traces',
                styles: '',
                format: 'image/png',
                transparent: 'true'
            }
    );
    map.addLayer(dailyTrack);

    map.setCenter(new OpenLayers.LonLat(953322, 5910416), 8);

    $("#zoomslider").slider({
        animate: true,
        orientation: "vertical",
        value: 8,
        min: 2,
        max: map.numZoomLevels,
        step: 1,
        slide: function(event, ui) {
            map.setCenter(map.getCenter(), ui.value);
        }
    });

    map.events.register('zoomend', map, function() {
        $("#zoomslider").slider('value', map.getZoom());
        console.log(map.getCenter());
    });
    
    $("#search").click(displayDailyTrack);

});

function displayDailyTrack() {

    // Retrieve the start and end locations and create
    // a DirectionsRequest using DRIVING directions.
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    if (start !== null) {
        if (end !== null)
            var request = {
                origin: start,
                destination: end,
//                avoidHighways: false,
//                avoidTolls: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            };
        else
            // Convertir le lieu de départ en coordonnées latitude/longitude
            startPoint = new google.maps.LatLng(start.coords.latitude, 
                                                start.coords.longitude);
    }
    
    // Route the directions and pass the response to a
    // function to create markers for each step.
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            distance = route.legs[0].distance.value;
            trackWindowInfo = new google.maps.InfoWindow({
                map: map,
                position: route.legs[0].start_location,
                content: 'Distance du trajet simple: <br />' + route.legs[0].distance.text +
                        '<br /><button class="longTrack" onclick="newRoute()">Générer tracer</button>'
            });
        }
    });
}

$(function() {
    $("#inputform").draggable();
});