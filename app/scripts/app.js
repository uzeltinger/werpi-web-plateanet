'use strict';

/**
 * @ngdoc overview
 * @name werpiApp
 * @description
 * # werpiApp
 *
 * Main module of the application.
 */
angular
  .module('werpiApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'cgNotify',
    'moment-picker',
    'app.common',
    'app.security',
    'app.directives',
    'app.directives.limitTo',
    'app.services',
    'app.constants'
  ])

//.constant('API_ENDPOINT', {url: 'http://localhost/dt/werpi-web/desa/source/api/v1.0/'})
//.constant('API_ENDPOINT', {url: 'https://test.werpi.com/api/v1.0/'})


//url configurada por build de grunt
//grunt serve para local
//grunt build -env=test para generar build para test
//grunt build -env=prod para generar build para prod

.constant('API_ENDPOINT', {url: '%API_URL%' })


.constant('SELLER', {sellerID: '3'})
//.constant('API_ENDPOINT', {url: 'http://localhost/dt/api/v1.0/'})
//.constant('API_ENDPOINT', {url: '/api/v1.0/'})
//.constant('API_ENDPOINT', {url: 'http://localhost/api/v1.0/'})

//.constant('API_ENDPOINT', {url: 'https://test.werpi.com/api/v1.0/'})

//.constant('API_ENDPOINT', {url: 'https://www.werpi.com/api/v1.0/'})

.config(['apiProvider','API_ENDPOINT', function (apiProvider, API_ENDPOINT) {

    apiProvider.setBaseRoute(API_ENDPOINT.url);

    apiProvider.endpoint('parking')
        .route('parking/:id')
        .addHttpAction('GET', 'lista', {}, API_ENDPOINT.url+'parking/?latitude=:latitude&longitude=:longitude');

    apiProvider.endpoint('security')
        .addHttpAction('POST', 'requestToken', {}, API_ENDPOINT.url+'oauth2/token')
        .addHttpAction('POST', 'logout', {}, API_ENDPOINT.url+'oauth2/token/revoke');

    apiProvider.endpoint('user')
        .addHttpAction('GET', 'getCurrentUserInfo', {}, API_ENDPOINT.url+'user/getCurrentUserInfo');

    apiProvider.endpoint('quotation')
        .route('quotation/:id');

    apiProvider.endpoint('booking')
        .route('booking/:id')
        .addHttpAction('POST', 'sendVoucher', {}, API_ENDPOINT.url+'booking/:id/sendVoucher');

    apiProvider.endpoint('payment')
        .route('payment/');

    apiProvider.endpoint('registration')
        .route('registration/:token');

    apiProvider.endpoint('password')
        .addHttpAction('POST', 'forgotPassword', {}, API_ENDPOINT.url+'password/forgot')
        .addHttpAction('GET', 'validateToken', {}, API_ENDPOINT.url+'/password/forgot/:blankPasswordToken')
        .addHttpAction('POST', 'resetPassword', {}, API_ENDPOINT.url+'password/blank');

    apiProvider.endpoint('plateanet')
        .addHttpAction('GET', 'getTeatros', {}, API_ENDPOINT.url+'/plateanet/teatros');



}])
.run(['$rootScope', '$location', 'AuthenticationSharedService', 'Session', 'ALLOWED_PERMISSIONS', '$state', '$window',
        function ($rootScope, $location, AuthenticationSharedService, Session, ALLOWED_PERMISSIONS, $state, $window) {
            $rootScope.$on('$stateChangeStart', function (event, next) {
                $rootScope.authenticated = AuthenticationSharedService.isAuthenticated();
                $rootScope.account = Session;
                var requiredPermissions = next.access?next.access.authorizedPermissions:ALLOWED_PERMISSIONS.all;

                if(requiredPermissions!="*"){
                  if(!$rootScope.authenticated){
                    //Si requiere estar autenticado y no lo esta
                    event.preventDefault();
                    $rootScope.loginRequiredState=next.name;
                    $rootScope.$broadcast('event:auth-loginRequired');
                  }else{
                    //Si requiere estar autenticado y lo esta, valido que tenga los permisos necesarios
                    if (requiredPermissions && !AuthenticationSharedService.isAuthorized(requiredPermissions)) {
                      event.preventDefault();
                      $rootScope.$broadcast('event:auth-notAuthorized');
                    }
                  }

                }

            });

          $rootScope.$on('$stateChangeSuccess', function(){
            /*var backBtn = document.getElementById('global-back-btn');
            backBtn.classList.remove('hide');*/
            var regex = new RegExp('(home|login|register)');
            $rootScope.isHome = regex.test($window.location.href);
          });

            // Call when the the client is confirmed
            $rootScope.$on('event:auth-loginConfirmed', function () {
                var reservarUrl=$window.sessionStorage.getItem("reservarUrl");
                if(reservarUrl&&reservarUrl!=''){
                  $window.sessionStorage.setItem("reservarUrl",'');
                  $window.location.href=reservarUrl;
                }

                if ($location.path() === '/login') {
                    if ($rootScope.loginRequiredState){
                      $state.go($rootScope.loginRequiredState, null, {reload: true, location: 'replace'});
                      $rootScope.loginRequiredState=null;
                    }else{
                      $state.go('main');
                    }
                }
            });

            // Call when the 401 response is returned by the server
            $rootScope.$on('event:auth-loginRequired', function (rejection, response) {
                Session.destroy();
                $state.go('login');
            });

            // Call when the 403 response is returned by the server
            $rootScope.$on('event:auth-notAuthorized', function () {
                $rootScope.error = '403 - No autorizado';
                //$state.go('unauthorizedState');
            });

            // Call when the user logs out
            $rootScope.$on('event:auth-loginCancelled', function () {
                Session.destroy();
                event.preventDefault();
                $state.go('login', null, {reload: true, location: 'replace'});
            });

        }])


/*.config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });*/

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'ALLOWED_PERMISSIONS', function($stateProvider, $urlRouterProvider, $locationProvider, ALLOWED_PERMISSIONS) {


  $locationProvider.hashPrefix('');

  $urlRouterProvider.otherwise("/home");

  $stateProvider

  .state('main', {
    url: '/home',
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  })

  .state('login', {
    url: '/login',
    //templateUrl: 'views/login.html',
    //controller: 'LoginCtrl'
    templateUrl: 'views/login-or-register.html',
    controller: 'LoginRegisterCtrl'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'LoginCtrl'
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'views/profile.html',
    controller: 'ProfileCtrl',
    access: { authorizedPermissions: ALLOWED_PERMISSIONS.user}
  })

  .state('buy', {
    url: '/buy/',
    templateUrl: 'views/pay.html',
    controller: 'PayCtrl',
    access: { authorizedPermissions: ALLOWED_PERMISSIONS.user}
  })

  .state('booking', {
    url: '/booking/:bookingId',
    templateUrl: 'views/booking.html',
    controller: 'BookingCtrl',
    params: {'bookingId': null, 'justBooked': false},
    access: { authorizedPermissions: ALLOWED_PERMISSIONS.user}
  })

  .state('registration', {
    url: '/registration/:token',
    templateUrl: 'views/registration.html',
    controller: 'RegistrationCtrl'
  })

  .state('password', {
    url: '/password/:token',
    templateUrl: 'views/change-password.html',
    controller: 'ChangePasswordCtrl'
  })

  .state('terms', {
    url: '/terms',
    controller: 'TermsController',
    templateUrl: 'views/terms.html'
  });

}]);
