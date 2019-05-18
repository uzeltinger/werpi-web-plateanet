'use strict';

angular.module('app.directives', ['app.services'])

.directive('map', function(parkingService,/*$ionicLoading,*/$interval,api,$rootScope,$filter,$timeout,SELLER) {
    return {
        restrict: 'A',
        scope: {
          location: '=',
          dateFrom: '=',
          dateTo: '=',
          fixedPosition: '=',
          query: '=query',
          mark: '=mark',
          places: '=places'
        },
        link:function(scope, element, attrs){

          var firstMapLoad=true;
          var myPosition=null;
          var lastPosition=null;
          var initPositionMarked=false;
          var placesMarked=false;
          scope.myMarker =  null;
          scope.mySearchMarker =  null;
          /*var dateFrom = null;
          var dateTo = null;*/
          var dateFrom = new Date(new Date().getTime());

          if (dateFrom.getMinutes()<30){
                dateFrom.setHours(dateFrom.getHours() + 1);
          }else{
                dateFrom.setHours(dateFrom.getHours() + 2);
          }

          dateFrom.setMinutes(0);
          dateFrom.setSeconds(0);

          var dateTo = new Date(dateFrom.getTime() + (12*60*60*1000));

          var mapOptions = {
            enableHighAccuracy: true
          };

          var markers = [];

          var map=null;

          var infoWindow = new google.maps.InfoWindow();


          scope.query = function (query,queryCallback) {
             if (query.length>7){
               var buenosAires = new google.maps.LatLng(-34.5943027,-58.4227);

               var request = {location: buenosAires,
                              radius: '500',
                              query: [query] };

               var service = new google.maps.places.PlacesService(map);

               service.textSearch(request, queryCallback);
             }else{
                queryCallback([]);
             }
          };

          scope.mark = function (place) {

              var position = {coords:{longitude:place.geometry.location.lng(),latitude:place.geometry.location.lat()}};

              var searchPosition = {name: place.name, address: place.formatted_address, lat:place.geometry.location.lat(), long:place.geometry.location.lng(), geolocate:place.geometry.location, position:position };

              updateThisMarker("mySearchMarker", searchPosition, false);
              centerOnThis(searchPosition);
              updateParkingMarkers(searchPosition);
          };


          var markPlaces = function () {

              if (scope.places){
                angular.forEach(scope.places, function(place) {
                    createPlaceMarker(place.id,place.info);
                });
                
                placesMarked = true;
              }

          };

          scope.refreshParkingPrices = function (){
            updateParkingMarkers();
          };

/*          scope.$watch(attrs.dateFrom, function(value) {
            if(!dateFrom||(value && value.getTime()!=dateFrom.getTime())){
              dateFrom = value;
              updateParkingMarkers();
            }
          });

          scope.$watch(attrs.dateTo, function(value) {
            if(!dateTo||(value && value.getTime()!=dateTo.getTime())){
              dateTo = value;
              updateParkingMarkers();
            }
          });*/



          var markInitPosition = function () {

              if (scope.fixedPosition){

                var geolocate = new google.maps.LatLng(scope.fixedPosition.coords.latitude, scope.fixedPosition.coords.longitude);

                var searchPosition = {name: scope.fixedPosition.name, address: '', lat:scope.fixedPosition.coords.latitude, long:scope.fixedPosition.coords.longitude, geolocate:geolocate, position:scope.fixedPosition };

                if (scope.fixedPosition.name&&scope.fixedPosition.name!=''){
                  updateThisMarker("mySearchMarker", searchPosition, false);
                }

                centerOnThis(searchPosition);
                updateParkingMarkers(searchPosition);
              }
              
              initPositionMarked=true;

          };




          var getCurrentPosition = function () {

            navigator.geolocation.getCurrentPosition(function(position) {

              lastPosition=myPosition;

              var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

              myPosition = {name: 'Ubicacion actual', address: '', lat:position.coords.latitude, long:position.coords.longitude, geolocate:geolocate, position:position };

              if (lastPosition==null) {
                lastPosition=myPosition;
              }

              if (firstMapLoad){
                updateMap();
              }

            },

            function(error) {
              //alert('Unable to get location: ' + error.message);

              //Si el usuario niega la ubicacion poner ubicacion por defecto
              var defaultPosition = {coords:{longitude:-58.3810793,latitude:-34.606510}};

              lastPosition=myPosition;

              var geolocate = new google.maps.LatLng(defaultPosition.coords.latitude, defaultPosition.coords.longitude);

              myPosition = {name: 'Ubicacion actual', address: '', lat:defaultPosition.coords.latitude, long:defaultPosition.coords.longitude, geolocate:geolocate, position:defaultPosition };

              if (lastPosition==null) {
                lastPosition=myPosition;
              }

              if (firstMapLoad){
                updateMap();
              }

            }, mapOptions);

          };

          var updateMap = function () {

            if (myPosition != null && lastPosition != null) {

                if (firstMapLoad === true) {

                    /*loading = $ionicLoading.show({
                      showBackdrop: true
                    });*/

                    var myLatlng = new google.maps.LatLng(myPosition.lat,myPosition.long);

                    var mapOptions = {
                          zoom: 15,
                          center: myLatlng,
                          streetViewControl: false,
                          zoomControl: true,
                          zoomControlOptions: {
                            style: google.maps.ZoomControlStyle.LARGE,
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                          },
                          fullscreenControl: false,
                          mapTypeControl: false,
                          styles: [{
                          featureType: 'water',
                          stylers: [{
                              color: '#8ebdd6'
                          }, {
                              visibility: 'on'
                          }]
                      }, {
                          featureType: 'landscape',
                          stylers: [{
                              color: '#f2f2f2'
                          }]
                      }, {
                          featureType: 'road',
                          stylers: [{
                              saturation: -100
                          }, {
                              lightness: 45
                          }]
                      }, {
                          featureType: 'road.highway',
                          stylers: [{
                              visibility: 'simplified'
                          }]
                      }, {
                          featureType: 'road.arterial',
                          elementType: 'labels.icon',
                          stylers: [{
                              visibility: 'off'
                          }]
                      }, {
                          featureType: 'administrative',
                          elementType: 'labels.text.fill',
                          stylers: [{
                              color: '#444444'
                          }]
                      }, {
                          featureType: 'transit',
                          stylers: [{
                              visibility: 'off'
                          }]
                      }, {
                          featureType: 'poi',
                          stylers: [{
                              visibility: 'off'
                          }]
                      }]
                    };

                    map = new google.maps.Map(element[0],mapOptions);

                    if (!scope.fixedPosition){
                      centerOnThis(myPosition);
                    }
                    firstMapLoad=false;

                    updateThisMarker("myMarker", myPosition, true);
                    updateParkingMarkers();

                    /*$ionicLoading.hide();*/

                } else {

                    getCurrentPosition();

                    if (positionChange(lastPosition,myPosition,1)) {//TODO: Check max distance for position change

                       updateThisMarker("myMarker", myPosition, true);
                       updateParkingMarkers();
                    }

                }
            }

          };

          var centerOnThis = function(position) {
            if (map){
              map.setCenter(position.geolocate);
              map.setZoom(15);              
            }
          };

          var updateThisMarker = function (marker, position, isMyPosition){

              if (scope[marker] !== null) {
                scope[marker].setMap(null);
              }

              scope[marker] = new google.maps.Marker({
                    position: new google.maps.LatLng(position.lat, position.long),
                    map: map,
                    animation: google.maps.Animation.NONE,
                    icon: isMyPosition ? "images/bluedot2.png" : "images/blue-w.png",
                    zIndex: 20,
                    title: "Ubicacion actual"
              });

              var markerDescription = "";

              if (position.name){
                markerDescription += position.name+" ";
              }
              if (position.address){
                markerDescription += "("+position.address+")";
              }


              scope[marker].content = '<div class="infoWindowContentSmall"><strong>' + markerDescription + '</strong></div>';

              google.maps.event.addListener(scope[marker], 'click', function(){
                  infoWindow.setContent(scope[marker].content);
                  infoWindow.open(map, scope[marker]);
              });

              if(!isMyPosition) return;

              var centerControlDiv = document.createElement('div');
              centerControl(centerControlDiv).index = 1;

              map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
              map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv);

          };

          var updateParkingMarkers = function (position) {

            if(position) {
              myPosition = position;
            } else if (!myPosition) {
              return;
            }

             api.parking.lista({'sellerId':SELLER.sellerID,'latitude':myPosition.lat,'longitude':myPosition.long}).$promise.then(function(response) {
             var parkings=response.data.parkings;
             //parkingService.listParkings(myPosition.lat, myPosition.long).then(function(parkings) {


             if (scope.fixedPosition){

                  clearMarkers();
                  parkings=$filter('orderBy')(parkings, 'parking.distance');
                  parkings=parkings.slice(0, 4);

             }else{

                  //compares markers vs parkings, adds the new pakrings and removes the missing ones
                  angular.forEach(markers, function(marker) {

                    var found = false;

                    for (var i = 0; i < parkings.length; i++) {

                      if (angular.equals(marker.info, parkings[i])) {

                          found=true;
                          parkings.splice(i,1);
                      }

                    }

                    if (!found) {

                      deleteMarker(marker);
                    }

                 });

             }


             for (var i = 0; i < parkings.length; i++) {
                createMarker(parkings[i]);
             }


            }, function() {
              console.log('Unable to get the parkings');
            });

          };

          scope.pagar = function(){
            console.log("comprar");
          };

          var createMarker = function (info,quotation){

              var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(info.latitude, info.longitude),
                    map: map,
                    animation: google.maps.Animation.NONE,
                    title: info.parkingName,
                    icon: "images/map-parking.png",
                    startDate: quotation?quotation.startDate:'',
                    endDate: quotation?quotation.endDate:'',
                    price: quotation?quotation.price:'',
                    zIndex: 10,
                    info:quotation?quotation:info
              });

            //@smell: parece que esto está al pedo
              if (quotation){
                  var startDate = new Date(quotation.startDate);
                  var endDate = new Date(quotation.endDate);
              }

                google.maps.event.addListener(marker, 'click', function(){
                    getMarkerQuotation(marker.info.parkingId).then(function(quotation){
                      marker.content = generateMarkerContent(info, quotation, quotation.price);
                      infoWindow.setContent(marker.content);
                      
                      google.maps.event.addListener(infoWindow,'domready',function(){ 
                        $('#map-parking-container')
                         .closest('.gm-style-iw-d')
                          .parent().addClass('custom-iw');
                        $('#map-parking-container')
                         .closest('.gm-style-iw-d')
                          .addClass('custom-iw-inner');
                      });

                      infoWindow.open(map, marker);
                      map.setCenter(marker.position);
                    });
                });

                markers.push(marker);
          };


          var createPlaceMarker = function (marker,info){

              scope[marker] = new google.maps.Marker({
                    position: new google.maps.LatLng(info.lat, info.long),
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: info.icon,
                    zIndex: 30,
                    title: info.title
              });

              scope[marker].content = '<div id="map-place-container" class="container-place-info"> <div class="infoWindowContentPlace"><div style="display: inline-block;"> <img class="place-logo" src="./images/icono-teatro-small.png" alt=""> <strong>' + info.description + '</strong> </div></div></div>';

              google.maps.event.addListener(scope[marker], 'click', function(){
                  infoWindow.setContent(scope[marker].content);

                  google.maps.event.addListener(infoWindow,'domready',function(){ 
                    $('#map-place-container')
                     .closest('.gm-style-iw-d')
                      .parent().addClass('custom-place-iw');
                    $('#map-place-container')
                     .closest('.gm-style-iw-d')
                      .addClass('custom-place-iw-inner');
                  });

                  infoWindow.open(map, scope[marker]);
              });

          };

          var getMarkerQuotation = function(parkingId) {
            return new Promise (function(resolve, reject){
              var data = {
                sellerId: SELLER.sellerID,
                vehicleTypeId:1,
                latitude:myPosition.lat,
                longitude:myPosition.long,
                startDate: parkingService.convertDateToAPIFormat(dateFrom),
                endDate: parkingService.convertDateToAPIFormat(dateTo),
                parkingId: parkingId
              };

              api.quotation.save('',data).$promise.then(function(response) {
                var result = false;
                if(response && response.data && response.data.quotations) {
                  if(response.data.quotations.length > 0){
                    result = response.data.quotations[0];
                  }
                }
                resolve(result);
              }).catch(function(err){
                reject(err);
              });
            });
          };

          var generateMarkerContent = function(info, quotation, price) {
            var HTMLContent;
            HTMLContent = '<div id="map-parking-container" class="container-info"> <img class="garage-logo" src="./images/estacionamiento.svg" alt=""><div ng-controller="MainCtrl" class="infoWindowContent"> <strong>' + info.parkingDescription + ' </strong>';
            //HTMLContent += quotation?'Desde: '+startDate.toLocaleDateString()+" <strong>"+startDate.toLocaleTimeString()+'</strong></br>':'';
            //HTMLContent += quotation?'Hasta: '+endDate.toLocaleDateString()+" <strong>"+endDate.toLocaleTimeString()+'</br>':'';
            HTMLContent += quotation?'<div class="address-line"> ' + quotation.parking.address.street + ' ' + quotation.parking.address.number + ' </div>':
            '<div class="address-line">' + info.address.street + ' ' + info.address.number + ' </div>';
            HTMLContent += price?'<div class="price-line"><strong>$'+price+'</strong> - 12hs</div>':
                '<div class="price-line">12hs</div>';
            HTMLContent += info?'<div class="distance-line"><div style="display: inline-block;"><img class="distance-logo" src="./images/walking-distance.png" alt="">&nbsp;<strong style="margin-top:3px;">' + parseInt(info.distance) + ' cuadras</strong></div></div>': '';
            
            HTMLContent += '</div> <div class="buttons"><button type="button" id="btn-reservar" onClick="window.sessionStorage.setItem(\'reservarUrl\', \'#/buy/?parkingId='+ info.parkingId+'&lat='+myPosition.lat+'&lng='+myPosition.long+'\');window.location.href=\'#/buy/?parkingId='+ info.parkingId+'&lat='+myPosition.lat+'&lng='+myPosition.long+'\'" class=""><img src="./images/reservar.svg" alt="">Reservar</button>';
            //HTMLContent += '<div class="buttons-divider"><hr></div><button type="button" id="btn-estacionar" onClick="window.location.href=\'#/buy/?parkingId='+ info.parkingId+'&lat='+myPosition.lat+'&lng='+myPosition.long+'&estacionar=1\'" class=""><img src="./images/estacionar.svg" alt="">Estacionar</button></div>';
            
            /*HTMLContent += quotation?'</div> <div class="buttons"><button type="button" id="btn-reservar" onClick="window.location.href=\'#/buy/?quotationId='+quotation.quotationId+'&parkingId='+ quotation.parking.parkingId+'&lat='+myPosition.lat+'&lng='+myPosition.long+'\'" class=""><img src="./images/reservar.svg" alt="">Reservar</button>':
                '</div> <div class="buttons"><button type="button" class=""><a href="#/login"><img src="./images/reservar.svg" alt="">Reservar</a></button>';
            HTMLContent += quotation?'<div class="buttons-divider"><hr></div><button type="button" id="btn-estacionar" onClick="window.location.href=\'#/buy/?quotationId='+quotation.quotationId+'&parkingId='+ quotation.parking.parkingId+'&lat='+myPosition.lat+'&lng='+myPosition.long+'&estacionar=1\'" class=""><img src="./images/estacionar.svg" alt="">Estacionar</button></div>':
                '<hr><button type="button" class=""><a href="#/login"><img src="./images/estacionar.svg" alt="estacionar">Estacionar</a></button></div>';*/
            HTMLContent += ' </div>';
            return HTMLContent;
          };


          var deleteMarker = function(marker) {

            marker.setMap(null);

            var index = markers.indexOf(marker);

            if (index > -1) {
                markers.splice(index, 1);
            }

          };

          var clearMarkers = function() {

              for(var i=0; i<markers.length; i++){
                  markers[i].setMap(null);
              }
              markers = new Array();
          };

          var positionChange = function (lastPosition, myPosition, maxDistance ) {

             var latLng1 = new google.maps.LatLng(lastPosition.lat,lastPosition.long);
             var latLng2 = new google.maps.LatLng(myPosition.lat,myPosition.long);

             var distance = google.maps.geometry.spherical.computeDistanceBetween(latLng1, latLng1);

             return (distance>maxDistance);

          };

          /**
           * The CenterControl adds a control to the map that recenters the map on the user's location.
           * This constructor takes the control DIV as an argument.
           */
          var centerControl = function(centerControlDiv) {
            var userPos = new google.maps.LatLng(myPosition.lat,myPosition.long),
                controlUI = document.createElement('div'),
                controlTextImg = document.createElement('img');

            $(controlUI).addClass('geolocation-center-position-button');
            controlTextImg.src = "images/center-position.png";
            centerControlDiv.appendChild(controlUI);
            controlUI.appendChild(controlTextImg);
            controlUI.addEventListener('click', function() {

              map.panTo(userPos);
              //map.setZoom(config.isDesktop ? 17 : 18);
              /*if(!config.isDesktop){
                $(config.infoWindowContainer).parent().removeClass('infowindow-opened');
              }*/
            });
            return centerControlDiv;
          };

          getCurrentPosition();

          $interval(function () {

              if (myPosition==null) {
                getCurrentPosition(); //TODO: Show alert to start GPS.
              }

          }, 2000);

          updateMap();

          $interval(function () {
              updateMap();
          }, 5000);

          $interval(function () {
            if (map && !initPositionMarked)
              markInitPosition();
            if (map && !placesMarked)
              markPlaces();
          }, 1000);


          //TODO

          //Probar checkeo de distancia en metros para redibujado de myMarker
          //Usar myLocation como parametro en todas las llamadas en lugar de usarla como global.
          //Cuando arranca la app sin GPS y luego se activa no funciona. Incluso con el intent de getCurrentPosition


        }
    };
});
