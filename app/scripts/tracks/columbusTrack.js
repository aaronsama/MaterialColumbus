angular.module('tracks')

.factory('ColumbusConverter', ['$filter','$http', '$q', function($filter,$http,$q){

  var convertPoints = function($fileContent){
    var rows = $fileContent.split('\n');
    rows.shift(); //remove header

    var obj = [],
        lastPoint = {};

    angular.forEach(rows, function(val, idx) {
      if (val !== '') {
        var o = val.split(','),
            lat = $filter('columbusLatitude')(o[4]),
            lng = $filter('columbusLongitude')(o[5]);

        if (lat !== lastPoint.latitude && lng !== lastPoint.longitude) {
          var point = {
            timestamp: $filter('columbusTimestamp')(o[2],o[3]),
            point_type: o[1],
            latitude: lat,
            longitude: lng,
            height: o[6],
            heading: o[7]
          };
          obj.push(point);
          lastPoint = point;
        }
      }
    });

    return obj;
  };

  var convertCSV = function(name, $fileContent){
    return $q(function(resolve, reject){
      var rows = $fileContent.split('\n');
      rows.shift(); //remove header

      if (rows.length > 1) {
        var obj = convertPoints($fileContent),
            start = "Somewhere",
            end = "Somewhere else";

        reverseGeocode(obj[0])
        .then(function(res){
          start = res;
          reverseGeocode(obj[obj.length-1])
          .then(function(res){
            end = res;
            resolve({
              name: name,
              date: obj[0].timestamp,
              start: start,
              end: end,
              points: obj,
              notes: "Double click to add some notes",
              editing: false,
              geojson: null
            });
          });
        });

      } else {
        reject("This track has no points!");
      }
    });
  };

  var reverseGeocode = function(point){
    return $q(function(resolve, reject){
      $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+point.latitude+','+point.longitude+'&key=AIzaSyDUO5OAsX9LAGQEtKLt012nKrIGj45DyiE').
      success(function(data, status){
        if (data.status === "OK") {
          if (data.results[0].types[0] === "locality") {
            var city = data.results[0].address_components[0].short_name;
            resolve(city);
          } else {
            resolve(data.results[0].formatted_address);
          }
        } else {
          resolve('Somewhere');
        }
      }).
      error(function(){
        resolve('Somewhere');
      });
    });

  };

  return {
    convertPoints: convertPoints,
    convertCSV: convertCSV,
    reverseGeocode: reverseGeocode
  };
}])

.filter('columbusTimestamp',function(){
  return function(date,time){
    //return moment(date + time, "YYMMDDHHmmss"); //DON'T USE IT! IT WILL CORRUPT THE DB
    var d = date.match(/.{1,2}/g).join('-');
    var t = time.match(/.{1,2}/g).join(':');
    return new Date("20" + d + "T" + t);
  };
})

.filter('columbusLatitude',function(){
  return function(input){
    var floatPart = parseFloat(input.substring(0,input.length-1));
    return input.slice(-1) == 'S' ? -floatPart : floatPart;
  };
})

.filter('columbusLongitude',function(){
  return function(input){
    var floatPart = parseFloat(input.substring(0,input.length-1));
    return input.slice(-1) == 'W' ? -floatPart : floatPart;
  };
});