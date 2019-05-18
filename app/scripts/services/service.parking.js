'use strict';

angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('parkingService', function (api) {

    this.listParkings = function(latitude,longitude) {
	    api.parking.lista({'latitude':latitude,'longitude':longitude});

	    return api.parking.lista({'latitude':latitude,'longitude':longitude}).$promise.then(function(result) {
		    var responseParkings = [];	

	      	angular.forEach(result.data.parkings, function(value, key) {
	        	responseParkings.push({name: value.parkingName, address: value.address.street+' '+value.address.number, lat:value.latitude, long:value.longitude });
			});
			return responseParkings;
	    });
    };

    this.convertDateToAPIFormat = function(date) {
			var dates = date.toJSONLocal().split('T');
			return dates[0] + ' ' +  dates[1].substr(0,5);
		}
	
});


Date.prototype.toJSONLocal = function() {
	var cloneDate = new Date(this);
	var tzDiff = cloneDate.getTimezoneOffset() / 60;
	cloneDate.setHours(cloneDate.getHours() - tzDiff);
	return cloneDate.toJSON();
};