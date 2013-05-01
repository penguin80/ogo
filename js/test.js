var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var trackMap;
var trackWindowInfo;
var startPoint;
var distance;

function initialize() {

    // Instantiate a directions service.
    directionsDisplay = new google.maps.DirectionsRenderer();

    // Create a map and center it on geolocalisation (if it works).
    var mapOptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    trackMap = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(trackMap);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);

            trackMap.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
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
        map: trackMap,
        position: new google.maps.LatLng(47, 7),
        content: content
    };

    new google.maps.InfoWindow(options);
    trackMap.setCenter(options.position);
}

function calcRoute() {

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
                map: trackMap,
                position: route.legs[0].start_location,
                content: 'Distance du trajet simple: <br />' + route.legs[0].distance.text +
                        '<br /><button class="longTrack" onclick="newRoute()">Générer tracer</button>'
            });
        }
    });
}

function newRoute() {

    if (startPoint !== null)
        var options = {
            center: startPoint,
            map: trackMap,
            radius: distance * 2 * 20,
            visible: true,
            fillColor: 'lilas',
            fillOpacity: 0.9
        };

    new google.maps.Circle(options);
    trackMap.setCenter(options.center);
}

$(function() {
    $("#inputform").draggable();
});

google.maps.event.addDomListener(window, 'load', initialize);