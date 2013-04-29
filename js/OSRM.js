L.DomUtil.enableTextSelection = function() {
    if (!document.onselectstart) {
        return
    }
    document.onselectstart = this._onselectstart;
    this._onselectstart = null
};
L.LabelMarker = L.Marker.extend({changeIcon: function(a) {
        this.options.icon = a;
        if (this._map) {
            this._changeIcon()
        }
    }, setLabel: function(a) {
        if (this._icon) {
            this._icon.lastChild.innerHTML = a;
            this._icon.lastChild.style.display = "block"
        }
    }, setTitle: function(a) {
        this.options.title = a;
        this._icon.title = a
    }, _changeIcon: function() {
        var a = this.options, d = this._map, c = (d.options.zoomAnimation && d.options.markerZoomAnimation), b = c ? "leaflet-zoom-animated" : "leaflet-zoom-hide";
        if (this._icon) {
            this._icon = a.icon.changeIcon(this._icon);
            L.DomUtil.addClass(this._icon, b);
            L.DomUtil.addClass(this._icon, "leaflet-clickable")
        }
    }});
L.LabelMarkerIcon = L.Icon.extend({_createImg: function(d) {
        var c;
        if (!L.Browser.ie6) {
            c = document.createElement("div");
            var a = document.createElement("img");
            var b = document.createElement("div");
            a.src = d;
            b.className = "via-counter";
            b.innerHTML = "";
            c.appendChild(a);
            c.appendChild(b)
        } else {
            c = document.createElement("div");
            c.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + d + '")'
        }
        return c
    }, changeIcon: function(a) {
        return this._changeIcon("icon", a)
    }, changeShadow: function(a) {
        return this.options.shadowUrl ? this._changeIcon("shadow", a) : null
    }, _changeIcon: function(b, c) {
        var d = this._getIconUrl(b);
        if (!d) {
            if (b === "icon") {
                throw new Error("iconUrl not set in Icon options (see the docs).")
            }
            return null
        }
        var a = this._changeImg(d, c);
        this._setIconStyles(a, b);
        return a
    }, _changeImg: function(b, a) {
        if (!L.Browser.ie6) {
            a.firstChild.src = b
        } else {
            a.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + b + '")'
        }
        return a
    }});
L.BingLayer = L.TileLayer.extend({options: {subdomains: [0, 1, 2, 3], type: "Aerial", attribution: "", culture: "en-US"}, initialize: function(b, a) {
        L.Util.setOptions(this, a);
        this._key = b;
        this._url = null;
        this.meta = {};
        this.loadMetadata()
    }, tile2quad: function(a, g, e) {
        var c = "";
        for (var d = e; d > 0; d--) {
            var f = 0;
            var b = 1 << (d - 1);
            if ((a & b) != 0) {
                f += 1
            }
            if ((g & b) != 0) {
                f += 2
            }
            c = c + f
        }
        return c
    }, getTileUrl: function(c, d) {
        var d = this._getZoomForUrl();
        var a = this.options.subdomains, b = this.options.subdomains[Math.abs((c.x + c.y) % a.length)];
        return this._url.replace("{subdomain}", b).replace("{quadkey}", this.tile2quad(c.x, c.y, d)).replace("{culture}", this.options.culture)
    }, loadMetadata: function() {
        var d = this;
        var c = "_bing_metadata_" + L.Util.stamp(this);
        window[c] = function(g) {
            d.meta = g;
            window[c] = undefined;
            var f = document.getElementById(c);
            f.parentNode.removeChild(f);
            if (g.errorDetails) {
                alert("Got metadata" + g.errorDetails);
                return
            }
            d.initMetadata()
        };
        var b = "http://dev.virtualearth.net/REST/v1/Imagery/Metadata/" + this.options.type + "?include=ImageryProviders&jsonp=" + c + "&key=" + this._key;
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = b;
        a.id = c;
        document.getElementsByTagName("head")[0].appendChild(a)
    }, initMetadata: function() {
        var e = this.meta.resourceSets[0].resources[0];
        this.options.subdomains = e.imageUrlSubdomains;
        this._url = e.imageUrl;
        this._providers = [];
        for (var b = 0; b < e.imageryProviders.length; b++) {
            var g = e.imageryProviders[b];
            for (var a = 0; a < g.coverageAreas.length; a++) {
                var h = g.coverageAreas[a];
                var f = {zoomMin: h.zoomMin, zoomMax: h.zoomMax, active: false};
                var d = new L.LatLngBounds(new L.LatLng(h.bbox[0] + 0.01, h.bbox[1] + 0.01), new L.LatLng(h.bbox[2] - 0.01, h.bbox[3] - 0.01));
                f.bounds = d;
                f.attrib = g.attribution;
                this._providers.push(f)
            }
        }
        this._update()
    }, _update: function() {
        if (this._url == null || !this._map) {
            return
        }
        this._update_attribution();
        L.TileLayer.prototype._update.apply(this, [])
    }, _update_attribution: function() {
        var c = this._map.getBounds();
        var b = this._map.getZoom();
        if (this._map.attributionControl) {
            for (var a = 0; a < this._providers.length; a++) {
                var d = this._providers[a];
                if ((b <= d.zoomMax && b >= d.zoomMin) && c.intersects(d.bounds)) {
                    if (!d.active) {
                        this._map.attributionControl.addAttribution(d.attrib)
                    }
                    d.active = true
                } else {
                    if (d.active) {
                        this._map.attributionControl.removeAttribution(d.attrib)
                    }
                    d.active = false
                }
            }
        }
    }, onAdd: function(a) {
        L.TileLayer.prototype.onAdd.apply(this, [a]);
        if (this._map.attributionControl) {
            this._map.attributionControl.setPostfix(this.options.postfix)
        }
    }, onRemove: function(c) {
        if (this._map.attributionControl) {
            for (var a = 0; a < this._providers.length; a++) {
                var b = this._providers[a];
                if (b.active) {
                    this._map.attributionControl.removeAttribution(b.attrib);
                    b.active = false
                }
            }
            this._map.attributionControl.setPostfix("")
        }
        L.TileLayer.prototype.onRemove.apply(this, [c])
    }});
