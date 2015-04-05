'use strict';

angular.module('materialColumbus', ['tracks', 'map', 'settings', 'ngRoute', 'ngMaterial','wu.masonry','indexedDB','ngAnimate','angularMoment','pippTimelineDirectives'])

.config(function($routeProvider, $mdThemingProvider, $indexedDBProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');

  $indexedDBProvider
    .connection('material-tracklogs-meta')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('tracklogs', {keyPath: 'name'});

        //useful indices
        //objStore.createIndex('name_idx', 'name', { unique: true });
        objStore.createIndex('start_idx', 'start', { unique: false });
        objStore.createIndex('end_idx', 'end', { unique: false });
        objStore.createIndex('year_idx', 'year', {unique: false});
        objStore.createIndex('month_idx', 'month', {unique: false});
      });

  $routeProvider
    .when('/tracks', {
      controller: 'TracksController',
      templateUrl: 'templates/tracks.html'
    })
    .when('/tracks/:trackName', {
      controller: 'TracksController',
      templateUrl: 'templates/trackDetails.html'
    })
    .otherwise({
      redirectTo: '/tracks'
    });
})

.run(function(amMoment){
  // amMoment.changeLocale('it');
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://fonts.gstatic.com/s/roboto/v15/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2", true);
  xhr.responseType = "blob";
  xhr.onreadystatechange = function() {
      // console.log("STATE", xhr.readyState);
      if (xhr.readyState == 4) {
          var myfontblob = window.URL.createObjectURL(xhr.response);
          var newStyle = document.createElement('style');
          newStyle.appendChild(document.createTextNode("\
          @font-face {\
            font-family: Roboto;\
            font-style: normal, light;\
            font-weight: 400;\
            src: url('" + myfontblob + "') format(woff2);\
          }\
          "));
          document.head.appendChild(newStyle);
      }
  };
  xhr.send();
});