'use strict';
angular.module('werpiApp')
  .controller('ProfileCtrl', function ($scope, $stateParams, Session, $rootScope, api, notify, $window) {

    $scope.user = Session.getUser();
    var token = Session.getSession().token;
    $scope.newUserData = {};
    $scope.newUserData.licencePlate = $scope.user.licencePlate;
    $scope.newUserData.firstName = $scope.user.firstName;
    $scope.newUserData.lastName = $scope.user.lastName;
    $scope.newUserData.phoneTypeId = $scope.user.phoneTypeId;
    $scope.newUserData.phoneNumber = $scope.user.phoneNumber;
    $scope.newUserData.addressTypeId = $scope.user.addressTypeId;
    $scope.newUserData.street = $scope.user.street;
    $scope.newUserData.streetNumber = $scope.user.streetNumber;
    $scope.newUserData.floor = $scope.user.floor;
    $scope.newUserData.zipcode = $scope.user.zipcode;
    $scope.newUserData.provinceId = $scope.user.provinceId;
    $scope.newUserData.countryId = $scope.user.countryId;

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
        console.log('newUserData', newUserData);
        $scope.loading = true;
        api.user.setNewUserData(data, newUserData).$promise.then(function (response) {
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