'use strict';

angular.module('materialColumbus', ['tracks', 'map', 'settings', 'ngRoute', 'ngMaterial','wu.masonry','xc.indexedDB'])

.config(function($routeProvider, $mdThemingProvider, $indexedDBProvider) {
  $mdThemingProvider.theme('default')
    .primaryColor('pink')
    .accentColor('orange');

  $indexedDBProvider
    .connection('material-tracklogs-meta')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('tracklogs', {autoIncrement: true});

        //useful indices
        objStore.createIndex('name_idx', 'name', { unique: true });
        objStore.createIndex('start_idx', 'start', { unique: false });
        objStore.createIndex('end_idx', 'end', { unique: false });

      })
      .upgradeDatabase(2, function(event, db, tx){
        var objStore = tx.objectStore('tracklogs');

        objStore.createIndex('year_idx', 'year', {unique: false});
        objStore.createIndex('month_idx', 'month', {unique: false});
      });

  $routeProvider
    .when('/', {
      controller: 'TracksController',
      templateUrl: 'tracks.html'
    });
});