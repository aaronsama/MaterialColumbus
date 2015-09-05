angular.module('tracks')

.controller('TrackDetailsController', function($scope, $routeParams, $location, $mdToast, TracksDataService){

  $scope.trackLoading = true;

  TracksDataService.get($routeParams.trackName).then(function(trackData){
    $scope.selectedTrack = trackData;
    postToWebview(trackData);
  }, function(reason){
    $mdToast.showSimple(reason);
  });

  $scope.deselectTrack = function(){
    postToWebview(null);
    $location.path('/tracks');
  };

  var postToWebview = function(track){
    var webview = document.querySelector('webview');
    webview.contentWindow.postMessage({track: track},'chrome-extension://laddhngkclengmbmkjhdbnddglncbejf/map.html#!/');
  };

  $scope.$root.$on('$messageIncoming', function (event, data){
    $scope.trackLoading = false;

    if (data.error){
      $mdToast.showSimple(data.error);
    } else if (data.message === 'trackDisplayed'){
      //reloadMasonry(500);
    }
  });

});