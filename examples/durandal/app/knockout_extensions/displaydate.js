
/* 
    binding handler to display a formatted date, piggybacking off jquery ui datepicker
*/
define(['jquery', 'knockout', 'jquery-ui'], function ($, ko, $ui) {

    var formatDate = function (element, valueAccessor, allBindingsAccessor) {
         var value = valueAccessor();
        var options = allBindingsAccessor().displaydateOptions || {
            dateFormat: "yy-mm-dd"
        };
        var formattedDate = $.datepicker.formatDate('yy-mm-dd', ko.unwrap(value));
        $(element).text(formattedDate)
    };

    ko.bindingHandlers.displaydate = {
        init: formatDate,
        update: formatDate
    };
});
