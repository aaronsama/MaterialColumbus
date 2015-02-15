'use strict';

angular.module('materialColumbus', ['tracks', 'map', 'settings', 'ngRoute', 'ngMaterial','wu.masonry','xc.indexedDB'])

.config(function($routeProvider, $mdThemingProvider, $indexedDBProvider) {
  $mdThemingProvider.theme('default')
    .primaryColor('pink')
    .accentColor('orange');

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
    .when('/', {
      controller: 'TracksController',
      templateUrl: 'templates/tracks.html'
    });
});