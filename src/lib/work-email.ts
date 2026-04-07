/**
 * Domains we reject for demo / B2B flows where a work email is required.
 * Match is on the registrable part after @ (lowercase).
 */
const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.co.uk",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "mail.com",
  "hey.com",
  "fastmail.com",
]);

export function getEmailDomain(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0 || at === trimmed.length - 1) return "";
  return trimmed.slice(at + 1);
}

export function isConsumerEmailDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  return domain !== "" && CONSUMER_EMAIL_DOMAINS.has(domain);
}

export const WORK_EMAIL_REQUIRED_MESSAGE =
  "Please use a work email address. Personal providers such as Gmail or Hotmail are not accepted.";
