sap.ui.define([], function () {
  "use strict";
  return {
    /**
     * Format an integer-euro value as the fixture amount style ("€12,450.00").
     * Integer euros internally (fractional-euro products are excluded) so the
     * rendered column stays byte-identical across pages.
     */
    euro: function (value) {
      return (
        "€" +
        Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    },
  };
});
