(function () {
	'use strict';

	angular.module('app.security').
		controller('LoginCtrl', ['$scope', '$location', 'AuthenticationSharedService', '$state','api','notify',

			function ($scope, $location, AuthenticationSharedService, $state, api, notify) {
        $scope.errors=[];
				$scope.invalidLogin = false;
				$scope.user = {};
				$scope.loading = false;

				$scope.login = function () {
						//$ionicLoading.show({template: '...'});
					$scope.loading = true;
					AuthenticationSharedService.login({
						username: $scope.user.username,
						password: $scope.user.password,
						//rememberMe: $scope.rememberMe,
						success: function () {
							//$ionicLoading.hide();
							$scope.loading = false;
							$scope.invalidLogin = false;
						},
						error: function () {
							$scope.loading = false;
							$scope.invalidLogin = true;
							//$ionicLoading.hide();
							$scope.user.password = '';
						},
						finally: function () {
							//$ionicLoading.hide();
							$scope.user.password = '';
						}
					});
				}

				$scope.validate= function () {
					var passwordConfirmError='Las contraseñas no coinciden';
					if (($scope.passwordConfirmation !== $scope.password)){
						if(!$scope.errors.length > 0) $scope.errors.push(passwordConfirmError);
					} else {
						$scope.errors = [];
					}
				} 

				$scope.signUp = function () {
				  $scope.validate();
          if($scope.errors.length === 0) {
            var data = {
              firstName: $scope.firstName,
              lastName: $scope.lastName,
              licensePlate: $scope.licensePlate,
              email: $scope.email,
              password: $scope.password,
              registrationDestination: "PLATEANET"
            };
            $scope.loading = true;
            api.registration.save('', data).$promise.then(function (response) {
              $scope.loading = false;
              notify({
                messageTemplate: '<i class="fa fa-check big-fa"></i><div class="notify-text">Gracias por registrarse en Werpi, recibira un mail en su casilla para completar el registro</div>',
                classes: 'alert-notify',
                position: 'right'
              });

              $scope.user.username = $scope.email;
              $scope.user.password = $scope.password;

              $scope.firstName = "";
              $scope.lastName = "";
              $scope.licensePlate = "";
              $scope.email = "";
              $scope.password = "";

            }, function (response) {
              $scope.loading = false;
              var msg = "No se pudo realizar el registro. ";
              if (response.data && response.data.errors && response.data.errors.error && response.data.errors.error.errorDetail) {
                msg += response.data.errors.error.errorDetail;
              }
              notify({
                messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">' + msg + '</div>',
                classes: 'alert-notify',
                position: 'right'
              });
            });
          }

				}

				$scope.forgotPassword = function () {
					if(!$scope.user.username){

						notify({messageTemplate:'<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text"> Inrgese su usuario/email para continuar</div>', classes:'alert-notify',position:'right'} );

					}else{

						var data = {email: $scope.user.username, forgotPasswordDestination: "PLATEANET"};
						$scope.loading = true;
						api.password.forgotPassword('',data).$promise.then(function(response) {
									$scope.loading = false;
        							notify({ messageTemplate:'<i class="fa fa-check big-fa"></i><div class="notify-text">Recibirá un mail en su casilla para verificar su identidad y realizar el cambio de contraseña</div>', classes:'alert-notify',position:'right'} );
        							$scope.user.username="";

				                   },function(response) {
				                   		$scope.loading = false;
				                   		var msg = "No se pudo generar el cambio de contraseña. 	";
				                   		if (response.data&&response.data.errors&&response.data.errors.error&&response.data.errors.error.errorDetail){
				                   			msg+=response.data.errors.error.errorDetail;
				                   		}
        								notify({messageTemplate:'<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">'+msg+'</div>', classes:'alert-notify',position:'right'} );
									 });
					}

				};

			}]);
})();
