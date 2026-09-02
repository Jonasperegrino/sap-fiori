sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],
  function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("sap.fiori.poc.controller.Customers", {
      onInit: function () {
        this._loadCustomers();
      },
      _loadCustomers: function () {
        var table = this.byId("customersTable");
        table.setBusy(true);
        table.setBusyIndicatorDelay(0);
        fetch("data/customers.json")
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Failed to load customers: HTTP " + response.status);
            }
            return response.json();
          })
          .then(
            function (data) {
              this.getView().setModel(new JSONModel(data), "customers");
              table.setBusy(false);
            }.bind(this)
          )
          .catch(
            function () {
              MessageToast.show("Failed to load customers.");
              this.getView().setModel(new JSONModel([]), "customers");
              table.setBusy(false);
            }.bind(this)
          );
      },
      onRowPress: function (oEvent) {
        var customer = oEvent.getSource().getBindingContext("customers").getObject();
        this.getOwnerComponent().getRouter().navTo("customer", { customerId: customer.id });
      },
      onSearch: function (oEvent) {
        var query = "";
        if (oEvent.getParameter) {
          query = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
        }
        if (!query && oEvent.getSource && oEvent.getSource().getValue) {
          query = oEvent.getSource().getValue();
        }
        var binding = this.byId("customersTable").getBinding("items");
        if (!binding) return;
        if (!query) {
          binding.filter([]);
          return;
        }
        var q = query.toLowerCase();
        // case-insensitive OR filter via custom test functions
        var fn = function (value) {
          return value && value.toLowerCase().indexOf(q) !== -1;
        };
        var filters = [
          new Filter({ path: "name", test: fn }),
          new Filter({ path: "industry", test: fn }),
          new Filter({ path: "city", test: fn }),
          new Filter({ path: "country", test: fn }),
          new Filter({ path: "contact", test: fn }),
          new Filter({ path: "email", test: fn })
        ];
        binding.filter(new Filter({ filters: filters, and: false }));
      },
      onNavDashboard: function () {
        this.getOwnerComponent().getRouter().navTo("dashboard");
      },
      onNavCatalog: function () {
        this.getOwnerComponent().getRouter().navTo("catalog");
      },
      onNavOrders: function () {
        this.getOwnerComponent().getRouter().navTo("orders");
      },
      onNavCustomers: function () {
        this.getOwnerComponent().getRouter().navTo("customers");
      }
    });
  }
);
