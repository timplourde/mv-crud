/* 
    binding handler to display a pie chart 
*/
define(['jquery', 'knockout', 'highcharts'], function ($, ko) {

    var chartInstance;

    var convertSeriesToHighChartFormat = function (series) {
        // we expect series to be like this:
        // [ { name: 'foo', val: 60}, {name: 'bar', val: 40} ]
        // highcharts likes this (among other things)
        // [ ['foo', 60], ['bar', 40] ]

        return $.map(series || [], function (point) {
            return [[point.name, point.val]];
        });
    };

    ko.bindingHandlers.pieChart = {

        init: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element);
            var series = ko.unwrap(valueAccessor()) || [];

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
                        // layout is getting is affected by transitions somehow
                         y: -20,
                         size: '65%',   
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
                    data: convertSeriesToHighChartFormat(series)
                }]
            };

            var userOptions = allBindingsAccessor().pieChartOptions || {};
            $.extend(options, userOptions);

            function createIfVisible() {
                if ($element.is(':visible')) {
                    $element.highcharts(options);
                    chartInstance = $element.highcharts();
                } else {
                    setTimeout(createIfVisible, 200);
                }
            }
            createIfVisible();

        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var series = ko.unwrap(valueAccessor()) || [];
            if (chartInstance) {
                chartInstance.series[0].setData(convertSeriesToHighChartFormat(series), true);
            }
        }
    };
});
