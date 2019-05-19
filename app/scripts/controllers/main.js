'use strict';

/**
 * @ngdoc function
 * @name werpiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the werpiApp
 */
angular.module('werpiApp')
  .controller('MainCtrl', function ($scope, $http, api, SELLER) {

    $scope.parkings = [];
    $scope.myPosition = { long: -58.3810793, lat: -34.606510 };
    $scope.showAll = 4;
    getList();

    /*$http.get('parkings.json').then(function (response) {
      $scope.parkings = response.data;
      return response;
    });*/

    function getList() {
      api.parking.lista({ 'sellerId': SELLER.sellerID, 'latitude': $scope.myPosition.lat, 'longitude': $scope.myPosition.long }).$promise.then(function (response) {
        var parkings = response.data.parkings;
        //console.log('parkings', parkings);
        angular.forEach(parkings, function (info, key) {
          let buttonReservar = '<button type="button" id="btn-reservar" onClick="window.sessionStorage.setItem(\'reservarUrl\', \'#/buy/?parkingId=' + info.parkingId + '&lat=' + $scope.myPosition.lat + '&lng=' + $scope.myPosition.long + '\');window.location.href=\'#/buy/?parkingId=' + info.parkingId + '&lat=' + $scope.myPosition.lat + '&lng=' + $scope.myPosition.long + '\'" class=""><img src="./images/reservar.svg" alt="">Reservar</button>';
          info.buttonReservar = buttonReservar;
        });
        $scope.parkings = parkings;
      });
    }

    $scope.reservar = function(parking){
      window.sessionStorage.setItem('reservarUrl', '#/buy/?parkingId=' + parking.parkingId + '&lat=' + $scope.myPosition.lat + '&lng=' + $scope.myPosition.long );
      window.location.href='#/buy/?parkingId=' + parking.parkingId + '&lat=' + $scope.myPosition.lat + '&lng=' + $scope.myPosition.long ;
    }

    $scope.verMas = function(){
      $scope.showAll = 999;
    }


    /*
    $scope.textoUbicacion = "";
    $scope.selectedLocation = "";
    $scope.lugaresPosibles = [];
    $scope.authenticated = $rootScope.authenticated;
    $scope.dates = {};

    $scope.showBanner = false;//!($window.sessionStorage.getItem("showBanner")=="false");

    $scope.showTeatros = true;
    $scope.selectedTeatro;

    $scope.urlIdTeatro  = null;

//Example: http://localhost:9000/#/home?funcion=17-07-2019%2020:00&obra=TOC%20TOC&teatro=MULTITEATRO&id_teatro=3
    
    if ($location.search().id_teatro){
      $scope.urlIdTeatro = $location.search().id_teatro;
      $window.sessionStorage.setItem("urlIdTeatro",$scope.urlIdTeatro);
    }else{
      if ($window.sessionStorage.getItem('urlIdTeatro')){
        $scope.urlIdTeatro = $window.sessionStorage.getItem('urlIdTeatro');
      }
    }

    if ($scope.urlIdTeatro==null){
        $scope.showBuscarDestino=true;
    }else{
        $scope.showBuscarDestino=false;
    }

    $scope.urlfuncion  = null;
    
    if ($location.search().funcion){
      $scope.urlfuncion = $location.search().funcion;
      $window.sessionStorage.setItem("urlfuncion",$scope.urlfuncion);
    }else{
      if ($window.sessionStorage.getItem('urlfuncion')){
        $scope.urlfuncion = $window.sessionStorage.getItem('urlfuncion');
      }
    }


    moment.locale('es');

    //$scope.dateFrom = new Date(new Date().getTime());

    //if ($scope.dateFrom.getMinutes()<30){
    //      $scope.dateFrom.setHours($scope.dateFrom.getHours() + 1);
    //}else{
    //     $scope.dateFrom.setHours($scope.dateFrom.getHours() + 2);
    //}

    //$scope.dateFrom.setMinutes(0);
    //$scope.dateFrom.setSeconds(0);

    //$scope.dateTo = new Date($scope.dateFrom.getTime() + (12*60*60*1000));

    var minHourMargin = 2;

    var URLlatitude = parseFloat($location.search().latitude);
    var URLlongitude = parseFloat($location.search().longitude);
    var URLMarkerName = $location.search().markerName;

    if (URLlatitude && URLlongitude && URLMarkerName){
        $scope.URLFixedPostion={name:URLMarkerName,coords:{longitude:URLlongitude,latitude:URLlatitude}};
    }
    
    $window.sessionStorage.setItem("reservarUrl",'');
    
    function getTrimmedNow(){
        var now = moment();
        now.minutes(0);
        now.seconds(0);
        now.milliseconds(0);
        return now;
    }

    function getMomentFrom(){
        return getTrimmedNow().add(minHourMargin,"h");
    }

    $scope.refreshDates = function(){
      if (!($scope.momentDateFrom.diff(getTrimmedNow(),'h')>=minHourMargin)){ //si desde no es al menos x horas despues de ahora
        $scope.momentDateFrom = getMomentFrom();
      }

      if(!$scope.momentDateTo.diff($scope.momentDateFrom,'h')>=1){ //si la fecha hasta no es al menos 1 hora despues de la fecha desde
        $scope.momentDateTo = $scope.momentDateFrom.clone();
        $scope.momentDateTo.add(1,"h");
      }

      $scope.dateTo = $scope.momentDateTo.toDate();
      $scope.dateFrom = $scope.momentDateFrom.toDate();
    }


    $scope.momentDateFrom = getMomentFrom();
    $scope.momentDateTo = $scope.momentDateFrom.clone();
    $scope.momentDateTo.add(12,"h");

    $scope.refreshDates();

	  $scope.mapQueryCallback = function (results, status) {
	    if (status == google.maps.places.PlacesServiceStatus.OK) {
	    	$scope.lugaresPosibles=results;
	    }else{
	    	$scope.lugaresPosibles=[];
	    }
	  }

	  $scope.irUbicacion = function (ubicacion) {
	    $scope.lugaresPosibles=[];
	  	$scope.markMap(ubicacion);
	  }

    $scope.buscarUbicacion=function (){
    	$scope.queryMap($scope.textoUbicacion,$scope.mapQueryCallback);
    }

    $scope.downloadWerpi = function(){
      $window.open('http://onelink.to/qj6zn5', '_blank');
    } 
    $scope.closeBanner = function(){
      $scope.showBanner=false;
      $window.sessionStorage.setItem("showBanner",false);
    } 
    $scope.closeMobileBanner = function(){
      $scope.showMobileBanner=false;
      $window.sessionStorage.setItem("showMobileBanner",false);
    } 
    $scope.isMobile = function (){ 

      return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);

    }
*/
    /*if($scope.showBanner==false && $scope.isMobile()){
        $scope.showMobileBanner = $window.sessionStorage.getItem("showMobileBanner");
        $scope.showMobileBanner = $scope.showMobileBanner?$scope.showMobileBanner:true;
    }else{
        $scope.showMobileBanner = false;
    }*/

    $scope.showMobileBanner = false;
    /*
      api.plateanet.getTeatros().$promise.then(function(response) {
               $scope.allTeatros = response.data;
               $scope.selectedTeatro = $scope.allTeatros[0];
               $scope.allTeatros=$filter('orderBy')($scope.allTeatros, 'ComboDescription');
               $scope.showTeatros = true;
               var places= [];
                angular.forEach($scope.allTeatros, function(teatro) {
                  
                  if ($scope.urlIdTeatro && $scope.urlIdTeatro!=''){
                    if ($scope.urlIdTeatro==teatro.Id){
                      var place = {id:'teatro-'+teatro.Id, info:{icon:"images/map-plateanet.png",lat:teatro.Latitud,long:teatro.Longitud,name:teatro.Name,description:teatro.Name}};
                      places.push(place);
                      $scope.URLFixedPostion={name:'',coords:{longitude:teatro.Longitud,latitude:teatro.Latitud}};
                    }
                  }else{
                      var place = {id:'teatro-'+teatro.Id, info:{icon:"images/map-plateanet.png",lat:teatro.Latitud,long:teatro.Longitud,name:teatro.Name,description:teatro.Name}};
                      places.push(place);
                  }              
                });
                $scope.otherPlaces=places;
          }, function(response) {$scope.showTeatros = false;} );
    
    */



    /*
    
        $scope.refrescarFechas = function (){
          $scope.dateTo = new Date($scope.dateFrom.getTime() + (48*60*60*1000));
        };
    
    
      $scope.today = function() {
          $scope.dt = new Date();
        };
    
      $scope.today();
    
      $scope.clear = function() {
        $scope.dt = null;
      };
    
      $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
      };
    
      $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: $scope.dateFrom,
        startingDay: 1
      };
    
      // Disable weekend selection
      function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
      }
    
      $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
      };
    
      $scope.toggleMin();
    
      $scope.open1 = function() {
        $scope.popup1.opened = true;
      };
    
      $scope.open2 = function() {
        $scope.popup2.opened = true;
      };
    
      $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
      };
    
      $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      $scope.altInputFormats = ['M!/d!/yyyy'];
    
      $scope.popup1 = {
        opened: false
      };
    
      $scope.popup2 = {
        opened: false
      };
    
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var afterTomorrow = new Date();
      afterTomorrow.setDate(tomorrow.getDate() + 1);
      $scope.events = [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];
    
      function getDayClass(data) {
        var date = data.date,
          mode = data.mode;
        if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);
    
          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
    
            if (dayToCheck === currentDay) {
              return $scope.events[i].status;
            }
          }
        }
    
        return '';
      }
      */



  });
