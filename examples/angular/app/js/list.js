(function (angular) {
    'use strict';

    var listModule = angular.module('portfoliosApp.list', ['portfoliosApp.common']);

    // CONTROLLERS
    listModule.controller('ListCtrl', ['$scope', 'Repository', '$modal', function ($scope, repo, $modal) {
        $scope.currentViewName = 'list';

        $scope.isViewLoading = true;
        $scope.portfolios = [];
        $scope.sortingByColumn = 'name';
        $scope.sortingDesc = false;

        var updateList = function (setIsLoading) {
            if (setIsLoading) $scope.isViewLoading = true;
            repo.getPortfolioList().then(function (data) {
                $scope.portfolios = data;
                $scope.isViewLoading = false;
            });
        }

        $scope.sortBy = function (colName) {
            $scope.sortingByColumn = colName;
            $scope.sortingDesc = !$scope.sortingDesc;
        };

        $scope.destroy = function (portfolio) {

            var modalInstance = $modal.open({
                templateUrl: 'partials/confirm.html',
                controller: function ($scope, $modalInstance) {
                    $scope.message = "Are you sure?";
                    $scope.ok = function () {
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function () {
                repo.destroyPortfolio(portfolio.id).then(function () {
                    updateList(false);
                });
            }, function () {
                //dismissed...
            });
        };

        // initialization
        updateList(true);

    } ]);

} (angular));