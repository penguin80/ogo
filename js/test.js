var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
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
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

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
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    // Localisation basée sur la Suisse
    var options = {
        map: map,
        position: new google.maps.LatLng(47, 7),
        content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

function calcRoute() {

    // Retrieve the start and end locations and create
    // a DirectionsRequest using DRIVING directions.
    startPoint = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var request = {
        origin: startPoint,
        destination: end,
//        avoidHighways: false,
//        avoidTolls: true,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    
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

function newRoute() {
    
    var options = {
        
    };
}

google.maps.event.addDomListener(window, 'load', initialize);