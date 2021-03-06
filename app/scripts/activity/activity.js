angular.module('activity', [])

.constant('activityTypes', [
  { name: 'Aerobics', value: 9 },
  { name: 'Badminton', value: 10 },
  { name: 'Baseball', value: 11 },
  { name: 'Basketball ', value: 12 },
  { name: 'Biathlon', value: 13 },
  { name: 'Biking', value: 1 },
  { name: 'Handbiking', value: 14 },
  { name: 'Mountain biking', value: 15 },
  { name: 'Road biking', value: 16 },
  { name: 'Spinning', value: 17 },
  { name: 'Stationary biking', value: 18 },
  { name: 'Utility biking', value: 19 },
  { name: 'Boxing', value: 20 },
  { name: 'Calisthenics', value: 21 },
  { name: 'Circuit training', value: 22 },
  { name: 'Cricket', value: 23 },
  { name: 'Curling', value: 106 },
  { name: 'Dancing', value: 24 },
  { name: 'Diving', value: 102 },
  { name: 'Elliptical', value: 25 },
  { name: 'Ergometer', value: 103 },
  { name: 'Fencing', value: 26 },
  { name: 'Football (American)', value: 27 },
  { name: 'Football (Australian)', value: 28 },
  { name: 'Football (Soccer)', value: 29 },
  { name: 'Frisbee', value: 30 },
  { name: 'Gardening', value: 31 },
  { name: 'Golf', value: 32 },
  { name: 'Gymnastics', value: 33 },
  { name: 'Handball', value: 34 },
  { name: 'Hiking', value: 35 },
  { name: 'Hockey', value: 36 },
  { name: 'Horseback riding', value: 37 },
  { name: 'Housework', value: 38 },
  { name: 'Ice skating', value: 104 },
  { name: 'In vehicle', value: 0 },
  { name: 'Jumping rope', value: 39 },
  { name: 'Kayaking ', value: 40 },
  { name: 'Kettlebell training', value: 41 },
  { name: 'Kickboxing ', value: 42 },
  { name: 'Kitesurfing', value: 43 },
  { name: 'Martial arts', value: 44 },
  { name: 'Meditation', value: 45 },
  { name: 'Mixed martial arts', value: 46 },
  { name: 'On foot', value: 2 },
  { name: 'Other (unclassified fitness activity)', value: 108 },
  { name: 'P90X exercises', value: 47 },
  { name: 'Paragliding', value: 48 },
  { name: 'Pilates', value: 49 },
  { name: 'Polo', value: 50 },
  { name: 'Racquetball', value: 51 },
  { name: 'Rock climbing', value: 52 },
  { name: 'Rowing', value: 53 },
  { name: 'Rowing machine', value: 54 },
  { name: 'Rugby', value: 55 },
  { name: 'Running', value: 8 },
  { name: 'Jogging', value: 56 },
  { name: 'Running on sand', value: 57 },
  { name: 'Running (treadmill)', value: 58 },
  { name: 'Sailing', value: 59 },
  { name: 'Scuba diving', value: 60 },
  { name: 'Skateboarding', value: 61 },
  { name: 'Skating', value: 62 },
  { name: 'Cross skating', value: 63 },
  { name: 'Indoor skating', value: 105 },
  { name: 'Inline skating (rollerblading)', value: 64 },
  { name: 'Skiing', value: 65 },
  { name: 'Back-country skiing', value: 66 },
  { name: 'Cross-country skiing', value: 67 },
  { name: 'Downhill skiing', value: 68 },
  { name: 'Kite skiing', value: 69 },
  { name: 'Roller skiing', value: 70 },
  { name: 'Sledding', value: 71 },
  // { name: 'Sleeping ', value: 72 },
  // { name: 'Light sleep', value: 109 },
  // { name: 'Deep sleep ', value: 110 },
  // { name: 'REM sleep', value: 111 },
  // { name: 'Awake (during sleep cycle) ', value: 112 },
  { name: 'Snowboarding', value: 73 },
  { name: 'Snowmobile', value: 74 },
  { name: 'Snowshoeing', value: 75 },
  { name: 'Squash', value: 76 },
  { name: 'Stair climbing', value: 77 },
  { name: 'Stair-climbing machine', value: 78 },
  { name: 'Stand-up paddleboarding', value: 79 },
  // { name: 'Still (not moving)', value: 3 },
  { name: 'Strength training', value: 80 },
  { name: 'Surfing', value: 81 },
  { name: 'Swimming', value: 82 },
  { name: 'Swimming (open water)', value: 84 },
  { name: 'Swimming (swimming pool)', value: 83 },
  { name: 'Table tennis (ping pong)', value: 85 },
  { name: 'Team sports', value: 86 },
  { name: 'Tennis ', value: 87 },
  // { name: 'Tilting (sudden device gravity change) ', value: 5 },
  { name: 'Treadmill (walking or running)', value: 88 },
  // { name: 'Unknown (unable to detect activity)', value: 4 },
  { name: 'Volleyball', value: 89 },
  { name: 'Volleyball (beach)', value: 90 },
  { name: 'Volleyball (indoor)', value: 91 },
  { name: 'Wakeboarding', value: 92 },
  { name: 'Walking', value: 7 },
  { name: 'Walking (fitness)', value: 93 },
  { name: 'Nording walking', value: 94 },
  { name: 'Walking (treadmill)', value: 95 },
  { name: 'Waterpolo', value: 96 },
  { name: 'Weightlifting', value: 97 },
  { name: 'Wheelchair', value: 98 },
  { name: 'Windsurfing', value: 99 },
  { name: 'Yoga', value: 100 },
  { name: 'Zumba', value: 101 }
])

.directive('activityTypeSelect', function(activityTypes){
  // Runs during compile
  return {
    restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'templates/activityTypeSelect.html',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {
      $scope.activityTypes = activityTypes;
    }
  };
});