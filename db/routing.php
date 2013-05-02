<?php
include('./connection.php');

if ($conn !== false) {

    $lng = $_GET['lng'];
    $lat = $_GET['lat'];
    $distance = $_GET['distance'];

    if (is_numeric($lng) && is_numeric($lat) && is_numeric($distance)) {
        
        $minDistance = 0.9*$distance;
        $maxDistance = 1.1*$distance;
        $query = "SELECT wup_aggl as city_name " .
                 "FROM cities_capital_pt " .
                 "WHERE st_distance_spheroid(the_geom, st_geomfromtext('POINT(" . 
                                             $lng . " " . $lat . ")', 4326), ".
                                             "'SPHEROID[\"WGS 84\"," .
                                             "6378137,298.257223563]') / 1000 >= " . 
                                             $minDistance . " AND " .
                 "st_distance_spheroid(the_geom, st_geomfromtext('POINT(" . 
                                             $lng . " " . $lat . ")', 4326), ".
                                             "'SPHEROID[\"WGS 84\"," .
                                             "6378137,298.257223563]') / 1000 <= " . 
                                             $maxDistance .
                " ORDER BY random()" .
                " LIMIT 1;";

        
        $rs = pg_query($conn, $query);
        $result = pg_fetch_assoc($rs);
        
        if (isset($result['city_name'])) {
            echo json_encode($result['city_name']);
        } else {
            echo '{"error": "No road found.."}';
        }

    } else {
        echo '{"error": "problem with start point id or end point id..."}';
    }
} else {
    echo '{"error": "No connexion with database..."}';
}


?>