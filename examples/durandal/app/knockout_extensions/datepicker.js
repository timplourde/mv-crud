
/* 
    binding handler for the jquery ui  date picker
*/
define(['jquery', 'knockout', 'jquery-ui'], function ($, ko, $ui) {

    //from http://jsfiddle.net/rniemeyer/AkBUv/

    ko.bindingHandlers.datepicker = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {
                dateFormat: "yy-mm-dd"
            };
            $(element).datepicker(options);
          
            //handle the field changing
            ko.utils.registerEventHandler(element, "change", function () {
                var observable = valueAccessor();
                observable($(element).datepicker("getDate"));
            });
        
            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).datepicker("destroy");
            });
    
        },
        //update the control when the view model changes
        update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                current = $(element).datepicker("getDate");
        
            if (value - current !== 0) {
                $(element).datepicker("setDate", value);   
            }
        }
    };
});