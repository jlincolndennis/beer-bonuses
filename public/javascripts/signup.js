(function() {
  'use strict';
    angular.module('app')
    .controller('SignupController', function($scope, $http, $window, $location, $rootScope) {

      $scope.createUser = function(){

        $http.post('/api/v1/users/signup', $scope.user)
          .then(function (response) {
            $window.localStorage.setItem('token', response.data.token);
            $rootScope.user = response.data;
            $location.path('/');
          })
      }
    })
}());


// catch
//   set $scope.errors (add to the view)
