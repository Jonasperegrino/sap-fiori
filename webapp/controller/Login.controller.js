sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("sap.fiori.poc.controller.Login", {
      onLogin: function () {
        var username = this.byId("usernameInput").getValue();
        var password = this.byId("passwordInput").getValue();

        if (username === "demo" && password === "password123") {
          this.getOwnerComponent().getRouter().navTo("dashboard");
        } else {
          MessageToast.show("Invalid credentials. Please try again.");
        }
      },
    });
  },
);
