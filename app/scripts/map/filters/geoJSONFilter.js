'use strict';

angular.module('map')

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