export const APP_NAME = "ValueSwitch";
export const APP_TAGLINE = "Compare & Save";
export const APP_DESCRIPTION = "Free, impartial price comparison for UK households and businesses.";

export const ITEMS_PER_PAGE = 20;
export const MAX_COMPARE_ITEMS = 3;

export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const CURRENCY = {
  symbol: "£",
  code: "GBP",
  locale: "en-GB",
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceShort(amount: number): string {
  return `£${amount.toFixed(2)}`;
}
