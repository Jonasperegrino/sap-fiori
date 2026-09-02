sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/fiori/poc/util/format",
  ],
  function (Controller, JSONModel, MessageToast, format) {
    "use strict";
    return Controller.extend("sap.fiori.poc.controller.CustomerDetail", {
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
        this._customerId = null;
        // Create the named models once in onInit and update them via setData()
        // later: XML property bindings resolve against the model reference that
        // exists at view parse time — replacing the model afterwards leaves the
        // ObjectHeader title/attr bindings dangling on the old (empty) one.
        this._customersModel = new JSONModel({});
        this._ordersModel = new JSONModel([]);
        this._kpiModel = new JSONModel({ orderCount: 0, totalValue: "" });
        this.getView().setModel(this._customersModel, "customers");
        this.getView().setModel(this._ordersModel, "orders");
        this.getView().setModel(this._kpiModel, "kpi");
        // XML uses relative bindings ({customers>name}) — those resolve against an
        // element context, which only exists once the view is bound to its model
        this.getView().bindElement({ path: "/", model: "customers" });
        this.getOwnerComponent()
          .getRouter()
          .getRoute("customer")
          .attachMatched(this._onMatched, this);
      },
      _onMatched: function (oEvent) {
        this._customerId = oEvent.getParameter("arguments").customerId;
        this._loadCustomer();
      },
      _loadCustomer: function () {
        var table = this.byId("customerOrdersTable");
        table.setBusy(true);
        table.setBusyIndicatorDelay(0);
        Promise.all([
          fetch("data/customers.json").then(function (r) {
            return r.json();
          }),
          fetch("data/sales.json").then(function (r) {
            return r.json();
          }),
        ])
          .then(
            function (results) {
              var customers = results[0];
              var orders = results[1];
              var customer = customers.filter(
                (c) => c.id === this._customerId,
              )[0];
              if (!customer) {
                MessageToast.show("Unknown customer: " + this._customerId);
                this._customersModel.setData({});
                this._ordersModel.setData([]);
                table.setBusy(false);
                return;
              }
              var theirOrders = orders
                .filter(
                  function (o) {
                    return o.customerId === this._customerId;
                  }.bind(this),
                )
                .filter(function (o) {
                  return o.built.indexOf("2026") === 0;
                });
              var totalEur = theirOrders.reduce(function (sum, o) {
                return sum + o.amountEur;
              }, 0);
              this._customersModel.setData(customer);
              this._ordersModel.setData(theirOrders);
              this._kpiModel.setData({
                orderCount: theirOrders.length,
                totalValue: format.euro(totalEur),
              });
              table.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              MessageToast.show("Failed to load customer data.");
              this._customersModel.setData({});
              this._ordersModel.setData([]);
              table.setBusy(false);
            }.bind(this),
          );
      },
      onBack: function () {
        // UI5 1.151 removed Router#navBack — go back via browser history so the
        // hash changer re-matches the previous route (falls back to dashboard).
        if (
          sap.ui.core.routing.History.getInstance().getPreviousHash() !==
          undefined
        ) {
          window.history.back();
        } else {
          this.getOwnerComponent().getRouter().navTo("dashboard");
        }
      },
    });
  },
);
