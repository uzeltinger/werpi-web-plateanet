'use strict';

angular.module('werpiApp')
  .controller('PayCtrl', function ($scope, $window, $location,$stateParams, $state, Session, $rootScope, api, notify, parkingService, SELLER) {


    moment.locale('es');


    $scope.mindate=moment();
    $scope.quotationId = $location.search().quotationId;
    $scope.user = Session.getUser();
    $scope.bookingStatus = "Reservando...";
    $scope.booking = {};
    $scope.paymentName = "";
    $scope.paymentMethodId = "";
    $scope.loading = false;
    $scope.currentQuotation={};

    $scope.QuotationFixedStartDate = null;
    $scope.QuotationFixedEndDate = null;
    
    $scope.vehicleTypeId=1;
    $scope.parking={};
    $scope.voucherKey = null;
    $scope.messages=[];

    $rootScope.paySection = 'step-one';

    $scope.paymentMethodImg =null;

    $rootScope.estacionarSection = $location.search().estacionar;
    $rootScope.parkingId = $location.search().parkingId;
    $rootScope.myPositionLat = $location.search().lat;
    $rootScope.myPositionLng = $location.search().lng;


    $rootScope.contactFirstName = $scope.user.firstName;
    $rootScope.contactLastName = $scope.user.lastName;
    $rootScope.licencePlate = $scope.user.licencePlate;

    $scope.cardExpirationMonth;
    $scope.cardExpirationYear;

    var thisYear = new Date().getFullYear();
    var yearRange = [];
    yearRange.push(thisYear);
    for (var i = 1; i < 20; i++) {
        yearRange.push(thisYear + i);
    }
    $scope.yearList = yearRange;

    var monthRange = [];
    for (var i = 1; i <= 12; i++) {
        monthRange.push(('0'+i).substr(-2,2));
    }
    $scope.monthList = monthRange;

    var data = {
      quotationId: $scope.quotationId,
      slots: 1,
      contactData: [{
        licensePlate: $rootScope.licencePlate,
        contactName: $rootScope.contactFirstName,
        contactSurname: $rootScope.contactLastName,
        contactEmail: $scope.user.email
      }]
    };

    $scope.changeVehicleType= function(id){
      $scope.vehicleTypeId=id;
      if ($scope.momentDateFrom){
            $scope.refreshQuotation().then(function(res){
            if(res.quotationId) {
              $scope.quotationId = res.quotationId;
              data.quotationId = res.quotationId;
            } else {
             throw new Error('quotationId is not present in quotation response');
            }
          }).catch(function(err){
            console.log(err);
            notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No hay disponibilidad para el vehículo y fechas seleccionadas.</div>', classes: 'alert-notify', position: 'right'});
          });
      }      
    }

    $scope.applyVoucher= function(){
      
      if ($scope.momentDateFrom){
          $scope.refreshQuotation().then(function(res){
            if(res.quotationId) {
              $scope.quotationId = res.quotationId;
              data.quotationId = res.quotationId;
            } else {
             throw new Error('quotationId is not present in quotation response');
            }
          }).catch(function(err){
            console.log(err);
            notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">El voucher ingresado es inválido</div>', classes: 'alert-notify', position: 'right'});
          });
      }
    }

    $scope.doReserve = function () {

      data = {
        quotationId: $scope.quotationId,
        slots: 1,
        contactData: [{
          licensePlate: $scope.licencePlate,
          contactName: $scope.contactFirstName,
          contactSurname: $scope.contactLastName,
          contactEmail: $scope.user.email
        }]
      };

      api.booking.save('', data).$promise.then(function (response) {
        $scope.booking = response.data.booking;
        $scope.bookingStatus = "Reserva " + $scope.booking.bookingId;
        //correctBookingDates();
        fixBookingDates($scope.booking);
        $rootScope.paySection = 'step-two';
      }, function (response) {
        var errorDetail = response.data.errors.error.errorDetail;

        //Si hay error en el book intenta ir a buscar un book existente para esa quotation.
        var dataGet = {quotationId: $scope.quotationId};
        api.booking.get(dataGet).$promise.then(function (response) {
            if (response.data.bookings.size>0){
              $scope.booking = response.data.bookings[0].booking;
              $scope.bookingStatus = "Reserva " + $scope.booking.bookingId;
              //correctBookingDates();
              fixBookingDates($scope.booking);
              $rootScope.paySection = 'step-two';
            }else{
              notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">'+errorDetail+'</div>', classes: 'alert-notify', position: 'right'});
            }
          }
        );
      });
    };
/*,
      function (error){
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Error '+'</div>', classes: 'alert-notify', position: 'right'});
      }*/
    $scope.refreshQuotation = function() {
      if(!$rootScope.parkingId) return;
      return new Promise (function(resolve, reject){

        var myStartDate = parkingService.convertDateToAPIFormat(new Date($scope.momentDateFrom));
        var myEndDate = parkingService.convertDateToAPIFormat(new Date($scope.momentDateFrom).addHours(12));

        var data = {
          sellerId: SELLER.sellerID,
          vehicleTypeId: $scope.vehicleTypeId,
          latitude:$rootScope.myPositionLat,
          longitude:$rootScope.myPositionLng,
          startDate: myStartDate,
          endDate: myEndDate,
          parkingId: $rootScope.parkingId,
          voucherKey: $scope.voucherKey
        };

        api.quotation.save('',data).$promise.then(function(response) {
          var result = false;
          if(response && response.data && response.data.quotations) {
            if(response.data.quotations.length > 0){
              $scope.currentQuotation = response.data.quotations[0];
              $scope.momentDateFrom = moment($scope.currentQuotation.startDate,'YYYY-MM-DD HH:mm');
              $scope.momentDateTo = moment($scope.currentQuotation.endDate,'YYYY-MM-DD HH:mm');
              $scope.QuotationFixedStartDate = $scope.momentDateFrom.clone();
              $scope.QuotationFixedEndDate = $scope.momentDateTo.clone();
            }
            if (response.data.messages){
              $scope.messages=response.data.messages;
            }
          }
          resolve($scope.currentQuotation);
        }).catch(function(err){
          reject(err);
        });
      });
    };

    $scope.goStepTwo = function () {
      if(!$scope.momentDateFrom){
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Ingrese la fecha y hora de llegada al estacionamiento</div>', classes: 'alert-notify', position: 'right'});
        return;
      } 
      if(!$scope.licencePlate){
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Ingrese la patente del vehículo</div>', classes: 'alert-notify', position: 'right'});
        return;
      } 
      if(!$scope.contactFirstName){
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Ingrese el nombre del conductor</div>', classes: 'alert-notify', position: 'right'});
        return;
      } 
      if(!$scope.contactLastName){
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Ingrese el apellido del conductor</div>', classes: 'alert-notify', position: 'right'});
        return;
      } 

      $scope.refreshQuotation().then(function(res){
        if(res.quotationId) {
          $scope.quotationId = res.quotationId;
          data.quotationId = res.quotationId;
          $scope.doReserve();
        } else {
         throw new Error('quotationId is not present in quotation response');
        }
      }).catch(function(err){
        console.log(err);
        notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No hay disponibilidad para el vehículo y fechas seleccionadas.</div>', classes: 'alert-notify', position: 'right'});
      });
    };

    $scope.refreshToDate = function () {
      if (!$scope.QuotationFixedStartDate || !$scope.QuotationFixedEndDate 
        || $scope.QuotationFixedStartDate != $scope.momentDateFrom || $scope.QuotationFixedEndDate != $scope.momentDateTo){

          $scope.momentDateTo = moment($scope.momentDateFrom).add(12, 'hours');
          $scope.refreshQuotation().then(function(res){
            if(res.quotationId) {
              $scope.quotationId = res.quotationId;
              data.quotationId = res.quotationId;
            } else {
             throw new Error('quotationId is not present in quotation response');
            }
          }).catch(function(err){
            console.log(err);
            notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No hay disponibilidad para el vehículo y fechas seleccionadas.</div>', classes: 'alert-notify', position: 'right'});
          });
      }
    };


    //Mercadopago.setPublishableKey("APP_USR-75c9d28d-394c-4863-8e50-628f061cea3f");
    Mercadopago.setPublishableKey("TEST-36a8ab1b-4d6d-4d4f-9ee4-fb2413387475");
    

    Mercadopago.getIdentificationTypes();

    /*function correctBookingDates() {
      $scope.booking.startDate = new Date($scope.momentDateFrom);
      $scope.booking.endDate = new Date($scope.momentDateFrom).addHours(12);
    }*/


    function setPaymentMethodInfo(status, response) {
      if (status == 200) {
        $scope.paymentMethodId = response[0].id;
        var form = document.querySelector('#frmPay');
        $scope.paymentName = response[0].name;
        if (document.querySelector("input[name=paymentMethodId]") == null) {
          var paymentMethod = document.createElement('input');
          paymentMethod.setAttribute('name', "paymentMethodId");
          paymentMethod.setAttribute('type', "hidden");
          paymentMethod.setAttribute('value', response[0].id);
          form.appendChild(paymentMethod);

        } else {
          document.querySelector("input[name=paymentMethodId]").value = $scope.paymentMethodId;
        }
        $scope.paymentMethodImg=response[0].thumbnail;
      }
    };

    function getBin() {
      var ccNumber = document.querySelector('input[data-checkout="cardNumber"]');
      return ccNumber.value.replace(/[ .-]/g, '').slice(0, 6);
    };

    $scope.guessingPaymentMethod = function () {
      var bin = getBin();
      if (bin.length >= 6) {
        Mercadopago.getPaymentMethod({
          "bin": bin
        }, setPaymentMethodInfo);
      }
    };

    // Este sería el send() del step-two
    $scope.processPay = function () {
      $scope.loading = true;
      var $form = document.querySelector('#frmPay');
      Mercadopago.createToken($form, sdkResponseHandler);
    };

    function doPay(event) {
      event.preventDefault();
      var $form = document.querySelector('#frmPay');
      Mercadopago.createToken($form, sdkResponseHandler);
      return false;
    };

    $scope.processFreePay = function (){

        var data = {
          paymentSourceId: 'MP',
          bookingId: $scope.booking.bookingId,
          paymentToken: null,
          installments: 1,
          paymentMethodId: null,
          email: $scope.user.email
        };

        api.payment.save('', data).$promise.then(function (response) {

          $scope.loading = false;
          Mercadopago.clearSession();
          handleDocumentScroll();
          $rootScope.goBackCallback = goBackToHome;
          $state.go('booking', {'bookingId': $scope.booking.bookingId, 'justBooked': true});

        }, function (response) {
          console.log(response);
          $scope.loading = false;
          var error = response && response.data && response.data.errors && response.data.errors.error ? response.data.errors.error.errorDetail : '';
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No fue posible procesar el pago. <br/>' + error + '</div>', classes: 'alert-notify', position: 'right'});

        });


    }


    function sdkResponseHandler(status, response) {

      if (status == 400 ){
        var message;
        switch(response.cause[0].code) {
          case '205':
            message='Ingresa el número de tu tarjeta';
            break;
          case '208':
            message='Elige un mes';
            break;
          case '209':
            message='Elige un año.';
            break;
          case '212':
            message='Ingresa tu documento';
            break;
          case '213':
            message='Ingresa tu documento';
            break;
          case '214':
            message='Ingresa tu documento';
            break;
          case '221':
            message='Ingresa el nombre y apellido';
            break;
          case '224':
            message='Ingresa el código de seguridad';
            break;
          case 'E301':
            message='Hay algo mal en ese número de tarjeta. Vuelve a ingresarlo';
            break;
          case 'E302':
            message='Revisa el código de seguridad';
            break;
          case '316':
            message='Ingresa un nombre válido';
            break;
          case '322':
            message='Revisa tu documento';
            break;
          case '323':
            message='Revisa tu documento';
            break;
          case '324':
            message='Revisa tu documento';
            break;
          case '325':
            message='Revisa el mes';
            break;
          case '326':
            message='Revisa el año';
            break;
          default:
            message='Los datos ingresados son incorrectos';
        }
        notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">&nbsp;'+message+'</div>', classes: 'alert-notify', position: 'right'});
        $scope.loading = false;
        return;        
      }


      if (status != 200 && status != 201) {
        notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">Los datos ingresados son incorrectos.</div>', classes: 'alert-notify', position: 'right'});
        $scope.loading = false;
      } else {


        var data = {
          paymentSourceId: 'MP',
          bookingId: $scope.booking.bookingId,
          paymentToken: response.id,
          installments: 1,
          paymentMethodId: $scope.paymentMethodId,
          email: $scope.user.email
        };

        api.payment.save('', data).$promise.then(function (response) {

          $scope.loading = false;
          Mercadopago.clearSession();
          handleDocumentScroll();
          $rootScope.goBackCallback = goBackToHome;
          $state.go('booking', {'bookingId': $scope.booking.bookingId, 'justBooked': true});

        }, function (response) {
          console.log(response);
          $scope.loading = false;
          var error = response && response.data && response.data.errors && response.data.errors.error ? response.data.errors.error.errorDetail : '';
          notify({messageTemplate: '<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">No fue posible procesar el pago. <br/>' + error + '</div>', classes: 'alert-notify', position: 'right'});

        });


      }
    };

    function handleDocumentScroll() {
      document.body.classList.toggle('no-scroll');
    }


    function goBackToHome() {
      handleDocumentScroll();
      $state.go('main');
    }

    // @TODO: unificar con fixDates() en un solo método
    function fixBookingDates(booking){
      $scope.booking.price = booking.price;
      $scope.booking.startDate = getDateObject(booking.startDate);
      $scope.booking.endDate = getDateObject(booking.endDate);
      $scope.booking.formattedShortStartTime = moment(booking.startDate).format('HH:mm');
      $scope.booking.formattedShortStartDate = moment(booking.startDate).format('D/MM/YY');
      $scope.booking.formattedStartDate = moment(booking.startDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
      $scope.booking.formattedEndDate = moment(booking.endDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
      $scope.booking.duration = moment(booking.endDate).diff(moment(booking.startDate),'h')+" hs";
    }

    function getDateObject(str) {
      return new Date(str);
    }

  if($rootScope.parkingId){
      var parkingGet = { id : $rootScope.parkingId};
      api.parking.get(parkingGet).$promise.then(function(response) {
                     $scope.parking = response.data.parkings[0];
                     if(!$rootScope.myPositionLat){
                      $rootScope.myPositionLat=$scope.parking.latitude;
                     }
                     if(!$rootScope.myPositionLng){
                      $rootScope.myPositionLng=$scope.parking.longitude;
                     }

                      // Si es vista Estacionar...
                      if($rootScope.estacionarSection == 1){
                        $scope.momentDateFrom = moment().add(15, 'minutes');
                        $scope.refreshToDate();
                      }

                   });

  }

  if(!$rootScope.parkingId&&!$scope.quotationId){
      goBackToHome();
  }


  if ($window.sessionStorage.getItem('urlfuncion')){
    $scope.urlfuncion = $window.sessionStorage.getItem('urlfuncion');
    $scope.momentDateFrom = moment($scope.urlfuncion,'DD-MM-YYYY HH:mm');
    if ($scope.momentDateFrom.isValid()){
      $scope.refreshToDate();
    }
  }




  });


//@TODO: deberíamos llevar esto a otro lado...
Date.prototype.addHours= function(h){
  var copiedDate = new Date(this.getTime());
  copiedDate.setHours(copiedDate.getHours()+h);
  return copiedDate;
};