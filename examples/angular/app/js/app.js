(function (angular) {
    'use strict';

    angular.module('portfoliosApp', [
      'ngRoute',
      'portfoliosApp.list',
      'portfoliosApp.editor',
      'ui.bootstrap'
    ]).
    config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/list', {templateUrl: 'partials/list.html', controller: 'ListCtrl'});
      $routeProvider.when('/edit/:portfolioId', {templateUrl: 'partials/edit.html', controller: 'EditCtrl'});
      $routeProvider.when('/new', {templateUrl: 'partials/edit.html', controller: 'EditCtrl'});
      $routeProvider.otherwise({redirectTo: '/list'});
    }]);

} (angular));
