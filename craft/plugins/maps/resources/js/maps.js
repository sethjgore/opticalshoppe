var Maps;
(function (Maps) {
    var Map = (function () {
        function Map(name, markers, options) {
            this.autoZoom = false;
            this.name = name;
            this.markers = [];
            this.$map = document.getElementById(name + '-map');
            var mapOptions;
            if(options) {
                options = JSON.parse(options);
                if(options.autoZoom && options.autoZoom == true) {
                    this.autoZoom = true;
                }
                mapOptions = {
                    zoom: options.zoom || Map.defaults.zoom,
                    center: options.center ? new google.maps.LatLng(options.center.ob, options.center.pb, false) : Map.defaults.center,
                    mapTypeId: options.mapTypeId || Map.defaults.mapTypeId
                };
            } else {
                mapOptions = Map.defaults;
            }
            this.map = new google.maps.Map(this.$map, mapOptions);
            if(markers) {
                markers = JSON.parse(markers);
                var marker;
                for(var i = 0; i < markers.length; i++) {
                    marker = markers[i];
                    this.addMarker(new google.maps.LatLng(marker.lat, marker.lng, false));
                }
            }
        }
        Map.defaults = {
            zoom: 1,
            center: new google.maps.LatLng(0, 0, false),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        Map.prototype.addMarker = function (latLng, draggable) {
            if (typeof draggable === "undefined") { draggable = false; }
            var marker = new google.maps.Marker({
                map: this.map,
                position: latLng,
                draggable: draggable
            });
            this.markers.push(marker);
            if(this.autoZoom) {
                if(this.markers.length > 1) {
                    var bounds = new google.maps.LatLngBounds();
                    for(var i = 0; i < this.markers.length; i++) {
                        bounds.extend(this.markers[i].getPosition());
                    }
                    this.map.fitBounds(bounds);
                } else {
                    this.map.panTo(marker.getPosition());
                    this.map.setZoom(8);
                }
            }
            return marker;
        };
        return Map;
    })();
    Maps.Map = Map;
})(Maps || (Maps = {}));

var Maps;
(function (Maps) {
    var Geocoder = (function () {
        function Geocoder(name) {
            this.$address = $('#' + name + '-address');
            this.$spinner = $('#' + name + '-spinner');
            this.geocoder = new google.maps.Geocoder();
            this.addListeners();
        }
        Geocoder.prototype.addListeners = function () {
            var _this = this;
            this.$address.keydown(function (event) {
                if(event.keyCode == 13) {
                    event.preventDefault();
                    _this.geocode();
                    $(this).val('');
                    return false;
                }
            });
        };
        Geocoder.prototype.geocode = function () {
            this.$spinner.removeClass('hidden');
            var _this = this;
            this.geocoder.geocode({
                'address': this.$address.val()
            }, function (results, status) {
                _this.$spinner.addClass('hidden');
                var args = {
                    status: status,
                    location: new google.maps.LatLng(0, 0, false)
                };
                if(status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    args.location = new google.maps.LatLng(lat, lng, false);
                }
                _this.$address.trigger("geocoded", args);
            });
        };
        return Geocoder;
    })();
    Maps.Geocoder = Geocoder;
})(Maps || (Maps = {}));

var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Maps;
(function (Maps) {
    var MapFieldType = (function (_super) {
        __extends(MapFieldType, _super);
        function MapFieldType(name, markers, options) {
            if (typeof markers === "undefined") { markers = []; }
                _super.call(this, name, markers, options);
            this.geocoder = new Maps.Geocoder(name);
            this.addListeners();
        }
        MapFieldType.prototype.addListeners = function () {
            var _this = this;
            google.maps.event.addListener(this.map, 'click', function (event) {
                _this.addMarker(event.latLng);
            });
            $('#content form').submit(function () {
                var marker;
                var locations = [];
                for(var i = 0; i < _this.markers.length; i++) {
                    marker = _this.markers[i];
                    locations.push({
                        lat: marker.position.lat(),
                        lng: marker.position.lng()
                    });
                }
                var value = {
                    locations: locations,
                    options: {
                        zoom: _this.map.getZoom(),
                        center: _this.map.getCenter(),
                        mapTypeId: _this.map.getMapTypeId()
                    }
                };
                $('#' + _this.name + '-value').val(JSON.stringify(value));
                return true;
            });
            this.geocoder.$address.on('geocoded', function (event, args) {
                if(args.status == google.maps.GeocoderStatus.OK) {
                    _this.addMarker(args.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + args.status);
                }
            });
        };
        MapFieldType.prototype.addMarker = function (latLng) {
            var _this = this;
            var marker = _super.prototype.addMarker.call(this, latLng, true);
            google.maps.event.addListener(marker, 'click', function (event) {
                _this.markers.splice(_this.markers.indexOf(marker), 1);
                marker.setMap(null);
            });
            return marker;
        };
        return MapFieldType;
    })(Maps.Map);
    Maps.MapFieldType = MapFieldType;
})(Maps || (Maps = {}));

var Maps;
(function (Maps) {
    var LocationFieldType = (function (_super) {
        __extends(LocationFieldType, _super);
        function LocationFieldType(name, lat, lng, options) {
            var markers = [];
            if(lat != null && lng != null) {
                markers = [
                    {
                        lat: lat,
                        lng: lng
                    }
                ];
            }
            this.$lat = $('#' + name + '-lat');
            this.$lng = $('#' + name + '-lng');
            this.geocoder = new Maps.Geocoder(name);
                _super.call(this, name, JSON.stringify(markers), options);
            this.addListeners();
        }
        LocationFieldType.prototype.addListeners = function () {
            var _this = this;
            google.maps.event.addListener(this.map, 'click', function (event) {
                _this.addMarker(event.latLng);
            });
            this.$lat.change(function () {
                _this.updateMarkerPosition(_this.$lat.val(), _this.$lng.val());
            });
            this.$lng.change(function () {
                _this.updateMarkerPosition(_this.$lat.val(), _this.$lng.val());
            });
            this.geocoder.$address.on('geocoded', function (event, args) {
                if(args.status == google.maps.GeocoderStatus.OK) {
                    _this.$lat.val(args.location.lat());
                    _this.$lng.val(args.location.lng());
                    _this.addMarker(args.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + args.status);
                }
            });
        };
        LocationFieldType.prototype.addMarker = function (latLng) {
            var _this = this;
            var marker;
            if(this.markers.length > 0) {
                marker = this.markers[0];
                marker.setPosition(latLng);
            } else {
                marker = _super.prototype.addMarker.call(this, latLng, true);
            }
            this.map.panTo(latLng);
            _this.$lat.val(latLng.lat());
            _this.$lng.val(latLng.lng());
            google.maps.event.addListener(marker, 'dragend', function (event) {
                marker.setPosition(event.latLng);
                _this.$lat.val(event.latLng.lat());
                _this.$lng.val(event.latLng.lng());
            });
            google.maps.event.addListener(marker, 'click', function (event) {
                marker.setMap(null);
                _this.markers = [];
                _this.$lat.val(null);
                _this.$lng.val(null);
            });
            return marker;
        };
        LocationFieldType.prototype.updateMarkerPosition = function (lat, lng) {
            var latLng = new google.maps.LatLng(lat, lng, false);
            this.addMarker(latLng);
        };
        return LocationFieldType;
    })(Maps.Map);
    Maps.LocationFieldType = LocationFieldType;
})(Maps || (Maps = {}));

google.maps.visualRefresh = true;
