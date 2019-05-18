(function() {
	'use strict';

angular.module('app.common', ['ngResource']).
	config(['$provide', function($provide) {
		$provide.provider('api', app.ApiProvider);
	}])


})(window);