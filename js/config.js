/* 
 * Definition of global JS application parameters
 */

var myWMS = "http://192.168.80.128:8080/geoserver/wms";
var myWFS = "http://192.168.80.128:8080/geoserver/wfs";

var myProxy = "proxy.php?url=";

var remoteSLD = "http://192.168.80.128/webmaptuto/sld";

/* 
 * Insertion of <script> elements to load required libraries :
 * 
 * @requires js/OpenLayers/lib/OpenLayers.js (version 2.12)
 * @requires js/jquery-1.9.1.js
 * 
 */

scriptTag = '<script type="text/javascript" src="js/OpenLayers/OpenLayers.js"></script>';
document.write(scriptTag);

scriptTag = '<script type="text/javascript" src="js/jquery/jquery-1.9.1.js"></script>';
document.write(scriptTag);

// -> Google Maps API v2
//scriptTag = '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAADPWudfErG2kEBVfQJH1_6RSrSAkL6bMEzHE7XhgwwJhlGiVXzxTdlo_GcbLpv1PJ838EniQ7yF2DQw"></script>';
// -> v3

scriptTag = '<script src="http://maps.google.com/maps/api/js?v=3&amp;sensor=false"></script>';
document.write(scriptTag);
