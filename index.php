<html>
    <head>
        <title>Lol</title>
        <link type="text/css" href="css/styles.css" rel="stylesheet">
        <link type="text/css" href="css/leaflet.css" rel="stylesheet">
        <script type="text/javascript" src="js/OSRM.js"></script>    
        <script type="text/javascript" src="js/leaflet.js"></script>    
        <script type="text/javascript" src="js/config.js"></script> 
        <script id="jsonp_data_timestamp" type="text/javascript" src="http://router.project-osrm.org/timestamp?jsonp=OSRM.JSONP.callbacks.data_timestamp">
            OSRM.JSONP.callbacks.data_timestamp({"version": 0.3, "status": 0, "timestamp": "130426 07:29Z", "transactionId": "OSRM Routing Engine JSON timestamp (v0.3)"})
        </script>
        <script type="text/javascript" src="localization/OSRM.Locale.en.js">
            OSRM.Localization.en = {CULTURE: "en-US", LANGUAGE: "English", GUI_START: "Start", GUI_END: "End", GUI_RESET: "&nbsp;&nbsp;Reset&nbsp;&nbsp;", GUI_ZOOM_ON_ROUTE: "Zoom onto Route", GUI_ZOOM_ON_USER: "Zoom onto User", GUI_SEARCH: "&nbsp;&nbsp;Show&nbsp;&nbsp;", GUI_REVERSE: "Reverse", GUI_START_TOOLTIP: "Enter start", GUI_END_TOOLTIP: "Enter destination", GUI_MAIN_WINDOW: "Main window", GUI_ZOOM_IN: "Zoom in", GUI_ZOOM_OUT: "Zoom out", GUI_CONFIGURATION: "Configuration", GUI_LANGUAGE: "Language", GUI_UNITS: "Units", GUI_KILOMETERS: "Kilometers", GUI_MILES: "Miles", GUI_M: "m", GUI_KM: "km", GUI_MI: "mi", GUI_FT: "ft", GUI_H: "h", GUI_MIN: "min", GUI_S: "s", GUI_MAPPING_TOOLS: "Mapping Tools", GUI_HIGHLIGHT_UNNAMED_ROADS: "Highlight unnamed streets", GUI_SHOW_PREVIOUS_ROUTES: "Show previous routes", OPEN_JOSM: "JOSM", OPEN_OSMBUGS: "OSM Bugs", SEARCH_RESULTS: "Search Results", FOUND_X_RESULTS: "found %i results", TIMED_OUT: "Timed Out", NO_RESULTS_FOUND: "No results found", NO_RESULTS_FOUND_SOURCE: "No results found for start", NO_RESULTS_FOUND_TARGET: "No results found for end", ROUTE_DESCRIPTION: "Route Description", GET_LINK_TO_ROUTE: "Generate Link", GENERATE_LINK_TO_ROUTE: "waiting for link", LINK_TO_ROUTE_TIMEOUT: "not available", GPX_FILE: "GPX File", DISTANCE: "Distance", DURATION: "Duration", YOUR_ROUTE_IS_BEING_COMPUTED: "Your route is being computed", NO_ROUTE_FOUND: "No route possible", OVERVIEW_MAP: "Overview Map", NO_ROUTE_SELECTED: "No route selected", ENGINE_0: "Car (fastest)", N: "north", E: "east", S: "south", W: "west", NE: "northeast", SE: "southeast", SW: "southwest", NW: "northwest", DIRECTION_0: "Unknown instruction[ onto <b>%s</b>]", DIRECTION_1: "Continue[ onto <b>%s</b>]", DIRECTION_2: "Turn slight right[ onto <b>%s</b>]", DIRECTION_3: "Turn right[ onto <b>%s</b>]", DIRECTION_4: "Turn sharp right[ onto <b>%s</b>]", DIRECTION_5: "U-Turn[ onto <b>%s</b>]", DIRECTION_6: "Turn sharp left[ onto <b>%s</b>]", DIRECTION_7: "Turn left[ onto <b>%s</b>]", DIRECTION_8: "Turn slight left[ onto <b>%s</b>]", DIRECTION_10: "Head <b>%d</b>[ onto <b>%s</b>]", "DIRECTION_11-1": "Enter roundabout and leave at first exit[ onto <b>%s</b>]", "DIRECTION_11-2": "Enter roundabout and leave at second exit[ onto <b>%s</b>]", "DIRECTION_11-3": "Enter roundabout and leave at third exit[ onto <b>%s</b>]", "DIRECTION_11-4": "Enter roundabout and leave at fourth exit[ onto <b>%s</b>]", "DIRECTION_11-5": "Enter roundabout and leave at fifth exit[ onto <b>%s</b>]", "DIRECTION_11-6": "Enter roundabout and leave at sixth exit[ onto <b>%s</b>]", "DIRECTION_11-7": "Enter roundabout and leave at seventh exit[ onto <b>%s</b>]", "DIRECTION_11-8": "Enter roundabout and leave at eighth exit[ onto <b>%s</b>]", "DIRECTION_11-9": "Enter roundabout and leave at nineth exit[ onto <b>%s</b>]", "DIRECTION_11-x": "Enter roundabout and leave at one of the too many exits[ onto <b>%s</b>]", DIRECTION_15: "You have reached your destination", NOTIFICATION_MAINTENANCE_HEADER: "Scheduled Maintenance", NOTIFICATION_MAINTENANCE_BODY: "The OSRM Website is down for a scheduled maintenance. Please be patient while required updates are performed. The site will be back online shortly.<br/><br/>In the meantime you may want to go out an map a friendly neighborhood near you...<br/><br/><br/>[OSRM]", NOTIFICATION_LOCALIZATION_HEADER: "Did you know? You can change the display language.", NOTIFICATION_LOCALIZATION_BODY: "You can use the pulldown menu in the upper left corner to select your favorite language. <br/><br/>Don't despair if you cannot find your language of choice. If you want, you can help to provide additional translations! Visit <a href='https://github.com/DennisSchiefer/Project-OSRM-Web'>here</a> for more information.", NOTIFICATION_CLICKING_HEADER: "Did you know? You can click on the map to set route markers.", NOTIFICATION_CLICKING_BODY: "You can click on the map with the left mouse button to set a source marker (green) or a target marker (red), if the source marker already exists. The address of the selected location will be displayed in the boxes to the left. <br/><br/>You can delete a marker by clicking on it again with the left mouse button.", NOTIFICATION_DRAGGING_HEADER: "Did you know? You can drag each route marker on the map.", NOTIFICATION_DRAGGING_BODY: "You can drag a marker by clicking on it with the left mouse button and holding the button pressed. Then you can move the marker around the map and the route will be updated instantaneously. <br/><br/>You can even create intermediate markers by dragging them off of the main route! ", GUI_LEGAL_NOTICE: "Routing by <a href='http://project-osrm.org/'>Project OSRM</a> - Geocoder by <a href='http://wiki.openstreetmap.org/wiki/Nominatim'>Nominatim</a> - OSRM hosting by <a href='http://algo2.iti.kit.edu/'>KIT</a>", GUI_DATA_TIMESTAMP: "data: ", GUI_VERSION: "gui: ", QR: "QR"};
            if (OSRM.DEFAULTS.LANUGAGE_ONDEMAND_RELOADING == true) {
                OSRM.Localization.setLanguage("en", true);
            };
        </script>
        <script type="text/javascript">
            var map,extent;
              
            $(document).ready(function(){

                var options = {
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
                    displayProjection: 'EPSG:4326' // Affichage en °
                };          
                map = new OpenLayers.Map('map', options);
                
                var osm = new OpenLayers.Layer.OSM();
                map.addLayer(osm);
                         
                var wms = new OpenLayers.Layer.WMS(
                                "GeoAdmin WMS IFDG",
                                "http://wms.geo.admin.ch",
                                {
                                    layers: 'ch.swisstopo.pixelkarte-pk25.metadata-kartenblatt',
                                    SLD: 'http://poulpe.heig-vd.ch/ogo13' + '/blattnummer.sld.xml',
                                    format: 'image/png',
                                    transparent: 'true'
                                },
                                {
                                    singleTile:true
                                }
                            );
                map.addLayer(wms);

                map.addControl(new OpenLayers.Control.LayerSwitcher());
                map.setCenter(new OpenLayers.LonLat(8, 47).transform(map.displayProjection, map.getProjectionObject()),6);
                
                $('#scale').click(function(){
                    console.log(map.getScale());
                })
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
        <div id="map" class="leaflet-container" style="display: block; position: relative;" tabindex="0">
            <div class="leaflet-control-container">
                <div class="leaflet-top leaflet-left">
                    <div class="box-wrapper gui-control-wrapper leaflet-control" style="top: 5px; left: 420px; visibility: visible;">
                        <a class="box-content gui-control gui-zoom-in" title="Zoom in"></a>
                        <a class="box-content gui-control gui-zoom-out" title="Zoom out"></a>
                    </div>
                </div>
            </div>
        </div>
        <div id="gui" style="display: block;">
            <div id="main-wrapper" class="box-wrapper" style="left: 5px; visibility: visible;">
                <div id="main-input" class="box-content">
                    <div id="input-mask-header">
                        <div id="main-toggle" class="iconic-button cancel-marker top-right-button"></div>
                        <div class="quad top-right-button"></div>
                    </div>
                    <div id="input-mask">
                        <div class="full">
                            <div id="input-source" class="input-marker">
                                <div class="left">
                                    <span id="gui-search-source-label" class="input-label">Adresse de départ:</span>
                                </div>
                                <div class="center input-box">
                                    <input id="gui-input-source" class="input-box" type="text" title="Lieu de départ" value="" maxlength="200">
                                </div>
                                <div class="left">
                                    <div id="gui-delete-source" class="iconic-button cancel-marker input-delete"></div>
                                </div>
                            </div>
                            <div id="input-target" class="input-marker">
                                <div class="left">
                                    <span id="gui-search-target-label" class="input-label">Adresse d'arrivée:</span>
                                </div>
                                <div class="center input-box">
                                    <input id="gui-input-target" class="input-box" type="text" title="Lieu d'arrivée" value="" maxlength="200">
                                </div>
                                <div class="left">
                                    <div id="gui-delete-target" class="iconic-button cancel-marker input-delete"></div>
                                </div>
                            </div>
                        </div>
                        <div class="quad"></div>
                        <div class="full">
                            <div class="row">
                                <div class="left">
                                    <a id="gui-reset" class="button">  Reset  </a>
                                </div>
                                <div class="center">
                                    <span id="styled-select-gui-engine-toggle" class="styled-select base-font" style="width: 103px; height: 18px;">Car (fastest)</span>
                                    <select id="gui-engine-toggle" class="engine-select styled-select-helper base-font">
                                        <option value="0">Car (fastest)</option>
                                    </select>
                                </div>
                                <div class="right">
                                    <a id="gui-reverse" class="button">Reverse</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="main-output" class="box-content">
                    <div id="information-box-header"></div>
                    <div id="information-box" class="information-box-with-normal-header"></div>
                    <div id="legal-notice" class="small-font">
                        Routing by
                        <a href="http://project-osrm.org/">Project OSRM</a>
                        - Geocoder by
                        <a href="http://wiki.openstreetmap.org/wiki/Nominatim">Nominatim</a>
                        - OSRM hosting by
                        <a href="http://algo2.iti.kit.edu/">KIT</a>
                    </div>
                </div>
            </div>
        </div>
    </body>

</html>