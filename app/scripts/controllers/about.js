'use strict';

/**
 * @ngdoc function
 * @name werpiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the werpiApp
 */
angular.module('werpiApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
