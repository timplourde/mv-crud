define(['durandal/app', 'knockout', 'services/repository', 'jquery', 'plugins/router', './investmentpicker',
    'knockout_extensions/percent', 'knockout_extensions/datepicker', 'knockout_extensions/piechart'],
    function (app, ko, repo, $, router, investmentpicker) {

        // this module exports a function so there can be multiple instances.
        var ctor = function () {
            var self = this;

            var lastKnownGoodModel = null; // used to detect if there are unsaved changes

            self.availableStrategies = ko.observableArray();
            self.isSaving = ko.observable(false);
            self.isViewLoading = ko.observable(true);

            self.id = null;
            self.name = ko.observable(),
            self.strategy = ko.observable(),
            self.nextReviewDate = ko.observable(),
            self.investments = ko.observableArray();

            self.destroyInvestment = function (investment) {
                self.investments.remove(investment);
            };

            self.openInvestmentPicker = function () {
                investmentpicker.show(self._addInvestment);
            };

            // portfolio break down by type (pie chart data)
            self.portfolioBreakdown = ko.observableArray();
            var updatePortfolioBreakdown = function () {
                var types = {};
                ko.utils.arrayForEach(self.investments(), function (inv) {
                    var targetPercentage = parseFloat(inv.targetPercentage());
                    var type = inv.type;
                    if (!types[type]) {
                        types[type] = targetPercentage;
                    } else {
                        types[type] += targetPercentage;
                    }
                });
                var newBreakdown = [];
                $.each(types, function (type, val) {
                    newBreakdown.push({
                        name: type,
                        val: val
                    });
                });
                self.portfolioBreakdown(newBreakdown);
            };
            self.investments.subscribe(updatePortfolioBreakdown);

            // grand total
            self.grandTotal = {};
            self.grandTotal.delta = ko.observable(0);
            self.grandTotal.isTooLow = ko.observable(false);
            self.grandTotal.showHelper = ko.observable(false);
            self.grandTotal.percentage = ko.computed(function () {
                var total = 0;
                ko.utils.arrayForEach(self.investments(), function (investment) {
                    var percentage = parseFloat(investment.targetPercentage());
                    if (typeof (percentage) === 'number')
                        total += percentage;
                });

                if (total === 100) {
                    self.grandTotal.showHelper(false);
                } else {
                    self.grandTotal.showHelper(true);
                    self.grandTotal.delta((Math.abs(100 - total)).toFixed(2));
                    self.grandTotal.isTooLow(total < 100);
                }

                return total.toFixed(2);

            }).extend({ throttle: 50 });


            // validation (ko-validation is much better, just using computed's for simplicity)
            var required = function (observable) {
                return (observable() || '').length > 0;
            }
            self.name.isValid = ko.computed(function () {
                return required(self.name);
            });
            self.strategy.isValid = ko.computed(function () {
                return required(self.strategy);
            });
            self.nextReviewDate.isValid = ko.computed(function () {
                if (!self.nextReviewDate()) return false;
                return typeof (self.nextReviewDate().getMonth) === 'function';
            });

            var pendingPortfolio = false, pendingStrategies = false;
            var maybeFinishedLoading = function () {
                if (!pendingPortfolio && !pendingStrategies)
                    self.isViewLoading(false);
            };

            // loading
            self.activate = function (id) {
                self.isViewLoading(true);
                pendingStrategies = true;
                repo.getAvailableStrategies().done(function (data) {
                    self.availableStrategies(data);
                    pendingStrategies = false;
                    maybeFinishedLoading();
                });

                if (typeof (id) !== 'undefined') {
                    pendingPortfolio = true;
                    self._loadPortfolio(id);
                }
            }

            self._addInvestment = function (investment) {
                var existingInvestments = self.investments();
                for (var i = 0; i < existingInvestments.length; i++) {
                    var existingInvestment = existingInvestments[i];
                    if (investment.tickerSymbol === existingInvestment.tickerSymbol) {
                        return false;
                    }
                }
                var editableInvestment = {
                    name: investment.name,
                    tickerSymbol: investment.tickerSymbol,
                    type: investment.type,
                    targetPercentage: ko.observable(investment.targetPercentage || 0).extend({ percent: 2 })
                };
                editableInvestment.targetPercentage.subscribe(updatePortfolioBreakdown);
                self.investments.push(editableInvestment);
            };

            self._loadPortfolio = function (id) {
                repo.getPortfolio(id).done(function (portfolio) {
                    self.id = portfolio.id;
                    self.name(portfolio.name);
                    self.strategy(portfolio.strategy);
                    self.nextReviewDate(portfolio.nextReviewDate);
                    ko.utils.arrayForEach(portfolio.investments, self._addInvestment);
                    pendingPortfolio = false;
                    maybeFinishedLoading();
                    lastKnownGoodModel = self._makeSaveCommand();
                });
            };

            // validation & saving
            self._isValid = function () {
                if (self.investments().length === 0) return false;
                if (!self.name.isValid() || !self.strategy.isValid() || !self.nextReviewDate.isValid()) return false;
                if (self.grandTotal.showHelper()) return false;
                return true;
            };

            self._makeSaveCommand = function () {
                var command = {
                    id: self.id,
                    name: self.name(),
                    strategy: self.strategy(),
                    nextReviewDate: self.nextReviewDate(),
                    investments: []
                }
                command.investments = $.map(ko.toJS(self.investments), function (investment) {
                    investment.targetPercentage = parseFloat(investment.targetPercentage);
                    return investment;
                });
                lastKnownGoodModel = command;
                return command;
            };

            self.save = function () {
                if (!self._isValid()) return false;
                self.isSaving(true);
                var saveCommand = self._makeSaveCommand();
                repo.savePortfolio(saveCommand).then(function () {
                    router.navigate('#');
                });
            };

            self.canDeactivate = function () {
                if (!self.id) return true;
                // make the user confirm if they have unsaved changes
                var currentSaveCommand = ko.toJSON(self._makeSaveCommand());
                if (ko.toJSON(lastKnownGoodModel) === currentSaveCommand) return true;
                app.showMessage('You have unsaved changes, are you sure you want to navigate away?', 'Please Confirm', ['Yes', 'No']).then(function (x) {
                    if (x === 'Yes') {
                        return true;
                    }
                    return false;
                });
            }
        };

        return ctor;
    });