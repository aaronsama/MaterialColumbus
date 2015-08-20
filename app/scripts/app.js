'use strict';

angular.module('materialColumbus', ['tracks', 'map', 'settings', 'activity', 'ngRoute', 'ngMaterial','wu.masonry','indexedDB','ngAnimate','angularMoment'])

.config(function($routeProvider, $mdThemingProvider, $indexedDBProvider, $mdIconProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green');

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

  $mdIconProvider
    // .iconSet('action', '../styles/images/icons/material-design/action-icons.svg', 24)
    // .iconSet('alert', '../styles/images/icons/material-design/alert-icons.svg', 24)
    // .iconSet('av', '../styles/images/icons/material-design/av-icons.svg', 24)
    // .iconSet('communication', '../styles/images/icons/material-design/communication-icons.svg', 24)
    // .iconSet('content', '../styles/images/icons/material-design/content-icons.svg', 24)
    // .iconSet('device', '../styles/images/icons/material-design/device-icons.svg', 24)
    // .iconSet('editor', '../styles/images/icons/material-design/editor-icons.svg', 24)
    // .iconSet('file', '../styles/images/icons/material-design/file-icons.svg', 24)
    // .iconSet('hardware', '../styles/images/icons/material-design/hardware-icons.svg', 24)
    // .iconSet('icons', '../styles/images/icons/material-design/icons-icons.svg', 24)
    // .iconSet('image', '../styles/images/icons/material-design/image-icons.svg', 24)
    .iconSet('maps', '../styles/images/icons/material-design/maps-icons.svg', 24);
    // .iconSet('navigation', '../styles/images/icons/material-design/navigation-icons.svg', 24)
    // .iconSet('notification', '../styles/images/icons/material-design/notification-icons.svg', 24)
    // .iconSet('social', '../styles/images/icons/material-design/social-icons.svg', 24)
    // .iconSet('toggle', '../styles/images/icons/material-design/toggle-icons.svg', 24);

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