define(['durandal/app', 'knockout', 'services/repository', 'jquery', 'knockout_extensions/displaydate'], function (app, ko, repo, $) {

    var portfolios = ko.observableArray();
    var isViewLoading = ko.observable(true);

    var updateList = function (setIsLoading) {
        if(setIsLoading) isViewLoading(true);
        repo.getPortfolioList().done(function (portfoliosFromServer) {
            portfolios(portfoliosFromServer);
            sortPortfolios();
            isViewLoading(false);
        });
    };

    // sorting
    var sortingByColumn = ko.observable('name');
    var sortingDesc = ko.observable(false);
    var sortBy = function (colName) {
        sortingByColumn(colName);
        sortingDesc(!sortingDesc());
    };
    var sortPortfolios = function () {
        var col = sortingByColumn();
        var descending = sortingDesc();
        portfolios.sort(function (a, b) {
            if (descending) {
                return a[col] > b[col] ? -1 : 1;
            }
            return a[col] < b[col] ? -1 : 1;
        });
    };
    sortingByColumn.subscribe(sortPortfolios);
    sortingDesc.subscribe(sortPortfolios);

    // filtering
    var searchTerm = ko.observable();
    var filteredPortfolios = ko.computed(function () {
        var currentSearch = (searchTerm() || '').trim();
        if (currentSearch.length === 0) return portfolios();
        return $.grep(portfolios(), function (p) {
            return p.name.toLowerCase().indexOf(currentSearch) !== -1;
        });
    }).extend({ throttle: 50 });

    // this is effectively a singleton, require returns this object every time
    return {
        activate: function () {
            updateList(true);
        },
        displayName: 'List',
        searchTerm: searchTerm,
        isViewLoading: isViewLoading,
        filteredPortfolios: filteredPortfolios,
        sortingByColumn: sortingByColumn,
        sortingDesc: sortingDesc,
        sortBy: sortBy,
        destroy: function (portfolio) {
            app.showMessage('Are you sure?', 'Please Confirm', ['Yes', 'No']).then(function (x) {
                if (x === 'Yes') {
                    repo.destroyPortfolio(portfolio.id).done(function () {
                        updateList(false);
                    });
                }
            });
        }
    };
});