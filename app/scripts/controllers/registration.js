'use strict';




angular.module('werpiApp')
  .controller('RegistrationCtrl', function ($scope,$stateParams,Session,$rootScope,api,notify) {
  	$scope.token=$stateParams.token;
    $scope.registrationStatus=0;

  	if ($scope.token){
  		var dataGet = { token : $scope.token };
  			  api.registration.get(dataGet).$promise.then(function(response) {
          $scope.registrationStatus=1;

  		   },function(response){
            $scope.registrationStatus=-1;
         }
         );
  	} else {

      $scope.registrationStatus=-1;
    }


  });
