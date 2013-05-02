var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var trackMap;
var trackWindowInfo;
var startPoint;
var distance;
 var lineLayer = new OpenLayers.Layer.Vector("Line Layer"); 

$(document).ready(function() {
    $("#inputform").draggable();
    initialize();
    $("#search").click(calcRoute);
    $("#generateLongTrack").live("click", function() {
        alert("toto!");
    });
    
});

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
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            //directionsDisplay.setDirections(response);
            
            var route = response.routes[0];
            var pointsArray = response.routes[0].overview_path;
            
//            console.log(pointsArray[2].hb);
//            console.log(pointsArray[2].ib);
            
            // Sauvegarder la valeur de la distance reçue
            distance = route.legs[0].distance.value;
            
            // Convertir le lieu de départ en coordonnées latitude/longitude
            startPoint = new google.maps.LatLng(route.legs[0].start_location.lat,
                route.legs[0].start_location.lng);
                                                
            // Apporter des informations supplémentaires au formulaire
            $("#result").html("Longueur du parrcours quotidien: " + route.legs[0].distance.text);
            var button = $("<button/>").attr("id", "generateLongTrack").attr("type", "button");
            //button.appendTo($("#result"));
            $("#inputform").append("Longueur du parrcours quotidien: " + route.legs[0].distance.text);
            newRoute(pointsArray);
        }
        
        
    });
}

function newRoute(pointsArray) {
   

    trackMap.addLayer(lineLayer);                    
    //trackMap.addControl(new OpenLayers.Control.DrawFeature(lineLayer, OpenLayers.Handler.Path));                                     
    var points = new Array();
    var j = 0;
    for(j=0; pointsArray.length(); j++){
        points[j] = new OpenLayers.Geometry.Point(pointsArray[j].hb, pointsArray[2].ib)
    }

    console.log(points);
    var line = new OpenLayers.Geometry.LineString(points);

    var style = { 
        strokeColor: '#0000ff', 
        strokeOpacity: 0.5,
        strokeWidth: 5
    };

    var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
    lineLayer.addFeatures([lineFeature]);
}

google.maps.event.addDomListener(window, 'load', initialize);