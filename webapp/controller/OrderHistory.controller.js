sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";
    var STORAGE_KEY = "poc.orders.created";

    return Controller.extend("sap.fiori.poc.controller.OrderHistory", {
      formatStatus: function (status) {
        var map = {
          Approved: "Success",
          Pending: "Warning",
          Shipped: "Information",
          Rejected: "Error",
          Cancelled: "None",
        };
        return map[status] || "None";
      },
      onInit: function () {
        this._loadOrders();
        // Expose for integration tests to force a refresh after localStorage mutations.
        window.__refreshOrders = this._loadOrders.bind(this);
      },
      _loadOrders: function () {
        var table = this.byId("ordersTable");
        table.setBusy(true);
        table.setBusyIndicatorDelay(0);
        fetch("data/sales.json")
          .then(function (response) {
            if (!response.ok) {
              throw new Error(
                "Failed to load sales data: HTTP " + response.status,
              );
            }
            return response.json();
          })
          .then(
            function (data) {
              // "This year 2026 only" — static filter, no datepicker (kept simple).
              var history = data.filter(function (order) {
                return order.built.indexOf("2026") === 0;
              });
              var created = this._readCreatedOrders();
              this.getView().setModel(
                new JSONModel(history.concat(created)),
                "orders",
              );
              table.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              MessageToast.show("Failed to load order history.");
              this.getView().setModel(
                new JSONModel(this._readCreatedOrders()),
                "orders",
              );
              table.setBusy(false);
            }.bind(this),
          );
      },
      _readCreatedOrders: function () {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return [];
        }
      },
      onRowPress: function (oEvent) {
        var order = oEvent.getSource().getBindingContext("orders").getObject();
        this.getOwnerComponent()
          .getRouter()
          .navTo("customer", { customerId: order.customerId });
      },
      onNavDashboard: function () {
        this.getOwnerComponent().getRouter().navTo("dashboard");
      },
      onNavCustomers: function () {
        this.getOwnerComponent().getRouter().navTo("customers");
      },
      onNavCatalog: function () {
        this.getOwnerComponent().getRouter().navTo("catalog");
      },
      onNavOrders: function () {
        this.getOwnerComponent().getRouter().navTo("orders");
      },
    });
  },
);
