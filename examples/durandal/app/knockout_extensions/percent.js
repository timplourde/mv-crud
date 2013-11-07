/* 
    extender which produces a computed observable for reading/writing percentages
*/

define(['knockout'], function (ko) {

    ko.extenders.percent = function (target, precision) {
        precision = precision || 2;
        var result = ko.computed({
            read: function () {
                var val = target();
                if (typeof (val) === 'number') {
                     return val.toFixed(precision);
                } else {
                    return '';
                }
            },
            write: function (newValue) {
                var previousValue = target();
                var parsedVal = parseFloat(newValue);
                // reject invalid percentages
                if (isNaN(parsedVal) || typeof (parsedVal) !== 'number' || parsedVal < 0 || parsedVal > 100) {
                    target(previousValue);
                    target.notifySubscribers();
                } else {
                    target(parsedVal);
                }
            }
        });
        return result;
    };

});
