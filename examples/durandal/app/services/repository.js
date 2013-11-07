
/*
    This simulates an async server backend using promises.  
    Be careful about references since the database is just an object.
*/
define(['jquery'], function ($) {

    var portfolios = {};

    var async = function (actualFunction, functionParam) {
        var deferred = $.Deferred();

        timer = setInterval(function () {
            // start
            deferred.notify();
        }, 100);

        setTimeout(function () {
            clearInterval(timer);
            // end
            var data = actualFunction(functionParam);
            deferred.resolve(data);
        }, 500);

        return deferred.promise();
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
                return $.map(portfolios, function (val) {
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

});
