(function () {
    'use strict';

    /* Services */
    angular.module('app.security').
        factory('Session', [
            function () {
                this.create = function (login, token, refreshToken, expiresIn) {
                    this.login = login;
                    this.token = token;
                    this.refreshToken = refreshToken;
                    this.expirationDate = (Date.now()+(1000*(expiresIn-60)));
                    this.saveSession();
                };                
                this.setUser = function (user) {
                    this.user = user;
                    this.saveSession();
                };
                this.invalidateToken = function (){
                    this.token=null;
                    this.saveSession();
                }
                this.destroy = function () {
                    this.user = null;                  
                    this.login = null;
                    this.token = null;
                    this.refreshToken = null;
                    window.localStorage.removeItem("account");
                };

                this.getSession = function () {
                    if (this.login){
                        return this;
                    }else{
                        var session = window.localStorage.getItem('account');
                        if (session) {
                            return JSON.parse(session);
                        }else{
                            return null;
                        }
                    }
                };

                this.getUser = function () {
                    return this.getSession()?this.getSession().user:null;
                };

                this.saveSession = function () {
                    window.localStorage.setItem('account',JSON.stringify(this));
                };

                return this;
            }]);

    angular.module('app.security').
        factory('AuthenticationSharedService', ['$rootScope', '$http', 'authService', 'Session', 'api', '$q', 
            function ($rootScope, $http, authService, Session, api, $q) {

                return {
                    login: function (param) {
                        var data = {'client_id':'werpi-mobile',
                            'client_secret':'werpi1234',
                            'grant_type':'password',
                            'username': param.username,
                            'password': param.password
                        };

                        api.security.requestToken(null,data).$promise.then(function(result) {
                            var token = result;
                            Session.create(param.username, result.access_token, result.refresh_token, result.expires_in);

                            api.user.getCurrentUserInfo().$promise.then(function(result) {

                                Session.setUser(result.data.user);                      

                                authService.loginConfirmed(result);
                                param.success();

                            },function () {
                                Session.destroy();
                                param.error();
                            });
                        },function () {
                            Session.destroy();
                            param.error();
                        });

                    }, 
                    isAuthenticated: function () {
                        var authenticated = false;
                        //Si tiene session
                        if(Session.getSession()&&Session.getSession().refreshToken){
                            if(Session.getSession().expirationDate>Date.now()){
                                authenticated = true;
                            }else{
                                Session.invalidateToken();

                                var username=Session.getSession().login;
                                var refreshToken=Session.getSession().refreshToken;

                                var data = {'client_id':'werpi-mobile',
                                    'client_secret':'werpi1234',
                                    'grant_type':'refresh_token',
                                    'username':username,
                                    'refresh_token': refreshToken
                                };

                                authenticated = api.security.requestToken(null,data).$promise.then(function(result) {
                                                    var token = result;
                                                    Session.create(Session.login, result.access_token, result.refresh_token, result.expires_in);

                                                    api.user.getCurrentUserInfo().$promise.then(function(result) {

                                                        Session.setUser(result.data.user);                            

                                                        return true;

                                                    },function () {
                                                        Session.destroy();
                                                        return false;
                                                    });
                                                },function () {
                                                    Session.destroy();
                                                    return false;
                                                });
                            }
                        }

                        return authenticated;


                    },
                    isAuthorized: function (requiredPermissions) {
                      
                        if (!angular.isArray(requiredPermissions)) {
                            if (requiredPermissions === '*') {
                                return true;
                            }
                            requiredPermissions = [requiredPermissions];
                        }


                        var isAuthorized=false;
                        if (Session.getSession().user){
                            var userPermissionNames = [];
                            angular.forEach(Session.getSession().user.permissions, function (userPermission) {
                                        userPermissionNames.push(userPermission.permissionName);
                                    });

                            var missingPermission = false;
                            angular.forEach(requiredPermissions, function (requiredPermission) {
                                        if (!Session.getSession().user.permissions || userPermissionNames.indexOf(requiredPermission) == -1){
                                            missingPermission=true;
                                        }
                                    });
                            isAuthorized = !missingPermission;
                        }
                        return isAuthorized;
 
                     },
                    logout: function () {
                        var token = Session.getSession().token;
                        Session.invalidateToken();
                        api.security.logout(null,{"token":token}).$promise.then(function(result) {
                            Session.destroy();
                        },function () {
                            Session.destroy();
                        });

                        authService.loginCancelled();
                    }
                };
            }]);
})();