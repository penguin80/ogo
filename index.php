<html>
    <head>
        <title>Ex3c - overlay of WMS over Google layer</title>

        <script type="text/javascript" src="js/config.js"></script>    
        <script type="text/javascript">
            var map,extent;
              
            $(document).ready(function(){

                var options = {
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
                    displayProjection: 'EPSG:4326' // Affichage en °
                };          
                map = new OpenLayers.Map('map', options);
                
                var gphy = new OpenLayers.Layer.Google(
                                "Google Physical",
                                {
                                    type: google.maps.MapTypeId.TERRAIN,
                                    sphericalMercator: true
                                }
                            );                
                map.addLayer(gphy);
                         
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
                width: 1000;
                height: 600;
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
        <p id="scale">scales</p>
    </body>

</html>