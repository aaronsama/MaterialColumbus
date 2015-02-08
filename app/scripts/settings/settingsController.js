angular.module('settings',[])

.controller('SettingsController',['$scope','$mdToast', 'TracksDataService', function($scope, $mdToast, tracksDataService){

  $scope.tracklogsDir = tracksDataService.tracklogsDir();

  $scope.selectTracklogsDir = function(){
    tracksDataService.chooseTracklogsDir()
      .then(function(){
        $mdToast.show(
          $mdToast.simple()
          .content('Tracklogs dir changed')
          .action('OK')
          .highlightAction(false)
        );
      });
  };

}]);