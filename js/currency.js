(() => {
  const currencyNames = {
    CAD: "Canadian Dollar",
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    AUD: "Australian Dollar",
    NZD: "New Zealand Dollar",
    JPY: "Japanese Yen",
    CHF: "Swiss Franc",
    SEK: "Swedish Krona",
    NOK: "Norwegian Krone",
    DKK: "Danish Krone",
    PHP: "Philippine Peso",
    BRL: "Brazilian Real",
    MXN: "Mexican Peso"
  };

  function formatCurrencyValue(value, currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "JPY" ? 0 : 2
      }).format(value);
    } catch {
      return `${Number(value).toFixed(2)} ${currency}`;
    }
  }

  document
    .querySelectorAll("[data-currency-converter]")
    .forEach((converter) => {
      const amount = converter.querySelector(
        "[data-currency-amount]"
      );

      const from = converter.querySelector(
        "[data-currency-from]"
      );

      const to = converter.querySelector(
        "[data-currency-to]"
      );

      const result = converter.querySelector(
        "[data-currency-result]"
      );

      const meta = converter.querySelector(
        "[data-currency-meta]"
      );

      const status = converter.querySelector(
        "[data-currency-status]"
      );

      const convertButton = converter.querySelector(
        "[data-currency-convert]"
      );

      const swapButton = converter.querySelector(
        "[data-currency-swap]"
      );

      const sourceLabel = converter.querySelector(
  "[data-currency-source-label]"
);

function updateSourceLabel() {
  if (sourceLabel) {
    sourceLabel.textContent = from.value;
  }
}

      updateSourceLabel();

      async function convertCurrency() {
        const numericAmount = Number(amount.value);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          status.textContent =
            "Enter an amount greater than 0.";

          result.textContent = "—";
          meta.textContent = "";

          return;
        }

        const source = from.value;
        const target = to.value;

        if (source === target) {
          result.textContent =
            formatCurrencyValue(numericAmount, target);

          meta.textContent =
            `1 ${source} = 1 ${target}`;

          status.textContent =
            "The selected currencies are the same.";

          return;
        }

        status.textContent =
          "Checking the latest available exchange rate...";

        convertButton.disabled = true;
        swapButton.disabled = true;

        try {
          const response = await fetch(
            `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(source)}/${encodeURIComponent(target)}`
          );

          if (!response.ok) {
            throw new Error("Rate unavailable");
          }

          const data = await response.json();
          const rate = Number(data.rate);

          if (!Number.isFinite(rate)) {
            throw new Error("Invalid exchange rate");
          }

          result.textContent =
            formatCurrencyValue(
              numericAmount * rate,
              target
            );

          meta.textContent =
            `1 ${source} = ${rate.toLocaleString(undefined, {
              maximumFractionDigits: 6
            })} ${target} · Rate date ${data.date}`;

          status.textContent =
            `Approximate conversion from ${
              currencyNames[source] || source
            } to ${
              currencyNames[target] || target
            }.`;
        } catch (error) {
          console.error(
            "Unable to load exchange rate:",
            error
          );

          result.textContent = "—";

          meta.textContent =
            "Live exchange rate unavailable.";

          status.textContent =
            "The live exchange rate could not be loaded. Try again in a moment.";
        } finally {
          convertButton.disabled = false;
          swapButton.disabled = false;
        }
      }

      convertButton.addEventListener(
        "click",
        convertCurrency
      );

      amount.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          convertCurrency();
        }
      });

      from.addEventListener("change", () => {
  updateSourceLabel();
});
      
      swapButton.addEventListener("click", () => {
  const previousFrom = from.value;

  from.value = to.value;
  to.value = previousFrom;

  updateSourceLabel();
  convertCurrency();
});

      convertCurrency();
    });
})();
