'use strict';

angular.module('tracks')

.filter('trackDuration',function(){
  return function(input){
    return moment.duration(input).humanize();
  };
});