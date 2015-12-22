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
.controller('CheckinController', ['$scope', '$http', function($scope, $http) {
	$scope.user = false;
	$scope.isTyping = false;
	$scope.password = "";
	
	$http.get("https://api.hacktj.org/auth/cookie", { withCredentials: true })
	.success(function(data){
		$scope.user = data;
	})
	.error(function(data){
		console.log(data);
	})


	$scope.login = function(){
		$http.post("https://api.hacktj.org/auth/login", {password: $scope.password})
		.success(function(data){
			$scope.user = data;
		})
		.error(function(data){
			$scope.loginhelp = "Incorrect Password"
		})
	}
	$scope.logout = function(){
		$http.get('https://api.hacktj.org/auth/logout')
		$scope.user = false;
	}
}]);
