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

angular.module('HackTJCheckin', [])
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}])
.controller('CheckinController', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
	$scope.user = false;
	$scope.isTyping = false;
	$scope.password = "";
	$scope.type = "student"
	$scope.search = ""
	$scope.index = 0;
	
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

	$scope.checkin = function(guest){
		alert("Checking in "+guest.firstname+" "+guest.lastname);
		$scope.search = "";
	}

	document.addEventListener('keydown', function(e){
		console.log(e);
		if($scope.filteredGuests){
			var delta = 0;
			var preventDefault = false;
			if(e.keyIdentifier === 'Down' && $scope.index < ($scope.filteredGuests.length-1)){
				delta = 1;
				preventDefault = true;
			}else if(e.keyIdentifier === 'Up' && $scope.index > 0){
				delta = -1;
				preventDefault = true;
			}else if(e.keyIdentifier === 'Enter'){
				$scope.checkin($scope.filteredGuests[$scope.index]);
				preventDefault = true;
			}
			if(delta !== 0){
				$scope.$apply(function(){
					$scope.index += delta;
				});
			}
			if(preventDefault){
				e.preventDefault();
			}
		}
	});
	// $('input.checkin').on('keypress', function(e){
	// 	if(e.keyIdentifier === 'Down' || e.keyIdentifier === 'Up' || e.keyIdentifier === 'Enter'){
	// 		e.preventDefault();
	// 	}
	// })
}]);
