define(['plugins/dialog', 'knockout', 'services/repository'], function (dialog, ko, repo) {

    var InvestmentPicker = function (onInvestmentSelected) {

        this.availableInvestments = ko.observableArray();

        this.isViewLoading = ko.observable(true);

        this.selectInvestment = function (investment) {
            if (onInvestmentSelected) {
                onInvestmentSelected(investment);
                this.availableInvestments.remove(investment);
            }
        } .bind(this);

        // filtering
        this.filters = {};
        this.filters.name = ko.observable();
        this.filters.type = ko.observable();
        this.filters.availableTypes = ko.observableArray();
        this.filteredInvestments = ko.computed(function () {
            var currentName = (this.filters.name() || '').trim();
            var currentType = this.filters.type() || '';
            if (currentName.length === 0 && currentType.length === 0) return this.availableInvestments();
            return $.grep(this.availableInvestments(), function (i) {
                if (currentName && i.name.toLowerCase().indexOf(currentName) !== -1) return true;
                if (currentType && currentType === i.type) return true;
                return false;
            });
        }, this);
    };

    InvestmentPicker.prototype.activate = function () {
        var self = this;

        self.isViewLoading(true);
        var pendingInvestmentTypes = true, pendingInvestments = true;
        var maybeFinishedLoading = function () {
            if (!pendingInvestments && !pendingInvestmentTypes)
                self.isViewLoading(false);
        }

        repo.getAvailableInvestmentTypes().then(function (data) {
            self.filters.availableTypes(data);
            pendingInvestmentTypes = false;
            maybeFinishedLoading();
        });
        repo.getAvailableInvestments().then(function (data) {
            self.availableInvestments(data);
            pendingInvestments = false;
            maybeFinishedLoading();
        });
    };

    InvestmentPicker.prototype.close = function () {
        dialog.close(this);
    };

    InvestmentPicker.show = function (onInvestmentSelected) {
        return dialog.show(new InvestmentPicker(onInvestmentSelected));
    };

    return InvestmentPicker;

});