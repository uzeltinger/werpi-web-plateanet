'use strict';

angular.module('app.security').
	factory('tokenInterceptor', ['Session',function (Session) {
    var tokenInterceptor = {

        'request': function (config) {
            var accountCookie = Session.getSession();
            if (accountCookie !== undefined && accountCookie != null) {
                if (accountCookie.token) {
                    config.headers = {'Authorization':  'Bearer '+accountCookie.token};
                }
            }

            return config;
        }
    };

    return tokenInterceptor;
}]);

angular.module('app.security').
	config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('tokenInterceptor');
	}]);