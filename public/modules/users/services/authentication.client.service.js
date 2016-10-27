'use strict';

angular.module('users').factory('AuthInterceptor', function ($rootScope, $q, $window, $location, Authentication) {
	return {
		request: function (config) {
			config.headers = config.headers || {};
			if (Authentication.getToken()) {
				config.headers.Authorization = 'Token ' + Authentication.getToken();
			}
			return config;
		},
		response: function (response) {
			if (response.status === 401) {
				Authentication.deleteData();
				$location.path('signin');
			}
			return response || $q.when(response);
		}
	};
});

angular.module('users').config(function ($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});

angular.module('users').factory('Authentication', function ($rootScope, $q, $window) {
	return {
		setData: function (data) {
			$window.sessionStorage.token = data.token;
			$window.sessionStorage.expires = data.expires;
			$window.sessionStorage.user = JSON.stringify(data.user);
			$rootScope.$broadcast('userLoaded');
		},
		deleteData: function(){
			delete $window.sessionStorage.token;
			delete $window.sessionStorage.expires;
			delete $window.sessionStorage.user;
		},
		getUser: function(){
			return $window.sessionStorage.user ? JSON.parse($window.sessionStorage.user) : null;
		},
		setUser: function(user){
			$window.sessionStorage.user = JSON.stringify(user);
		},
		getToken: function(){
			return $window.sessionStorage.token;
		}
	};
});
