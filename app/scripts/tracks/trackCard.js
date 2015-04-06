angular.module('tracks')

.directive('trackCard', function(TracksDataService){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      track: '=',
      expand: '=',
      onclose: '&'
    }, // {} = isolate, true = child, false/undefined = no change
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'templates/trackCard.html',
    controller: function ($scope, $attrs) {
      $scope.deselectTrack = function() {
        $scope.onclose();
      };

      $scope.editTrackTitle = function(track){
        track.editing = true;
        $scope.editedTrackTitle = track.title;
      };

      $scope.doneEditingTrackTitle = function(track){
        TracksDataService.update(track).then(function(){
          track.editing = false;
          $scope.editedTrackTitle = null;
          TracksDataService.refresh();
        }, function(reason){
          console.log(reason);
        });
      };

      $scope.editTrackNotes = function(track){
        track.editing = true;
        $scope.editedTrackNotes = track.notes;
      };

      $scope.doneEditingTrackNotes = function(track){
        TracksDataService.update(track).then(function(){
          track.editing = false;
          $scope.editedTrackNotes = null;
          TracksDataService.refresh();
        }, function(reason){
          console.log(reason);
        });

      };
    }
    // replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    // link: function($scope, element, iAttrs, controller) {
    //   element.find('#deselect-track').on('click', function(event){
    //     $scope.$root.deselectTrack(event);
    //   });
    // }
  };
});