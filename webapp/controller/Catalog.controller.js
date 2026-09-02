sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/fiori/poc/util/format",
  ],
  function (Controller, JSONModel, MessageToast, format) {
    "use strict";
    var STORAGE_KEY = "poc.orders.created";
    var NEW_ORDER_BASE = 2001; // SO-2001+ keeps clear of fixture ids (SO-1xxx)

    return Controller.extend("sap.fiori.poc.controller.Catalog", {
      onInit: function () {
        this._loadProducts();
      },
      _loadProducts: function () {
        var table = this.byId("productTable");
        table.setBusy(true);
        table.setBusyIndicatorDelay(0);
        fetch("data/products.json")
          .then(function (response) {
            if (!response.ok) {
              throw new Error(
                "Failed to load product catalog: HTTP " + response.status,
              );
            }
            return response.json();
          })
          .then(
            function (data) {
              // Hidden/discontinued products (active=false or zero stock) are not
              // orderable and do not render — the endpoint still serves them.
              var visible = data
                .filter(function (product) {
                  return product.active === true && product.stock > 0;
                })
                .map(function (product) {
                  var row = Object.assign({}, product);
                  row.qty = 1;
                  row.priceDisplay = format.euro(product.price);
                  return row;
                });
              this.getView().setModel(new JSONModel(visible), "products");
              table.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              MessageToast.show("Failed to load product catalog.");
              this.getView().setModel(new JSONModel([]), "products");
              table.setBusy(false);
            }.bind(this),
          );
      },
      onAddOrder: function (oEvent) {
        var product = oEvent
          .getSource()
          .getBindingContext("products")
          .getObject();
        var qty = parseInt(product.qty, 10);

        if (isNaN(qty) || qty < 1) {
          MessageToast.show("Quantity must be at least 1.");
          return;
        }
        if (qty > product.stock) {
          MessageToast.show(
            "Not enough stock (" + product.stock + " available).",
          );
          return;
        }

        var amountEur = product.price * qty;
        var created = this._readCreatedOrders();
        var order = {
          id: "SO-" + (NEW_ORDER_BASE + created.length),
          customer: "Acme Corp",
          customerId: "C-1001",
          amount: format.euro(amountEur),
          amountEur: amountEur,
          status: "Pending",
          built: new Date().toISOString().slice(0, 10),
        };
        created.push(order);
        this._writeCreatedOrders(created);
        MessageToast.show(
          "Order " +
            order.id +
            " placed (€" +
            amountEur.toLocaleString("en-US") +
            ").",
        );
        product.qty = 1;
        this.getView().getModel("products").refresh();
      },
      _readCreatedOrders: function () {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return [];
        }
      },
      _writeCreatedOrders: function (orders) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        } catch (e) {
          MessageToast.show("Could not persist the order.");
        }
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
