(function (angular) {
    'use strict';

    var commonModule = angular.module('portfoliosApp.common', []);

    // SERVICES
    commonModule.factory('Repository', ['$q', function($q){
    
        var portfolios = {};

        var async = function (actualFunction, functionParam) {
            var deferred = $q.defer();

            var timer = setInterval(function () {
                // start
                deferred.notify();
            }, 100);

            setTimeout(function () {
                clearInterval(timer);
                // end
                var data = actualFunction(functionParam);
                deferred.resolve(data);
            }, 500);

            return deferred.promise;
        };

        // when this app is loaded, initialize the "database" with some data...
        var identity = 100;
        portfolios[identity] = {
            id: identity,
            name: '70/30 Technology',
            strategy: 'Aggressive',
            nextReviewDate: new Date(2013, 9, 3),
            investments: [{
                name: 'Microsoft',
                tickerSymbol: 'MSFT',
                type: 'Equities',
                targetPercentage: 50
            }, {
                name: 'Google',
                tickerSymbol: 'GOOG',
                type: 'Equities',
                targetPercentage: 20
            }, {
                name: 'Municipal Bond Fund',
                tickerSymbol: 'MEMTX',
                type: 'Fixed Income',
                targetPercentage: 30
            }]
        };

        identity++;
        portfolios[identity] = {
            id: identity,
            name: '60/40 Consumer Goods',
            strategy: 'Aggressive',
            nextReviewDate: new Date(2014, 6, 15),
            investments: [{
                name: 'Coca Cola',
                tickerSymbol: 'KO',
                type: 'Equities',
                targetPercentage: 30
            },
            {
                name: 'Johnson & Johnson',
                tickerSymbol: 'JNJ',
                type: 'Equities',
                targetPercentage: 30
            }, {
                name: 'International Bond Fund',
                tickerSymbol: 'BAEDX',
                type: 'Fixed Income',
                targetPercentage: 40
            }]
        };

        identity++;
        portfolios[identity] = {
            id: identity,
            name: '50/50 Retailers',
            strategy: 'Conservative',
            nextReviewDate: new Date(2015, 1, 3),
            investments: [{
                name: 'Target Stores',
                tickerSymbol: 'TGT',
                type: 'Equities',
                targetPercentage: 25
            }, {
                name: 'Wal-Mart Stores',
                tickerSymbol: 'WMT',
                type: 'Equities',
                targetPercentage: 25
            }, {
                name: 'Municipal Bond Fund',
                tickerSymbol: 'MEMTX',
                type: 'Fixed Income',
                targetPercentage: 50
            }]
        };

        return {
            getPortfolioList: function () {
                return async(function () {
                    return jQuery.map(portfolios, function (val) {
                        return val;
                    });
                });
            },
            getPortfolio: function (id) {
                return async(function (id) {
                    return portfolios[id];
                }, id);
            },
            savePortfolio: function (portfolio) {
                return async(function (portfolio) {
                    if (typeof (portfolio.id) === 'undefined') {
                        portfolio.id = ++identity;
                    }
                    portfolios[portfolio.id] = portfolio;
                }, portfolio);
            },
            destroyPortfolio: function (id) {
                return async(function (id) {
                    delete portfolios[id];
                }, id);
            },
            getAvailableStrategies: function () {
                return async(function () {
                    return ['Aggressive', 'Conservative'];
                });
            },
            getAvailableInvestmentTypes: function () {
                return async(function () {
                    return ['Equities', 'Fixed Income'];
                });
            },
            getAvailableInvestments: function () {
                return async(function () {
                    return [
                        {
                            name: 'Microsoft',
                            tickerSymbol: 'MSFT',
                            type: 'Equities',
                            rating: 'Buy'
                        }, {
                            name: 'Google',
                            tickerSymbol: 'GOOG',
                            type: 'Equities',
                            rating: 'Buy'
                        }, {
                            name: 'Coca Cola',
                            tickerSymbol: 'KO',
                            type: 'Equities',
                            rating: 'Sell'
                        }, {
                            name: 'Johnson & Johnson',
                            tickerSymbol: 'JNJ',
                            type: 'Equities',
                            rating: 'Hold'
                        }, {
                            name: 'Target Stores',
                            tickerSymbol: 'TGT',
                            type: 'Equities',
                            rating: 'Buy'
                        }, {
                            name: 'Wal-Mart Stores',
                            tickerSymbol: 'WMT',
                            type: 'Equities',
                            rating: 'Hold'
                        }, {
                            name: 'Municipal Bond Fund',
                            tickerSymbol: 'MEMTX',
                            type: 'Fixed Income',
                            rating: 'Sell'
                        }, {
                            name: 'International Bond Fund',
                            tickerSymbol: 'BAEDX',
                            type: 'Fixed Income',
                            rating: 'Hold'
                        },
                    ];
                });
            }
        };
    }]);

    commonModule.factory('InvestmentPicker', ['$modal', 'Repository', function ($modal, repo) {

        var open = function (onInvestmentSelected) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/investmentPicker.html',
                controller: function ($scope, $modalInstance) {

                    $scope.availableInvestments = [];
                    $scope.isViewLoading = true;
                    $scope.filters = {
                        name: '',
                        type: '',
                        availableTypes: []
                    };

                    // initialization
                    var pendingInvestmentTypes = true, pendingInvestments = true;
                    var maybeFinishedLoading = function () {
                        if (!pendingInvestments && !pendingInvestmentTypes)
                            $scope.isViewLoading = false;
                    }

                    repo.getAvailableInvestmentTypes().then(function (data) {
                        $scope.filters.availableTypes = data;
                        pendingInvestmentTypes = false;
                        maybeFinishedLoading();
                    });

                    repo.getAvailableInvestments().then(function (data) {
                        $scope.availableInvestments = data;
                        pendingInvestments = false;
                        maybeFinishedLoading();
                    });

                    $scope.selectInvestment = function (investment) {
                        onInvestmentSelected(angular.copy(investment));
                        var index = $scope.availableInvestments.indexOf(investment)
                        $scope.availableInvestments.splice(index, 1);
                    }

                    $scope.close = function () {
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });

        };

        return {
            open: open
        };

    } ]);

    // CONTROLLERS
    commonModule.controller('HeaderCtrl', ['$scope', '$route', function ($scope, $route) {
        // just used to highlight the current route in the nav bar
        $scope.$route = $route;
    } ]);

} (angular));