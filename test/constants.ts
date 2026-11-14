/**
 * Fixtures for CI. These are not Stripe credentials and are rejected by Stripe.
 * The local mock is the only server that accepts them.
 */
export const TEST_STRIPE_KEY = "sk_test_ci_not_a_real_key";
export const TEST_WEBHOOK_SECRET = "whsec_test_ci_not_a_real_secret";
export const TEST_PRICE_ID = "price_test_monthly";
export const TEST_SESSION_SECRET = "test-session-secret-not-production";
export const TEST_EMAIL = "buyer@example.com";
export const TEST_PASSWORD = "correct-horse";
export const TEST_SESSION_ID = "cs_test_e2e_checkout";
export const TEST_SUBSCRIPTION_ID = "sub_e2etest";
export const TEST_CUSTOMER_ID = "cus_e2etest";
export const TEST_ORIGIN = "http://127.0.0.1:3210";
