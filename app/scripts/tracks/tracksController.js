angular.module('tracks')

.controller('TracksController', ['$scope', '$rootScope', '$mdToast', '$timeout', 'TracksDataService', 'ColumbusConverter', function($scope,$rootScope,$mdToast,$timeout,TracksDataService,columbusConverter){
  $scope.tracks = TracksDataService.all;
  $scope.trackLoading = false;
  $scope.selectedTrack = null;

  $scope.openFileChooser = function(){
    chrome.fileSystem.chooseEntry({type: 'openFile', accepts: [{ mimeTypes: ['text/csv']}]}, function(readOnlyEntry) {
      readOnlyEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = function(e) {
          toast('Error loading file');
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
      }, function(reason){
        $scope.trackLoading = false;
        toast('Can\'t add this track! ' + reason);
      });
    }, function(reason){
      $scope.trackLoading = false;
      toast('Can\'t add this track! ' + reason);
    });
  };

  $scope.select = function(track){
    $scope.selectedTrack = track;
    $scope.trackLoading = true;

    TracksDataService.get(track).then(function(trackData){
      postToWebview(trackData);
    }, function(reason){
      toast(reason);
    });
  };

  $scope.deselectTrack = function($event){
    $event.stopPropagation();
    $scope.selectedTrack = null;
    reloadMasonry(0);
    postToWebview(null);
  };

  $scope.isSelected = function(track){
    return (track === $scope.selectedTrack);
  };

  $scope.editTrackNotes = function(track){
    track.editing = true;
    $scope.editedTrackNotes = track.notes;
  };

  $scope.doneEditingTrackNotes = function(track){
    TracksDataService.update(track._id, track);

    track.editing = false;
    $scope.editedTrackNotes = null;
  };

  $scope.tracksIn = function(year, month){
    TracksDataService.tracksIn(year, month).then(function(result){

    }, function(reason){

    });
  };

  var reloadMasonry = function(delay){
    $timeout(function(){
      $('#tracks-masonry-container').masonry();
    },delay);
  };

  var postToWebview = function(track){
    var webview = document.querySelector('webview');
    webview.contentWindow.postMessage({track: track},'chrome-extension://laddhngkclengmbmkjhdbnddglncbejf/map.html#!/');
  };

  var toast = function(message){
    $mdToast.show(
      $mdToast.simple()
      .content(message)
      .action('OK')
      .highlightAction(false)
    );
  };

  $scope.$root.$on('$messageIncoming', function (event, data){
    $scope.trackLoading = false;

    if (data.error){
      toast(data.error);
    } else if (data.message === 'trackDisplayed'){
      reloadMasonry(500);
    }
  });
}])

// //Credit for ngBlur and ngFocus to https://github.com/addyosmani/todomvc/blob/master/architecture-examples/angularjs/js/directives/
.directive('ngBlur', function() {
  return function( scope, elem, attrs ) {
    elem.bind('blur', function() {
      scope.$apply(attrs.ngBlur);
    });
  };
})

.directive('ngFocus', function( $timeout ) {
  return function( scope, elem, attrs ) {
    scope.$watch(attrs.ngFocus, function( newval ) {
      if ( newval ) {
        $timeout(function() {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
});

// angular.module('tracks',['columbusTrack','trackDisplay','dateFilters'])

// .controller('TracksController', ['$scope', '$rootScope', '$filter', 'columbusConverter', 'TracksDataService', 'FoundationApi', function($scope, $rootScope, $filter, columbusConverter, TracksDataService, foundationApi){

//   $scope.tracks = TracksDataService.db;
//   $scope.editedTrackNotes = null;
//   $scope.selectedTrack = null;
//   $scope.altChartConfig = {
//     options: {
//       title: {
//         text: 'Altitude Profile'
//       },
//       chart: {
//         type: 'area'
//       },
//       lang: {
//         noData: 'No Data to Display!'
//       }
//     },
//     loading: true,
//     size: {
//       width: 800,
//       height: 400
//     }
//   };

//   $rootScope.$on('pictureSelected', function(event, timestamp) {
//     var datetime = moment(timestamp, "YYYY:MM:DD HH:mm:ss");
//     // var datetime = new (Date.bind.apply(Date, [null].concat(timestamp.split(/ |:/))))();

//     if ($scope.selectedTrack) {
//       var candidatePoint,
//           minDist = 5000; //turn that 5000 into a variable

//       $scope.selectedTrack.points.forEach(function(point){
//         var diff = Math.abs(datetime.diff(point.timestamp));
//         if (diff <= minDist){
//           minDist = diff;
//           candidatePoint = point;
//         }
//       });

//       if (candidatePoint){
//         var webview = document.querySelector('webview');
//         webview.contentWindow.postMessage({point: candidatePoint},'chrome-extension://lllnimfggckmlgjamendhnigclmbnofo/map.html#!/');
//       } else {
//         foundationApi.publish('main-notifications', { title: "Can't geolocate picture", content: "Can't find a candidate point", color: "alert" });
//       }
//     } else {
//       foundationApi.publish('main-notifications', { title: "Can't geolocate picture", content: "You need to select a track first!", color: "alert" });
//     }
//   });


//   $scope.removeTrack = function(track) {
//     if (track === $scope.selectedTrack) {
//       $scope.selectedTrack = null;
//     }
//     TracksDataService.del(track);
//   };




//   //load the altitude profile when the track stats modal is opened
//   foundationApi.subscribe('track-stats', function(msg){
//     if (msg === 'open') {
//       TracksDataService.altitudeProfile($scope.selectedTrack).then(function(resp){
//         $scope.altChartConfig.series = [resp];
//         $scope.altChartConfig.loading = false;
//       });
//     } else if (msg === 'close') {
//       $scope.altChartConfig.loading = true;
//     }
//   });

// }])
