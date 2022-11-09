//---------------------------------------------------------------------------
// Sanlam SharePrice
// Author: Christo Greeff, 10 May 2015
//---------------------------------------------------------------------------
var ViewModelSharePrice = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.loading = ko.observable(true);
    self.hasdata = ko.observable(false);
    self.haserror = ko.observable(false);
    self.data = ko.observable();
    self.weblink = ko.observable("http://www.sanlam.com/shareinformation");

    self.query = "/assets/slm.xml";

    //---------------------------------------------------------
    // SharePrice object
    //---------------------------------------------------------
    var doSharePrice = (function () {
        function doSharePrice() {
            var self = this;

            self.Price = ko.observable();
            self.Date = ko.observable();
            self.Link = ko.observable();
            self.Movement = ko.observable();
            self.Indicator = ko.observable();
        }

        return doSharePrice;
    })();

    ViewModelSharePrice.doSharePrice = doSharePrice;

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadData = function () {
        $.ajax({
            url: self.query,
            dataType: "xml",
            cache: true,
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                try {
                    // parse share price
                    cabs_tabdata = $(data).find("cabs_tabdata");
                    if (cabs_tabdata) {
                        var price = new doSharePrice();
                        // get date
                        date = cabs_tabdata.attr("date");
                        if (date) {
                            price.Date(moment(date, "yyyy/mm/dd").format("dddd, DD MMM YYYY"));
                            obj.NotificationDate(parser.getValueDefault(moment(ndate, "yyyy/mm/dd").format("dddd, DD MMM YYYY")));
                        }
                        items = $(data).find("row");
                        items.each(function () {
                            id = $(this).attr('id');
                            if (id) {
                                if (id = "SLM") {
                                    p = $(this).find("column#spot").text();
                                    if (p) {
                                        price.Price(p);
                                    }

                                    m = $(this).find("column#perc").text();
                                    if (m) {
                                        price.Movement(m);
                                        if (m > 0) {
                                            price.Indicator("up");
                                        } else {
                                            if (m < 0) {
                                                price.Indicator("down");
                                            } else {
                                                price.Indicator("neutral");
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        self.data(price);
                    }
                } catch (err) {
                    console.log("Error: ViewModelSharePrice.loadData->Could not load share price: " + err);
                }
                self.FinishedLoading();
            },
            error: function (jqxr, errorCode, errorThrown) {
                console.log("Error: ViewModelSharePrice.loadData: " + errorThrown);
                self.haserror(true);
                self.FinishedLoading();
            }
        });
    };

    //-----------------------------------------------------------------------
    // Finish up loading
    //-----------------------------------------------------------------------
    self.FinishedLoading = function () {
        try {
            self.hasdata(self.data());
            self.loaded(true);
            self.loading(false);
        } catch (err) {
            self.haserror(true);
            console.log("Error: ViewModelSharePrice.FinishedLoading: " + err);
        }
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        try {
            // create model and manual bind
            var elementSharePrice = document.getElementById("slmSanlamSharePrice");

            // bind if viewmodel element found
            if (elementSharePrice) {
                var viewModelSharePrice = new ViewModelSharePrice();

                ko.applyBindings(viewModelSharePrice, elementSharePrice);
                viewModelSharePrice.loadData();
            }
        }
        catch (err) {
            console.log("Error->ViewModelSharePrice: Document ready / ApplyBindings: " + err);
        }
    })
});