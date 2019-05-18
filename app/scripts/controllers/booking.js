'use strict';

angular.module('werpiApp')
  .controller('BookingCtrl', function ($scope,$state,$stateParams,$filter,Session,$rootScope,api,notify,$window) {

    moment.locale('es');
    $scope.loading = false;


    $scope.bookingId=$stateParams.bookingId;
    
    if ($stateParams.justBooked){
      $scope.justBooked=true;
    }else{
      $scope.justBooked=false;      
    }


    $scope.showBuyBanner = false;//!($window.sessionStorage.getItem("showBuyBanner")=="false");

  	$scope.user=Session.getUser();
  	$scope.booking={};
  	$scope.bookingDetail=false;

  	if ($scope.bookingId){
		  var dataGet = { id : $scope.bookingId };
      api.booking.get(dataGet).$promise.then(function(response) {
        $scope.booking = response.data.booking;
        $scope.bookingDetail=true;
        //$scope.booking.startDate = getDateObject($scope.booking.startDate);
        //$scope.booking.endDate = getDateObject($scope.booking.endDate);
        fixBookingDates(response.data.booking);
     });
	  }

	api.booking.get().$promise.then(function(response) {
           $scope.bookings = response.data.bookings;
           $scope.bookings.forEach(fixDates);
           $scope.bookings=$filter('orderBy')($scope.bookings, 'booking.startDate',true);
   		});

  function fixDates(booking, index){
    $scope.bookings[index].booking.price = $scope.bookings[index].booking.price;
    $scope.bookings[index].booking.formattedShortStartTime = moment($scope.bookings[index].booking.startDate).format('HH:mm');
    $scope.bookings[index].booking.formattedShortStartDate = moment($scope.bookings[index].booking.startDate).format('D/MM/YY');
    $scope.bookings[index].booking.formattedStartDate = moment($scope.bookings[index].booking.startDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
    $scope.bookings[index].booking.formattedEndDate = moment($scope.bookings[index].booking.endDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
    $scope.bookings[index].booking.duration = moment($scope.bookings[index].booking.endDate).diff(moment($scope.bookings[index].booking.startDate),'h')+" hs";
  }

  // @TODO: unificar con fixDates() en un solo método
  function fixBookingDates(booking){
    $scope.booking.price = booking.price;
    //$scope.booking.startDate = getDateObject(booking.startDate);
    //$scope.booking.endDate = getDateObject(booking.endDate);
    $scope.booking.formattedShortStartTime = moment(booking.startDate).format('HH:mm');
    $scope.booking.formattedShortStartDate = moment(booking.startDate).format('D/MM/YY');
    $scope.booking.formattedStartDate = moment(booking.startDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
    $scope.booking.formattedEndDate = moment(booking.endDate).format('D [de] MMMM [del] YYYY [a las] hh:mm a');
    $scope.booking.duration = moment(booking.endDate).diff(moment(booking.startDate),'h')+" hs";
  }

  function getDateObject(str) {
    return new Date(str);
  }

  function getLocalDate(UTCDate){
      return new Date(UTCDate.replace(/-/g,'/')+' UTC');
  }

	$scope.showBooking = function(index){
  		$scope.booking=$scope.bookings[index].booking;
  		$scope.bookingDetail=true;
      $rootScope.goBackCallback = $scope.closeBookingDetail; // We handle de backbutton behavior in MenuCtrl
      handleDocumentScroll();
	};

	function handleDocumentScroll() {
    document.body.classList.toggle('no-scroll');
  }

  $scope.goHome = function(){
      $state.go('main');
  }

  $scope.resendVoucher = function(){

     var data = {id: $scope.booking.bookingId};
      $scope.loading = true;
         api.booking.sendVoucher(data).$promise.then(function(response) {
                $scope.loading = false;
                  notify({ messageTemplate:'<i class="fa fa-check big-fa"></i><div class="notify-text">Se ha reenviado el comprobante a su casilla de correos</div>', classes:'alert-notify',position:'right'} );
                       },function(response) {
                          $scope.loading = false;
                          var msg = "No se pudo reenviar el comprobante. ";
                          if (response.data&&response.data.errors&&response.data.errors.error&&response.data.errors.error.errorDetail){
                            msg+=response.data.errors.error.errorDetail;
                          }
                    notify({messageTemplate:'<i class="fa fa-exclamation-circle big-fa"></i><div class="notify-text">'+msg+'</div>', classes:'alert-notify',position:'right'} );
               });
  };

  $scope.closeBookingDetail = function() {
    $scope.bookingDetail = false;
    $rootScope.goBackCallback = ''; // Is very important to clear this
    handleDocumentScroll();
  };

  $scope.downloadWerpi = function(){
    $window.open('http://onelink.to/qj6zn5', '_blank');
  } 
  $scope.closeBanner = function(){
    $scope.showBuyBanner=false;
    $window.sessionStorage.setItem("showBuyBanner",false);
  } 



  });
