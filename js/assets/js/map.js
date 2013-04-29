var map, startPointLayer, endPointLayer, lineLayer, control, gpxLayer, baseurl;

$(document).ready(function() {
    
    // A CONFIGURER !!!
    baseurl = "http://ogovm/webmaptuto/webpgrouting/";
    
    // initialisation de la Map en SRS EPSG:900913
    map = new OpenLayers.Map({
        div: "map",
        projection: new OpenLayers.Projection("EPSG:900913"),
        units: 'm'
    });

    // ajout d'une baselayer OSM
    var osm = new OpenLayers.Layer.OSM();
    map.addLayer(osm);

    // définition du style des points départ/arrivée
    // (style partagé grace à un context par les deux couches startPointLayer et endPointLayer)
    var myStyles = new OpenLayers.StyleMap({
        "default":new OpenLayers.Style({
            externalGraphic: "${getIcon}",
            strokeColor: "#FF0000",
            graphicHeight: 40,
            graphicYOffset: -43
        }, {
            context: {
                getIcon: function(feature) {
                    var img = (feature.attributes.type == 'start') ? 'dot_1.png' : 'dot_2.png';
                    var path = 'assets/img/';
                    return path + img;
                }
            }
        })
    });

    // création des deux couches de saisie des points départ/arrivée
    startPointLayer = new OpenLayers.Layer.Vector("Start Point Layer", {
        styleMap: myStyles
    });
    endPointLayer = new OpenLayers.Layer.Vector("End Point Layer", {
        styleMap: myStyles
    });

    // activation du controle de saisie de point (d'abord sur la couche de saisie du départ)
    control = new OpenLayers.Control.DrawFeature(startPointLayer, OpenLayers.Handler.Point);
    map.addControl(control);
    control.activate();

    // enregistrement d'un écouteur sur l'événement beforefeatureadded (avant insertion) :
    // - on vide la couche startPointLayer
    // - on vide la couche itinéraire (si une recherche d'itinéraire avait déjà été faite)
    // - on "tague" au passage l'entité qui sera ajoutée avec un attribut type de valeur 'start'
    startPointLayer.events.register('beforefeatureadded', control, function(e) {
        startPointLayer.removeAllFeatures();
        lineLayer.removeAllFeatures();
        e.feature.attributes.type = 'start';
    });
    // idem, enregistrement d'un écouteur sur l'événement beforefeatureadded sur endPointLayer
    // (on vide les couches et on tague avec la valeur 'end')
    endPointLayer.events.register('beforefeatureadded', control, function(e) {
        endPointLayer.removeAllFeatures();
        lineLayer.removeAllFeatures();
        e.feature.attributes.type = 'end';
    });
    
    // création de la couche pour accueillir le résultat du calcul d'itinéraire
    // (elle est vide au départ par l'utilisation d'un flux GeoJSON de taille 0)
    lineLayer = new OpenLayers.Layer.Vector("Roads", {
        protocol: new OpenLayers.Protocol.HTTP({
            url: baseurl + "assets/nofeature.json",
            format: new OpenLayers.Format.GeoJSON()
        }),
        projection: new OpenLayers.Projection("EPSG:4326"),
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({
            "default":new OpenLayers.Style({
                strokeWidth: "5"
            })
        })
    });

    // ajout de couches
    map.addLayers([startPointLayer, endPointLayer, lineLayer]);

    // centrage de la carte
    map.setCenter(new OpenLayers.LonLat(740663,5865507),12);    

    // fonction d'appel du service de recherche du noeud de réseau le plus proche du point saisie par l'utilisateur
    function correct_point(e) {
        // on transforme un clone du point en SRS 4326 avant l'appel
        geom = e.feature.geometry.clone().transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:4326'));
        $.ajax({
            url: 'point_to_id.php',
            data: {
                "lon"   : geom.x,
                "lat"   : geom.y
            },
            success: function(data, textStatus, jqXHR) {
                if (data.success) {
                    // Set vertice id
                    e.feature.attributes.id = data.success.id;
                    // Correct dot coordinates
                    correctPos = new OpenLayers.LonLat(data.success.x, data.success.y);
                    correctPos.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
                    e.feature.move(correctPos);
                } else {
                    e.object.removeAllFeatures();
                    alert(data.error);
                }
            },
            error: function(data) {
                e.object.removeAllFeatures();
                alert('Meh... Something went wrong...');
            }
        });

    }
    endPointLayer.events.register('featureadded', control, correct_point);
    startPointLayer.events.register('featureadded', control, correct_point);


    $(document).on('click', '#point_selector .btn', function() {
        $(this).toggleClass('active');

        if ($(this).hasClass('start')) {
            $('#point_selector .btn.end').toggleClass('active');
            control.layer = startPointLayer;
        } else {
            $('#point_selector .btn.start').toggleClass('active');
            control.layer = endPointLayer;
        }
    });

    $(document).on('click', '#search', function() {
        if (startPointLayer.features.length == 1) {
            if (endPointLayer.features.length == 1) {
                if (startPointLayer.features[0].attributes.id && endPointLayer.features[0].attributes.id) {
                    
                    qs = jQuery.param({
                        start: startPointLayer.features[0].attributes.id,
                        end: endPointLayer.features[0].attributes.id
                    });

                    lineLayer.protocol.options.url = baseurl + "routing.php?" + qs;
                    lineLayer.refresh();

                } else {
                    alert("A point has not been encoded...");
                }
            } else {
                alert("You have to define a destination");
            }
        } else {
            alert("You have to define a start");
        }
    })
});