import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { CLOSEPATH_PRODUCT_ID } from "../lib/closepath";
import {
  TEST_CUSTOMER_ID,
  TEST_EMAIL,
  TEST_PRICE_ID,
  TEST_SESSION_ID,
  TEST_SUBSCRIPTION_ID,
} from "./constants";

export type MockCall = { method: string; path: string };

type SubscriptionRecord = {
  id: string;
  status: string;
  metadata: Record<string, string>;
};

export type StripeMock = {
  port: number;
  calls: MockCall[];
  subscription(id: string): SubscriptionRecord | undefined;
  setPriceAmount(cents: number | null): void;
  close(): Promise<void>;
};

const DEFAULT_AMOUNT = 999;

function price(amount: number) {
  return {
    id: TEST_PRICE_ID,
    object: "price",
    active: true,
    currency: "usd",
    unit_amount: amount,
    product: CLOSEPATH_PRODUCT_ID,
    type: "recurring",
    livemode: false,
    recurring: { interval: "month", interval_count: 1 },
  };
}

function session() {
  return {
    id: TEST_SESSION_ID,
    object: "checkout.session",
    mode: "subscription",
    status: "complete",
    payment_status: "no_payment_required",
    currency: "usd",
    amount_subtotal: 0,
    amount_total: 0,
    livemode: false,
    metadata: { product: "closepath" },
    subscription: TEST_SUBSCRIPTION_ID,
    customer: TEST_CUSTOMER_ID,
    customer_details: { email: TEST_EMAIL, name: null, phone: null },
    payment_intent: null,
    url: `https://checkout.stripe.com/c/pay/${TEST_SESSION_ID}`,
    success_url: "http://127.0.0.1:3210/products/closepath/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://127.0.0.1:3210/products/closepath",
    line_items: {
      object: "list",
      data: [
        {
          id: "li_test_e2e",
          object: "item",
          quantity: 1,
          price: price(DEFAULT_AMOUNT),
        },
      ],
      has_more: false,
      url: `/v1/checkout/sessions/${TEST_SESSION_ID}/line_items`,
    },
  };
}

function subscription(record: SubscriptionRecord) {
  return {
    id: record.id,
    object: "subscription",
    status: record.status,
    cancel_at_period_end: false,
    livemode: false,
    metadata: record.metadata,
    customer: TEST_CUSTOMER_ID,
    discounts: [],
  };
}

function list(url: string) {
  return { object: "list", data: [], has_more: false, url };
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function send(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(json),
  });
  res.end(json);
}

function stripeError(res: ServerResponse, status: number, message: string) {
  send(res, status, { error: { message, type: status === 404 ? "invalid_request_error" : "api_error" } });
}

/** Local Stripe API for CI. It never forwards to Stripe and never reads a real key. */
export function startStripeMock(port = 0): Promise<StripeMock> {
  const calls: MockCall[] = [];
  const subscriptions = new Map<string, SubscriptionRecord>();
  let priceAmount: number | null = DEFAULT_AMOUNT;

  subscriptions.set(TEST_SUBSCRIPTION_ID, {
    id: TEST_SUBSCRIPTION_ID,
    status: "trialing",
    metadata: { product: "closepath" },
  });

  const server: Server = createServer(async (req, res) => {
    try {
      const method = req.method ?? "GET";
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      calls.push({ method, path: url.pathname });
      if (!req.headers.authorization?.startsWith("Bearer ")) {
        stripeError(res, 401, "Missing test token.");
        return;
      }
      const parts = url.pathname.split("/").filter(Boolean);
      const body = method === "GET" || method === "HEAD" ? "" : await readBody(req);
      const form = new URLSearchParams(body);

      if (parts[0] === "v1" && parts[1] === "prices" && parts[2] && method === "GET") {
        if (parts[2] !== TEST_PRICE_ID || priceAmount == null) {
          stripeError(res, 404, "No such price.");
          return;
        }
        send(res, 200, price(priceAmount));
        return;
      }

      if (parts[0] === "v1" && parts[1] === "checkout" && parts[2] === "sessions" && !parts[3] && method === "POST") {
        send(res, 200, session());
        return;
      }

      if (parts[0] === "v1" && parts[1] === "checkout" && parts[2] === "sessions" && parts[3] && method === "GET") {
        if (parts[3] !== TEST_SESSION_ID) {
          stripeError(res, 404, "No such checkout session.");
          return;
        }
        send(res, 200, session());
        return;
      }

      if (parts[0] === "v1" && parts[1] === "checkout" && parts[2] === "sessions" && parts[3] && method === "POST") {
        send(res, 200, { ...session(), metadata: { product: "closepath", fulfillment: form.get("metadata[fulfillment]") ?? "" } });
        return;
      }

      if (parts[0] === "v1" && parts[1] === "subscriptions" && parts[2] && method === "GET") {
        const record = subscriptions.get(parts[2]);
        if (!record) {
          stripeError(res, 404, "No such subscription.");
          return;
        }
        send(res, 200, subscription(record));
        return;
      }

      if (parts[0] === "v1" && parts[1] === "subscriptions" && parts[2] && method === "POST") {
        const current = subscriptions.get(parts[2]) ?? {
          id: parts[2],
          status: "canceled",
          metadata: { product: "closepath" },
        };
        const metadata = { ...current.metadata };
        for (const [key, value] of form) {
          if (key.startsWith("metadata[") && key.endsWith("]")) {
            metadata[key.slice("metadata[".length, -1)] = value;
          }
        }
        const next = { ...current, metadata };
        subscriptions.set(parts[2], next);
        send(res, 200, subscription(next));
        return;
      }

      if (parts[0] === "v1" && parts[1] === "invoices" && method === "GET") {
        send(res, 200, list("/v1/invoices"));
        return;
      }

      if (parts[0] === "v1" && parts[1] === "billing_portal" && parts[2] === "sessions" && method === "POST") {
        send(res, 200, {
          id: "bps_test_e2e",
          object: "billing_portal.session",
          url: "https://billing.stripe.com/p/session/test_e2e",
        });
        return;
      }

      stripeError(res, 404, "Mock route is not implemented.");
    } catch {
      stripeError(res, 500, "Mock failed.");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Stripe mock did not bind."));
        return;
      }
      resolve({
        port: address.port,
        calls,
        subscription(id) {
          return subscriptions.get(id);
        },
        setPriceAmount(cents) {
          priceAmount = cents;
        },
        close() {
          return new Promise((done, fail) => {
            server.close((error) => (error ? fail(error) : done()));
          });
        },
      });
    });
  });
}
