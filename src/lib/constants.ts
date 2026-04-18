export const APP_NAME = "ValueSwitch";
export const APP_TAGLINE = "Compare & Save";
export const APP_DESCRIPTION = "Free, impartial price comparison for UK households and businesses.";

export const COMPANY = {
  legalName: "VALUESWITCH LIMITED",
  displayName: "ValueSwitch",
  companyNumber: "17108611",
  companyType: "Private limited Company",
  status: "Active",
  incorporatedOn: "23 March 2026",
  address: {
    street: "6 Berkett Road",
    city: "Coventry",
    country: "England",
    postcode: "CV6 4FU",
    full: "6 Berkett Road, Coventry, England, CV6 4FU",
  },
  phone: {
    display: "+44 800 688 9495",
    tel: "+448006889495",
  },
  email: {
    support: "support@valueswitch.co.uk",
  },
  hours: "Mon-Fri 9am-6pm, Sat 10am-4pm",
};

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
