<html>
    <head>
        <title>Lol</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link type="text/css" href="css/style.css" rel="stylesheet">
        <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css" />
        <script type="text/javascript" src="js/OSRM.js"></script>    
        <script type="text/javascript" src="js/leaflet.js"></script>    
        <script type="text/javascript" src="js/config.js"></script> 
        <script src="http://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
 
        <script type="text/javascript">
            $(document).ready(function(){
                // $("#inputform").draggable();
                var myLatLng = new google.maps.LatLng(0, -180);
                var mapOptions = {
                    zoom: 3,
                    center: myLatLng,
                    mapTypeId: google.maps.MapTypeId.TERRAIN
                };

                var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);
                
               
                $("#buton").click(drawLine);
                
                function drawLine(){
                
                    var start = $('input[id=start]').val();
                    var end = $('input[id=end]').val();
                
                    //alert(""+start);
                    //var temp = $.getJSON("http://maps.googleapis.com/maps/api/directions/json?origin="+start+"&destination="+end+"&sensor=false");
                    (function() {
                        var googleAPI = "http://maps.googleapis.com/maps/api/directions/json?";
                        $.getJSON( googleAPI, {
                            origin: start,
                            destination: end,
                            sensor: "false"
                        })
                        .done(function( data ) {
                            $.each( data.items, function( i, item ) {
                                //Todo
                                alert(""+item.start_location.lat);
                                
      
                            });
                        });
                    })();
                    
                
                    
                    var trace = [
                        new google.maps.LatLng(37.772323, -122.214897),
                        new google.maps.LatLng(21.291982, -157.821856),
                        new google.maps.LatLng(-18.142599, 178.431),
                        new google.maps.LatLng(-27.46758, 153.027892)
                    ];
                    var flightPath = new google.maps.Polyline({
                        path: trace,
                        strokeColor: "#FF0000",
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });

                    flightPath.setMap(map);
                } 
                
               
            
            });
            
            $(function() {
                $( "#inputform" ).draggable();
            });
            
            
            
            
         
        </script>

        <style type="text/css">
            #map {
                width: 100%;
                height: 100%;
            }

            .olControlAttribution {
                visibility: hidden;
            }

            .olLayerGoogleCopyright {
                visibility: hidden;
            }
        </style>

    </head>

    <body>
        <div id="map"></div>
        <div id="inputform" class="ui-widget-content">
            <input id="start" name="start" type="text" placeholder="Lieu de départ" required autofocus>
            <input id="end" name="end" type="text" placeholder="Lieu d'arrivée" required>
            <input id="buton" type="submit" /> 
        </div>
    </body>

</html>
