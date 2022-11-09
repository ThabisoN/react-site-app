//---------------------------------------------------------------------------
// Notification Board ViewModel
// Author: Mark Goosen, 30 March 2015
//---------------------------------------------------------------------------
var ViewModelMenu = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.MenuArray = ko.observableArray();

    // properties
    self.GroupName = "Sanlam Group Intranet Navigation";
    self.TermSetName = "Global Navigation";
    self.cacheMenu = "cacheMnu";
    self.cacheTimeout = 240;

    //-----------------------------------------------------------------------
    // Load Term Store    
    //-----------------------------------------------------------------------  
    self.load = function () {
        try {

            var _termStore = new slmTermStoreManager(self.GroupName, self.TermSetName, self.cacheMenu, self.cacheTimeout, self.mapTerms);
            _termStore.loadCached();

        } catch (err) {
            self.logFailure("load", err);
        }
    };

    //-----------------------------------------------------------------------
    // Bind the view model to the DOM
    //-----------------------------------------------------------------------
    self.mapTerms = function (terms) {
        try {

            // Process JSON menu obj
            ko.mapping.fromJS(terms, {}, self.MenuArray);

            self.loaded(true);
        } catch (err) {
            self.logFailure("bindViewModel", err)
        }
    };

    //-----------------------------------------------------------------------
    // log failure for viewmodel
    //-----------------------------------------------------------------------
    self.logFailure = function (method, message) {
        console.log("Error: ViewModelMenu." + method + ": " + message);
    };

    //-----------------------------------------------------------------------
    // CLICK EVENT - Open Menu
    //-----------------------------------------------------------------------
    self.openMenu = function () {
        var mymenu = window.matchMedia("screen and (min-width: 781px)");

        if (mymenu.matches) {

            var currentId = $(".current").attr("id");
            $("#" + this.TermId()).children('.megamenu').toggle(40);
            $('.wsmenu-list li').removeClass("current");

            if (currentId != this.TermId()) {
                $("#" + this.TermId()).children('.megamenu').dimBackground();
                $("#" + this.TermId()).addClass("current").css("position", "relative");
            } else {
                $("#" + this.TermId()).children('.megamenu').undim();
            }
        } else {
            self.mobileToggle($("#" + this.TermId()));
        }
    };


    //-----------------------------------------------------------------------
    // CLICK EVENT - Close Menu
    //-----------------------------------------------------------------------
    self.closeMenu = function () {
        var mymenu = window.matchMedia("screen and (min-width: 781px)");
        if (mymenu.matches) {
            $('.megamenu').hide(25).undim();
            $('.wsmenu-list li').removeClass("current").css("position", "static!important").undim();
        }
    };

    //-----------------------------------------------------------------------
    // CLICK EVENT - Mobile Menu Click
    //-----------------------------------------------------------------------
    self.mobileMenu = function () {
        self.mobileToggle($("#" + this.TermId()));
    };

    //-----------------------------------------------------------------------
    // CLICK EVENT - Mobile Menu Click
    //-----------------------------------------------------------------------
    self.mobileToggle = function (menuItem) {
        menuItem.children('.wsmenu-submenu').slideToggle('slow');
        menuItem.find('.wsmenu-click > .wsmenu-arrow').toggleClass('wsmenu-rotate');
        menuItem.children('.wsmenu-submenu-sub').slideToggle('slow');
        menuItem.children('.wsmenu-submenu-sub-sub').slideToggle('slow');
        menuItem.children('.megamenu').slideToggle('slow');
    };
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    try {
        // create model and manual bind
        var viewModelMenuElement = document.getElementById("slm-topnav");

        // bind if viewmodel element found
        if (viewModelMenuElement) {
            var viewModelMenu = new ViewModelMenu();
            ko.applyBindings(viewModelMenu, viewModelMenuElement);
            viewModelMenu.load();
        }
    }
    catch (err) {
        console.log("Error->ViewModelMenu: Document ready / ApplyBindings: " + err);
    }
});