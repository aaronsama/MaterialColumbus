'use strict';

angular.module('tracks')

.controller('TracksController', ['$scope', '$rootScope', '$mdToast', '$timeout', '$location', 'TracksDataService', 'ColumbusConverter', function($scope,$rootScope,$mdToast,$timeout,$location,TracksDataService,columbusConverter){
  $scope.tracks = TracksDataService.recent;
  // $scope.tracksIn = TracksDataService.tracksIn;
  $scope.years = TracksDataService.years;
  $scope.trackLoading = false;
  $scope.selectedYear = new Date().getYear();

  $scope.openFileChooser = function(){
    chrome.fileSystem.chooseEntry({type: 'openFile', accepts: [{ mimeTypes: ['text/csv']}]}, function(readOnlyEntry) {
      readOnlyEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = function(e) {
          $mdToast.showSimple('Error loading file');
        };

        reader.onloadend = function(e) {
          $scope.addColumbusTrack(readOnlyEntry, e.target.result);
        };

        reader.readAsText(file);
      });
    });
  };

  $scope.addColumbusTrack = function(entry, $fileContent){
    var name = entry.name;
    $scope.trackLoading = true;

    columbusConverter.convertCSV(name, $fileContent)
    .then(function(track){
      TracksDataService.add(track, entry).then(function(){
        $scope.trackLoading = false;
        TracksDataService.refresh();
      }, function(reason){
        $scope.trackLoading = false;
        $mdToast.showSimple('Can\'t add this track! ' + reason);
      });
    }, function(reason){
      $scope.trackLoading = false;
      $mdToast.showSimple('Can\'t add this track! ' + reason);
    });
  };

  $scope.select = function(track){
    $location.path('/tracks/' + track.name);
  };

  $scope.tracksIn = function(year){
    TracksDataService.tracksIn(year).then(function(result){

    }, function(reason){

    });
  };

}]);