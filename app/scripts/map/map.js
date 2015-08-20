angular.module('map',['leaflet-directive','ngPostMessage'])//,'highcharts-ng'])

.controller('MapController', ['$scope', '$filter', '$q', 'leafletData', 'leafletBoundsHelpers', function($scope, $filter, $q, leafletData, leafletBoundsHelpers/*, TracksData*/){

  //Leaflet stuff
  // L.Icon.Default.imagePath = '/assets/images';
  L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

  angular.extend($scope,{
    defaults: {
      zoomControl: false,
      touchZoom: true
    },
    center: {
      lat: 46,
      lng: 11,
      zoom: 7
    },
    tiles: {
      url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; OpenCycleMap, ' + 'Map data ' + '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
      }
    }
  });

  $scope.mapStyle = function() {
    leafletData.getMap().then(function(map){
      map.invalidateSize();
    });
    return 'width: 100%; height: '+ $('#map-container').height() +'px;';
  };

  $scope.$root.$on('$messageIncoming', function (event, data){
    if (data.track){
      trackSelected(data.track).then(function(response){
        $scope.$root.$broadcast('$messageOutgoing',{message: 'trackDisplayed'});
      }, function(reason){
        $scope.$root.$broadcast('$messageOutgoing',{error: 'Can\'t display track!'});
      });
    } else if (data.point){
      $scope.addPictureMarker(data.point);
    } else {
      angular.extend($scope,{
        geojson: {}
      });
    }
  });

  // $scope.$on('message',function(event){
  //   console.log(event.data);
  // });

  var trackSelected = function(track){
    return $q(function(resolve,reject){
      $scope.track = track;
      var geoJSON = $filter('geoJSON')(track);

      // Display the track on the map
      leafletData.getMap().then(function(map){
        map.fitBounds(track.points.map(function(point) {
          return [point.latitude,point.longitude];
        }));

        angular.extend($scope, {
          geojson: {
            data: geoJSON,
            pointToLayer: function(feature, latlng){
              if (feature.properties.pointType === 'start'){
                return L.marker(
                  latlng,
                  {
                    icon: L.AwesomeMarkers.icon({
                      markerColor: 'blue',
                      icon: 'play'
                    })
                  });
              } else if (feature.properties.pointType === 'end'){
                return L.marker(
                  latlng,
                  {
                    icon: L.AwesomeMarkers.icon({
                      markerColor: 'blue',
                      icon: 'stop'
                    })
                  });
              }
              return {};
            },
            onEachFeature: function(feature,layer){
              if (feature.properties && feature.properties.popupContent) {
                var popupContent = feature.properties.popupContent;
                layer.bindPopup(popupContent);
              }
            },
            style: {
              weight: 2,
              opacity: 1,
              color: 'blue'
            }
          }
        });

        resolve();
      }, function(reason){
        reject(reason);
      });
    });
  };

  $scope.addPictureMarker = function(point){
    leafletData.getMap().then(function(map){
      var icon = L.AwesomeMarkers.icon({
        markerColor: 'blue',
        icon: 'camera'
      });
      L.marker([point.latitude, point.longitude], {
        icon: icon,
        draggable: true
      }).addTo(map);
    });
  };

}])

.directive('mapResize', ['$window', 'leafletData', function ($window, leafletData) {
  return {
    link: function (scope, element) {
      w = angular.element($window);
      scope.$watch(function(){ return $("#map-container").height(); }, function (newValue, oldValue) {
        scope.mapStyle = function () {
          return 'width: 100%; height: '+ $('#map-container').height() +'px;';
        };
      }, true);

      w.bind('resize', function () {
        scope.$apply();
        leafletData.getMap().then(function(map){
          map.invalidateSize();
        });
      });
    }
  };
}])

.filter('geoJSON',function() {
  return function(track){
    if (!track.geojson) {
      track.geojson = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            "properties": {
              "name": track.start + " to " + track.end,
              "popupContent": track.notes
            },
            "geometry": {
              "type": "LineString",
              "coordinates": track.points.map(function(point) {
                  //geoJSON uses x,y for coordinates!
                  return [point.longitude, point.latitude];
                })
            }
          },
          {
            'type': 'Feature',
            'properties': {
              'pointType': 'start'
            },
            'geometry': {
              "type": "Point",
              "coordinates": [track.points[0].longitude, track.points[0].latitude]
            }
          },
          {
            'type': 'Feature',
            'properties': {
              'pointType': 'end'
            },
            'geometry': {
              "type": "Point",
              "coordinates": [track.points[track.points.length - 1].longitude, track.points[track.points.length - 1].latitude]
            }
          }
        ]
      };
    }
    return track.geojson;
  };
});