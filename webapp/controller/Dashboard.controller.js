sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/fiori/poc/util/format",
  ],
  function (Controller, JSONModel, MessageToast, format) {
    "use strict";
    return Controller.extend("sap.fiori.poc.controller.Dashboard", {
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
        // Named model created once; updated via setData() so the KPI bindings
        // survive async loads (same pattern as CustomerDetail).
        this._kpiModel = new JSONModel({
          totalOrders: 0,
          openOrders: 0,
          shippedOrders: 0,
          totalValue: format.euro(0),
        });
        this.getView().setModel(this._kpiModel, "kpi");
        this._loadOrders();
      },
      _loadOrders: function () {
        var table = this.byId("salesTable");
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
              this.getView().setModel(new JSONModel(data), "orders");
              this._updateKpis(data);
              table.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              MessageToast.show("Failed to load sales data.");
              var empty = new JSONModel([]);
              this.getView().setModel(empty, "orders");
              this._updateKpis([]);
              table.setBusy(false);
            }.bind(this),
          );
      },
      _updateKpis: function (orders) {
        var totalEur = orders.reduce(function (sum, o) {
          return sum + (o.amountEur || 0);
        }, 0);
        this._kpiModel.setData({
          totalOrders: orders.length,
          openOrders: orders.filter(function (o) {
            return o.status === "Pending";
          }).length,
          shippedOrders: orders.filter(function (o) {
            return o.status === "Shipped";
          }).length,
          totalValue: format.euro(totalEur),
        });
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
      onNavCatalog: function () {
        this.getOwnerComponent().getRouter().navTo("catalog");
      },
      onNavOrders: function () {
        this.getOwnerComponent().getRouter().navTo("orders");
      },
    });
  },
);
