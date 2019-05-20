'use strict';
angular.module('werpiApp')
  .controller('ProfileCtrl', function ($scope, $stateParams, Session, $rootScope, api, notify, $window) {

    $scope.user = Session.getUser();
    var token = Session.getSession().token;
    console.log("$scope.user",$scope.user);
    $scope.newUserData = {};
    $scope.newUserData.licencePlate = $scope.user.licencePlate;
    $scope.newUserData.firstName = $scope.user.firstName;
    $scope.newUserData.lastName = $scope.user.lastName;
    if($scope.user.phone){
      $scope.newUserData.phoneTypeId = $scope.user.phone.phoneType.phoneTypeId.toString();
      $scope.newUserData.phoneNumber = $scope.user.phone.phoneNumber;
    }
    $scope.newUserData.addressTypeId = 1;//$scope.user.address.addressType.addressTypeId;    
    if($scope.user.address){
      $scope.newUserData.street = $scope.user.address.street;
      $scope.newUserData.streetNumber = $scope.user.address.number;
      $scope.newUserData.floor = $scope.user.address.floor;
      $scope.newUserData.zipcode = $scope.user.address.zipCode;
      $scope.newUserData.provinceId = $scope.user.address.province.provinceId.toString();
      $scope.newUserData.countryId = $scope.user.address.country.countryId;
    }else{
      $scope.newUserData.countryId = "AR";
    }

    api.province.getProvinces().$promise.then(function (result) {
      $scope.provinces = result.data;      
    });

    $scope.phoneTypes = [
      {"phoneTypeId":"1","phoneType":"Fijo"},
      {"phoneTypeId":"2","phoneType":"Movil"}
    ]

    $scope.showModifProfileBanner = !($window.sessionStorage.getItem("showModifProfileBanner") == "false");

    $scope.downloadWerpi = function () {
      $window.open('http://onelink.to/qj6zn5', '_blank');
    }
    $scope.closeBanner = function () {
      $scope.showModifProfileBanner = false;
      $window.sessionStorage.setItem("showModifProfileBanner", false);
    }

    $scope.setNewUserData = function (newUserData) {
      if ($scope.profile_form.$valid) {
        var data = { id: $scope.user.userId };
        $scope.loading = true;
        api.user.setNewUserData(data, newUserData).$promise.then(function (response) {
          Session.setUser(response.data.user);    
          $scope.loading = false;
          notify({ messageTemplate: '<i class="fa fa-check big-fa"></i><div class="notify-text">Se han guardado los nuevos datos</div>', classes: 'alert-notify', position: 'right' });
        }, function (response) {
          $scope.loading = false;
          var msg = "No se pudo actualizar la información. ";
          if (response.data && response.data.errors && response.data.errors.error && response.data.errors.error.errorDetail) {
            msg += response.data.errors.error.errorDetail;
          }
          notify({ messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">' + msg + '</div>', classes: 'alert-notify', position: 'right' });
        });
      }
    };

  });