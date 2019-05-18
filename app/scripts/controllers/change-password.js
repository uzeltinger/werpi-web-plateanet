'use strict';




angular.module('werpiApp')
  .controller('ChangePasswordCtrl', function ($scope,$stateParams,$state,api,notify) {

  	$scope.token=$stateParams.token;
    $scope.changePasswordStatusMessage="Estamos confirmando el cambio de clave";
    $scope.changePasswordStatusSubMessage="Aguarde por favor...";
    $scope.changePasswordStatus=0;
    $scope.loading=false;

  	if ($scope.token){
  		var dataGet = { blankPasswordToken : $scope.token };
  			  api.password.validateToken(dataGet).$promise.then(function(response) {
          $scope.changePasswordStatusMessage="Su solicitud de cambio fue confirmada con exito";
          $scope.changePasswordStatusSubMessage="Ingrese su nueva contraseña para realizar el cambio.";
          $scope.changePasswordStatus=1;

  		   },function(response){
            $scope.changePasswordStatus=-1;
            $scope.changePasswordStatusMessage="No fue posible realizar el cambio de contraseña";
            $scope.changePasswordStatusSubMessage="Por favor intente nuevamente, o contáctenos.";
         }
         );
  	} else {

      $scope.changePasswordStatus=-1;
      $scope.changePasswordStatusMessage="No fue posible realizar el cambio de contraseña";
      $scope.changePasswordStatusSubMessage='Ingrese nuevamente a "Olvide mi clave" ';
    }

    $scope.changePassword = function(){
      var data = {blankPasswordToken:$scope.token,newPassword:$scope.password2}

          $scope.loading=true;
          api.password.resetPassword('',data).$promise.then(function(response) {
                $state.go('login');

         },function(response){
            $scope.password="";
            $scope.password2="";

            $scope.loading=false;
            var error = response&&response.data&&response.data.errors&&response.data.errors.error?response.data.errors.error.errorDetail:'';
            notify({messageTemplate:'<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No fue posible cambiar la contraseña <br/>'+error+'</div>', classes:'alert-notify',position:'right'} );  
                    
         }
         );
    }


  });
