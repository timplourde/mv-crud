(function (angular) {
    'use strict';

    var editorModule = angular.module('portfoliosApp.editor', ['portfoliosApp.common']);

    // CONTROLLERS
    editorModule.controller('EditCtrl', ['$scope', 'Repository', '$routeParams', '$location', 'InvestmentPicker',
        function ($scope, repo, $routeParams, $location, investmentPicker) {

            var lastKnownGoodSaveModel = null;  // used to detect unsaved changes
            $scope.$on('$locationChangeStart', function (x) {
                if($scope.currentViewName === 'new') return;
                var currentSaveModel = makeSaveCommand();
                if (!angular.equals(currentSaveModel, lastKnownGoodSaveModel)) {
                    if(!confirm('Are you sure you want to navigate away?  You have unsaved changes.')){
                        x.preventDefault();
                    }
                }
            });

            $scope.portfolio = null;
            $scope.availableStrategies = [];
            $scope.isSaving = false;
            $scope.isViewLoading = true;

            // grand total
            $scope.grandTotal = {
                delta: 0,
                isTooLow: 0,
                showHelper: true
            };
            $scope.grandTotal.percentage = function () {
                if (!$scope.portfolio) return;
                var total = 0;
                angular.forEach($scope.portfolio.investments || [], function (investment) {
                    total += parseFloat(investment.targetPercentage);
                })

                if (isNaN(total)) {
                    $scope.grandTotal.showHelper = false;
                    return '';
                }
                if (total === 100) {
                    $scope.grandTotal.showHelper = false;
                } else {
                    $scope.grandTotal.showHelper = true;
                    $scope.grandTotal.delta = (Math.abs(100 - total)).toFixed(2);
                    $scope.grandTotal.isTooLow = total < 100;
                }
                return total.toFixed(2);
            }

            $scope.destroyInvestment = function (investment) {
                var index = $scope.portfolio.investments.indexOf(investment)
                $scope.portfolio.investments.splice(index, 1);
            }

            // breakdown (for pie chart)
            var calculateBreakdown = function () {
                var types = {}, newBreakdown = [];
                if (!$scope.portfolio) return newBreakdown;
                angular.forEach($scope.portfolio.investments || [], function (inv) {
                    var targetPercentage = parseFloat(inv.targetPercentage);
                    var type = inv.type;
                    if (!types[type]) {
                        types[type] = targetPercentage;
                    } else {
                        types[type] += targetPercentage;
                    }
                });
                angular.forEach(types, function (val, key) {
                    newBreakdown.push({
                        name: key,
                        val: val
                    });
                });
                return newBreakdown;
            };
            $scope.portfolioBreakdown = [];
            $scope.$watch('portfolio.investments', function () {
                $scope.portfolioBreakdown = calculateBreakdown();
            }, true);

            // validation 
            var isValid = function () {
                if (!$scope.portfolio) return false;
                if (!$scope.portfolio.investments || $scope.portfolio.investments.length === 0) return false;
                if (!$scope.portfolioForm.portfolioName.$valid ||
               !$scope.portfolioForm.strategy.$valid ||
               !$scope.portfolioForm.nextReviewDate.$valid) return false;
                if ($scope.grandTotal.showHelper) return false;
                return true;
            };

            // saving
            var makeSaveCommand = function () {
                // may need to do some cleanup and parseFloat()...
                // angular.copy() recursively strips out the '$' properties angular adds to models
                var portfolio = angular.copy($scope.portfolio);
                angular.forEach(portfolio.investments, function (inv) {
                    inv.targetPercentage = parseFloat(inv.targetPercentage);
                });
                return portfolio;
            };
            $scope.save = function () {
                if (!isValid()) return false;
                $scope.isSaving = true;
                var saveCommand = makeSaveCommand();
                lastKnownGoodSaveModel = saveCommand;
                repo.savePortfolio(saveCommand).then(function () {
                    $location.path("/");
                });
            };

            // add investment
            var addInvestment = function (investment) {
                investment.targetPercentage = 0;
                $scope.portfolio.investments.push(investment);
            }
            $scope.addInvestment = function () {
                investmentPicker.open(addInvestment);
            };

            // initialization
            var pendingPortfolio = false, pendingStrategies = false;

            var maybeFinishedLoading = function () {
                if (!pendingPortfolio && !pendingStrategies)
                    $scope.isViewLoading = false;
            };

            var portfolioId = parseInt($routeParams.portfolioId, 10) || null;

            $scope.isViewLoading = true;
            pendingStrategies = true;
            repo.getAvailableStrategies().then(function (data) {
                $scope.availableStrategies = data;
                pendingStrategies = false;
                maybeFinishedLoading();
            });

            if (portfolioId !== null) {
                $scope.currentViewName = 'edit';
                pendingPortfolio = true;
                repo.getPortfolio(portfolioId).then(function (data) {
                    $scope.portfolio = angular.copy(data);
                    pendingPortfolio = false;
                    lastKnownGoodSaveModel = makeSaveCommand();
                    maybeFinishedLoading();
                });
            } else {
                $scope.currentViewName = 'new';
                $scope.portfolio = {
                    investments: []
                };
            }
            

        } ]);

    // DIRECTIVES
    editorModule.directive('jquiDatepicker', ['$filter', function ($filter) {
        var defaultDateFormat = 'yy-mm-dd';
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                element.datepicker({
                    dateFormat: defaultDateFormat,
                    onSelect: function () {
                        // get the Date object instead of the formatted string
                        var date = element.datepicker("getDate");
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });

                ngModelCtrl.$formatters.push(function (value) {
                    return $filter('date')(value, 'yyyy-MM-dd');
                });

                element.on('$destroy', function () {
                    element.datepicker("destroy");
                });
            }
        }
    } ]);

    editorModule.directive('percentage', function () {
        var precision = 2;
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                var previousVal;
                var isAValidPercentage = function (input) {
                    var parsedVal = parseFloat(input);
                    if (isNaN(parsedVal) || typeof (parsedVal) !== 'number' || parsedVal < 0 || parsedVal > 100) {
                        return false;
                    }
                    return true;
                };

                ngModelCtrl.$formatters.push(function (value) {
                    if (isAValidPercentage(value)) {
                        // stash away previously known valid inputs
                        // in case we ever need to revert later on
                        previousVal = value;
                        return value.toFixed(precision);
                    }
                    return value;
                });

                ngModelCtrl.$parsers.push(function (value) {
                    if (isAValidPercentage(value)) {
                        // stash away previously known valid inputs
                        // in case we ever need to revert later on
                        previousVal = parseFloat(value);
                    }
                    return value;
                });

                element.bind('change', function (x, y) {
                    scope.$apply(handleInput);
                });

                var handleInput = function () {
                    var input = element.val(), newValue;
                    // reject invalid percentages, reverting to the previously known good value
                    var isValid = isAValidPercentage(input);
                    newValue = isValid ? parseFloat(input) : previousVal;
                    ngModelCtrl.$setViewValue(newValue.toFixed(precision));
                    ngModelCtrl.$render();
                };
            }
        }
    });

    editorModule.directive('piechart', function () {

        var chartInstance;

        var convertSeriesToHighChartFormat = function (series) {
            // we expect series to be like this:
            // [ { name: 'foo', val: 60}, {name: 'bar', val: 40} ]
            // highcharts likes this (among other things)
            // [ ['foo', 60], ['bar', 40] ]

            var converted = [];
            angular.forEach(series || [], function (point) {
                converted.push([point.name, point.val]);
            })
            return converted;
        };

        var initChart = function (element, data) {
            var options = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                legend: {
                    enabled: true
                },
                series: [{
                    type: 'pie',
                    name: 'Total',
                    data: convertSeriesToHighChartFormat(data)
                }]
            };

            function createIfVisible() {
                if (element.is(':visible')) {
                    element.highcharts(options);
                    chartInstance = element.highcharts();
                    element.on('$destroy', function () {
                        chartInstance.destroy();
                        chartInstance = null;
                    })
                } else {
                    setTimeout(createIfVisible, 200);
                }
            }
            createIfVisible();
        };

        return {
            restrict: 'A',
            scope: {
                piechartSeries: '='
            },
            link: function (scope, element, attrs) {

                if (scope.pieChartSeries && scope.pieChartSeries.length) {
                    // in the unlikely event that pieChartSeries has been data-bound by now
                    initChart(element, scope.pieChartSeries);
                }

                scope.$watch('piechartSeries', function (newVal) {
                    // init or update
                    if (!newVal || !newVal.length) return;
                    if (chartInstance) {
                        var converted = convertSeriesToHighChartFormat(newVal);
                        chartInstance.series[0].setData(converted, true);
                    } else {
                        initChart(element, newVal);
                    }
                });

            }
        }
    });

} (angular));