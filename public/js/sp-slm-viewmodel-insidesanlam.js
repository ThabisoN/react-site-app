//---------------------------------------------------------------------------
// Inside Sanlam ViewModel
// Author: Christo Greeff, 10 May 2015
//---------------------------------------------------------------------------
var ViewModelInSanlam = function () {
    var self = this;

    // observables
    self.loadedSanlam = ko.observable(false);
    self.hasdataSanlam = ko.observable(false);
    self.dataSanlam = ko.observableArray();

    self.loadedSPF = ko.observable(false);
    self.hasdataSPF = ko.observable(false);
    self.dataSPF = ko.observableArray();

    self.queryInsideSanlam = "http://www.insidesanlam.co.za/layout/set/xml/newsml/feed/(type)/story/(source)/9393/(limit)/4";
    self.queryInsideSPF = "http://www.insidesanlam.co.za/layout/set/xml/newsml/feed/(type)/story/(source)/104/(limit)/4";

    self.cacheInsideSlm = "cacheInsideSanlam";
    self.cacheInsideSpf = "cacheInsideSPF";
    self.cacheminutes = 15;

    self.insideSanlamMore = ko.observable("http://www.insidesanlam.co.za");
    self.insideSPFMore = ko.observable("http://www.insidesanlam.co.za/personal-finance");
    //self.queryInsideSanlam = "/_catalogs/masterpage/slmgroup/json/insidesanlam.dummy";
    //self.queryInsideSPF = "/_catalogs/masterpage/slmgroup/json/insidesanlam.dummy";

    //---------------------------------------------------------
    // Generic Inside Sanlam/SPF Data Object
    //---------------------------------------------------------
    var doNewsItem = (function () {
        function doNewsItem() {
            var self = this;

            self.date = ko.observable();
            self.actualdate = ko.observable();
            self.headline = ko.observable();
            self.synopsis = ko.observable();
            self.morelink = ko.observable();
            self.image = ko.observable();
        }

        return doNewsItem;
    })();

    ViewModelInSanlam.doNewsItem = doNewsItem;

    //-----------------------------------------------------------------------
    // Populate Mapped Item
    //-----------------------------------------------------------------------
    self.populateNewsItem = function (ndate, nheadline, nsynopsis, nmorelink, nimage, narray) {
        try {
            obj = new doNewsItem();

            // map fields
            obj.date(moment(ndate, 'YYYYMMDDTHHmmssZ').subtract(120, 'minutes').fromNow());
            obj.actualdate(ndate);
            obj.headline(nheadline);
            obj.synopsis(nsynopsis);
            obj.morelink(nmorelink);
            obj.image(nimage);

            narray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelInSanlam.populateNewsItem : " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadData = function (cache, query, array, finish) {
        localCache = new slmSessionStorage();
        localCache.Get(cache,
            function () {
                $.ajax({
                    url: query,
                    dataType: "xml",
                    cache: true,
                    type: "GET",
                    crossdomain: true,
                    success: function (data) {
                        items = $(data).find("NewsItem")

                        items.each(function () {
                            try {
                                var d = $(this).find("FirstCreated").text();
                                var headline = $(this).find("HeadLine").text();
                                var sysnopsis = $(this).find("Synopsis").text();
                                var morelink = $(this).find("MoreLink").text();
                                var image = $(this).find("img").attr("src");

                                self.populateNewsItem(d, headline, sysnopsis, morelink, image, array);
                            } catch (err) {
                                console.log("Error: ViewModelInSanlam.loadData->Could not populate news item: " + err);
                            }
                        });

                        loadedCache = new slmSessionStorage();
                        loadedCache.Add(cache, ko.toJSON(array), self.cacheminutes);
                        finish();
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        console.log("Error: ViewModelInSanlam.loadData: " + errorThrown);
                        finish();
                    }
                });
            },
            function (data) {
                d = JSON.parse(data);
                $.each(d, function (index, result) {
                    self.populateNewsItem(result.actualdate, result.headline, result.sysnopsis, result.morelink, result.image, array);
                });
                finish();
            });
    }

    //-----------------------------------------------------------------------
    // Load Inside Sanlam
    //-----------------------------------------------------------------------
    self.loadSanlam = function () {
        self.loadData(self.cacheInsideSlm, self.queryInsideSanlam, self.dataSanlam, self.FinishedLoadingSanlam);
    }

    //-----------------------------------------------------------------------
    // Load Inside SPF
    //-----------------------------------------------------------------------
    self.loadSPF = function () {
        self.loadData(self.cacheInsideSpf, self.queryInsideSPF, self.dataSPF, self.FinishedLoadingSPF);
    }

    //-----------------------------------------------------------------------
    // Finish up loading for Inside Sanlam
    //-----------------------------------------------------------------------
    self.FinishedLoadingSanlam = function () {
        try {
        } catch (err) {
            console.log("Error: ViewModelInSanlam.FinishedLoadingSanlam: " + err);
        }
        hasData = (self.dataSanlam().length > 0);
        self.hasdataSanlam(hasData);
        self.loadedSanlam(true);
    }

    //-----------------------------------------------------------------------
    // Finish up loading for Inside SPF
    //-----------------------------------------------------------------------
    self.FinishedLoadingSPF = function () {
        try {
        } catch (err) {
            console.log("Error: ViewModelInSanlam.FinishedLoadingSPF: " + err);
        }
        hasData = (self.dataSPF().length > 0);
        self.hasdataSPF(hasData);
        self.loadedSPF(true);
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    try {
        // create model and manual bind
        var viewModelInSlmElement = document.getElementById("slmInsideSanlamTabs");

        // bind if viewmodel element found
        if (viewModelInSlmElement) {
            var viewModelInSlm = new ViewModelInSanlam();

            ko.applyBindings(viewModelInSlm, viewModelInSlmElement);
            viewModelInSlm.loadSanlam();
            viewModelInSlm.loadSPF();
        }
    }
    catch (err) {
        console.log("Error->ViewModelInSanlam: Document ready / ApplyBindings: " + err);
    }
});