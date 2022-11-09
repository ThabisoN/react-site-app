//---------------------------------------------------------------------------
// Toolbox ViewModel
// Author: Mark Goosen, 14 April 2015
//---------------------------------------------------------------------------
var ViewModelToolbox = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.hasdata = ko.observable(false);
    self.categoryFilter = ko.observableArray(null);
    self.selectedCategory = ko.observable();
    self.dataArray = ko.observableArray();
    self.favouriteArray = ko.observableArray();
    self.ManageUrl = ko.observable(get_slm_URL_Intranet() + "/Lists/MyToolboxFavourites");
    self.AllToolsUrl = ko.observable(get_slm_URL_Intranet() + "/Lists/ToolboxConfiguration");

    // constants
    self.api_currentUser_query = get_slm_URL_Intranet() + "/_api/web/currentUser";
    self.api_toolbox_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_Toolbox_Title + "\')/items?$select=ID,Title,ToolCategory,ToolURL&$orderby=Title asc";
    self.api_favourites_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_ToolboxFavourites_Title + "\')/items?$select=ID,SortOrder,Tool/Title,Tool/ID&$expand=Tool/Title,Tool/ID&$orderby=SortOrder asc";
    self.string_default_message = "No tools could be found.";
    self.string_default_type = "Default";
    self.string_my_favourites_category = "My Favourite";

    //---------------------------------------------------------
    // Sanlam Tool Data Object
    //---------------------------------------------------------
    var dataobjectTool = (function () {
        function dataobjectTool() {
            var self = this;

            self.ToolId = ko.observable();
            self.ToolTitle = ko.observable();
            self.ToolCategory = ko.observable();
            self.ToolUrl = ko.observable();
            self.ToolOrder = ko.observable();

        }

        return dataobjectTool;
    })();

    ViewModelToolbox.dataobjectTool = dataobjectTool;

    //---------------------------------------------------------
    // Sanlam Unique Tool Categories
    //---------------------------------------------------------
    self.categoryArray = ko.dependentObservable(function () {
        var categories = ko.utils.arrayMap(self.dataArray(), function (item) {
            return item.ToolCategory();
        });
        return ko.utils.arrayGetDistinctValues(categories).sort(function (left, right) {
            if (left == self.string_my_favourites_category) {
                return -1;
            } else if (right == self.string_my_favourites_category) {
                return 1;
            }
            return (left == right ? 0 : (left < right ? -1 : 1));
        });
    });

    //-----------------------------------------------------------------------
    // Filtered Tools
    //----------------------------------------------------------------------- 
    self.filteredArray = ko.computed(function () {

        if (self.selectedCategory()) {
            var filteredTools = ko.utils.arrayFilter(self.dataArray(), function (item) {
                return (item.ToolCategory() === self.selectedCategory());
            });

            return filteredTools.sort(function (left, right) {
                if (self.selectedCategory() == self.string_my_favourites_category) {
                    return (left.ToolOrder() == right.ToolOrder() ? 0 : (left.ToolOrder() < right.ToolOrder() ? -1 : 1));
                } else {
                    return (left.ToolTitle() == right.ToolTitle() ? 0 : (left.ToolTitle() < right.ToolTitle() ? -1 : 1));
                }
            });
        } else {
            return self.dataArray();
        }


    });

    //-----------------------------------------------------------------------
    // Mapped Tools
    //-----------------------------------------------------------------------
    self.mapTool = function (tid, ttitle, tcategory, turl, torder) {
        try {
            obj = new dataobjectTool();
            parser = new slmParser();

            var toolUrl = parser.getValueDefault(turl, "#");

            // map fields
            obj.ToolId(parser.getValueDefault(tid, "0"));
            obj.ToolTitle(parser.getValueDefault(ttitle, self.string_default_title));
            obj.ToolCategory(parser.getValueDefault(tcategory, ""));
            obj.ToolUrl(toolUrl);
            obj.ToolOrder(parser.getValueDefault(torder, "0"));

            self.dataArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelToolbox.mapTool: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Mapped Favourites
    //-----------------------------------------------------------------------
    self.mapFavourite = function (tid, ttitle, torder) {
        try {
            obj = new dataobjectTool();
            parser = new slmParser();

            // map fields
            obj.ToolId(parser.getValueDefault(tid, "0"));
            obj.ToolTitle(parser.getValueDefault(ttitle, self.string_default_title));
            obj.ToolCategory(self.string_my_favourites_category);
            obj.ToolOrder(parser.getValueDefault(torder, "0"));

            self.favouriteArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelToolbox.mapFavourite: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Populate Toolbox Items
    //-----------------------------------------------------------------------
    self.populateTools = function (data) {
        try {
            var d = data.d.results;
            $.each(d, function (index, result) {
                self.mapTool(result.ID, result.Title, result.ToolCategory, result.ToolURL.Url);
            });
        } catch (err) {
            console.log("Error: ViewModelToolbox.populateTools: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Populate My Toolbox Favourites
    //-----------------------------------------------------------------------
    self.populateFavourites = function (data) {
        try {
            var d = data.d.results;
            $.each(d, function (index, result) {
                self.mapFavourite(result.Tool.ID, result.Tool.Title, result.SortOrder);
            });
        } catch (err) {
            console.log("Error: ViewModelToolbox.populateFavourites: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Load current user
    //-----------------------------------------------------------------------
    self.loadCurrentUser = function () {
        try {
            // get tool configuration
            $.ajax({
                url: self.api_currentUser_query,
                dataType: "json",
                type: "GET",
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    self.userId = data.d.Id;
                },
                error: function (jqxr, errorCode, errorThrown) {
                    console.log("Error: ViewModelToolbox.loadCurrentUserID->error: " + errorThrown);
                }
            })
        } catch (err) {
            console.log("Error: ViewModelToolbox.loadCurrentUserID: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadData = function () {
        try {
            $.when(
                // get tool configuration
                $.ajax({
                    url: self.api_toolbox_query,
                    dataType: "json",
                    type: "GET",
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        self.populateTools(data);
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        console.log("Error: ViewModelToolbox.loadData->Tools*error: " + errorThrown);
                    }
                })
            .always(function () {
                $.when(
                    // get my favourite tools
                    $.ajax({
                        url: self.api_favourites_query + "&$filter=(Author/Id eq " + self.userId + ")",
                        dataType: "json",
                        type: "GET",
                        contentType: "application/json;odata=verbose",
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val()
                        },
                        success: function (data) {
                            self.populateFavourites(data);
                        },
                        error: function (jqxr, errorCode, errorThrown) {
                            console.log("Error: ViewModelToolbox.loadData->Favourites*error: " + errorThrown);
                        }
                    }))
                .always(function () {
                    self.FinishedLoading();
                })
            }));
        } catch (err) {
            console.log("Error: ViewModelToolbox.loadData: " + err);
        }
    }


    //-----------------------------------------------------------------------
    // Finish loading
    //-----------------------------------------------------------------------
    self.FinishedLoading = function () {
        try {
            // Combine favourites with tools
            ko.utils.arrayForEach(self.dataArray(), function (tool) {
                ko.utils.arrayForEach(self.favouriteArray(), function (favourite) {
                    if (tool.ToolId() == favourite.ToolId() && tool.ToolCategory() != self.string_my_favourites_category) {
                        self.mapTool(favourite.ToolId(), favourite.ToolTitle(), favourite.ToolCategory(), tool.ToolUrl(), favourite.ToolOrder());
                    }
                });
            });

            self.selectedCategory(self.string_my_favourites_category);
        } catch (err) {
            console.log("Error: ViewModelToolbox.FinishedLoading: " + err);
        }

        hasData = self.dataArray().length > 0;
        self.hasdata(hasData);
        self.loaded(true);
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        try {
        
        
            // create model and manual bind
            var viewModelToolElement = document.getElementById("slmToolbox");

            // bind if viewmodel element found
            if (viewModelToolElement) {
                var viewModelTool = new ViewModelToolbox();

                ko.applyBindings(viewModelTool, viewModelToolElement);

                viewModelTool.loadCurrentUser();
            
                function loadTools() {
                    if (!viewModelTool.loaded()) {
                        viewModelTool.loadData();
                    }
                }

                $('#slmToolboxIcon').click(loadTools);
                $('.tools .wsmenu-click i').click(loadTools);

            }
        }
        catch (err) {
            console.log("Error->ViewModelToolbox: Document ready / ApplyBindings: " + err);
        }
    });
});