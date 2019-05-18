'use strict';




angular.module('werpiApp')
  .controller('ProfileCtrl', function ($scope,$stateParams,Session,$rootScope,api,notify,$window) {

  	$scope.user=Session.getUser();

    $scope.showModifProfileBanner = !($window.sessionStorage.getItem("showModifProfileBanner")=="false");

  $scope.downloadWerpi = function(){
    $window.open('http://onelink.to/qj6zn5', '_blank');
  } 
  $scope.closeBanner = function(){
    $scope.showModifProfileBanner=false;
    $window.sessionStorage.setItem("showModifProfileBanner",false);
  } 


  });
