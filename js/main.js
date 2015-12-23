// Helpers
function hasClass(el, className) {
  if (el.classList)
	return el.classList.contains(className)
  else
	return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
function addClass(el, className) {
  if (el.classList)
	el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
function removeClass(el, className) {
  if (el.classList)
	el.classList.remove(className)
  else if (hasClass(el, className)) {
	var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
	el.className=el.className.replace(reg, ' ')
  }
}

String.prototype.capitalize = function() {
    return this.split(' ').reduce(function(result, s){
    	return result + s.charAt(0).toUpperCase() + s.slice(1) + ' ';
    }, '')
}

angular.module('HackTJCheckin', [])
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}])
.controller('CheckinController', ['$scope', '$http', '$rootScope', '$timeout', function($scope, $http, $rootScope, $timeout) {
	$scope.user = false;
	$scope.isTyping = false;
	$scope.password = "";
	$scope.type = "student"
	$scope.search = ""
	$scope.index = 0;
	$scope.modalGuest = false;

	$scope.setIndex = function(i){
		$scope.index = i;
	}

	$scope.loadGuests = function(type){
		$http.get('https://api.hacktj.org/checkin/guests?type='+type, { withCredentials: true })
		.success(function(data){
			console.log(data);
			$scope.guests = data;
		});
	}

	$http.get("https://api.hacktj.org/auth/cookie", { withCredentials: true })
	.success(function(data){
		$scope.user = data;
		$scope.loadGuests($scope.type);
	});

	$scope.login = function(){
		$http.post("https://api.hacktj.org/auth/login", {password: $scope.password})
		.success(function(data){
			$scope.user = data;
			$scope.loadGuests($scope.type);
		})
		.error(function(data){
			$scope.loginhelp = "Incorrect Password"
		})
	}
	$scope.logout = function(){
		$http.get('https://api.hacktj.org/auth/logout')
		$scope.user = false;
	}

	$scope.checkinModal = function(index){
		$scope.index = index || $scope.index;
		$scope.modalGuest = $scope.filteredGuests[$scope.index];
		document.querySelector('input.phone').focus();
	}
	$scope.sendCheckin = function(){
		var guest = $scope.filteredGuests[$scope.index];
		console.log('Checked in '+guest.firstname+" "+guest.lastname+".")
		$scope.search = "";
		$scope.index = 0;
		removeClass(document.querySelector('.send-checkin'), 'selected');
		document.querySelector('input.checkin').focus();
		$scope.modalGuest = false;
	}

	document.addEventListener('keydown', function(e){
		console.log(e.keyIdentifier === "U+001B");
		if($scope.filteredGuests){
			var delta = 0;
			var preventDefault = false;
			if(e.keyIdentifier === 'Down' && $scope.index < ($scope.filteredGuests.length-1)){
				$scope.$apply(function(){
					$scope.index += 1;
				});
				e.preventDefault()
			}else if(e.keyIdentifier === 'Up' && $scope.index > 0){
				$scope.$apply(function(){
					$scope.index -= 1;
				});
				e.preventDefault();
			}else if(e.keyIdentifier === 'Enter'){
				$scope.$apply(function(){
					if($scope.modalGuest) {
						addClass(document.querySelector('.send-checkin'), 'selected');
						$timeout(function(){
							$scope.sendCheckin();
						}, 400);
					} else {
						$scope.checkinModal();
					}
				});
				e.preventDefault();
			}else if(e.keyIdentifier === "U+001B" && $scope.modalGuest){
				$scope.$apply(function(){
					$scope.modalGuest = false;
					document.querySelector('input.checkin').focus();
				});
			}
		}
	});
}]);
