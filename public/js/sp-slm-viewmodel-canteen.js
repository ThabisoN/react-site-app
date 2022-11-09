//---------------------------------------------------------------------------
// Canteen Menu ViewModel
// Author: Mark Goosen, 21 May 2015
// Updated: Christo Greeff, 01 June 2015
//---------------------------------------------------------------------------
var ViewModelCanteenMenu = function () {
    var self = this;

    // observables
    self.isLoaded = ko.observable(false);
    self.isLoading = ko.observable(false);
    self.hasData = ko.observable(false);
    self.categories = ko.observableArray();
    self.dataArray = ko.observableArray();
    self.dataArrayDocuments = ko.observableArray();
    self.categoryStructure = ko.observableArray();
    self.buildings = ko.observableArray();
    self.userBuilding = null;
    self.buildingDropdown = ko.observable();

    // constants
    self.query_menuItems = get_slm_URL_Intranet() + "/_api/web/lists/getByTitle(\'" + slm_LIST_Canteen + "\')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><ViewFields><FieldRef Name='CanteenMenuCategory'/><FieldRef Name='CanteenMenuItemCarbs'/><FieldRef Name='CanteenMenuItemDescription'/><FieldRef Name='CanteenMenuItemEnergy'/><FieldRef Name='CanteenMenuItemFat'/><FieldRef Name='CanteenMenuItemFat'/><FieldRef Name='CanteenMenuItemPrice'/><FieldRef Name='CanteenMenuItemProtein'/><FieldRef Name='DayOfWeek1'/><FieldRef Name='MenuItemDate'/><FieldRef Name='SanlamLocation'/><FieldRef Name='Title'/></ViewFields><Query><OrderBy><FieldRef Name='CanteenMenuCategory' Ascending='TRUE'/></OrderBy><Where><And><And><Geq><FieldRef Name='MenuItemDate'/><Value Type='DateTime'><Today OffsetDays='{0}'/></Value></Geq><Leq><FieldRef Name='MenuItemDate'/><Value Type='DateTime'><Today OffsetDays='{1}'/></Value></Leq></And><Eq><FieldRef Name='SanlamLocation'/><Value Type='TaxonomyFieldType'>{2}</Value></Eq></And></Where></Query></View>\"}";
    self.query_menuDoc_items = get_slm_URL_Intranet() + "/_api/web/lists/getByTitle(\'" + slm_LIBRARY_Canteen + "\')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><ViewFields><FieldRef Name='Title'/><FieldRef Name='CanteenMenuCategory'/><FieldRef Name='SanlamLocation'/></ViewFields><Query><OrderBy><FieldRef Name='CanteenMenuCategory' Ascending='TRUE'/><FieldRef Name='Title' Ascending='TRUE'/></OrderBy><Where><Eq><FieldRef Name='SanlamLocation'/><Value Type='TaxonomyFieldType'>{0}</Value></Eq></Where></Query></View>\"}";
    self.query_menuDocs = get_slm_URL_Intranet() + "/_api/web/lists/getByTitle(\'" + slm_LIBRARY_Canteen + "\')/items?$select=Id,EncodedAbsUrl";
    self.string_sanlam_canteen_control_id = "#slmCanteenMenu";
    self.string_sanlam_canteen_select_id = "#slmCanteenLocation";
    self.string_default_title = "Unknown Menu";

    self.string_location_termStore_group = "Sanlam Group Intranet Terms";
    self.string_location_termSet = "Sanlam Location";
    self.locationCache = "cacheLocationTerms";
    self.locationCacheTime = 2880;

    self.sanlamBuildingsMapping = [
        { SanlamLocation: "Sanlam Building", Building: "Sanlam Building" },
        { SanlamLocation: "Bellville HO - Sanlam Building", Building: "Sanlam Building" },
        { SanlamLocation: "Bellville HO CCC - Sanlam Building", Building: "Sanlam Building" },
        { SanlamLocation: "Alice Lane", Building: "Alice Lane" }
    ];

    self.s_kjoules = "kj";
    self.s_grams = "g";
    self.currency = "R";
    self.numbers = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    self.string_today = 'Today';
    self.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', self.string_today];

    //---------------------------------------------------------
    // Canteen Menu Data Document Object
    //---------------------------------------------------------
    var doCanteenMenuDocument = (function () {
        function doCanteenMenuDocument() {
            var self = this;

            self.Id = ko.observable();
            self.Category = ko.observable();
            self.Title = ko.observable();
            self.Url = ko.observable();
        }

        return doCanteenMenuDocument;
    })();

    ViewModelCanteenMenu.doCanteenMenuDocument = doCanteenMenuDocument;

    //---------------------------------------------------------
    // Canteen Menu Data Object
    //---------------------------------------------------------
    var doCanteenMenu = (function () {
        function doCanteenMenu() {
            var self = this;

            self.Category = ko.observable();
            self.Title = ko.observable();
            self.DayOfWeek = ko.observable();
            self.Description = ko.observable();
            self.Price = ko.observable();
            self.Location = ko.observable();
            self.NutritionEnergy = ko.observable();
            self.NutritionProtein = ko.observable();
            self.NutritionCarbs = ko.observable();
            self.NutritionFat = ko.observable();
        }

        return doCanteenMenu;
    })();

    ViewModelCanteenMenu.doCanteenMenu = doCanteenMenu;

    //-----------------------------------------------------------------------
    // SharePoint Post JSON via AJAX
    //-----------------------------------------------------------------------
    self.spAJAXpostJSON = function (query) {
        return $.ajax({
            url: query,
            dataType: "json",
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        });
    };

    //-----------------------------------------------------------------------
    // SharePoint Get JSON via AJAX
    //-----------------------------------------------------------------------
    self.spAJAXgetJSON = function (query) {
        return $.ajax({
            url: query,
            dataType: "json",
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        });
    };

    //-----------------------------------------------------------------------
    // Load food
    //-----------------------------------------------------------------------
    self.loadFood = function (location) {
        try {

            if (location) {
                // build/complete query
                var today = new Date();
                var q = String.Format(self.query_menuItems, self.getDaysTillMonday(today), self.getDaysTillFriday(today), location);

                $.when(
                   self.spAJAXpostJSON(q)
                   .done(function (data) {
                       var d = data.d.results;
                       var parser = new slmParser();
                       $.each(d, function (index, result) {
                           try {
                           	   var dayOfWeek = parser.getValueDefault(result.DayOfWeek1, self.string_today);
                           	   var menuItemDate = new Date(parser.getValueDefault(result.MenuItemDate, ""));                           	   
                           	   
                           	   if(dayOfWeek != self.string_today || menuItemDate.toDateString() == today.toDateString()) {
                           
	                               var obj = new doCanteenMenu();
	
	                               // format price
	                               var price = parser.getValueDefault(result.CanteenMenuItemPrice, "");
	                               if (price) {
	                                   price = self.currency + price.toFixed(2);
	                               }
	
	                               // map fields
	                               obj.Category(parser.getValueDefault(result.CanteenMenuCategory, ""));
	                               obj.Title(parser.getValueDefault(result.Title, "No meal title available"));
	                               obj.DayOfWeek(dayOfWeek);
	                               obj.Description(parser.getValueDefault(result.CanteenMenuItemDescription, "No meal description available"));
	                               obj.Price(price);
	                               obj.Location(parser.getValueDefault(result.SanlamLocation.Label, ""));
	                               obj.NutritionEnergy(parser.getValueDefault(result.CanteenMenuItemEnergy ? result.CanteenMenuItemEnergy + self.s_kjoules : "", ""));
	                               obj.NutritionProtein(parser.getValueDefault(result.CanteenMenuItemProtein ? result.CanteenMenuItemProtein + self.s_grams : "", ""));
	                               obj.NutritionCarbs(parser.getValueDefault(result.CanteenMenuItemCarbs ? result.CanteenMenuItemCarbs + self.s_grams : "", ""));
	                               obj.NutritionFat(parser.getValueDefault(result.CanteenMenuItemFat ? result.CanteenMenuItemFat + self.s_grams : "", ""));
	
	                               self.checkCategory(parser.getValueDefault(result.CanteenMenuCategory, ""));
	                               self.dataArray.push(obj);
                               }
                           } catch (err) {
                               console.log("Error: ViewModelCanteenMenu.loadFood*MenuDocuments: " + err);
                           }
                       });

                       self.hasData(d.length > 0);
                   }))
               .always(function () {
                   // Filter menu documents by location (returns lst item not file aka no url)
                   q = String.Format(self.query_menuDoc_items, location);

                   $.when(

                    
                      self.spAJAXpostJSON(q)
                      .done(function (data) {
                          var d = data.d.results;
                          var parser = new slmParser();
                          $.each(d, function (index, result) {
                              try {
                                  var obj = new doCanteenMenuDocument();

                                  // map fields
                                  obj.Id(parser.getValueDefault(result.Id, ""));
                                  obj.Category(parser.getValueDefault(result.CanteenMenuCategory, ""));
                                  obj.Title(parser.getValueDefault(result.Title, ""));

                                  self.checkCategory(parser.getValueDefault(result.CanteenMenuCategory, ""));
                                  self.dataArrayDocuments.push(obj);

                              } catch (err) {
                                  console.log("Error: ViewModelCanteenMenu.loadFood*MenuDocument Items: " + err);
                              }
                          });
                      }))
                  .always(function () {

                      // Get all menu documents (to get doc url) and map to filtered doc items
                      self.spAJAXgetJSON(self.query_menuDocs)
                      .done(function (data) {
                          var d = data.d.results;
                          var parser = new slmParser();

                          ko.utils.arrayForEach(self.dataArrayDocuments(), function (obj) {
                              $.each(d, function (index, result) {
                                  try {
                                      if (obj.Id() == result.Id) {
                                          obj.Url(parser.getValueDefault(result.EncodedAbsUrl, ""));
                                          return false;
                                      }
                                  } catch (err) {
                                      console.log("Error: ViewModelCanteenMenu.loadFood*MenuDocuments: " + err);
                                  }
                              });
                          });

                          self.finishLoading();
                      });

                  });

               });
            } else {
                self.finishLoading();
            }
        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.loadFood: " + err);
            self.finishLoading();
        }
    }

    //-----------------------------------------------------------------------
    // Check categories, and add if needed
    //-----------------------------------------------------------------------
    self.checkCategory = function (category) {
        try {
            // build categories
            if (!ko.utils.arrayFirst(self.categories(), function (item) { return item.name === category; })) {
                var num = self.categories().length + 1;
                var dayToday = self.days[new Date().getDay()];

                self.categories.push({
                    name: category,
                    day: dayToday,
                    cssHref: "#collapse" + self.numbers[num],
                    cssAria: "collapse" + self.numbers[num],
                    cssHead: "heading" + self.numbers[num]
                });
            };
        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.checkCategory: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Finish up loading
    //-----------------------------------------------------------------------
    self.finishLoading = function () {
        try {
            ko.utils.arrayForEach(this.categories(), function (category) {
                var c = category;
                var objs = [];
                var daysArray = [];

                // get objects per category
                ko.utils.arrayForEach(self.dataArray(), function (data) {
                    if (category.name.toLowerCase() == data.Category().toLowerCase()) {
                        self.days.forEach(function (day) {
                            if (day.toLowerCase() == data.DayOfWeek().toLowerCase()) {
                                if (daysArray.indexOf(day) == -1) {
                                    daysArray.push(day);
                                }
                            }
                        });
                        if (daysArray.length == 0) {
                            daysArray.push("");
                        }
                        objs.push(data);
                    }
                });

                // build final structure
                var str = {
                    category: c,
                    days: daysArray,
                    data: objs
                };

                self.categoryStructure.push(str);
            });

            self.isLoading(false);
            self.isLoaded(true);

            function toggleChevron(e) {
                $(e.target)
                    .prev('.panel-heading')
                    .find('i.indicator')
                    .toggleClass('accordion-up accordion-down');
                $('#accordion .panel-heading').removeClass('highlight');
                $(e.target).prev('.panel-heading').addClass('highlight');
            }
            $('#accordion').on('hidden.bs.collapse', toggleChevron);
            $('#accordion').on('shown.bs.collapse', toggleChevron);
        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.finishLoading: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Perform a mapping check against possible building locations
    //-----------------------------------------------------------------------
    self.getBuildingMapping = function (office) {
        try {
            return self.sanlamBuildingsMapping.filter(
                function (item) {
                    return item.SanlamLocation.toLowerCase() == office.toLowerCase();
                });
        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.getBuildingMapping: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Find location Filter
    //-----------------------------------------------------------------------
    self.findLocationFilter = function (locationTerms) {
        try {
            if (locationTerms && locationTerms.length > 0) {
                self.loadingLocations = true;
                $.each(locationTerms, function (index, loc) {
                    self.loadingLocations = ((self.userBuilding != null) && self.userBuilding != loc.Name);
                    self.buildings.push(loc.Name);
                });

                self.loadingLocations = false;
                if (!self.buildingDropdown() || ((self.userBuilding != null) && self.userBuilding != self.buildingDropdown())) {
                    self.buildingDropdown(self.userBuilding);
                }
            } else if (self.userBuilding) {
                self.loadingLocations = false;
                self.buildingDropdown(self.userBuilding);

            }

        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.findLocationFilter : " + err);
        }
    }

    //-----------------------------------------------------------------------
    // userBuilding subscribe event
    //-----------------------------------------------------------------------
    self.buildingDropdown.subscribe(function (newValue) {
        if (!self.loadingLocations) {
            self.isLoading(true);
            self.isLoaded(false);

            self.categories.removeAll();
            self.dataArray.removeAll();
            self.dataArrayDocuments.removeAll();
            self.categoryStructure.removeAll();

            self.loadFood(newValue);
        }
    });
    
    //-----------------------------------------------------------------------
    // Get the number of Days till Monday this week
    //-----------------------------------------------------------------------
    self.getDaysTillMonday = function(d) {
        try {

		  d = new Date(d);
		  var day = d.getDay();
		  return (day == 0 ? -6:1) - day; // adjust when day is sunday

        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.getMonday: " + err);
            return 0;
        }
	}
    
    //-----------------------------------------------------------------------
    // Get the number of Days till Friday this week
    //-----------------------------------------------------------------------
    self.getDaysTillFriday = function(d) {
        try {

		  d = new Date(d);
		  var day = d.getDay();
		  return (day == 0 ? -2:5) - day; // adjust when day is sunday

        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.getDaysTillFriday: " + err);
            return 0;
        }
	}


    //-----------------------------------------------------------------------
    // Main load event
    //-----------------------------------------------------------------------
    self.load = function () {
        try {
            self.isLoading(true);

            // Check if user is at headoffice
            var profile = new slmUserProfileManager();
            var result = profile.GetMyPropertiesCached();
            result.done(
                function (_result) {
                    parser = new slmParser();

                    var officeResult = parser.getValueFromKey(slm_User_Properties, "Office", "")
                    var mappedResult = self.getBuildingMapping(officeResult);
                    if (mappedResult && mappedResult.length > 0) {
                        self.userBuilding = mappedResult[0].Building;
                    }

                    var termStore = new slmTermStoreManager(
                        self.string_location_termStore_group,
                        self.string_location_termSet,
                        self.locationCache,
                        self.locationCacheTime,
                        self.findLocationFilter);
                    termStore.loadCached();

                    $(self.string_sanlam_canteen_control_id).show(); // show canteen

                });
        } catch (err) {
            console.log("Error: ViewModelCanteenMenu.load: " + err);
        }
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('SP.js', 'SP.ClientContext', function () {
        try {
            // create model and manual bind
            var viewModelBaseElement = document.getElementById("slmCanteenMenu");

            // bind if viewmodel element found
            if (viewModelBaseElement) {
                var viewModelCanteen = new ViewModelCanteenMenu();

                ko.applyBindings(viewModelCanteen, viewModelBaseElement);
                viewModelCanteen.load();
            }
        }
        catch (err) {
            console.log("Error->ViewModelCanteenMenu: Document ready / ApplyBindings: " + err);
        }
    })
});