var OSRM = {};
OSRM.VERSION = "0.1.8.1";
OSRM.DATE = "120918";
OSRM.CONSTANTS = {};
OSRM.DEFAULTS = {};
OSRM.GLOBALS = {};
OSRM.Control = {};
OSRM.G = OSRM.GLOBALS;
OSRM.C = OSRM.CONSTANTS;
OSRM.DEFAULTS = {ROUTING_ENGINES: [{url: "http://router.project-osrm.org/viaroute", timestamp: "http://router.project-osrm.org/timestamp", metric: 0, label: "ENGINE_0", }], WEBSITE_URL: document.URL.replace(/#*(\?.*|$)/i, ""), HOST_GEOCODER_URL: "http://nominatim.openstreetmap.org/search", HOST_REVERSE_GEOCODER_URL: "http://nominatim.openstreetmap.org/reverse", HOST_SHORTENER_URL: "http://map.project-osrm.org/shorten/", SHORTENER_PARAMETERS: "%url&jsonp=%jsonp", SHORTENER_REPLY_PARAMETER: "ShortURL", ROUTING_ENGINE: 0, DISTANCE_FORMAT: 0, GEOCODER_BOUNDS: "", ZOOM_LEVEL: 14, HIGHLIGHT_ZOOM_LEVEL: 16, JSONP_TIMEOUT: 10000, ONLOAD_ZOOM_LEVEL: 5, ONLOAD_LATITUDE: 48.84, ONLOAD_LONGITUDE: 10.1, ONLOAD_SOURCE: "", ONLOAD_TARGET: "", LANGUAGE: "en", LANGUAGE_USE_BROWSER_SETTING: true, LANUGAGE_ONDEMAND_RELOADING: true, LANGUAGE_SUPPORTED: [{encoding: "en", name: "English"}, {encoding: "bg", name: "Български"}, {encoding: "cs", name: "Česky"}, {encoding: "de", name: "Deutsch"}, {encoding: "da", name: "Dansk"}, {encoding: "el", name: "Ελληνικά"}, {encoding: "es", name: "Español"}, {encoding: "fi", name: "Suomi"}, {encoding: "fr", name: "Français"}, {encoding: "it", name: "Italiano"}, {encoding: "ja", name: "日本人"}, {encoding: "ka", name: "ქართული"}, {encoding: "lv", name: "Latviešu"}, {encoding: "nb", name: "Bokmål"}, {encoding: "pl", name: "Polski"}, {encoding: "pt", name: "Portugues"}, {encoding: "ro", name: "Română"}, {encoding: "ru", name: "Русский"}, {encoding: "sk", name: "Slovensky"}, {encoding: "sv", name: "Svenska"}, {encoding: "ta", name: "தமிழ்"}, {encoding: "tr", name: "Türkçe"}, {encoding: "uk", name: "Українська"}], TILE_SERVERS: [{display_name: "osm.org", url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL), Imagery © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (CC-BY-SA)', options: {maxZoom: 18}}, {display_name: "osm.de", url: "http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL), Imagery © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (CC-BY-SA)', options: {maxZoom: 18}}, {display_name: "MapQuest", url: "http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL), Imagery © <a href="http://www.mapquest.de/">MapQuest</a>', options: {maxZoom: 18, subdomains: "1234"}}, {display_name: "CloudMade", url: "http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png", attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL), Imagery © <a href="http://cloudmade.com/">CloudMade</a>', options: {maxZoom: 18}}, {display_name: "Bing Road", apikey: "AjCb2f6Azv_xt9c6pl_xok96bgAYrXQNctnG4o07sTj4iS9N68Za4B3pRJyeCjGr", options: {type: "Road", minZoom: 1}, attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL)', bing: true, }, {display_name: "Bing Aerial", apikey: "AjCb2f6Azv_xt9c6pl_xok96bgAYrXQNctnG4o07sTj4iS9N68Za4B3pRJyeCjGr", options: {type: "Aerial", minZoom: 1}, attribution: 'Data © <a href="http://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors (ODbL)', bing: true, }], OVERLAY_SERVERS: [{display_name: "Small Components", url: "http://tools.geofabrik.de/osmi/tiles/routing_i/{z}/{x}/{y}.png", attribution: "", options: {}}], NOTIFICATIONS: {LOCALIZATION: 1800000, CLICKING: 60000, DRAGGING: 120000, MAINTENANCE: false}, OVERRIDE_MAINTENANCE_NOTIFICATION_HEADER: undefined, OVERRIDE_MAINTENANCE_NOTIFICATION_BODY: undefined};
(function() {
    var a = navigator.userAgent;
    OSRM.Browser = {FF3: a.search(/Firefox\/3/), IE6_7: a.search(/MSIE (6|7)/), IE6_8: a.search(/MSIE (6|7|8)/), IE6_9: a.search(/MSIE (6|7|8|9)/)}
}());
document.head = document.head || document.getElementsByTagName("head")[0];
OSRM.Browser.getElementsByClassName = function(g, h) {
    var b = [];
    var f = new RegExp("(^| )" + h + "( |$)");
    var e = g.getElementsByTagName("*");
    for (var d = 0, c = e.length; d < c; d++) {
        if (f.test(e[d].className)) {
            b.push(e[d])
        }
    }
    return b
};
OSRM.Browser.onLoadHandler = function(a, d) {
    d = d || window;
    var c = d.document;
    if (d.addEventListener) {
        var b = function() {
            d.removeEventListener("DOMContentLoaded", arguments.callee, false);
            a.call()
        };
        d.addEventListener("DOMContentLoaded", b, false)
    } else {
        if (c.attachEvent) {
            var b = function() {
                if (c.readyState === "interactive" || c.readyState === "complete") {
                    c.detachEvent("onreadystatechange", arguments.callee);
                    a.call()
                }
            };
            c.attachEvent("onreadystatechange", b)
        }
    }
};
OSRM.Browser.onUnloadHandler = function(a, c) {
    c = c || window;
    var b = c.document;
    if (c.addEventListener) {
        c.addEventListener("unload", a, false)
    } else {
        if (b.attachEvent) {
            b.attachEvent("onunload", a)
        }
    }
};
(function() {
    var a = function() {
    };
    OSRM.inheritFrom = function(b, c) {
        a.prototype = c.prototype;
        b.prototype = new a();
        b.prototype.constructor = b;
        b.prototype.base = c.prototype
    }
}());
OSRM.extend = function(a, b) {
    for (property in b) {
        a.prototype[property] = b[property]
    }
};
OSRM.bind = function(a, b) {
    return function() {
        b.apply(a, arguments)
    }
};
OSRM.concat = function(b, a) {
    return function() {
        b.apply(this, arguments);
        a.apply(this, arguments)
    }
};
OSRM.init = function() {
    if (OSRM.checkOldBrowser() == true) {
        return
    }
    OSRM.showHTML();
    OSRM.prefetchImages();
    OSRM.prefetchIcons();
    OSRM.prefetchCSSIcons();
    OSRM.GUI.init();
    OSRM.Map.init();
    OSRM.Printing.init();
    OSRM.Routing.init();
    OSRM.RoutingAlternatives.init();
    OSRM.Localization.init();
    OSRM.parseParameters();
    if (OSRM.GUI.inMaintenance() == true) {
        return
    }
    if (OSRM.G.initial_position_override == false) {
        OSRM.Map.initPosition()
    }
    OSRM.Map.initFinally()
};
OSRM.GLOBALS.images = {};
OSRM.prefetchImages = function() {
    var b = [{id: "marker-shadow", url: "leaflet/images/marker-shadow.png"}, {id: "marker-source", url: "images/marker-source.png"}, {id: "marker-target", url: "images/marker-target.png"}, {id: "marker-via", url: "images/marker-via.png"}, {id: "marker-highlight", url: "images/marker-highlight.png"}, {id: "marker-source-drag", url: "images/marker-source-drag.png"}, {id: "marker-target-drag", url: "images/marker-target-drag.png"}, {id: "marker-via-drag", url: "images/marker-via-drag.png"}, {id: "marker-highlight-drag", url: "images/marker-highlight-drag.png"}, {id: "marker-drag", url: "images/marker-drag.png"}, {id: "cancel", url: "images/cancel.png"}, {id: "cancel_active", url: "images/cancel_active.png"}, {id: "cancel_hover", url: "images/cancel_hover.png"}, {id: "restore", url: "images/restore.png"}, {id: "restore_active", url: "images/restore_active.png"}, {id: "restore_hover", url: "images/restore_hover.png"}, {id: "up", url: "images/up.png"}, {id: "up_active", url: "images/up_active.png"}, {id: "up_hover", url: "images/up_hover.png"}, {id: "down", url: "images/down.png"}, {id: "down_active", url: "images/down_active.png"}, {id: "down_hover", url: "images/down_hover.png"}, {id: "config", url: "images/config.png"}, {id: "config_active", url: "images/config_active.png"}, {id: "config_hover", url: "images/config_hover.png"}, {id: "mapping", url: "images/mapping.png"}, {id: "mapping_active", url: "images/mapping_active.png"}, {id: "mapping_hover", url: "images/mapping_hover.png"}, {id: "printer", url: "images/printer.png"}, {id: "printer_active", url: "images/printer_active.png"}, {id: "printer_hover", url: "images/printer_hover.png"}, {id: "printer_inactive", url: "images/printer_inactive.png"}, {id: "zoom_in", url: "images/zoom_in.png"}, {id: "zoom_in_active", url: "images/zoom_in_active.png"}, {id: "zoom_in_hover", url: "images/zoom_in_hover.png"}, {id: "zoom_out", url: "images/zoom_out.png"}, {id: "zoom_out_active", url: "images/zoom_out_active.png"}, {id: "zoom_out_hover", url: "images/zoom_out_hover.png"}, {id: "locations_user", url: "images/locations_user.png"}, {id: "locations_user_active", url: "images/locations_user_active.png"}, {id: "locations_user_hover", url: "images/locations_user_hover.png"}, {id: "locations_user_inactive", url: "images/locations_user_inactive.png"}, {id: "locations_route", url: "images/locations_route.png"}, {id: "locations_route_active", url: "images/locations_route_active.png"}, {id: "locations_route_hover", url: "images/locations_route_hover.png"}, {id: "locations_route_inactive", url: "images/locations_route_inactive.png"}, {id: "layers", url: "images/layers.png"}, {id: "direction_0", url: "images/default.png"}, {id: "direction_1", url: "images/continue.png"}, {id: "direction_2", url: "images/slight-right.png"}, {id: "direction_3", url: "images/turn-right.png"}, {id: "direction_4", url: "images/sharp-right.png"}, {id: "direction_5", url: "images/u-turn.png"}, {id: "direction_6", url: "images/sharp-left.png"}, {id: "direction_7", url: "images/turn-left.png"}, {id: "direction_8", url: "images/slight-left.png"}, {id: "direction_10", url: "images/head.png"}, {id: "direction_11", url: "images/round-about.png"}, {id: "direction_15", url: "images/target.png"}, {id: "osrm-logo", url: "images/osrm-logo.png"}, {id: "selector", url: "images/selector.png"}];
    for (var a = 0; a < b.length; a++) {
        OSRM.G.images[b[a].id] = new Image();
        OSRM.G.images[b[a].id].src = b[a].url
    }
};
OSRM.GLOBALS.icons = {};
OSRM.prefetchIcons = function() {
    var b = [{id: "marker-source", image_id: "marker-source"}, {id: "marker-target", image_id: "marker-target"}, {id: "marker-via", image_id: "marker-via"}, {id: "marker-highlight", image_id: "marker-highlight"}, {id: "marker-source-drag", image_id: "marker-source-drag"}, {id: "marker-target-drag", image_id: "marker-target-drag"}, {id: "marker-via-drag", image_id: "marker-via-drag"}, {id: "marker-highlight-drag", image_id: "marker-highlight-drag"}];
    var a = L.LabelMarkerIcon.extend({options: {shadowUrl: OSRM.G.images["marker-shadow"].getAttribute("src"), iconSize: [25, 41], shadowSize: [41, 41], iconAnchor: [13, 41], shadowAnchor: [13, 41], popupAnchor: [0, -33]}});
    for (var c = 0; c < b.length; c++) {
        OSRM.G.icons[b[c].id] = new a({iconUrl: OSRM.G.images[b[c].image_id].getAttribute("src")})
    }
    OSRM.G.icons["marker-drag"] = new L.LabelMarkerIcon({iconUrl: OSRM.G.images["marker-drag"].getAttribute("src"), iconSize: new L.Point(18, 18)})
};
OSRM.prefetchCSSIcons = function() {
    var c = [{id: "#gui-printer-inactive", image_id: "printer_inactive"}, {id: "#gui-printer", image_id: "printer"}, {id: "#gui-printer:hover", image_id: "printer_hover"}, {id: "#gui-printer:active", image_id: "printer_active"}, {id: ".gui-zoom-in", image_id: "zoom_in"}, {id: ".gui-zoom-in:hover", image_id: "zoom_in_hover"}, {id: ".gui-zoom-in:active", image_id: "zoom_in_active"}, {id: ".gui-zoom-out", image_id: "zoom_out"}, {id: ".gui-zoom-out:hover", image_id: "zoom_out_hover"}, {id: ".gui-zoom-out:active", image_id: "zoom_out_active"}, {id: ".gui-locations-user-inactive", image_id: "locations_user_inactive"}, {id: ".gui-locations-user", image_id: "locations_user"}, {id: ".gui-locations-user:hover", image_id: "locations_user_hover"}, {id: ".gui-locations-user:active", image_id: "locations_user_active"}, {id: ".gui-locations-route-inactive", image_id: "locations_route_inactive"}, {id: ".gui-locations-route", image_id: "locations_route"}, {id: ".gui-locations-route:hover", image_id: "locations_route_hover"}, {id: ".gui-locations-route:active", image_id: "locations_route_active"}, {id: ".gui-layers", image_id: "layers"}, {id: ".cancel-marker", image_id: "cancel"}, {id: ".cancel-marker:hover", image_id: "cancel_hover"}, {id: ".cancel-marker:active", image_id: "cancel_active"}, {id: ".up-marker", image_id: "up"}, {id: ".up-marker:hover", image_id: "up_hover"}, {id: ".up-marker:active", image_id: "up_active"}, {id: ".down-marker", image_id: "down"}, {id: ".down-marker:hover", image_id: "down_hover"}, {id: ".down-marker:active", image_id: "down_active"}, {id: "#input-mask-header", image_id: "osrm-logo"}, {id: ".styled-select", image_id: "selector"}, {id: "#config-handle-icon", image_id: "config"}, {id: "#config-handle-icon:hover", image_id: "config_hover"}, {id: "#config-handle-icon:active", image_id: "config_active"}, {id: "#mapping-handle-icon", image_id: "mapping"}, {id: "#mapping-handle-icon:hover", image_id: "mapping_hover"}, {id: "#mapping-handle-icon:active", image_id: "mapping_active"}, {id: "#main-handle-icon", image_id: "restore"}, {id: "#main-handle-icon:hover", image_id: "restore_hover"}, {id: "#main-handle-icon:active", image_id: "restore_active"}];
    var b = OSRM.CSS.getStylesheet("main.css");
    for (var a = 0; a < c.length; a++) {
        OSRM.CSS.insert(b, c[a].id, "background-image:url(" + OSRM.G.images[c[a].image_id].getAttribute("src") + ");")
    }
};
OSRM.checkOldBrowser = function() {
    if (OSRM.Browser.IE6_7 == -1) {
        return false
    }
    document.getElementById("old-browser-warning").style.display = "block";
    return true
};
OSRM.showHTML = function() {
    document.getElementById("map").style.display = "block";
    document.getElementById("gui").style.display = "block"
};
OSRM.parseParameters = function() {
    var d = document.location.search.substr(1, document.location.search.length);
    OSRM.G.initial_position_override = false;
    if (d.length > 1000 || d.length == 0) {
        return
    }
    var e = {};
    var m = d.split("&");
    for (var f = 0; f < m.length; f++) {
        var l = m[f].split("=");
        if (l.length != 2) {
            continue
        }
        if (l[0] == "hl") {
            OSRM.Localization.setLanguage(l[1])
        } else {
            if (l[0] == "df") {
                var j = parseInt(l[1]);
                if (j != 0 && j != 1) {
                    return
                }
                OSRM.GUI.setDistanceFormat(j)
            } else {
                if (l[0] == "loc") {
                    var k = unescape(l[1]).split(",");
                    if (k.length != 2 || !OSRM.Utils.isLatitude(k[0]) || !OSRM.Utils.isLongitude(k[1])) {
                        return
                    }
                    e.positions = e.positions || [];
                    e.positions.push(new L.LatLng(k[0], k[1]))
                } else {
                    if (l[0] == "dest") {
                        var k = unescape(l[1]).split(",");
                        if (k.length != 2 || !OSRM.Utils.isLatitude(k[0]) || !OSRM.Utils.isLongitude(k[1])) {
                            return
                        }
                        e.destination = new L.LatLng(k[0], k[1])
                    } else {
                        if (l[0] == "destname") {
                            e.destination_name = decodeURI(l[1]).replace(/<\/?[^>]+(>|$)/g, "")
                        } else {
                            if (l[0] == "z") {
                                var g = Number(l[1]);
                                if (g < 0 || g > 18) {
                                    return
                                }
                                e.zoom = g
                            } else {
                                if (l[0] == "center") {
                                    var k = unescape(l[1]).split(",");
                                    if (k.length != 2 || !OSRM.Utils.isLatitude(k[0]) || !OSRM.Utils.isLongitude(k[1])) {
                                        return
                                    }
                                    e.center = new L.LatLng(k[0], k[1])
                                } else {
                                    if (l[0] == "alt") {
                                        var c = Number(l[1]);
                                        if (c < 0 || c > OSRM.RoutingAlternatives > 10) {
                                            return
                                        }
                                        e.active_alternative = c
                                    } else {
                                        if (l[0] == "re") {
                                            var b = Number(l[1]);
                                            if (b < 0 || b >= OSRM.DEFAULTS.ROUTING_ENGINES.length) {
                                                return
                                            }
                                            e.active_routing_engine = b
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (OSRM.GUI.inMaintenance() == true) {
        return
    }
    if (e.destination) {
        var h = OSRM.G.markers.setTarget(e.destination);
        if (e.destination_name) {
            OSRM.G.markers.route[h].description = e.destination_name
        } else {
            OSRM.Geocoder.updateAddress(OSRM.C.TARGET_LABEL, OSRM.C.DO_FALLBACK_TO_LAT_LNG)
        }
        OSRM.G.markers.route[h].show();
        OSRM.G.markers.route[h].centerView(e.zoom);
        OSRM.G.initial_position_override = true;
        return
    }
    if (e.positions) {
        if (e.positions.length > 0) {
            OSRM.G.markers.setSource(e.positions[0]);
            OSRM.Geocoder.updateAddress(OSRM.C.SOURCE_LABEL, OSRM.C.DO_FALLBACK_TO_LAT_LNG)
        }
        if (e.positions.length > 1) {
            OSRM.G.markers.setTarget(e.positions[e.positions.length - 1]);
            OSRM.Geocoder.updateAddress(OSRM.C.TARGET_LABEL, OSRM.C.DO_FALLBACK_TO_LAT_LNG)
        }
        for (var f = 1; f < e.positions.length - 1; f++) {
            OSRM.G.markers.setVia(f - 1, e.positions[f])
        }
        for (var f = 0; f < OSRM.G.markers.route.length; f++) {
            OSRM.G.markers.route[f].show()
        }
        if (e.zoom == null || e.center == null) {
            var a = new L.LatLngBounds(e.positions);
            OSRM.G.map.fitBoundsUI(a)
        } else {
            OSRM.G.map.setView(e.center, e.zoom)
        }
        OSRM.G.active_alternative = e.active_alternative || 0;
        OSRM.GUI.setRoutingEngine(e.active_routing_engine || OSRM.DEFAULTS.ROUTING_ENGINE);
        OSRM.Routing.getRoute({keepAlternative: true});
        OSRM.G.initial_position_override = true;
        return
    }
    return
};
OSRM.Browser.onLoadHandler(OSRM.init);
OSRM.Control.Attribution = L.Control.extend({options: {position: "bottomright", prefix: 'Powered by <a href="http://leaflet.cloudmade.com">Leaflet</a>', postfix: ""}, initialize: function(a) {
        L.Util.setOptions(this, a);
        this._attributions = {}
    }, onAdd: function(a) {
        this._container = L.DomUtil.create("div", "leaflet-control-attribution");
        L.DomEvent.disableClickPropagation(this._container);
        a.on("layeradd", this._onLayerAdd, this).on("layerremove", this._onLayerRemove, this);
        this._update();
        return this._container
    }, onRemove: function(a) {
        a.off("layeradd", this._onLayerAdd).off("layerremove", this._onLayerRemove)
    }, setPrefix: function(a) {
        this.options.prefix = a;
        this._update();
        return this
    }, setPostfix: function(a) {
        this.options.postfix = a;
        this._update();
        return this
    }, addAttribution: function(a) {
        if (!a) {
            return
        }
        if (!this._attributions[a]) {
            this._attributions[a] = 0
        }
        this._attributions[a]++;
        this._update();
        return this
    }, removeAttribution: function(a) {
        if (!a) {
            return
        }
        this._attributions[a]--;
        this._update();
        return this
    }, _update: function() {
        if (!this._map) {
            return
        }
        var c = [];
        for (var a in this._attributions) {
            if (this._attributions.hasOwnProperty(a) && this._attributions[a]) {
                c.push(a)
            }
        }
        var b = [];
        if (this.options.prefix) {
            b.push(this.options.prefix)
        }
        if (c.length) {
            b.push(c.join(", "))
        }
        if (this.options.postfix) {
            b.push(this.options.postfix)
        }
        this._container.innerHTML = b.join(" &#8212; ")
    }, _onLayerAdd: function(a) {
        if (a.layer.getAttribution) {
            this.addAttribution(a.layer.getAttribution())
        }
    }, _onLayerRemove: function(a) {
        if (a.layer.getAttribution) {
            this.removeAttribution(a.layer.getAttribution())
        }
    }});
OSRM.Control.Layers = L.Control.Layers.extend({getActiveLayerName: function() {
        var c, b, e, a = this._form.getElementsByTagName("input"), d = a.length;
        for (c = 0; c < d; c++) {
            b = a[c];
            e = this._layers[b.layerId];
            if (b.checked && !e.overlay) {
                return e.name
            }
        }
    }, getActiveLayer: function() {
        var c, b, e, a = this._form.getElementsByTagName("input"), d = a.length;
        for (c = 0; c < d; c++) {
            b = a[c];
            e = this._layers[b.layerId];
            if (b.checked && !e.overlay) {
                return e.layer
            }
        }
    }, setLayerLabels: function() {
        var d, b, a = this._form.getElementsByTagName("input"), e = a.length;
        tileServers = OSRM.DEFAULTS.TILE_SERVERS.length;
        for (d = 0; d < e; d++) {
            b = a[d];
            if (d < tileServers) {
                if (OSRM.loc("TILE_SERVER_" + d) == "TILE_SERVER_" + d) {
                    b.parentNode.lastChild.textContent = " " + OSRM.DEFAULTS.TILE_SERVERS[d].display_name
                } else {
                    b.parentNode.lastChild.textContent = " " + OSRM.loc("TILE_SERVER_" + d)
                }
            } else {
                var c = d - tileServers;
                if (OSRM.loc("OVERLAY_SERVER_" + c) == "OVERLAY_SERVER_" + c) {
                    b.parentNode.lastChild.textContent = " " + OSRM.DEFAULTS.OVERLAY_SERVERS[c].display_name
                } else {
                    b.parentNode.lastChild.textContent = " " + OSRM.loc("OVERLAY_SERVER_" + c)
                }
            }
        }
    }, _initLayout: function() {
        L.Control.Layers.prototype._initLayout.apply(this);
        this._container.className = "box-wrapper gui-control-wrapper";
        this._layersLink.className = "box-content gui-control gui-layers";
        this._form.className = "box-content gui-control gui-layers-list medium-font";
        this._baseLayersList.className = "gui-layers-base";
        this._separator.className = "gui-layers-separator";
        this._overlaysList.className = "gui-layers-overlays"
    }, _expand: function() {
        L.DomUtil.addClass(this._container, "gui-layers-expanded")
    }, _collapse: function() {
        this._container.className = this._container.className.replace(" gui-layers-expanded", "")
    }, _onInputClick: function() {
        var c, b, e, a = this._form.getElementsByTagName("input"), d = a.length;
        for (c = 0; c < d; c++) {
            b = a[c];
            e = this._layers[b.layerId];
            if (!b.checked) {
                this._map.removeLayer(e.layer)
            }
        }
        for (c = 0; c < d; c++) {
            b = a[c];
            e = this._layers[b.layerId];
            if (b.checked) {
                this._map.addLayer(e.layer, !e.overlay)
            }
        }
    }});
OSRM.Control.Locations = L.Control.extend({options: {position: "topright"}, onAdd: function(b) {
        var a = L.DomUtil.create("div", "box-wrapper gui-control-wrapper");
        L.DomEvent.disableClickPropagation(a);
        this._userButton = this._createButton("gui-locations-user", a, OSRM.GUI.zoomOnUser, b, !!navigator.geolocation);
        this._routeButton = this._createButton("gui-locations-route", a, OSRM.GUI.zoomOnRoute, b, false);
        this._container = a;
        return a
    }, _createButton: function(h, a, e, b, d) {
        var c = (d == false) ? "-inactive" : "";
        var g = "box-content gui-control" + c + " " + h + c;
        var f = L.DomUtil.create("a", g, a);
        f.title = h;
        L.DomEvent.on(f, "click", L.DomEvent.stopPropagation).on(f, "click", L.DomEvent.preventDefault).on(f, "click", e, b).on(f, "dblclick", L.DomEvent.stopPropagation);
        return f
    }, activateRoute: function() {
        this._routeButton.className = "box-content gui-control gui-locations-route"
    }, deactivateRoute: function() {
        this._routeButton.className = "box-content gui-control-inactive gui-locations-route-inactive"
    }, setTooltips: function(b, a) {
        this._userButton.title = b;
        this._routeButton.title = a
    }});
OSRM.Control.Zoom = L.Control.extend({options: {position: "topleft"}, onAdd: function(b) {
        var a = L.DomUtil.create("div", "box-wrapper gui-control-wrapper");
        L.DomEvent.disableClickPropagation(a);
        this._zoomIn = this._createButton("gui-zoom-in", a, b.zoomIn, b, true);
        this._zoomOut = this._createButton("gui-zoom-out", a, b.zoomOut, b, true);
        this._container = a;
        return a
    }, _createButton: function(h, a, e, b, d) {
        var c = (d == false) ? "-inactive" : "";
        var g = "box-content gui-control" + c + " " + h + c;
        var f = L.DomUtil.create("a", g, a);
        f.title = h;
        L.DomEvent.on(f, "click", L.DomEvent.stopPropagation).on(f, "click", L.DomEvent.preventDefault).on(f, "click", e, b).on(f, "dblclick", L.DomEvent.stopPropagation);
        return f
    }, hide: function() {
        if (this._container) {
            this._container.style.visibility = "hidden"
        }
    }, show: function() {
        if (this._container) {
            this._container.style.top = "5px";
            this._container.style.left = (OSRM.G.main_handle.boxVisible() == true ? (OSRM.G.main_handle.boxWidth() + 10) : "30") + "px";
            this._container.style.visibility = "visible"
        }
    }, setTooltips: function(b, a) {
        this._zoomIn.title = b;
        this._zoomOut.title = a
    }});
OSRM.Control.Map = L.Map.extend({_boundsInsideView: function(c) {
        var d = this.getBounds(), b = this.project(d.getSouthWest()), f = this.project(d.getNorthEast()), a = this.project(c.getSouthWest()), e = this.project(c.getNorthEast());
        if (f.y > e.y) {
            return false
        }
        if (f.x < e.x) {
            return false
        }
        if (b.y < a.y) {
            return false
        }
        if (b.x > a.x) {
            return false
        }
        return true
    }, setViewBounds: function(b) {
        var a = this.getBoundsZoom(b);
        if (this._zoom > a) {
            this.setView(b.getCenter(), a)
        } else {
            if (!this._boundsInsideView(b)) {
                this.setView(b.getCenter(), this._zoom)
            }
        }
    }, setViewUI: function(b, d, c) {
        if (OSRM.G.main_handle.boxVisible()) {
            var a = this.project(b, d);
            a.x -= OSRM.G.main_handle.boxWidth() / 2;
            b = this.unproject(a, d)
        }
        this.setView(b, d, c)
    }, setViewBoundsUI: function(d) {
        var e = d.getSouthWest();
        var c = d.getNorthEast();
        var b = this.getBoundsZoom(d);
        var a = this.project(e, b);
        if (OSRM.G.main_handle.boxVisible()) {
            a.x -= OSRM.G.main_handle.boxWidth() + 20
        } else {
            a.x -= 20
        }
        a.y += 20;
        var f = this.project(c, b);
        f.y -= 20;
        f.x += 20;
        d.extend(this.unproject(a, b));
        d.extend(this.unproject(f, b));
        this.setViewBounds(d)
    }, fitBoundsUI: function(d) {
        var e = d.getSouthWest();
        var c = d.getNorthEast();
        var b = this.getBoundsZoom(d);
        var a = this.project(e, b);
        if (OSRM.G.main_handle.boxVisible()) {
            a.x -= OSRM.G.main_handle.boxWidth() + 20
        } else {
            a.x -= 20
        }
        a.y += 20;
        var f = this.project(c, b);
        f.y -= 20;
        f.x += 20;
        d.extend(this.unproject(a, b));
        d.extend(this.unproject(f, b));
        this.fitBounds(d)
    }, getBoundsUI: function(d) {
        var b = this.getPixelBounds();
        if (OSRM.G.main_handle.boxVisible()) {
            b.min.x += OSRM.G.main_handle.boxWidth()
        }
        var a = this.unproject(new L.Point(b.min.x, b.max.y), this._zoom, true), c = this.unproject(new L.Point(b.max.x, b.min.y), this._zoom, true);
        return new L.LatLngBounds(a, c)
    }, getCenterUI: function(b) {
        var a = this.getSize();
        if (OSRM.G.main_handle.boxVisible()) {
            a.x += OSRM.G.main_handle.boxWidth()
        }
        var c = this._getTopLeftPoint().add(a.divideBy(2));
        return this.unproject(c, this._zoom, b)
    }, getActiveLayerId: function() {
        var d = 0;
        var c = OSRM.DEFAULTS.TILE_SERVERS;
        var e = this.layerControl.getActiveLayerName();
        for (var b = 0, a = c.length; b < a; b++) {
            if (c[b].display_name == e) {
                d = b;
                break
            }
        }
        return d
    }});
OSRM.Marker = function(b, c, a) {
    this.label = b ? b : "marker";
    this.position = a ? a : new L.LatLng(0, 0);
    this.description = null;
    this.marker = new L.LabelMarker(this.position, c);
    this.marker.parent = this;
    this.shown = false;
    this.hint = null
};
OSRM.extend(OSRM.Marker, {show: function() {
        OSRM.G.map.addLayer(this.marker);
        this.shown = true
    }, hide: function() {
        OSRM.G.map.removeLayer(this.marker);
        this.shown = false;
        if (this.label == "highlight") {
            if (this.description) {
                var a = document.getElementById("description-" + this.description);
                a && (a.className = "description-body-item");
                this.description = null
            }
        }
    }, setPosition: function(a) {
        this.position = a;
        this.marker.setLatLng(a);
        this.hint = null
    }, getPosition: function() {
        return this.position
    }, getLat: function() {
        return this.position.lat
    }, getLng: function() {
        return this.position.lng
    }, isShown: function() {
        return this.shown
    }, centerView: function(a) {
        if (a == undefined) {
            a = OSRM.DEFAULTS.ZOOM_LEVEL
        }
        OSRM.G.map.setViewUI(this.position, a)
    }, toString: function() {
        return'OSRM.Marker: "' + this.label + '", ' + this.position + ")"
    }});
OSRM.RouteMarker = function(b, c, a) {
    c.baseicon = c.icon;
    OSRM.RouteMarker.prototype.base.constructor.apply(this, arguments);
    this.label = b ? b : "route_marker";
    this.marker.on("click", this.onClick);
    this.marker.on("drag", this.onDrag);
    this.marker.on("dragstart", this.onDragStart);
    this.marker.on("dragend", this.onDragEnd)
};
OSRM.inheritFrom(OSRM.RouteMarker, OSRM.Marker);
OSRM.extend(OSRM.RouteMarker, {onClick: function(b) {
        for (var a = 0; a < OSRM.G.markers.route.length; a++) {
            if (OSRM.G.markers.route[a].marker === this) {
                OSRM.G.markers.removeMarker(a);
                break
            }
        }
        OSRM.Routing.getRoute();
        OSRM.G.markers.highlight.hide();
        OSRM.G.markers.dragger.hide()
    }, onDrag: function(a) {
        this.parent.setPosition(a.target.getLatLng());
        if (OSRM.G.markers.route.length > 1) {
            OSRM.Routing.getRoute_Dragging()
        }
        OSRM.Geocoder.updateLocation(this.parent.label)
    }, onDragStart: function(b) {
        OSRM.GUI.deactivateTooltip("DRAGGING");
        OSRM.G.dragging = true;
        this.changeIcon(this.options.dragicon);
        this.parent.description = null;
        for (var a = 0; a < OSRM.G.markers.route.length; a++) {
            if (OSRM.G.markers.route[a].marker === this) {
                OSRM.G.dragid = a;
                break
            }
        }
        if (this.parent != OSRM.G.markers.highlight) {
            OSRM.G.markers.highlight.hide()
        }
        if (this.parent != OSRM.G.markers.dragger) {
            OSRM.G.markers.dragger.hide()
        }
        if (OSRM.G.route.isShown()) {
            OSRM.G.route.showOldRoute()
        }
    }, onDragEnd: function(a) {
        OSRM.G.dragging = false;
        this.changeIcon(this.options.baseicon);
        this.parent.setPosition(a.target.getLatLng());
        if (OSRM.G.route.isShown()) {
            OSRM.Routing.getRoute();
            OSRM.G.route.hideOldRoute();
            OSRM.G.route.hideUnnamedRoute()
        } else {
            OSRM.Geocoder.updateAddress(this.parent.label);
            OSRM.GUI.clearResults()
        }
    }, toString: function() {
        return'OSRM.RouteMarker: "' + this.label + '", ' + this.position + ")"
    }});
OSRM.DragMarker = function(b, c, a) {
    OSRM.DragMarker.prototype.base.constructor.apply(this, arguments);
    this.label = b ? b : "drag_marker"
};
OSRM.inheritFrom(OSRM.DragMarker, OSRM.RouteMarker);
OSRM.extend(OSRM.DragMarker, {onClick: function(b) {
        if (this.parent != OSRM.G.markers.dragger) {
            this.parent.hide()
        } else {
            var a = OSRM.Via.findViaIndex(b.target.getLatLng());
            OSRM.G.markers.route.splice(a + 1, 0, this.parent);
            OSRM.RouteMarker.prototype.onDragStart.call(this, b);
            OSRM.G.markers.route[OSRM.G.dragid] = new OSRM.RouteMarker(OSRM.C.VIA_LABEL, {draggable: true, icon: OSRM.G.icons["marker-via"], dragicon: OSRM.G.icons["marker-via-drag"]}, b.target.getLatLng());
            OSRM.G.markers.route[OSRM.G.dragid].show();
            OSRM.RouteMarker.prototype.onDragEnd.call(this, b);
            this.parent.hide()
        }
    }, onDragStart: function(b) {
        var a = OSRM.Via.findViaIndex(b.target.getLatLng());
        OSRM.G.markers.route.splice(a + 1, 0, this.parent);
        OSRM.RouteMarker.prototype.onDragStart.call(this, b)
    }, onDragEnd: function(a) {
        OSRM.G.markers.route[OSRM.G.dragid] = new OSRM.RouteMarker(OSRM.C.VIA_LABEL, {draggable: true, icon: OSRM.G.icons["marker-via"], dragicon: OSRM.G.icons["marker-via-drag"]}, a.target.getLatLng());
        OSRM.G.markers.route[OSRM.G.dragid].show();
        OSRM.RouteMarker.prototype.onDragEnd.call(this, a);
        this.parent.hide()
    }, toString: function() {
        return'OSRM.DragMarker: "' + this.label + '", ' + this.position + ")"
    }});
OSRM.SimpleRoute = function(a, b) {
    this.label = (a ? a : "route");
    this.route = new L.Polyline([], b);
    this.shown = false;
    this.route.on("click", this.onClick)
};
OSRM.extend(OSRM.SimpleRoute, {show: function() {
        OSRM.G.map.addLayer(this.route);
        this.shown = true
    }, hide: function() {
        OSRM.G.map.removeLayer(this.route);
        this.shown = false
    }, isShown: function() {
        return this.shown
    }, getPoints: function() {
        return this.route._originalPoints
    }, getPositions: function() {
        return this.route.getLatLngs()
    }, setPositions: function(a) {
        this.route.setLatLngs(a)
    }, setStyle: function(a) {
        this.route.setStyle(a)
    }, centerView: function() {
        var a = new L.LatLngBounds(this.getPositions());
        OSRM.g.map.fitBoundsUI(a)
    }, onClick: function(c) {
        var a = Math.max(0, OSRM.Via.findViaIndex(c.latlng));
        var b = OSRM.G.markers.setVia(a, c.latlng);
        OSRM.G.markers.route[b].show();
        OSRM.Routing.getRoute()
    }, toString: function() {
        return"OSRM.Route(" + this.label + ", " + this.route.getLatLngs().length + " points)"
    }});
OSRM.MultiRoute = function(a) {
    this.label = (a ? a : "multiroute");
    this.route = new L.LayerGroup();
    this.shown = false
};
OSRM.extend(OSRM.MultiRoute, {show: function() {
        OSRM.G.map.addLayer(this.route);
        this.shown = true
    }, hide: function() {
        OSRM.G.map.removeLayer(this.route);
        this.shown = false
    }, isShown: function() {
        return this.shown
    }, addRoute: function(b) {
        var a = new L.Polyline(b);
        a.on("click", function(c) {
            OSRM.G.route.fire("click", c)
        });
        this.route.addLayer(a)
    }, clearRoutes: function() {
        this.route.clearLayers()
    }, setStyle: function(a) {
        this.route.invoke("setStyle", a)
    }, toString: function() {
        return"OSRM.MultiRoute(" + this.label + ")"
    }});
OSRM.GLOBALS.map = null;
OSRM.GLOBALS.localizable_maps = [];
OSRM.Map = {init: function() {
        if (OSRM.G.main_handle == null) {
            OSRM.GUI.init()
        }
        var d = OSRM.DEFAULTS.TILE_SERVERS;
        var f = {};
        for (var c = 0, b = d.length; c < b; c++) {
            if (d[c].bing == true) {
                d[c].options.postfix = d[c].attribution;
                f[d[c].display_name] = new L.BingLayer(d[c].apikey, d[c].options);
                OSRM.G.localizable_maps.push(f[d[c].display_name])
            } else {
                d[c].options.attribution = d[c].attribution;
                f[d[c].display_name] = new L.TileLayer(d[c].url, d[c].options)
            }
            L.Util.stamp(f[d[c].display_name])
        }
        var a = OSRM.DEFAULTS.OVERLAY_SERVERS;
        var e = {};
        for (var c = 0, b = a.length; c < b; c++) {
            a[c].options.attribution = a[c].attribution;
            e[a[c].display_name] = new L.TileLayer(a[c].url, a[c].options);
            L.Util.stamp(e[a[c].display_name])
        }
        OSRM.G.map = new OSRM.Control.Map("map", {center: new L.LatLng(OSRM.DEFAULTS.ONLOAD_LATITUDE, OSRM.DEFAULTS.ONLOAD_LONGITUDE), zoom: OSRM.DEFAULTS.ONLOAD_ZOOM_LEVEL, layers: [], zoomAnimation: false, fadeAnimation: false, zoomControl: false, attributionControl: false});
        OSRM.G.map.attributionControl = new OSRM.Control.Attribution();
        OSRM.G.map.attributionControl.addTo(OSRM.G.map);
        OSRM.G.map.locationsControl = new OSRM.Control.Locations();
        OSRM.G.map.locationsControl.addTo(OSRM.G.map);
        OSRM.G.map.addLayer(f[d[0].display_name]);
        OSRM.G.map.layerControl = new OSRM.Control.Layers(f, e);
        OSRM.G.map.layerControl.addTo(OSRM.G.map);
        OSRM.G.map.zoomControl = new OSRM.Control.Zoom();
        OSRM.G.map.zoomControl.addTo(OSRM.G.map);
        OSRM.G.map.zoomControl.show();
        OSRM.G.map.scaleControl = new L.Control.Scale();
        OSRM.G.map.scaleControl.options.metric = (OSRM.G.DISTANCE_FORMAT != 1);
        OSRM.G.map.scaleControl.options.imperial = (OSRM.G.DISTANCE_FORMAT == 1);
        OSRM.G.map.scaleControl.addTo(OSRM.G.map);
        OSRM.G.map.on("zoomend", OSRM.Map.zoomed);
        OSRM.G.map.on("click", OSRM.Map.click);
        OSRM.G.map.on("contextmenu", OSRM.Map.contextmenu);
        OSRM.G.map.on("mousemove", OSRM.Map.mousemove)
    }, initFinally: function() {
        L.Util.setOptions(OSRM.G.map, {zoomAnimation: true, fadeAnimation: true})
    }, initPosition: function() {
        var a = new L.LatLng(OSRM.DEFAULTS.ONLOAD_LATITUDE, OSRM.DEFAULTS.ONLOAD_LONGITUDE);
        OSRM.G.map.setViewUI(a, OSRM.DEFAULTS.ONLOAD_ZOOM_LEVEL, true);
        if (navigator.geolocation && document.URL.indexOf("file://") == -1) {
            navigator.geolocation.getCurrentPosition(OSRM.Map.geolocationResponse)
        }
    }, zoomed: function(a) {
        if (OSRM.G.dragging) {
            OSRM.Routing.getRoute_Dragging()
        } else {
            OSRM.Routing.getRoute_Redraw({keepAlternative: true})
        }
    }, contextmenu: function(a) {
    }, mousemove: function(a) {
        OSRM.Via.drawDragMarker(a)
    }, click: function(b) {
        OSRM.GUI.deactivateTooltip("CLICKING");
        if (!OSRM.G.markers.hasSource()) {
            var a = OSRM.G.markers.setSource(b.latlng);
            OSRM.Geocoder.updateAddress(OSRM.C.SOURCE_LABEL, OSRM.C.DO_FALLBACK_TO_LAT_LNG);
            OSRM.G.markers.route[a].show();
            OSRM.Routing.getRoute({recenter: OSRM.G.markers.route.length == 2})
        } else {
            if (!OSRM.G.markers.hasTarget()) {
                var a = OSRM.G.markers.setTarget(b.latlng);
                OSRM.Geocoder.updateAddress(OSRM.C.TARGET_LABEL, OSRM.C.DO_FALLBACK_TO_LAT_LNG);
                OSRM.G.markers.route[a].show();
                OSRM.Routing.getRoute({recenter: OSRM.G.markers.route.length == 2})
            }
        }
    }, geolocationResponse: function(a) {
        var b = new L.LatLng(a.coords.latitude, a.coords.longitude);
        OSRM.G.map.setViewUI(b, OSRM.DEFAULTS.ZOOM_LEVEL)
    }};
OSRM.Markers = function() {
    this.route = new Array();
    this.highlight = new OSRM.DragMarker("highlight", {zIndexOffset: -1, draggable: true, icon: OSRM.G.icons["marker-highlight"], dragicon: OSRM.G.icons["marker-highlight-drag"]});
    this.hover = new OSRM.Marker("hover", {zIndexOffset: -1, draggable: false, icon: OSRM.G.icons["marker-highlight"]});
    this.dragger = new OSRM.DragMarker("drag", {draggable: true, icon: OSRM.G.icons["marker-drag"], dragicon: OSRM.G.icons["marker-drag"]})
};
OSRM.extend(OSRM.Markers, {reset: function() {
        for (var a = 0; a < this.route.length; a++) {
            this.route[a].hide()
        }
        this.route.splice(0, this.route.length);
        document.getElementById("gui-delete-source").style.visibility = "hidden";
        document.getElementById("gui-delete-target").style.visibility = "hidden";
        this.highlight.hide();
        this.dragger.hide()
    }, removeVias: function() {
        for (var a = 1; a < this.route.length - 1; a++) {
            this.route[a].hide()
        }
        this.route.splice(1, this.route.length - 2)
    }, setSource: function(a) {
        if (this.route[0] && this.route[0].label == OSRM.C.SOURCE_LABEL) {
            this.route[0].setPosition(a)
        } else {
            this.route.splice(0, 0, new OSRM.RouteMarker(OSRM.C.SOURCE_LABEL, {draggable: true, icon: OSRM.G.icons["marker-source"], dragicon: OSRM.G.icons["marker-source-drag"]}, a))
        }
        document.getElementById("gui-delete-source").style.visibility = "visible";
        return 0
    }, setTarget: function(a) {
        if (this.route[this.route.length - 1] && this.route[this.route.length - 1].label == OSRM.C.TARGET_LABEL) {
            this.route[this.route.length - 1].setPosition(a)
        } else {
            this.route.splice(this.route.length, 0, new OSRM.RouteMarker(OSRM.C.TARGET_LABEL, {draggable: true, icon: OSRM.G.icons["marker-target"], dragicon: OSRM.G.icons["marker-target-drag"]}, a))
        }
        document.getElementById("gui-delete-target").style.visibility = "visible";
        return this.route.length - 1
    }, setVia: function(b, a) {
        if (this.route.length < 2 || b > this.route.length - 2) {
            return -1
        }
        this.route.splice(b + 1, 0, new OSRM.RouteMarker(OSRM.C.VIA_LABEL, {draggable: true, icon: OSRM.G.icons["marker-via"], dragicon: OSRM.G.icons["marker-via-drag"]}, a));
        return b + 1
    }, removeMarker: function(a) {
        if (a >= this.route.length) {
            return
        }
        if (a == 0 && this.route[0].label == OSRM.C.SOURCE_LABEL) {
            this.removeVias();
            document.getElementById("gui-input-source").value = "";
            document.getElementById("gui-delete-source").style.visibility = "hidden";
            OSRM.GUI.clearResults()
        } else {
            if (a == this.route.length - 1 && this.route[this.route.length - 1].label == OSRM.C.TARGET_LABEL) {
                this.removeVias();
                a = this.route.length - 1;
                document.getElementById("gui-input-target").value = "";
                document.getElementById("gui-delete-target").style.visibility = "hidden";
                OSRM.GUI.clearResults()
            }
        }
        this.route[a].hide();
        this.route.splice(a, 1)
    }, reverseDescriptions: function() {
        var d = this.route.length - 1;
        var c = this.route.length / 2;
        for (var b = 0; b < c; ++b) {
            var a = this.route[b].description;
            this.route[b].description = this.route[d - b].description;
            this.route[d - b].description = a
        }
    }, reverseMarkers: function() {
        var d = this.route.length;
        if (d > 1) {
            var b = this.route[0].getPosition();
            this.route[0].setPosition(this.route[d - 1].getPosition());
            this.route[d - 1].setPosition(b);
            var e = this.route[0];
            this.route[0] = this.route[d - 1];
            this.route[d - 1] = e;
            this.route.reverse();
            OSRM.GUI.clearResults()
        } else {
            if (d > 0) {
                var a = this.route[0].getPosition();
                var c = this.route[0].label;
                this.removeMarker(0);
                if (c == OSRM.C.TARGET_LABEL) {
                    this.setSource(a)
                } else {
                    if (c == OSRM.C.SOURCE_LABEL) {
                        this.setTarget(a)
                    }
                }
                this.route[0].show()
            }
        }
    }, hasSource: function() {
        if (this.route[0] && this.route[0].label == OSRM.C.SOURCE_LABEL) {
            return true
        }
        return false
    }, hasTarget: function() {
        if (this.route[this.route.length - 1] && this.route[this.route.length - 1].label == OSRM.C.TARGET_LABEL) {
            return true
        }
        return false
    }, relabelViaMarkers: function() {
        for (var b = 1, a = this.route.length - 1; b < a; b++) {
            this.route[b].marker.setLabel(b)
        }
    }});
OSRM.Route = function() {
    this._current_route = new OSRM.SimpleRoute("current", {dashArray: ""});
    this._alternative_route = new OSRM.SimpleRoute("alternative", {dashArray: ""});
    this._old_route = new OSRM.SimpleRoute("old", {color: "#123", dashArray: ""});
    this._unnamed_route = new OSRM.MultiRoute("unnamed");
    this._current_route_style = {color: "#0033FF", weight: 5, dashArray: ""};
    this._current_noroute_style = {color: "#222222", weight: 2, dashArray: "8,6"};
    this._old_route_style = {color: "#112233", weight: 5, dashArray: ""};
    this._old_noroute_style = {color: "#000000", weight: 2, dashArray: "8,6"};
    this._unnamed_route_style = {color: "#FF00FF", weight: 10, dashArray: ""};
    this._old_unnamed_route_style = {color: "#990099", weight: 10, dashArray: ""};
    this._alternative_route_style = {color: "#770033", weight: 5, opacity: 0.6, dashArray: ""};
    this._noroute = OSRM.Route.ROUTE;
    this._history = new OSRM.HistoryRoute()
};
OSRM.Route.NOROUTE = true;
OSRM.Route.ROUTE = false;
OSRM.extend(OSRM.Route, {showRoute: function(a, b) {
        this._noroute = b;
        this._current_route.setPositions(a);
        if (this._noroute == OSRM.Route.NOROUTE) {
            this._current_route.setStyle(this._current_noroute_style)
        } else {
            this._current_route.setStyle(this._current_route_style)
        }
        this._current_route.show();
        this._history.fetchHistoryRoute();
        this._history.showHistoryRoutes();
        this._history.storeHistoryRoute()
    }, hideRoute: function() {
        this._current_route.hide();
        this._unnamed_route.hide();
        this._history.fetchHistoryRoute();
        this._history.showHistoryRoutes();
        OSRM.GUI.deactivateRouteFeatures()
    }, showUnnamedRoute: function(a) {
        this._unnamed_route.clearRoutes();
        for (var b = 0; b < a.length; b++) {
            this._unnamed_route.addRoute(a[b])
        }
        this._unnamed_route.setStyle(this._unnamed_route_style);
        this._unnamed_route.show()
    }, hideUnnamedRoute: function() {
        this._unnamed_route.hide()
    }, _raiseUnnamedRoute: function() {
        if (this._unnamed_route.isShown()) {
            this._unnamed_route.hide();
            this._unnamed_route.show()
        }
    }, showOldRoute: function() {
        this._old_route.setPositions(this._current_route.getPositions());
        if (this._noroute == OSRM.Route.NOROUTE) {
            this._old_route.setStyle(this._old_noroute_style)
        } else {
            this._old_route.setStyle(this._old_route_style)
        }
        this._old_route.show();
        this._raiseUnnamedRoute();
        this._unnamed_route.setStyle(this._old_unnamed_route_style)
    }, hideOldRoute: function() {
        this._old_route.hide()
    }, showAlternativeRoute: function(a) {
        this._alternative_route.setPositions(a);
        this._alternative_route.setStyle(this._alternative_route_style);
        this._alternative_route.show()
    }, hideAlternativeRoute: function() {
        this._alternative_route.hide()
    }, isShown: function() {
        return this._current_route.isShown()
    }, isRoute: function() {
        return !(this._noroute)
    }, getPositions: function() {
        return this._current_route.getPositions()
    }, getPoints: function() {
        return this._current_route.getPoints()
    }, reset: function() {
        this.hideRoute();
        this._old_route.hide();
        this._noroute = OSRM.Route.ROUTE;
        this._history.clearHistoryRoutes()
    }, fire: function(a, b) {
        this._current_route.route.fire(a, b)
    }, centerView: function() {
        this._current_route.centerView()
    }, activateHistoryRoutes: function() {
        this._history.activate()
    }, deactivateHistoryRoutes: function() {
        this._history.deactivate()
    }});
OSRM.HistoryRoute = function() {
    this._history_styles = [{color: "#FFFFFF", opacity: 0.5, weight: 5, dashArray: ""}, {color: "#0000DD", opacity: 0.45, weight: 5, dashArray: ""}, {color: "#0000BB", opacity: 0.4, weight: 5, dashArray: ""}, {color: "#000099", opacity: 0.35, weight: 5, dashArray: ""}, {color: "#000077", opacity: 0.3, weight: 5, dashArray: ""}, {color: "#000055", opacity: 0.25, weight: 5, dashArray: ""}, {color: "#000033", opacity: 0.2, weight: 5, dashArray: ""}, {color: "#000011", opacity: 0.15, weight: 5, dashArray: ""}, {color: "#000000", opacity: 0.1, weight: 5, dashArray: ""}];
    this._history_length = this._history_styles.length;
    this._history = [];
    for (var b = 0, a = this._history_length; b < a; b++) {
        var c = {};
        c.route = new OSRM.SimpleRoute("current", {dashArray: ""});
        c.markers = [];
        c.checksum = null;
        this._history.push(c)
    }
    this._initiate_redrawHistory = OSRM.bind(this, this._getRoute_RedrawHistory);
    this._callback_redrawHistory = OSRM.bind(this, this._showRoute_RedrawHistory)
};
OSRM.extend(OSRM.HistoryRoute, {activate: function() {
        this.storeHistoryRoute = this._storeHistoryRoute;
        this.fetchHistoryRoute = this._fetchHistoryRoute;
        this.showHistoryRoutes = this._showHistoryRoutes;
        this.clearHistoryRoutes = this._clearHistoryRoutes;
        OSRM.G.map.on("zoomend", this._initiate_redrawHistory);
        this.storeHistoryRoute()
    }, deactivate: function() {
        this.clearHistoryRoutes();
        this.storeHistoryRoute = this.empty;
        this.fetchHistoryRoute = this.empty;
        this.showHistoryRoutes = this.empty;
        this.clearHistoryRoutes = this.empty;
        OSRM.G.map.off("zoomend", this._initiate_redrawHistory)
    }, empty: function() {
    }, storeHistoryRoute: function() {
    }, fetchHistoryRoute: function() {
    }, showHistoryRoutes: function() {
    }, clearHistoryRoutes: function() {
    }, _storeHistoryRoute: function() {
        var b = OSRM.G.route;
        if (!b.isShown() || !b.isRoute()) {
            return
        }
        var c = OSRM.G.response.hint_data;
        this._history[0].route.setPositions(b.getPositions());
        this._history[0].checksum = c.checksum;
        this._history[0].markers = [];
        var f = this._getCurrentMarkers();
        for (var e = 0, d = f.length; e < d; e++) {
            var a = {lat: f[e].lat, lng: f[e].lng, hint: c.locations[e]};
            this._history[0].markers.push(a)
        }
    }, _fetchHistoryRoute: function() {
        if (this._history[0].markers.length == 0) {
            return
        }
        if (OSRM.G.route.isShown() && this._equalMarkers(this._history[0].markers, this._getCurrentMarkers())) {
            return
        }
        if (this._equalMarkers(this._history[0].markers, this._history[1].markers)) {
            return
        }
        for (var a = this._history_length - 1; a > 0; a--) {
            this._history[a].route.setPositions(this._history[a - 1].route.getPositions());
            this._history[a].markers = this._history[a - 1].markers;
            this._history[a].checksum = this._history[a - 1].checksum
        }
        this._history[0].route.setPositions([]);
        this._history[0].markers = [];
        this._history[0].checksum = null
    }, _showHistoryRoutes: function() {
        for (var b = 1, a = this._history_length; b < a; b++) {
            this._history[b].route.setStyle(this._history_styles[b]);
            this._history[b].route.show();
            OSRM.G.route.hideOldRoute()
        }
    }, _clearHistoryRoutes: function() {
        for (var b = 0, a = this._history_length; b < a; b++) {
            this._history[b].route.hide();
            this._history[b].route.setPositions([]);
            this._history[b].markers = [];
            this._history[b].checksum = null
        }
    }, _getCurrentMarkers: function() {
        var b = [];
        var a = OSRM.G.route.getPositions();
        if (a.length == 0) {
            return b
        }
        for (var c = 0; c < OSRM.G.response.via_points.length; c++) {
            b.push({lat: OSRM.G.response.via_points[c][0], lng: OSRM.G.response.via_points[c][1]})
        }
        return b
    }, _equalMarkers: function(a, d) {
        if (a.length != d.length) {
            return false
        }
        for (var c = 0, b = a.length; c < b; c++) {
            if (a[c].lat.toFixed(5) != d[c].lat.toFixed(5) || a[c].lng.toFixed(5) != d[c].lng.toFixed(5)) {
                return false
            }
        }
        return true
    }, _showRoute_RedrawHistory: function(b, c) {
        if (!b) {
            return
        }
        var a = OSRM.RoutingGeometry._decode(b.route_geometry, 5);
        this._history[c].route.setPositions(a);
        this._updateHints(b, c)
    }, _getRoute_RedrawHistory: function() {
        for (var b = 0, a = this._history_length; b < a; b++) {
            if (this._history[b].markers.length > 0) {
                OSRM.JSONP.clear("history" + b);
                OSRM.JSONP.call(this._buildCall(b) + "&instructions=false", this._callback_redrawHistory, OSRM.JSONP.empty, OSRM.DEFAULTS.JSONP_TIMEOUT, "history" + b, b)
            }
        }
    }, _buildCall: function(e) {
        var d = OSRM.G.active_routing_server_url;
        d += "?z=" + OSRM.G.map.getZoom() + "&output=json&jsonp=%jsonp";
        if (this._history[e].checksum) {
            d += "&checksum=" + this._history[e].checksum
        }
        var a = this._history[e].markers;
        for (var c = 0, b = a.length; c < b; c++) {
            d += "&loc=" + a[c].lat.toFixed(6) + "," + a[c].lng.toFixed(6);
            if (a[c].hint) {
                d += "&hint=" + a[c].hint
            }
        }
        return d
    }, _updateHints: function(a, d) {
        this._history[d].checksum = a.hint_data.checksum;
        var c = a.hint_data.locations;
        for (var b = 0; b < c.length; b++) {
            this._history[d].markers[b].hint = c[b]
        }
    }});
OSRM.GUI = {init_functions: [], init: function() {
        for (var b = 0, a = OSRM.GUI.init_functions.length; b < a; b++) {
            OSRM.GUI.init_functions[b]()
        }
    }, extend: function(a) {
        for (property in a) {
            if (property == "init") {
                OSRM.GUI.init_functions.push(a[property])
            } else {
                OSRM.GUI[property] = a[property]
            }
        }
    }};
OSRM.GUIBoxGroup = function() {
    this._handles = []
};
OSRM.extend(OSRM.GUIBoxGroup, {add: function(a) {
        this._handles.push(a);
        a.$addToGroup(this)
    }, select: function(b) {
        for (var a = 0; a < this._handles.length; a++) {
            if (this._handles[a] != b) {
                this._handles[a].$hideBox()
            } else {
                this._handles[a].$showBox()
            }
        }
    }, $hide: function() {
        for (var a = 0; a < this._handles.length; a++) {
            this._handles[a].$hide()
        }
    }, $show: function() {
        for (var a = 0; a < this._handles.length; a++) {
            this._handles[a].$show()
        }
    }});
OSRM.GUIBoxHandle = function(b, g, d, e, j) {
    var c = document.getElementById(b + "-toggle");
    if (c == null) {
        console.log("[error] No toggle button for " + b);
        return
    }
    var a = document.createElement("div");
    a.id = b + "-handle-wrapper";
    a.className = "box-wrapper box-handle-wrapper-" + g;
    a.style.cssText += d;
    var f = document.createElement("div");
    f.id = b + "-handle-content";
    f.className = "box-content box-handle-content-" + g;
    var i = document.createElement("div");
    i.id = b + "-handle-icon";
    i.className = "iconic-button";
    i.title = b;
    f.appendChild(i);
    a.appendChild(f);
    document.body.appendChild(a);
    this._box = document.getElementById(b + "-wrapper");
    this._class = this._box.className;
    this._width = this._box.clientWidth;
    this._side = g;
    this._handle = a;
    this._box_group = null;
    this._transitionEndFct = j;
    this._box.style[this._side] = -this._width + "px";
    this._box_visible = false;
    this._box.style.visibility = "hidden";
    this._handle.style.visibility = "visible";
    var k = e ? OSRM.concat(this._toggle, e) : this._toggle;
    var h = OSRM.bind(this, k);
    c.onclick = h;
    i.onclick = h;
    var k = j ? OSRM.concat(this._onTransitionEnd, j) : this._onTransitionEnd;
    var h = OSRM.bind(this, k);
    if (OSRM.Browser.FF3 == -1 && OSRM.Browser.IE6_9 == -1) {
        var l = document.getElementById(b + "-wrapper");
        l.addEventListener("transitionend", h, false);
        l.addEventListener("webkitTransitionEnd", h, false);
        l.addEventListener("oTransitionEnd", h, false);
        l.addEventListener("MSTransitionEnd", h, false)
    } else {
        this._legacyTransitionEndFct = h
    }
};
OSRM.extend(OSRM.GUIBoxHandle, {boxVisible: function() {
        return this._box_visible
    }, boxWidth: function() {
        return this._width
    }, $addToGroup: function(a) {
        this._box_group = a
    }, $show: function() {
        this._handle.style.visibility = "visible"
    }, $hide: function() {
        this._handle.style.visibility = "hidden"
    }, $showBox: function() {
        this._box_visible = true;
        this._box.style.visibility = "visible";
        this._handle.style.visibility = "hidden";
        this._box.style[this._side] = "5px"
    }, $hideBox: function() {
        this._box_visible = false;
        this._box.style.visibility = "hidden";
        this._handle.style.visibility = "visible";
        this._box.style[this._side] = -this._width + "px"
    }, _toggle: function() {
        this._box.className += " box-animated";
        if (this._box_visible == false) {
            this._box_group.$hide();
            this._box.style[this._side] = "5px";
            this._box.style.visibility = "visible"
        } else {
            this._box.style[this._side] = -this._width + "px"
        }
        if (OSRM.Browser.FF3 != -1 || OSRM.Browser.IE6_9 != -1) {
            setTimeout(this._legacyTransitionEndFct, 0)
        }
    }, _onTransitionEnd: function() {
        this._box.className = this._class;
        if (this._box_visible == true) {
            this._box_group.$show();
            this._box_visible = false;
            this._box.style.visibility = "hidden"
        } else {
            this._box_visible = true;
            this._box.style.visibility = "visible"
        }
    }});
OSRM.GUI.extend({selectorInit: function(b, k, c, a) {
        var g = document.getElementById(b);
        g.className += " styled-select-helper base-font";
        g.onchange = function() {
            OSRM.GUI._selectorOnChange(this);
            a(this.value)
        };
        for (var d = 0, j = k.length; d < j; d++) {
            var e = document.createElement("option");
            e.innerHTML = k[d].display;
            e.value = k[d].value;
            g.appendChild(e)
        }
        g.value = k[c].value;
        var h = document.createTextNode(k[c].display);
        var f = document.createElement("span");
        f.className = "styled-select base-font";
        f.id = "styled-select-" + g.id;
        f.appendChild(h);
        g.parentNode.insertBefore(f, g);
        f.style.width = (g.offsetWidth - 2) + "px";
        f.style.height = (g.offsetHeight) + "px"
    }, _selectorOnChange: function(a) {
        var c = a.getElementsByTagName("option");
        for (var b = 0; b < c.length; b++) {
            if (c[b].selected == true) {
                document.getElementById("styled-select-" + a.id).childNodes[0].nodeValue = c[b].childNodes[0].nodeValue;
                break
            }
        }
    }, selectorChange: function(c, b) {
        var a = document.getElementById(c);
        a.value = b;
        OSRM.GUI._selectorOnChange(a)
    }, selectorRenameOptions: function(a, j) {
        var e = document.getElementById(a);
        var g = document.getElementById("styled-select-" + a);
        var f = document.createElement("select");
        f.id = a;
        f.className = e.className;
        f.onchange = e.onchange;
        var b = "";
        for (var c = 0, h = j.length; c < h; c++) {
            var d = document.createElement("option");
            d.innerHTML = j[c].display;
            d.value = j[c].value;
            f.appendChild(d);
            if (j[c].value == e.value) {
                b = j[c].display
            }
        }
        f.value = e.value;
        e.parentNode.insertBefore(f, e);
        e.parentNode.removeChild(e);
        g.childNodes[0].nodeValue = b;
        g.style.width = (f.offsetWidth - 2) + "px";
        g.style.height = (f.offsetHeight) + "px"
    }});
OSRM.GUI.extend({init: function() {
        var b = new OSRM.GUIBoxGroup();
        OSRM.G.main_handle = new OSRM.GUIBoxHandle("main", "left", "left:-5px;top:5px;", OSRM.GUI.beforeMainTransition, OSRM.GUI.afterMainTransition);
        b.add(OSRM.G.main_handle);
        b.select(OSRM.G.main_handle);
        var c = new OSRM.GUIBoxGroup();
        var d = new OSRM.GUIBoxHandle("config", "right", "right:-5px;bottom:70px;");
        var a = new OSRM.GUIBoxHandle("mapping", "right", "right:-5px;bottom:25px;");
        c.add(d);
        c.add(a);
        c.select(null);
        document.getElementById("gui-input-source").value = OSRM.DEFAULTS.ONLOAD_SOURCE;
        document.getElementById("gui-input-target").value = OSRM.DEFAULTS.ONLOAD_TARGET;
        OSRM.GUI.initDistanceFormatsSelector()
    }, setLabels: function() {
        document.getElementById("open-josm").innerHTML = OSRM.loc("OPEN_JOSM");
        document.getElementById("open-osmbugs").innerHTML = OSRM.loc("OPEN_OSMBUGS");
        document.getElementById("gui-reset").innerHTML = OSRM.loc("GUI_RESET");
        document.getElementById("gui-reverse").innerHTML = OSRM.loc("GUI_REVERSE");
        document.getElementById("gui-option-highlight-nonames-label").lastChild.nodeValue = OSRM.loc("GUI_HIGHLIGHT_UNNAMED_ROADS");
        document.getElementById("gui-option-show-previous-routes-label").lastChild.nodeValue = OSRM.loc("GUI_SHOW_PREVIOUS_ROUTES");
        document.getElementById("gui-search-source").innerHTML = OSRM.loc("GUI_SEARCH");
        document.getElementById("gui-search-target").innerHTML = OSRM.loc("GUI_SEARCH");
        document.getElementById("gui-search-source-label").innerHTML = OSRM.loc("GUI_START") + ":";
        document.getElementById("gui-search-target-label").innerHTML = OSRM.loc("GUI_END") + ":";
        document.getElementById("gui-input-source").title = OSRM.loc("GUI_START_TOOLTIP");
        document.getElementById("gui-input-target").title = OSRM.loc("GUI_END_TOOLTIP");
        document.getElementById("legal-notice").innerHTML = OSRM.loc("GUI_LEGAL_NOTICE");
        document.getElementById("gui-mapping-label").innerHTML = OSRM.loc("GUI_MAPPING_TOOLS");
        document.getElementById("gui-config-label").innerHTML = OSRM.loc("GUI_CONFIGURATION");
        document.getElementById("gui-language-2-label").innerHTML = OSRM.loc("GUI_LANGUAGE") + ":";
        document.getElementById("gui-units-label").innerHTML = OSRM.loc("GUI_UNITS") + ":";
        document.getElementById("gui-data-timestamp-label").innerHTML = OSRM.loc("GUI_DATA_TIMESTAMP");
        document.getElementById("gui-data-timestamp").innerHTML = OSRM.G.data_timestamp;
        document.getElementById("gui-timestamp-label").innerHTML = OSRM.loc("GUI_VERSION");
        document.getElementById("gui-timestamp").innerHTML = OSRM.DATE + "; v" + OSRM.VERSION;
        document.getElementById("config-handle-icon").title = OSRM.loc("GUI_CONFIGURATION");
        document.getElementById("mapping-handle-icon").title = OSRM.loc("GUI_MAPPING_TOOLS");
        document.getElementById("main-handle-icon").title = OSRM.loc("GUI_MAIN_WINDOW");
        OSRM.G.map.zoomControl.setTooltips(OSRM.loc("GUI_ZOOM_IN"), OSRM.loc("GUI_ZOOM_OUT"));
        OSRM.G.map.locationsControl.setTooltips(OSRM.loc("GUI_ZOOM_ON_USER"), OSRM.loc("GUI_ZOOM_ON_ROUTE"));
        OSRM.GUI.setDistanceFormatsLanguage();
        OSRM.GUI.setRoutingEnginesLanguage()
    }, clearResults: function() {
        document.getElementById("information-box").className = "information-box-with-normal-header";
        document.getElementById("information-box").innerHTML = "";
        document.getElementById("information-box-header").innerHTML = ""
    }, beforeMainTransition: function() {
        OSRM.G.map.zoomControl.hide()
    }, afterMainTransition: function() {
        OSRM.G.map.zoomControl.show()
    }, initDistanceFormatsSelector: function() {
        var a = OSRM.GUI.getDistanceFormats();
        OSRM.GUI.selectorInit("gui-units-toggle", a, OSRM.DEFAULTS.DISTANCE_FORMAT, OSRM.GUI._onDistanceFormatChanged)
    }, setDistanceFormat: function(a) {
        if (OSRM.G.active_distance_format == a) {
            return
        }
        OSRM.G.active_distance_format = a;
        if (OSRM.G.map) {
            OSRM.G.map.scaleControl.removeFrom(OSRM.G.map);
            OSRM.G.map.scaleControl.options.metric = (a != 1);
            OSRM.G.map.scaleControl.options.imperial = (a == 1);
            OSRM.G.map.scaleControl.addTo(OSRM.G.map)
        }
        if (a == 1) {
            OSRM.Utils.toHumanDistance = OSRM.Utils.toHumanDistanceMiles
        } else {
            OSRM.Utils.toHumanDistance = OSRM.Utils.toHumanDistanceMeters
        }
    }, _onDistanceFormatChanged: function(a) {
        OSRM.GUI.setDistanceFormat(a);
        OSRM.Routing.getRoute({keepAlternative: true})
    }, setDistanceFormatsLanguage: function() {
        var a = OSRM.GUI.getDistanceFormats();
        OSRM.GUI.selectorRenameOptions("gui-units-toggle", a)
    }, getDistanceFormats: function() {
        return[{display: OSRM.loc("GUI_KILOMETERS"), value: 0}, {display: OSRM.loc("GUI_MILES"), value: 1}]
    }, queryDataTimestamp: function() {
        OSRM.G.data_timestamp = "n/a";
        OSRM.JSONP.call(OSRM.G.active_routing_timestamp_url + "?jsonp=%jsonp", OSRM.GUI.setDataTimestamp, OSRM.JSONP.empty, OSRM.DEFAULTS.JSONP_TIMEOUT, "data_timestamp")
    }, setDataTimestamp: function(a) {
        if (!a) {
            return
        }
        OSRM.G.data_timestamp = a.timestamp.slice(0, 25).replace(/<\/?[^>]+(>|$)/g, "");
        document.getElementById("gui-data-timestamp").innerHTML = OSRM.G.data_timestamp
    }});
OSRM.GUI.extend({activeExclusive: undefined, activeTooltip: undefined, tooltips: {}, init: function() {
        var b = OSRM.DEFAULTS.NOTIFICATIONS;
        if (b.MAINTENANCE == true) {
            var d = OSRM.DEFAULTS.OVERRIDE_MAINTENANCE_NOTIFICATION_HEADER || OSRM.loc("NOTIFICATION_MAINTENANCE_HEADER");
            var a = OSRM.DEFAULTS.OVERRIDE_MAINTENANCE_NOTIFICATION_BODY || OSRM.loc("NOTIFICATION_MAINTENANCE_BODY");
            OSRM.GUI.exclusiveNotify(d, a, false);
            OSRM.GUI.activeExclusive = "MAINTENANCE";
            return
        }
        var b = OSRM.DEFAULTS.NOTIFICATIONS;
        var c = OSRM.GUI.tooltips;
        for (id in b) {
            if (!OSRM.Utils.isNumber(b[id])) {
                continue
            }
            c[id] = {};
            c[id]._timer = setTimeout(function(e) {
                return function() {
                    OSRM.GUI._showTooltip(e)
                }
            }(id), b[id]);
            c[id]._pending = true
        }
    }, deactivateTooltip: function(b) {
        var a = OSRM.GUI.tooltips;
        if (a[b] == undefined) {
            return
        }
        a[b]._pending = false
    }, _showTooltip: function(c) {
        var b = OSRM.GUI.tooltips;
        if (b[c] == undefined) {
            return
        }
        if (b[c]._pending == false) {
            return
        }
        var a = OSRM.DEFAULTS.NOTIFICATIONS;
        if (OSRM.GUI.isTooltipVisible()) {
            b[c]._timer = setTimeout(function(d) {
                return function() {
                    OSRM.GUI._showTooltip(d)
                }
            }(c), a[c]);
            return
        }
        OSRM.GUI.tooltipNotify(OSRM.loc("NOTIFICATION_" + c + "_HEADER"), OSRM.loc("NOTIFICATION_" + c + "_BODY"));
        OSRM.GUI.activeTooltip = c;
        b[c]._pending = false
    }, exclusiveNotify: function(c, b, a) {
        document.getElementById("exclusive-notification-blanket").style.display = "block";
        document.getElementById("exclusive-notification-label").innerHTML = c;
        document.getElementById("exclusive-notification-box").innerHTML = b;
        if (a) {
            document.getElementById("exclusive-notification-toggle").onclick = OSRM.GUI.exclusiveDenotify
        } else {
            document.getElementById("exclusive-notification-toggle").style.display = "none"
        }
        OSRM.GUI.exclusiveResize()
    }, exclusiveDenotify: function() {
        document.getElementById("exclusive-notification-blanket").style.display = "none";
        OSRM.GUI.activeExclusive = undefined
    }, exclusiveUpdate: function() {
        if (OSRM.GUI.activeExclusive == undefined) {
            return
        }
        var b = OSRM.DEFAULTS["OVERRIDE_" + OSRM.GUI.activeExclusive + "_HEADER"] || OSRM.loc("NOTIFICATION_MAINTENANCE_HEADER");
        var a = OSRM.DEFAULTS["OVERRIDE_" + OSRM.GUI.activeExclusive + "_BODY"] || OSRM.loc("NOTIFICATION_MAINTENANCE_BODY");
        document.getElementById("exclusive-notification-label").innerHTML = b;
        document.getElementById("exclusive-notification-box").innerHTML = a;
        OSRM.GUI.exclusiveResize()
    }, exclusiveResize: function() {
        var a = document.getElementById("exclusive-notification-box").clientHeight;
        document.getElementById("exclusive-notification-content").style.height = (a + 28) + "px";
        document.getElementById("exclusive-notification-wrapper").style.height = (a + 48) + "px"
    }, inMaintenance: function() {
        return OSRM.GUI.activeExclusive == "MAINTENANCE"
    }, tooltipNotify: function(b, a) {
        document.getElementById("tooltip-notification-wrapper").style.display = "block";
        document.getElementById("tooltip-notification-label").innerHTML = b;
        document.getElementById("tooltip-notification-box").innerHTML = a;
        document.getElementById("tooltip-notification-box").style.display = "block";
        OSRM.GUI.tooltipResize();
        document.getElementById("tooltip-notification-toggle").onclick = OSRM.GUI.tooltipDenotify;
        document.getElementById("tooltip-notification-resize").onclick = OSRM.GUI.tooltipResize
    }, tooltipDenotify: function() {
        document.getElementById("tooltip-notification-wrapper").style.display = "none";
        OSRM.GUI.activeTooltip = undefined
    }, tooltipUpdate: function() {
        if (OSRM.GUI.activeTooltip == undefined) {
            return
        }
        document.getElementById("tooltip-notification-label").innerHTML = OSRM.loc("NOTIFICATION_" + OSRM.GUI.activeTooltip + "_HEADER");
        document.getElementById("tooltip-notification-box").innerHTML = OSRM.loc("NOTIFICATION_" + OSRM.GUI.activeTooltip + "_BODY");
        OSRM.GUI.tooltipResize();
        OSRM.GUI.tooltipResize()
    }, tooltipResize: function() {
        if (document.getElementById("tooltip-notification-box").style.display == "none") {
            document.getElementById("tooltip-notification-box").style.display = "block";
            var a = document.getElementById("tooltip-notification-box").clientHeight;
            document.getElementById("tooltip-notification-content").style.height = (a + 28) + "px";
            document.getElementById("tooltip-notification-wrapper").style.height = (a + 48) + "px";
            document.getElementById("tooltip-notification-resize").className = "iconic-button up-marker top-right-button"
        } else {
            document.getElementById("tooltip-notification-box").style.display = "none";
            document.getElementById("tooltip-notification-content").style.height = "18px";
            document.getElementById("tooltip-notification-wrapper").style.height = "38px";
            document.getElementById("tooltip-notification-resize").className = "iconic-button down-marker top-right-button"
        }
    }, isTooltipVisible: function() {
        return document.getElementById("tooltip-notification-wrapper").style.display == "block"
    }, updateNotifications: function() {
        OSRM.GUI.exclusiveUpdate();
        OSRM.GUI.tooltipUpdate()
    }});
OSRM.GLOBALS.route = null;
OSRM.GLOBALS.markers = null;
OSRM.GLOBALS.dragging = null;
OSRM.GLOBALS.dragid = null;
OSRM.GLOBALS.pending = false;
OSRM.Routing = {init: function() {
        OSRM.GUI.setRoutingEngine(OSRM.DEFAULTS.ROUTING_ENGINE);
        OSRM.G.markers = new OSRM.Markers();
        OSRM.G.route = new OSRM.Route();
        OSRM.G.response = {via_points: []};
        OSRM.RoutingDescription.init()
    }, timeoutRoute: function() {
        OSRM.RoutingGeometry.showNA();
        OSRM.RoutingNoNames.showNA();
        OSRM.RoutingDescription.showNA(OSRM.loc("TIMED_OUT"));
        OSRM.Routing._snapRoute()
    }, timeoutRoute_Dragging: function() {
        OSRM.RoutingGeometry.showNA();
        OSRM.RoutingDescription.showNA(OSRM.loc("TIMED_OUT"))
    }, timeoutRoute_Reversed: function() {
        OSRM.G.markers.reverseMarkers();
        OSRM.Routing.timeoutRoute()
    }, showRoute: function(a, c) {
        if (!a) {
            return
        }
        if (c.keepAlternative != true) {
            OSRM.G.active_alternative = 0
        }
        OSRM.G.response = a;
        OSRM.Routing._snapRoute();
        if (a.status == 207) {
            OSRM.RoutingGeometry.showNA();
            OSRM.RoutingNoNames.showNA();
            OSRM.RoutingDescription.showNA(OSRM.loc("NO_ROUTE_FOUND"))
        } else {
            OSRM.RoutingAlternatives.prepare(OSRM.G.response);
            OSRM.RoutingGeometry.show(OSRM.G.response);
            OSRM.RoutingNoNames.show(OSRM.G.response);
            OSRM.RoutingDescription.show(OSRM.G.response)
        }
        OSRM.Routing._updateHints(a);
        if (c.recenter == true) {
            var b = new L.LatLngBounds(OSRM.G.route._current_route.getPositions());
            OSRM.G.map.setViewBoundsUI(b)
        }
    }, showRoute_Dragging: function(a) {
        if (!a) {
            return
        }
        if (!OSRM.G.dragging) {
            return
        }
        OSRM.G.response = a;
        if (a.status == 207) {
            OSRM.RoutingGeometry.showNA();
            OSRM.RoutingDescription.showNA(OSRM.loc("YOUR_ROUTE_IS_BEING_COMPUTED"))
        } else {
            OSRM.RoutingGeometry.show(a);
            OSRM.RoutingDescription.showSimple(a)
        }
        OSRM.Routing._updateHints(a);
        if (OSRM.G.pending) {
            setTimeout(OSRM.Routing.draggingTimeout, 1)
        }
    }, showRoute_Redraw: function(a, b) {
        if (!a) {
            return
        }
        if (b.keepAlternative == false) {
            OSRM.G.active_alternative = 0
        }
        OSRM.G.response = a;
        if (a.status != 207) {
            OSRM.RoutingAlternatives.prepare(OSRM.G.response);
            OSRM.RoutingGeometry.show(OSRM.G.response);
            OSRM.RoutingNoNames.show(OSRM.G.response)
        }
        OSRM.Routing._updateHints(a)
    }, getRoute: function(a) {
        if (OSRM.G.markers.route.length < 2) {
            OSRM.G.route.hideRoute();
            return
        }
        a = a || {};
        OSRM.JSONP.clear("dragging");
        OSRM.JSONP.clear("redraw");
        OSRM.JSONP.clear("route");
        OSRM.JSONP.call(OSRM.Routing._buildCall() + "&instructions=true", OSRM.Routing.showRoute, OSRM.Routing.timeoutRoute, OSRM.DEFAULTS.JSONP_TIMEOUT, "route", a)
    }, getRoute_Reversed: function() {
        if (OSRM.G.markers.route.length < 2) {
            return
        }
        OSRM.JSONP.clear("dragging");
        OSRM.JSONP.clear("redraw");
        OSRM.JSONP.clear("route");
        OSRM.JSONP.call(OSRM.Routing._buildCall() + "&instructions=true", OSRM.Routing.showRoute, OSRM.Routing.timeoutRoute_Reversed, OSRM.DEFAULTS.JSONP_TIMEOUT, "route", {})
    }, getRoute_Redraw: function(a) {
        if (OSRM.G.markers.route.length < 2) {
            return
        }
        a = a || {};
        OSRM.JSONP.clear("dragging");
        OSRM.JSONP.clear("redraw");
        OSRM.JSONP.call(OSRM.Routing._buildCall() + "&instructions=true", OSRM.Routing.showRoute_Redraw, OSRM.Routing.timeoutRoute, OSRM.DEFAULTS.JSONP_TIMEOUT, "redraw", a)
    }, getRoute_Dragging: function() {
        OSRM.G.pending = !OSRM.JSONP.call(OSRM.Routing._buildCall() + "&alt=false&instructions=false", OSRM.Routing.showRoute_Dragging, OSRM.Routing.timeoutRoute_Dragging, OSRM.DEFAULTS.JSONP_TIMEOUT, "dragging")
    }, draggingTimeout: function() {
        OSRM.G.markers.route[OSRM.G.dragid].hint = null;
        OSRM.Routing.getRoute_Dragging()
    }, _buildCall: function() {
        var c = OSRM.G.active_routing_server_url;
        c += "?z=" + OSRM.G.map.getZoom() + "&output=json&jsonp=%jsonp";
        if (OSRM.G.markers.checksum) {
            c += "&checksum=" + OSRM.G.markers.checksum
        }
        var d = OSRM.G.markers.route;
        for (var b = 0, a = d.length; b < a; b++) {
            c += "&loc=" + d[b].getLat().toFixed(6) + "," + d[b].getLng().toFixed(6);
            if (d[b].hint) {
                c += "&hint=" + d[b].hint
            }
        }
        return c
    }, _updateHints: function(b) {
        var a = b.hint_data.locations;
        OSRM.G.markers.checksum = b.hint_data.checksum;
        for (var c = 0; c < a.length; c++) {
            OSRM.G.markers.route[c].hint = a[c]
        }
    }, _snapRoute: function() {
        var c = OSRM.G.markers.route;
        var b = OSRM.G.response.via_points;
        for (var a = 0; a < b.length; a++) {
            c[a].setPosition(new L.LatLng(b[a][0], b[a][1]))
        }
        OSRM.Geocoder.updateAddress(OSRM.C.SOURCE_LABEL);
        OSRM.Geocoder.updateAddress(OSRM.C.TARGET_LABEL);
        OSRM.G.markers.relabelViaMarkers()
    }};
OSRM.RoutingAlternatives = {_buttons: [{id: "gui-a", label: "A"}, {id: "gui-b", label: "B"}], init: function() {
        OSRM.G.active_alternative = 0;
        OSRM.G.alternative_count = 0
    }, prepare: function(a) {
        var b = OSRM.G.response;
        b.route_name = b.route_name || [];
        b.alternative_names = b.alternative_names || [[]];
        b.alternative_geometries.unshift(a.route_geometry);
        b.alternative_instructions.unshift(a.route_instructions);
        b.alternative_summaries.unshift(a.route_summary);
        b.alternative_names.unshift(a.route_name);
        OSRM.G.alternative_count = a.alternative_geometries.length;
        if (OSRM.G.active_alternative >= OSRM.G.alternative_count) {
            OSRM.G.active_alternative = 0
        }
        b.route_geometry = b.alternative_geometries[OSRM.G.active_alternative];
        b.route_instructions = b.alternative_instructions[OSRM.G.active_alternative];
        b.route_summary = b.alternative_summaries[OSRM.G.active_alternative];
        b.route_name = b.alternative_names[OSRM.G.active_alternative]
    }, setActive: function(c) {
        OSRM.G.active_alternative = c;
        var d = OSRM.RoutingAlternatives._buttons;
        for (var b = 0, a = OSRM.G.alternative_count; b < a; b++) {
            document.getElementById(d[b].id).className = (c == b) ? "button-pressed top-right-button" : "button top-right-button"
        }
    }, show: function() {
        var h = OSRM.RoutingAlternatives._buttons;
        var e = "";
        for (var f = 0, m = OSRM.G.alternative_count; f < m; f++) {
            var a = OSRM.Utils.toHumanDistance(OSRM.G.response.alternative_summaries[f].total_distance);
            var b = OSRM.Utils.toHumanTime(OSRM.G.response.alternative_summaries[f].total_time);
            var g = " &#10;(";
            for (var d = 0, c = OSRM.G.response.alternative_names[f].length; d < c; d++) {
                g += (d > 0 && OSRM.G.response.alternative_names[f][d] != "" && OSRM.G.response.alternative_names[f][d - 1] != "" ? " - " : "") + OSRM.G.response.alternative_names[f][d]
            }
            g += ")";
            var l = OSRM.loc("DISTANCE") + ": " + a + " &#10;" + OSRM.loc("DURATION") + ": " + b + g;
            var k = (f == OSRM.G.active_alternative) ? "button-pressed" : "button";
            e = '<a class="' + k + ' top-right-button" id="' + h[f].id + '" title="' + l + '">' + h[f].label + "</a>" + e
        }
        for (var f = OSRM.G.alternative_count, m = h.length; f < m; ++f) {
            e = '<a class="button-inactive top-right-button" id="' + h[f].id + '">' + h[f].label + "</a>" + e
        }
        document.getElementById("information-box-header").innerHTML = e + document.getElementById("information-box-header").innerHTML;
        for (var f = 0, m = OSRM.G.alternative_count; f < m; f++) {
            document.getElementById(h[f].id).onclick = function(i) {
                return function() {
                    OSRM.RoutingAlternatives._click(i)
                }
            }(f);
            document.getElementById(h[f].id).onmouseover = function(i) {
                return function() {
                    OSRM.RoutingAlternatives._mouseover(i)
                }
            }(f);
            document.getElementById(h[f].id).onmouseout = function(i) {
                return function() {
                    OSRM.RoutingAlternatives._mouseout(i)
                }
            }(f)
        }
    }, _click: function(a) {
        if (OSRM.G.active_alternative == a) {
            return
        }
        OSRM.RoutingAlternatives.setActive(a);
        OSRM.G.route.hideAlternativeRoute();
        var b = OSRM.G.response;
        b.route_geometry = b.alternative_geometries[a];
        b.route_instructions = b.alternative_instructions[a];
        b.route_summary = b.alternative_summaries[a];
        b.route_name = b.alternative_names[a];
        OSRM.RoutingGeometry.show(b);
        OSRM.RoutingNoNames.show(b);
        OSRM.RoutingDescription.show(b);
        OSRM.G.markers.highlight.hide()
    }, _mouseover: function(a) {
        if (OSRM.G.active_alternative == a) {
            return
        }
        var b = OSRM.RoutingGeometry._decode(OSRM.G.response.alternative_geometries[a], 5);
        OSRM.G.route.showAlternativeRoute(b)
    }, _mouseout: function(a) {
        if (OSRM.G.active_alternative == a) {
            return
        }
        OSRM.G.route.hideAlternativeRoute()
    }};
OSRM.RoutingDescription = {QR_DIRECTORY: "qrcodes/", init: function() {
        OSRM.G.active_shortlink = null;
        OSRM.Browser.onUnloadHandler(OSRM.RoutingDescription.uninit)
    }, uninit: function() {
        if (OSRM.G.qrcodewindow) {
            OSRM.G.qrcodewindow.close()
        }
    }, onMouseOverRouteDescription: function(b, a) {
        OSRM.G.markers.hover.setPosition(new L.LatLng(b, a));
        OSRM.G.markers.hover.show()
    }, onMouseOutRouteDescription: function(b, a) {
        OSRM.G.markers.hover.hide()
    }, onClickRouteDescription: function(b, a, c) {
        OSRM.G.markers.highlight.setPosition(new L.LatLng(b, a));
        OSRM.G.markers.highlight.show();
        OSRM.G.markers.highlight.centerView(OSRM.DEFAULTS.HIGHLIGHT_ZOOM_LEVEL);
        console.log(OSRM.G.markers.highlight.description);
        if (OSRM.G.markers.highlight.description != null && document.getElementById("description-" + OSRM.G.markers.highlight.description)) {
            document.getElementById("description-" + OSRM.G.markers.highlight.description).className = "description-body-item"
        }
        OSRM.G.markers.highlight.description = c;
        document.getElementById("description-" + c).className = "description-body-item description-body-item-selected"
    }, onClickCreateShortcut: function(b) {
        b += "&z=" + OSRM.G.map.getZoom() + "&center=" + OSRM.G.map.getCenter().lat.toFixed(6) + "," + OSRM.G.map.getCenter().lng.toFixed(6);
        b += "&alt=" + OSRM.G.active_alternative;
        b += "&df=" + OSRM.G.active_distance_format;
        b += "&re=" + OSRM.G.active_routing_engine;
        var a = OSRM.DEFAULTS.HOST_SHORTENER_URL + OSRM.DEFAULTS.SHORTENER_PARAMETERS.replace(/%url/, b);
        OSRM.JSONP.call(a, OSRM.RoutingDescription.showRouteLink, OSRM.RoutingDescription.showRouteLink_TimeOut, OSRM.DEFAULTS.JSONP_TIMEOUT, "shortener");
        document.getElementById("route-link").innerHTML = "[" + OSRM.loc("GENERATE_LINK_TO_ROUTE") + "]"
    }, showRouteLink: function(a) {
        if (!a || !a[OSRM.DEFAULTS.SHORTENER_REPLY_PARAMETER]) {
            OSRM.RoutingDescription.showRouteLink_TimeOut();
            return
        }
        OSRM.G.active_shortlink = a[OSRM.DEFAULTS.SHORTENER_REPLY_PARAMETER];
        document.getElementById("route-link").innerHTML = '[<a class="route-link" onClick="OSRM.RoutingDescription.showQRCode();">' + OSRM.loc("QR") + '</a>] [<a class="route-link" href="' + OSRM.G.active_shortlink + '">' + OSRM.G.active_shortlink.substring(7) + "</a>]"
    }, showRouteLink_TimeOut: function() {
        document.getElementById("route-link").innerHTML = "[" + OSRM.loc("LINK_TO_ROUTE_TIMEOUT") + "]"
    }, showQRCode: function(a) {
        if (OSRM.G.qrcodewindow) {
            OSRM.G.qrcodewindow.close()
        }
        OSRM.G.qrcodewindow = window.open(OSRM.RoutingDescription.QR_DIRECTORY + "qrcodes.html", "", "width=280,height=250,left=100,top=100,dependent=yes,location=no,menubar=no,scrollbars=no,status=no,toolbar=no,resizable=no")
    }, show: function(c) {
        OSRM.GUI.activateRouteFeatures();
        var l = "?hl=" + OSRM.Localization.current_language;
        for (var g = 0; g < OSRM.G.markers.route.length; g++) {
            l += "&loc=" + OSRM.G.markers.route[g].getLat().toFixed(6) + "," + OSRM.G.markers.route[g].getLng().toFixed(6)
        }
        var b = '[<a class="route-link" onclick="OSRM.RoutingDescription.onClickCreateShortcut(\'' + OSRM.DEFAULTS.WEBSITE_URL + l + "')\">" + OSRM.loc("GET_LINK_TO_ROUTE") + "</a>]";
        var n = '[<a class="route-link" onClick="document.location.href=\'' + OSRM.G.active_routing_server_url + l + "&output=gpx';\">" + OSRM.loc("GPX_FILE") + "</a>]";
        var q = null;
        if (OSRM.G.markers.highlight.isShown()) {
            q = OSRM.G.markers.highlight.description
        }
        var h = OSRM.G.route.getPositions();
        var m = "";
        m += '<table class="description medium-font">';
        for (var g = 0; g < c.route_instructions.length; g++) {
            var k = "description-body-odd";
            if (g % 2 == 0) {
                k = "description-body-even"
            }
            m += '<tr class="' + k + '">';
            m += '<td class="description-body-directions">';
            m += '<img class="description-body-direction" src="' + OSRM.RoutingDescription._getDrivingInstructionIcon(c.route_instructions[g][0]) + '" alt=""/>';
            m += "</td>";
            m += '<td class="description-body-items">';
            var p = h[c.route_instructions[g][3]];
            m += '<div id="description-' + g + '" class="description-body-item ' + (q == g ? "description-body-item-selected" : "") + '" onclick="OSRM.RoutingDescription.onClickRouteDescription(' + p.lat.toFixed(6) + "," + p.lng.toFixed(6) + "," + g + ')" onmouseover="OSRM.RoutingDescription.onMouseOverRouteDescription(' + p.lat.toFixed(6) + "," + p.lng.toFixed(6) + ')" onmouseout="OSRM.RoutingDescription.onMouseOutRouteDescription(' + p.lat.toFixed(6) + "," + p.lng.toFixed(6) + ')">';
            if (c.route_instructions[g][1] != "") {
                m += OSRM.loc(OSRM.RoutingDescription._getDrivingInstruction(c.route_instructions[g][0])).replace(/\[(.*)\]/, "$1").replace(/%s/, c.route_instructions[g][1]).replace(/%d/, OSRM.loc(c.route_instructions[g][6]))
            } else {
                m += OSRM.loc(OSRM.RoutingDescription._getDrivingInstruction(c.route_instructions[g][0])).replace(/\[(.*)\]/, "").replace(/%d/, OSRM.loc(c.route_instructions[g][6]))
            }
            m += "</div>";
            m += "</td>";
            m += '<td class="description-body-distance">';
            if (g != c.route_instructions.length - 1) {
                m += "<b>" + OSRM.Utils.toHumanDistance(c.route_instructions[g][2]) + "</b>"
            }
            m += "</td>";
            m += "</tr>"
        }
        m += "</table>";
        var o = "(";
        for (var f = 0, e = c.route_name.length; f < e; f++) {
            o += (f > 0 && c.route_name[f] != "" && c.route_name[f - 1] != "" ? " - " : "") + "<span style='white-space:nowrap;'>" + c.route_name[f] + "</span>"
        }
        if (o == "(") {
            o += " - "
        }
        o += ")";
        header = OSRM.RoutingDescription._buildHeader(OSRM.Utils.toHumanDistance(c.route_summary.total_distance), OSRM.Utils.toHumanTime(c.route_summary.total_time), b, n, o);
        var d = document.createElement("tempDiv");
        document.body.appendChild(d);
        d.className = "base-font absolute-hidden";
        d.innerHTML = o;
        var a = d.clientWidth;
        var r = 370;
        document.body.removeChild(d);
        document.getElementById("information-box").className = (a > r ? "information-box-with-larger-header" : "information-box-with-large-header");
        document.getElementById("information-box-header").innerHTML = header;
        document.getElementById("information-box").innerHTML = m;
        OSRM.RoutingAlternatives.show()
    }, showSimple: function(a) {
        header = OSRM.RoutingDescription._buildHeader(OSRM.Utils.toHumanDistance(a.route_summary.total_distance), OSRM.Utils.toHumanTime(a.route_summary.total_time), "", "");
        document.getElementById("information-box").className = "information-box-with-normal-header";
        document.getElementById("information-box-header").innerHTML = header;
        document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + OSRM.loc("YOUR_ROUTE_IS_BEING_COMPUTED") + "</div>"
    }, showNA: function(d) {
        OSRM.GUI.activateRouteFeatures();
        var b = "?hl=" + OSRM.Localization.current_language;
        for (var a = 0; a < OSRM.G.markers.route.length; a++) {
            b += "&loc=" + OSRM.G.markers.route[a].getLat().toFixed(6) + "," + OSRM.G.markers.route[a].getLng().toFixed(6)
        }
        var c = '[<a class="route-link" onclick="OSRM.RoutingDescription.onClickCreateShortcut(\'' + OSRM.DEFAULTS.WEBSITE_URL + b + "')\">" + OSRM.loc("GET_LINK_TO_ROUTE") + "</a>]";
        header = OSRM.RoutingDescription._buildHeader("N/A", "N/A", c, "");
        document.getElementById("information-box").className = "information-box-with-normal-header";
        document.getElementById("information-box-header").innerHTML = header;
        document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + d + "</div>"
    }, _buildHeader: function(f, d, c, e, b) {
        var a = '<div class="header-title">' + OSRM.loc("ROUTE_DESCRIPTION") + (b ? '<br/><div class="header-subtitle">' + b + "</div>" : "") + '</div><div class="full"><div class="row"><div class="left"><div class="full"><div class="row"><div class="left header-label">' + OSRM.loc("DISTANCE") + ':</div><div class="left header-content stretch">' + f + '</div></div><div class="row"><div class="left header-label">' + OSRM.loc("DURATION") + ':</div><div class="left header-content stretch">' + d + '</div></div></div></div><div class="left"><div class="full"><div class="row"><div class="right header-content" id="route-link">' + c + '</div></div><div class="row"><div class="right header-content">' + e + "</div></div></div></div></div></div></div>";
        return a
    }, _getDrivingInstructionIcon: function(a) {
        var b = "direction_";
        a = a.replace(/^11-\d{1,}$/, "11");
        b += a;
        if (OSRM.G.images[b]) {
            return OSRM.G.images[b].getAttribute("src")
        } else {
            return OSRM.G.images.direction_0.getAttribute("src")
        }
    }, _getDrivingInstruction: function(a) {
        var c = "DIRECTION_";
        a = a.replace(/^11-\d{2,}$/, "11-x");
        c += a;
        var b = OSRM.loc(c);
        if (b == c) {
            return OSRM.loc("DIRECTION_0")
        }
        return b
    }};
OSRM.RoutingGeometry = {show: function(a) {
        var b = OSRM.RoutingGeometry._decode(a.route_geometry, 5);
        OSRM.G.route.showRoute(b, OSRM.Route.ROUTE)
    }, showNA: function() {
        var a = [];
        for (var c = 0, b = OSRM.G.markers.route.length; c < b; c++) {
            a.push(OSRM.G.markers.route[c].getPosition())
        }
        OSRM.G.route.showRoute(a, OSRM.Route.NOROUTE)
    }, _decode: function(c, d) {
        d = Math.pow(10, -d);
        var f = c.length, e = 0, j = 0, k = 0, h = [];
        while (e < f) {
            var l, a = 0, m = 0;
            do {
                l = c.charCodeAt(e++) - 63;
                m |= (l & 31) << a;
                a += 5
            } while (l >= 32);
            var g = ((m & 1) ? ~(m >> 1) : (m >> 1));
            j += g;
            a = 0;
            m = 0;
            do {
                l = c.charCodeAt(e++) - 63;
                m |= (l & 31) << a;
                a += 5
            } while (l >= 32);
            var i = ((m & 1) ? ~(m >> 1) : (m >> 1));
            k += i;
            h.push([j * d, k * d])
        }
        return h
    }};
OSRM.GUI.extend({init: function() {
        OSRM.GUI.setDistanceFormat(OSRM.DEFAULTS.DISTANCE_FORMAT);
        document.getElementById("gui-input-source").onchange = function() {
            OSRM.GUI.inputChanged(OSRM.C.SOURCE_LABEL)
        };
        document.getElementById("gui-delete-source").onclick = function() {
            OSRM.GUI.deleteMarker(OSRM.C.SOURCE_LABEL)
        };
        document.getElementById("gui-search-source").onclick = function() {
            OSRM.GUI.showMarker(OSRM.C.SOURCE_LABEL)
        };
        document.getElementById("gui-input-target").onchange = function() {
            OSRM.GUI.inputChanged(OSRM.C.TARGET_LABEL)
        };
        document.getElementById("gui-delete-target").onclick = function() {
            OSRM.GUI.deleteMarker(OSRM.C.TARGET_LABEL)
        };
        document.getElementById("gui-search-target").onclick = function() {
            OSRM.GUI.showMarker(OSRM.C.TARGET_LABEL)
        };
        document.getElementById("gui-reset").onclick = OSRM.GUI.resetRouting;
        document.getElementById("gui-reverse").onclick = OSRM.GUI.reverseRouting;
        document.getElementById("open-josm").onclick = OSRM.GUI.openJOSM;
        document.getElementById("open-osmbugs").onclick = OSRM.GUI.openOSMBugs;
        document.getElementById("option-highlight-nonames").onclick = OSRM.GUI.hightlightNonames;
        document.getElementById("option-show-previous-routes").onclick = OSRM.GUI.showPreviousRoutes
    }, activateRouteFeatures: function() {
        OSRM.Printing.activate();
        OSRM.G.map.locationsControl.activateRoute();
        OSRM.G.active_shortlink = null
    }, deactivateRouteFeatures: function() {
        OSRM.Printing.deactivate();
        OSRM.G.map.locationsControl.deactivateRoute();
        OSRM.G.active_shortlink = null
    }, resetRouting: function() {
        document.getElementById("gui-input-source").value = "";
        document.getElementById("gui-input-target").value = "";
        OSRM.G.route.reset();
        OSRM.G.markers.reset();
        OSRM.GUI.clearResults();
        OSRM.JSONP.reset()
    }, reverseRouting: function() {
        var a = document.getElementById("gui-input-source").value;
        document.getElementById("gui-input-source").value = document.getElementById("gui-input-target").value;
        document.getElementById("gui-input-target").value = a;
        if (OSRM.G.route.isShown()) {
            OSRM.G.markers.route.reverse();
            OSRM.Routing.getRoute_Reversed();
            OSRM.G.markers.route.reverse();
            OSRM.G.markers.highlight.hide();
            OSRM.RoutingDescription.showSimple(OSRM.G.response)
        } else {
            OSRM.G.markers.reverseMarkers()
        }
        OSRM.G.markers.reverseDescriptions()
    }, showMarker: function(a) {
        if (OSRM.JSONP.fences.geocoder_source || OSRM.JSONP.fences.geocoder_target) {
            return
        }
        if (a == OSRM.C.SOURCE_LABEL && OSRM.G.markers.hasSource()) {
            OSRM.G.markers.route[0].centerView()
        } else {
            if (a == OSRM.C.TARGET_LABEL && OSRM.G.markers.hasTarget()) {
                OSRM.G.markers.route[OSRM.G.markers.route.length - 1].centerView()
            }
        }
    }, inputChanged: function(a) {
        if (a == OSRM.C.SOURCE_LABEL) {
            OSRM.Geocoder.call(OSRM.C.SOURCE_LABEL, document.getElementById("gui-input-source").value)
        } else {
            if (a == OSRM.C.TARGET_LABEL) {
                OSRM.Geocoder.call(OSRM.C.TARGET_LABEL, document.getElementById("gui-input-target").value)
            }
        }
    }, openJOSM: function() {
        var a = OSRM.G.map.getCenterUI();
        var e = OSRM.G.map.getBoundsUI();
        var c = Math.min(0.02, Math.abs(e.getSouthWest().lng - a.lng));
        var b = Math.min(0.01, Math.abs(e.getSouthWest().lat - a.lat));
        var f = ["left=" + (a.lng - c).toFixed(6), "bottom=" + (a.lat - b).toFixed(6), "right=" + (a.lng + c).toFixed(6), "top=" + (a.lat + b).toFixed(6)];
        var d = "http://127.0.0.1:8111/load_and_zoom?" + f.join("&");
        var g = document.getElementById("josm-frame");
        if (!g) {
            g = L.DomUtil.create("iframe", null, document.body);
            g.style.display = "none";
            g.id = "josm-frame"
        }
        g.src = d
    }, openOSMBugs: function() {
        var a = OSRM.G.map.getCenterUI();
        window.open("http://osmbugs.org/?lat=" + a.lat.toFixed(6) + "&lon=" + a.lng.toFixed(6) + "&zoom=" + OSRM.G.map.getZoom())
    }, deleteMarker: function(a) {
        var b = null;
        if (a == "source" && OSRM.G.markers.hasSource()) {
            b = 0
        } else {
            if (a == "target" && OSRM.G.markers.hasTarget()) {
                b = OSRM.G.markers.route.length - 1
            }
        }
        if (b == null) {
            return
        }
        OSRM.G.markers.removeMarker(b);
        OSRM.Routing.getRoute();
        OSRM.G.markers.highlight.hide()
    }, showPreviousRoutes: function(a) {
        if (document.getElementById("option-show-previous-routes").checked == false) {
            OSRM.G.route.deactivateHistoryRoutes()
        } else {
            OSRM.G.route.activateHistoryRoutes()
        }
    }, zoomOnRoute: function() {
        if (OSRM.G.route.isShown() == false) {
            return
        }
        var a = new L.LatLngBounds(OSRM.G.route._current_route.getPositions());
        OSRM.G.map.fitBoundsUI(a)
    }, zoomOnUser: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(OSRM.Map.geolocationResponse)
        }
    }, hightlightNonames: function() {
        OSRM.Routing.getRoute_Redraw({keepAlternative: true})
    }});
OSRM.GUI.extend({init: function() {
        var a = OSRM.GUI.getRoutingEngines();
        OSRM.GUI.selectorInit("gui-engine-toggle", a, OSRM.DEFAULTS.ROUTING_ENGINE, OSRM.GUI._onRoutingEngineChanged)
    }, setRoutingEngine: function(a) {
        if (a == OSRM.G.active_routing_engine) {
            return
        }
        OSRM.GUI.selectorChange("gui-engine-toggle", a);
        OSRM.G.active_routing_engine = a;
        OSRM.G.active_routing_metric = OSRM.DEFAULTS.ROUTING_ENGINES[OSRM.G.active_routing_engine].metric;
        OSRM.G.active_routing_server_url = OSRM.DEFAULTS.ROUTING_ENGINES[OSRM.G.active_routing_engine].url;
        OSRM.G.active_routing_timestamp_url = OSRM.DEFAULTS.ROUTING_ENGINES[OSRM.G.active_routing_engine].timestamp;
        OSRM.GUI.queryDataTimestamp();
        OSRM.JSONP.call(OSRM.DEFAULTS.ROUTING_ENGINES[OSRM.G.active_routing_engine].timestamp + "?jsonp=%jsonp", OSRM.GUI.setDataTimestamp, OSRM.GUI.setDataTimestampTimeout, OSRM.DEFAULTS.JSONP_TIMEOUT, "data_timestamp")
    }, _onRoutingEngineChanged: function(a) {
        if (a == OSRM.G.active_routing_engine) {
            return
        }
        OSRM.GUI.setRoutingEngine(a);
        if (OSRM.G.markers.route.length > 1) {
            OSRM.Routing.getRoute()
        }
    }, setRoutingEnginesLanguage: function() {
        var a = OSRM.GUI.getRoutingEngines();
        OSRM.GUI.selectorRenameOptions("gui-engine-toggle", a)
    }, getRoutingEngines: function() {
        var d = OSRM.DEFAULTS.ROUTING_ENGINES;
        var a = [];
        for (var c = 0, b = d.length; c < b; c++) {
            a.push({display: OSRM.loc(d[c].label), value: c})
        }
        return a
    }});
OSRM.RoutingNoNames = {show: function(b) {
        if (document.getElementById("option-highlight-nonames").checked == false) {
            OSRM.G.route.hideUnnamedRoute();
            return
        }
        var a = [];
        for (var c = 0; c < b.route_instructions.length; c++) {
            if (b.route_instructions[c][1] == "") {
                a[b.route_instructions[c][3]] = false
            } else {
                a[b.route_instructions[c][3]] = true
            }
        }
        var g = OSRM.RoutingGeometry._decode(b.route_geometry, 5);
        var e = true;
        var f = [];
        var d = [];
        for (var c = 0; c < g.length; c++) {
            f.push(g[c]);
            if ((a[c] == e || a[c] == undefined) && c != g.length - 1) {
                continue
            }
            if (e == false) {
                d.push(f)
            }
            f = [];
            f.push(g[c]);
            e = a[c]
        }
        OSRM.G.route.showUnnamedRoute(d)
    }, showNA: function() {
        OSRM.G.route.hideUnnamedRoute()
    }};
OSRM.Via = {_findNearestRouteSegment: function(e) {
        var b = Number.MAX_VALUE;
        var g = undefined;
        var f = OSRM.G.map.latLngToLayerPoint(e);
        var a = OSRM.G.route.getPoints();
        for (var d = 1; d < a.length; d++) {
            var c = L.LineUtil._sqClosestPointOnSegment(f, a[d - 1], a[d], true);
            if (c < b) {
                b = c;
                g = d
            }
        }
        return g
    }, findViaIndex: function(d) {
        var c = OSRM.Via._findNearestRouteSegment(d);
        var f = OSRM.G.response.via_points;
        var a = f.length - 2;
        var e = Array();
        for (var b = 1; b < f.length - 1; b++) {
            e[b - 1] = OSRM.Via._findNearestRouteSegment(new L.LatLng(f[b][0], f[b][1]));
            if (e[b - 1] > c) {
                a = b - 1;
                break
            }
        }
        return a
    }, dragTimer: new Date(), drawDragMarker: function(a) {
        if (OSRM.G.route.isShown() == false) {
            return
        }
        if (OSRM.G.dragging == true) {
            return
        }
        if ((new Date() - OSRM.Via.dragTimer) < 25) {
            return
        }
        OSRM.Via.dragTimer = new Date();
        var j = OSRM.G.route._current_route.route.closestLayerPoint(a.layerPoint);
        var f = j ? j.distance : 1000;
        var e = a.latlng;
        for (var c = 0, k = OSRM.G.markers.route.length; c < k; c++) {
            if (OSRM.G.markers.route[c].label == "drag") {
                continue
            }
            var d = OSRM.G.markers.route[c].getPosition();
            var g = OSRM.G.map.project(e).distanceTo(OSRM.G.map.project(d));
            if (g < 20) {
                f = 1000
            }
        }
        var h = OSRM.G.map.layerPointToContainerPoint(a.layerPoint);
        var b = document.elementFromPoint(h.x, h.y);
        for (var c = 0, k = OSRM.G.markers.route.length; c < k; c++) {
            if (OSRM.G.markers.route[c].label == "drag") {
                continue
            }
            if (b == OSRM.G.markers.route[c].marker._icon) {
                f = 1000
            }
        }
        if (OSRM.G.markers.highlight.isShown()) {
            if (OSRM.G.map.project(e).distanceTo(OSRM.G.map.project(OSRM.G.markers.highlight.getPosition())) < 20) {
                f = 1000
            } else {
                if (b == OSRM.G.markers.highlight.marker._icon) {
                    f = 1000
                }
            }
        }
        if (f < 20) {
            OSRM.G.markers.dragger.setPosition(OSRM.G.map.layerPointToLatLng(j));
            OSRM.G.markers.dragger.show()
        } else {
            OSRM.G.markers.dragger.hide()
        }
    }};
OSRM.CONSTANTS.SOURCE_LABEL = "source";
OSRM.CONSTANTS.TARGET_LABEL = "target";
OSRM.CONSTANTS.VIA_LABEL = "via";
OSRM.CONSTANTS.DO_FALLBACK_TO_LAT_LNG = true;
OSRM.Geocoder = {call: function(a, d) {
        if (d == "") {
            return
        }
        if (d.match(/^\s*[-+]?[0-9]*\.?[0-9]+\s*[,;]\s*[-+]?[0-9]*\.?[0-9]+\s*$/)) {
            var e = d.split(/[,;]/);
            OSRM.Geocoder._onclickResult(a, e[0], e[1]);
            OSRM.Geocoder.updateAddress(a);
            return
        }
        var b = OSRM.DEFAULTS.HOST_GEOCODER_URL + "?format=json&json_callback=%jsonp" + OSRM.DEFAULTS.GEOCODER_BOUNDS + "&accept-language=" + OSRM.Localization.current_language + "&limit=30&q=" + d;
        var c = OSRM.G.map.getBounds();
        b += "&viewbox=" + c._southWest.lng + "," + c._northEast.lat + "," + c._northEast.lng + "," + c._southWest.lat;
        OSRM.JSONP.call(b, OSRM.Geocoder._showResults, OSRM.Geocoder._showResults_Timeout, OSRM.DEFAULTS.JSONP_TIMEOUT, "geocoder_" + a, {marker_id: a, query: d})
    }, _onclickResult: function(a, c, d) {
        var b;
        if (a == OSRM.C.SOURCE_LABEL) {
            b = OSRM.G.markers.setSource(new L.LatLng(c, d))
        } else {
            if (a == OSRM.C.TARGET_LABEL) {
                b = OSRM.G.markers.setTarget(new L.LatLng(c, d))
            } else {
                return
            }
        }
        OSRM.G.markers.route[b].show();
        OSRM.G.markers.route[b].centerView();
        if (OSRM.G.markers.route.length > 1) {
            OSRM.Routing.getRoute()
        }
    }, _showResults: function(b, h) {
        if (!b) {
            OSRM.Geocoder._showResults_Empty(h);
            return
        }
        if (b.length == 0) {
            OSRM.Geocoder._showResults_Empty(h);
            return
        }
        var a = [];
        for (var c = 0, j = b.length; c < j; c++) {
            var k = b[c];
            if (OSRM.Geocoder._filterResult(k)) {
                continue
            }
            a.push(k)
        }
        if (a.length == 0) {
            OSRM.Geocoder._showResults_Empty(h);
            return
        }
        a.sort(OSRM.Geocoder._compareResults);
        a.sort(OSRM.Geocoder._compareLocations);
        var g = [];
        g.push(a[0]);
        for (var c = 1, j = a.length; c < j; c++) {
            var f = a[c - 1];
            var k = a[c];
            if (k.lat != f.lat || k.lon != f.lon) {
                g.push(k)
            }
        }
        g.sort(OSRM.Geocoder._compareResults);
        OSRM.Geocoder._onclickResult(h.marker_id, g[0].lat, g[0].lon);
        if (OSRM.G.markers.route.length > 1) {
            return
        }
        var e = "";
        e += '<table class="results medium-font">';
        for (var c = 0; c < g.length; c++) {
            var k = g[c];
            var d = "results-body-odd";
            if (c % 2 == 0) {
                d = "results-body-even"
            }
            e += '<tr class="' + d + '">';
            if (!k.icon) {
                k.icon = "http://nominatim.openstreetmap.org/images/mapicons/poi_point_of_interest.glow.12.png"
            }
            e += '<td class="results-body-counter"><img src="' + k.icon + '" alt=""/></td>';
            e += '<td class="results-body-items">';
            if (k.display_name) {
                e += '<div class="results-body-item" onclick="OSRM.Geocoder._onclickResult(\'' + h.marker_id + "', " + k.lat + ", " + k.lon + ');">' + k.display_name;
                e += "</div>"
            }
            e += "</td></tr>"
        }
        e += "</table>";
        document.getElementById("information-box-header").innerHTML = "<div class='header-title'>" + OSRM.loc("SEARCH_RESULTS") + "</div><div class='header-content'>(" + OSRM.loc("FOUND_X_RESULTS").replace(/%i/, g.length) + ")</div>";
        "<div class='header-content'>(found " + g.length + " results)</div>";
        document.getElementById("information-box").className = "information-box-with-normal-header";
        document.getElementById("information-box").innerHTML = e
    }, _showResults_Empty: function(a) {
        document.getElementById("information-box-header").innerHTML = "<div class='header-title'>" + OSRM.loc("SEARCH_RESULTS") + "</div><div class='header-content'>(" + OSRM.loc("FOUND_X_RESULTS").replace(/%i/, 0) + ")</div>";
        document.getElementById("information-box").className = "information-box-with-normal-header";
        if (a.marker_id == OSRM.C.SOURCE_LABEL) {
            document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + OSRM.loc("NO_RESULTS_FOUND_SOURCE") + ": " + a.query + "</div>"
        } else {
            if (a.marker_id == OSRM.C.TARGET_LABEL) {
                document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + OSRM.loc("NO_RESULTS_FOUND_TARGET") + ": " + a.query + "</div>"
            } else {
                document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + OSRM.loc("NO_RESULTS_FOUND") + ": " + a.query + "</div>"
            }
        }
    }, _showResults_Timeout: function() {
        document.getElementById("information-box-header").innerHTML = "<div class='header-title'>" + OSRM.loc("SEARCH_RESULTS") + "</div><div class='header-content'>(" + OSRM.loc("FOUND_X_RESULTS").replace(/%i/, 0) + ")</div>";
        document.getElementById("information-box").className = "information-box-with-normal-header";
        document.getElementById("information-box").innerHTML = "<div class='no-results big-font'>" + OSRM.loc("TIMED_OUT") + "</div>"
    }, _filterResult: function(a) {
        if (a.type == "aerial_views") {
            return true
        }
        return false
    }, _compare_class_weights: {boundary: 9000, place: 8000, highway: 7000, }, _compare_type_weights: {country: 13, state: 12, county: 11, city: 10, town: 9, village: 8, hamlet: 7, suburb: 6, locality: 5, farm: 4}, _compareResults: function(b, f) {
        var e = OSRM.Geocoder._compare_class_weights;
        var c = OSRM.Geocoder._compare_type_weights;
        var d = (-e[b["class"]] || 0) + (-c[b.type] || 0);
        var a = (-e[f["class"]] || 0) + (-c[f.type] || 0);
        return(d - a)
    }, _compareLocations: function(a, b) {
        if (a.lat != b.lat) {
            return a.lat < b.lat
        } else {
            return a.lon < b.lon
        }
    }, updateLocation: function(a) {
        if (a == OSRM.C.SOURCE_LABEL && OSRM.G.markers.hasSource()) {
            document.getElementById("gui-input-source").value = OSRM.G.markers.route[0].getLat().toFixed(6) + ", " + OSRM.G.markers.route[0].getLng().toFixed(6)
        } else {
            if (a == OSRM.C.TARGET_LABEL && OSRM.G.markers.hasTarget()) {
                document.getElementById("gui-input-target").value = OSRM.G.markers.route[OSRM.G.markers.route.length - 1].getLat().toFixed(6) + ", " + OSRM.G.markers.route[OSRM.G.markers.route.length - 1].getLng().toFixed(6)
            }
        }
    }, updateAddress: function(a, b) {
        var f = null;
        var c = null;
        var e = null;
        if (a == OSRM.C.SOURCE_LABEL && OSRM.G.markers.hasSource()) {
            f = OSRM.G.markers.route[0].getLat();
            c = OSRM.G.markers.route[0].getLng();
            e = OSRM.G.markers.route[0].description
        } else {
            if (a == OSRM.C.TARGET_LABEL && OSRM.G.markers.hasTarget()) {
                f = OSRM.G.markers.route[OSRM.G.markers.route.length - 1].getLat();
                c = OSRM.G.markers.route[OSRM.G.markers.route.length - 1].getLng();
                e = OSRM.G.markers.route[OSRM.G.markers.route.length - 1].description
            } else {
                return
            }
        }
        if (e != null) {
            OSRM.Geocoder._showReverseResults({address: {road: e}}, {marker_id: a});
            return
        }
        var d = OSRM.DEFAULTS.HOST_REVERSE_GEOCODER_URL + "?format=json&json_callback=%jsonp&accept-language=" + OSRM.Localization.current_language + "&lat=" + f.toFixed(6) + "&lon=" + c.toFixed(6);
        OSRM.JSONP.call(d, OSRM.Geocoder._showReverseResults, OSRM.Geocoder._showReverseResults_Timeout, OSRM.DEFAULTS.JSONP_TIMEOUT, "reverse_geocoder_" + a, {marker_id: a, do_fallback: b})
    }, _showReverseResults: function(c, d) {
        if (!c) {
            OSRM.Geocoder._showReverseResults_Timeout(c, d);
            return
        }
        if (c.address == undefined) {
            OSRM.Geocoder._showReverseResults_Timeout(c, d);
            return
        }
        var a = 0;
        var b = "";
        if (c.address.road) {
            b += c.address.road;
            a++
        }
        if (c.address.city) {
            if (a > 0) {
                b += ", "
            }
            b += c.address.city;
            a++
        } else {
            if (c.address.village) {
                if (a > 0) {
                    b += ", "
                }
                b += c.address.village;
                a++
            }
        }
        if (a < 2 && c.address.country) {
            if (a > 0) {
                b += ", "
            }
            b += c.address.country;
            a++
        }
        if (a == 0) {
            OSRM.Geocoder._showReverseResults_Timeout(c, d);
            return
        }
        if (d.marker_id == OSRM.C.SOURCE_LABEL && OSRM.G.markers.hasSource()) {
            document.getElementById("gui-input-source").value = b
        } else {
            if (d.marker_id == OSRM.C.TARGET_LABEL && OSRM.G.markers.hasTarget()) {
                document.getElementById("gui-input-target").value = b
            }
        }
    }, _showReverseResults_Timeout: function(a, b) {
        if (!b.do_fallback) {
            return
        }
        OSRM.Geocoder.updateLocation(b.marker_id)
    }};
OSRM.CSS = {getStylesheet: function(a, d) {
        d = d || document;
        var e = d.styleSheets;
        for (var c = 0, b = e.length; c < b; c++) {
            if (e[c].href.indexOf(a) >= 0) {
                return e[c]
            }
        }
        return null
    }, insert: function(b, a, c) {
        if (b.addRule) {
            b.addRule(a, c)
        } else {
            if (b.insertRule) {
                b.insertRule(a + " { " + c + " }", b.cssRules.length)
            }
        }
    }};
OSRM.JSONP = {fences: {}, callbacks: {}, timeouts: {}, timers: {}, late: function() {
    }, empty: function() {
    }, call: function(d, e, h, c, g, b) {
        if (OSRM.JSONP.fences[g] == true) {
            return false
        }
        OSRM.JSONP.fences[g] = true;
        OSRM.JSONP.timeouts[g] = function(i) {
            try {
                h(i, b)
            } finally {
                OSRM.JSONP.callbacks[g] = OSRM.JSONP.late;
                OSRM.JSONP.timeouts[g] = OSRM.JSONP.empty;
                OSRM.JSONP.fences[g] = undefined
            }
        };
        OSRM.JSONP.callbacks[g] = function(i) {
            clearTimeout(OSRM.JSONP.timers[g]);
            OSRM.JSONP.timers[g] = undefined;
            try {
                e(i, b)
            } finally {
                OSRM.JSONP.callbacks[g] = OSRM.JSONP.empty;
                OSRM.JSONP.timeouts[g] = OSRM.JSONP.late;
                OSRM.JSONP.fences[g] = undefined
            }
        };
        var f = document.getElementById("jsonp_" + g);
        if (f) {
            f.parentNode.removeChild(f)
        }
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.id = "jsonp_" + g;
        a.src = d.replace(/%jsonp/, "OSRM.JSONP.callbacks." + g);
        document.head.appendChild(a);
        OSRM.JSONP.timers[g] = setTimeout(OSRM.JSONP.timeouts[g], c);
        return true
    }, clear: function(b) {
        clearTimeout(OSRM.JSONP.timers[b]);
        OSRM.JSONP.callbacks[b] = OSRM.JSONP.empty;
        OSRM.JSONP.timeouts[b] = OSRM.JSONP.empty;
        OSRM.JSONP.fences[b] = undefined;
        var a = document.getElementById("jsonp_" + b);
        if (a) {
            a.parentNode.removeChild(a)
        }
    }, reset: function() {
        OSRM.JSONP.fences = {};
        OSRM.JSONP.callbacks = {};
        OSRM.JSONP.timeouts = {};
        OSRM.JSONP.timers = {}
    }};
OSRM.Localization = {DIRECTORY: "localization/", current_language: OSRM.DEFAULTS.LANGUAGE, fallback_language: "en", load_on_demand_language: null, init: function() {
        var g = OSRM.DEFAULTS.LANGUAGE_SUPPORTED;
        if (OSRM.DEFAULTS.LANGUAGE_USE_BROWSER_SETTING == true) {
            var b = (navigator.language || navigator.userLanguage || "").substring(0, 2);
            for (var e = 0; e < g.length; ++e) {
                if (g[e].encoding == b) {
                    OSRM.Localization.current_language = b
                }
            }
        }
        var c = [];
        var a = [];
        var f = 0;
        for (var e = 0, d = g.length; e < d; e++) {
            c.push({display: g[e].encoding, value: g[e].encoding});
            a.push({display: g[e].name, value: g[e].encoding});
            if (g[e].encoding == OSRM.Localization.current_language) {
                f = e
            }
        }
        OSRM.GUI.selectorInit("gui-language-toggle", c, f, OSRM.Localization.setLanguageWrapper);
        OSRM.GUI.selectorInit("gui-language-2-toggle", a, f, OSRM.Localization.setLanguageWrapper);
        OSRM.Localization.setLanguage(OSRM.Localization.fallback_language);
        OSRM.Localization.setLanguage(OSRM.Localization.current_language)
    }, setLanguageWrapper: function(a) {
        OSRM.GUI.deactivateTooltip("LOCALIZATION");
        OSRM.Localization.setLanguage(a)
    }, setLanguage: function(f, a) {
        if (a) {
            if (f != OSRM.Localization.load_on_demand_language) {
                return
            }
        }
        OSRM.GUI.selectorChange("gui-language-toggle", f);
        OSRM.GUI.selectorChange("gui-language-2-toggle", f);
        if (OSRM.Localization[f]) {
            OSRM.Localization.current_language = f;
            OSRM.Localization.load_on_demand_language = null;
            OSRM.GUI.setLabels();
            OSRM.GUI.updateNotifications();
            OSRM.Utils.updateAbbreviationCache();
            for (var d = 0, c = OSRM.G.localizable_maps.length; d < c; d++) {
                OSRM.G.localizable_maps[d].options.culture = OSRM.loc("CULTURE")
            }
            if (OSRM.G.map.layerControl.getActiveLayer().redraw) {
                OSRM.G.map.layerControl.getActiveLayer().redraw()
            }
            OSRM.G.map.layerControl.setLayerLabels();
            if (OSRM.G.markers == null) {
                return
            }
            if (OSRM.G.markers.route.length > 1) {
                OSRM.Routing.getRoute({keepAlternative: true})
            } else {
                if (OSRM.G.markers.route.length > 0 && document.getElementById("information-box").innerHTML != "") {
                    OSRM.Geocoder.call(OSRM.C.SOURCE_LABEL, document.getElementById("gui-input-source").value);
                    OSRM.Geocoder.call(OSRM.C.TARGET_LABEL, document.getElementById("gui-input-target").value)
                } else {
                    OSRM.Geocoder.updateAddress(OSRM.C.SOURCE_LABEL, false);
                    OSRM.Geocoder.updateAddress(OSRM.C.TARGET_LABEL, false);
                    OSRM.GUI.clearResults()
                }
            }
        } else {
            if (OSRM.DEFAULTS.LANUGAGE_ONDEMAND_RELOADING == true) {
                var e = OSRM.DEFAULTS.LANGUAGE_SUPPORTED;
                for (var d = 0, c = e.length; d < c; d++) {
                    if (e[d].encoding == f) {
                        OSRM.Localization.load_on_demand_language = f;
                        var b = document.createElement("script");
                        b.type = "text/javascript";
                        b.src = OSRM.Localization.DIRECTORY + "OSRM.Locale." + f + ".js";
                        document.head.appendChild(b);
                        break
                    }
                }
            }
        }
    }, translate: function(a) {
        if (OSRM.Localization[OSRM.Localization.current_language] && OSRM.Localization[OSRM.Localization.current_language][a]) {
            return OSRM.Localization[OSRM.Localization.current_language][a]
        } else {
            if (OSRM.Localization[OSRM.Localization.fallback_language] && OSRM.Localization[OSRM.Localization.fallback_language][a]) {
                return OSRM.Localization[OSRM.Localization.fallback_language][a]
            } else {
                return a
            }
        }
    }};
OSRM.loc = OSRM.Localization.translate;
OSRM.Printing = {DIRECTORY: "printing/", BASE_DIRECTORY: "../", init: function() {
        var c = document.createElement("div");
        c.id = "gui-printer-inactive";
        c.className = "iconic-button top-right-button";
        var b = document.createElement("div");
        b.className = "quad top-right-button";
        var a = document.getElementById("input-mask-header");
        a.appendChild(b, a.lastChild);
        a.appendChild(c, a.lastChild);
        document.getElementById("gui-printer-inactive").onclick = OSRM.Printing.openPrintWindow;
        OSRM.Browser.onUnloadHandler(OSRM.Printing.uninit)
    }, uninit: function() {
        if (OSRM.G.printwindow) {
            OSRM.G.printwindow.close()
        }
    }, activate: function() {
        if (document.getElementById("gui-printer-inactive")) {
            document.getElementById("gui-printer-inactive").id = "gui-printer"
        }
    }, deactivate: function() {
        if (document.getElementById("gui-printer")) {
            document.getElementById("gui-printer").id = "gui-printer-inactive"
        }
    }, show: function(c) {
        var n = "(";
        for (var e = 0, d = c.route_name.length; e < d; e++) {
            n += (e > 0 && c.route_name[e] != "" && c.route_name[e - 1] != "" ? " - " : "") + "<span style='white-space:nowrap;'>" + c.route_name[e] + "</span>"
        }
        n += ")";
        var k;
        if (OSRM.Browser.IE6_8) {
            k = '<thead class="description-header"><tr><td colspan="3"><table class="full"><tr class="row"><td class="left stretch"><table class="full"><tr class="row"><td class="center description-header-label">' + OSRM.loc("GUI_START") + ': </td><td class="left description-header-content stretch">' + document.getElementById("gui-input-source").value + '</td></tr><tr class="row"><td class="center description-header-label">↓</td><td class="left description-header-label stretch">' + n + '</td></tr><tr class="row"><td class="center description-header-label">' + OSRM.loc("GUI_END") + ': </td><td class="left description-header-content stretch">' + document.getElementById("gui-input-target").value + '</td></tr></table></td><td class="left"><table class="full"><tr class="row"><td class="left description-header-label">' + OSRM.loc("DISTANCE") + ': </td><td class="left description-header-content">' + OSRM.Utils.toHumanDistance(c.route_summary.total_distance) + '</td></tr><tr class="row"><td class="left description-header-label">' + OSRM.loc("DURATION") + ': </td><td class="left description-header-content">' + OSRM.Utils.toHumanTime(c.route_summary.total_time) + '</td></tr></table></td></tr></table><div class="quad"></div></td></tr></thead>'
        } else {
            k = '<thead class="description-header"><tr><td colspan="3"><div class="full"><div class="row"><div class="left stretch"><div class="full"><div class="row"><div class="center description-header-label">' + OSRM.loc("GUI_START") + ': </div><div class="left description-header-content stretch">' + document.getElementById("gui-input-source").value + '</div></div><div class="row"><div class="center description-header-label">↓</div><div class="left description-header-label">' + n + '</div></div><div class="row"><div class="center description-header-label">' + OSRM.loc("GUI_END") + ': </div><div class="left description-header-content stretch">' + document.getElementById("gui-input-target").value + '</div></div></div></div><div class="left"><div class="full"><div class="row"><div class="left description-header-label">' + OSRM.loc("DISTANCE") + ': </div><div class="left description-header-content">' + OSRM.Utils.toHumanDistance(c.route_summary.total_distance) + '</div></div><div class="row"><div class="left description-header-label">' + OSRM.loc("DURATION") + ': </div><div class="left description-header-content">' + OSRM.Utils.toHumanTime(c.route_summary.total_time) + '</div></div></div></div></div></div><div class="quad"></div></td></tr></thead>'
        }
        var m = '<tbody class="description-body">';
        for (var g = 0; g < c.route_instructions.length; g++) {
            var l = "description-body-odd";
            if (g % 2 == 0) {
                l = "description-body-even"
            }
            m += '<tr class="' + l + '">';
            m += '<td class="description-body-directions">';
            m += '<img class="description-body-direction" src="' + OSRM.Printing.BASE_DIRECTORY + OSRM.RoutingDescription._getDrivingInstructionIcon(c.route_instructions[g][0]) + '" alt="" />';
            m += "</td>";
            m += '<td class="description-body-items">';
            if (c.route_instructions[g][1] != "") {
                m += OSRM.loc(OSRM.RoutingDescription._getDrivingInstruction(c.route_instructions[g][0])).replace(/\[(.*)\]/, "$1").replace(/%s/, c.route_instructions[g][1]).replace(/%d/, OSRM.loc(c.route_instructions[g][6]))
            } else {
                m += OSRM.loc(OSRM.RoutingDescription._getDrivingInstruction(c.route_instructions[g][0])).replace(/\[(.*)\]/, "").replace(/%d/, OSRM.loc(c.route_instructions[g][6]))
            }
            m += "</td>";
            m += '<td class="description-body-distance">';
            m += (g == c.route_instructions.length - 1) ? "&nbsp;" : "<b>" + OSRM.Utils.toHumanDistance(c.route_instructions[g][2]) + "</b>";
            m += "</td>";
            m += "</tr>"
        }
        m += "</tbody>";
        var h = OSRM.G.printwindow;
        h.document.getElementById("description").innerHTML = '<table class="description medium-font">' + k + m + "</table>";
        h.document.getElementById("overview-map-description").innerHTML = '<table class="description medium-font">' + k + "</table>";
        var b = OSRM.G.map.getActiveLayerId();
        var f = OSRM.G.route.getPositions();
        var a = new L.LatLngBounds(f);
        var o = h.OSRM.drawMap(OSRM.DEFAULTS.TILE_SERVERS[b], a);
        h.OSRM.prefetchIcons(OSRM.G.images);
        h.OSRM.drawMarkers(OSRM.G.markers.route);
        h.OSRM.drawRoute(f);
        OSRM.JSONP.call(OSRM.Routing._buildCall() + "&z=" + o + "&instructions=false", OSRM.Printing.drawRoute, OSRM.Printing.timeoutRoute, OSRM.DEFAULTS.JSONP_TIMEOUT, "print")
    }, timeoutRoute: function() {
    }, drawRoute: function(a) {
        if (!a) {
            return
        }
        a.alternative_geometries.unshift(a.route_geometry);
        if (OSRM.G.active_alternative >= a.alternative_geometries.length) {
            return
        }
        positions = OSRM.RoutingGeometry._decode(a.alternative_geometries[OSRM.G.active_alternative], 5);
        OSRM.G.printwindow.OSRM.drawRoute(positions)
    }, openPrintWindow: function() {
        if (!OSRM.G.route.isRoute() || !OSRM.G.route.isShown()) {
            return
        }
        if (OSRM.G.printwindow) {
            OSRM.G.printwindow.close()
        }
        OSRM.G.printwindow = window.open(OSRM.Printing.DIRECTORY + "printing.html", "", "width=540,height=500,left=100,top=100,dependent=yes,location=no,menubar=no,scrollbars=yes,status=no,toolbar=no,resizable=yes")
    }, printWindowLoaded: function() {
        var e = OSRM.G.printwindow;
        var a = e.document;
        var d = [{id: "#gui-printer-inactive", image_id: "printer_inactive"}, {id: "#gui-printer", image_id: "printer"}, {id: "#gui-printer:hover", image_id: "printer_hover"}, {id: "#gui-printer:active", image_id: "printer_active"}];
        var c = OSRM.CSS.getStylesheet("printing.css", a);
        for (var b = 0; b < d.length; b++) {
            OSRM.CSS.insert(c, d[b].id, "background-image:url(" + OSRM.Printing.BASE_DIRECTORY + OSRM.G.images[d[b].image_id].getAttribute("src") + ");")
        }
        e.OSRM.G.active_distance_format = OSRM.G.active_distance_format;
        e.OSRM.G.Localization.culture = OSRM.loc("CULTURE");
        a.getElementById("description-label").innerHTML = OSRM.loc("ROUTE_DESCRIPTION");
        a.getElementById("overview-map-label").innerHTML = OSRM.loc("OVERVIEW_MAP");
        if (!OSRM.G.route.isRoute() || !OSRM.G.route.isShown()) {
            a.getElementById("description").innerHTML = OSRM.loc("NO_ROUTE_SELECTED");
            return
        }
        OSRM.Printing.show(OSRM.G.response);
        a.getElementById("gui-printer-inactive").id = "gui-printer";
        a.getElementById("gui-printer").onclick = e.printWindow;
        e.focus()
    }};
OSRM.Utils = {seconds: "s", minutes: "min", hours: "h", miles: "mi", feet: "ft", kilometers: "km", meters: "m", updateAbbreviationCache: function() {
        OSRM.Utils.seconds = OSRM.loc("GUI_S");
        OSRM.Utils.minutes = OSRM.loc("GUI_MIN");
        OSRM.Utils.hours = OSRM.loc("GUI_H");
        OSRM.Utils.miles = OSRM.loc("GUI_MI");
        OSRM.Utils.feet = OSRM.loc("GUI_FT");
        OSRM.Utils.kilometers = OSRM.loc("GUI_KM");
        OSRM.Utils.meters = OSRM.loc("GUI_M")
    }, toHumanTime: function(a) {
        a = parseInt(a);
        minutes = parseInt(a / 60);
        a = a % 60;
        hours = parseInt(minutes / 60);
        minutes = minutes % 60;
        if (hours == 0 && minutes == 0) {
            return a + "&nbsp;s"
        } else {
            if (hours == 0) {
                return minutes + "&nbsp;min"
            } else {
                return hours + "&nbsp;h&nbsp;" + minutes + "&nbsp;min"
            }
        }
    }, toHumanDistanceMeters: function(a) {
        var b = parseInt(a);
        b = b / 1000;
        if (b >= 100) {
            return(b).toFixed(0) + "&nbsp;" + OSRM.Utils.kilometers
        } else {
            if (b >= 10) {
                return(b).toFixed(1) + "&nbsp;" + OSRM.Utils.kilometers
            } else {
                if (b >= 0.1) {
                    return(b).toFixed(2) + "&nbsp;" + OSRM.Utils.kilometers
                } else {
                    return(b * 1000).toFixed(0) + "&nbsp;" + OSRM.Utils.meters
                }
            }
        }
    }, toHumanDistanceMiles: function(a) {
        var b = parseInt(a);
        b = b / 1609.344;
        if (b >= 100) {
            return(b).toFixed(0) + "&nbsp;" + OSRM.Utils.miles
        } else {
            if (b >= 10) {
                return(b).toFixed(1) + "&nbsp;" + OSRM.Utils.miles
            } else {
                if (b >= 0.1) {
                    return(b).toFixed(2) + "&nbsp;" + OSRM.Utils.miles
                } else {
                    return(b * 5280).toFixed(0) + "&nbsp;" + OSRM.Utils.feet
                }
            }
        }
    }, toHumanDistance: null, isLatitude: function(a) {
        if (a >= -90 && a <= 90) {
            return true
        } else {
            return false
        }
    }, isLongitude: function(a) {
        if (a >= -180 && a <= 180) {
            return true
        } else {
            return false
        }
    }, isNumber: function(a) {
        return !isNaN(parseFloat(a)) && isFinite(a)
    }};