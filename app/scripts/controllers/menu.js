'use strict';

/**
 * @ngdoc function
 * @name werpiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the werpiApp
 */
angular.module('werpiApp')
  .controller('MenuController', function ($scope,$state,$rootScope,Session, AuthenticationSharedService) {
    $rootScope.menuIsActive = false;
    $rootScope.toggleMenu = function() {
      $rootScope.menuIsActive = !$rootScope.menuIsActive;
    }
    $scope.$on('$locationChangeStart', function(event) {
      $rootScope.menuIsActive = false;
    });
		$rootScope.goBackCallback = '';
	$scope.$watch(function () { return $rootScope.authenticated }, function(newVal, oldVal){
		if (Session.getUser()){
			$scope.userDisplayName=Session.getUser().firstName+" "+Session.getUser().lastName;
			$scope.userLicencePlate=Session.getUser().licencePlate;
			$scope.authenticated=true;
		}else{
			$scope.userDisplayName=null;
			$scope.userLicencePlate=null;
			$scope.authenticated=false;
		}
	});

		// Esto se hizo para evitar que se renderice
		// el botón volver antes de cargar el mapa
		$rootScope.$on('someEvent', function() {
			var backBtn = document.getElementById('global-back-btn');
				backBtn.classList.remove('hide');

		});

	$scope.logout = function () {
		AuthenticationSharedService.logout();
	};

	$scope.goBack = function(event) {
		event.preventDefault();
		if($rootScope.paySection === 'step-two' && !$rootScope.estacionarSection) {
			$rootScope.paySection = 'step-one';
			return;
		}

		if($rootScope.goBackCallback){
			$rootScope.goBackCallback();
			$rootScope.goBackCallback = ''; // safety reset
			return;
		}
		//$state.go('main');
		if($rootScope.loginPage){
			$rootScope.loginPage = false;
			$state.go('main');
			return;
		}
		window.history.back();
	}


  });
