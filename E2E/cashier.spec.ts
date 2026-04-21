import { expect, test } from "@playwright/test";

type SessionRole = "cashier" | "barista";

interface SessionUser {
  id: string;
  email: string;
  user_metadata: {
    role: SessionRole;
    display_name: string;
  };
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  expires_at: number;
  user: SessionUser;
}

interface CartItem {
  id: string;
  cart_id: string;
  drink_id: string;
  drink_name: string;
  drink_price: number;
  sugar: string;
  toppings: string[];
  quantity: number;
}

interface OrderRow {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
}

function buildSession(role: SessionRole, email: string, userId: string): AuthSession {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: "pw-access-token",
    refresh_token: "pw-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    user: {
      id: userId,
      email,
      user_metadata: {
        role,
        display_name: role === "cashier" ? "Cashier QA" : "Barista QA",
      },
    },
  };
}

function readEqParam(param: string | null): string | null {
  if (!param) return null;
  if (!param.startsWith("eq.")) return param;
  return decodeURIComponent(param.slice(3));
}

test.describe("Cashier flow", () => {
  test("cashier can add to cart and checkout successfully", async ({ page }) => {
    const cartId = "cart-1";
    let cartItems: CartItem[] = [];
    const createdOrders: OrderRow[] = [];

    await page.addInitScript((session: AuthSession) => {
      window.localStorage.setItem("queuetea-auth", JSON.stringify(session));
    }, buildSession("cashier", "cashier@example.com", "cashier-user-1"));

    await page.route("**/rest/v1/**", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const method = req.method();
      const pathname = url.pathname;

      const common = {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
          "access-control-allow-headers": "*",
        },
      };

      if (method === "OPTIONS") {
        await route.fulfill({ status: 200, ...common, body: "{}" });
        return;
      }

      if (pathname.endsWith("/carts") && method === "GET") {
        await route.fulfill({
          status: 200,
          ...common,
          body: JSON.stringify({ id: cartId, barista_user_id: "cashier-user-1", status: "active" }),
        });
        return;
      }

      if (pathname.endsWith("/cart_items") && method === "GET") {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify(cartItems) });
        return;
      }

      if (pathname.endsWith("/cart_items") && method === "POST") {
        const payload = req.postDataJSON() as Array<Omit<CartItem, "id">>;
        const newItem = {
          id: `item-${cartItems.length + 1}`,
          ...payload[0],
        };

        cartItems = [...cartItems, newItem];

        await route.fulfill({ status: 201, ...common, body: JSON.stringify([newItem]) });
        return;
      }

      if (pathname.endsWith("/cart_items") && method === "PATCH") {
        const payload = req.postDataJSON() as Partial<CartItem>;
        const id = readEqParam(url.searchParams.get("id"));
        cartItems = cartItems.map((item) => (item.id === id ? { ...item, ...payload } : item));

        await route.fulfill({ status: 200, ...common, body: JSON.stringify(cartItems.filter((item) => item.id === id)) });
        return;
      }

      if (pathname.endsWith("/cart_items") && method === "DELETE") {
        const byId = readEqParam(url.searchParams.get("id"));
        const byCartId = readEqParam(url.searchParams.get("cart_id"));

        if (byId) {
          cartItems = cartItems.filter((item) => item.id !== byId);
        }

        if (byCartId) {
          cartItems = cartItems.filter((item) => item.cart_id !== byCartId);
        }

        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      if (pathname.endsWith("/orders") && method === "POST") {
        const payload = req.postDataJSON() as Array<Omit<OrderRow, "id">>;
        const order: OrderRow = {
          id: `order-${createdOrders.length + 1}`,
          customer_name: payload[0].customer_name,
          order_details: payload[0].order_details,
          status: payload[0].status,
        };

        createdOrders.push(order);

        await route.fulfill({ status: 201, ...common, body: JSON.stringify([order]) });
        return;
      }

      await route.fulfill({ status: 200, ...common, body: "[]" });
    });

    await page.goto("/kiosk");

    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    await page.getByRole("button", { name: "+ Add to Order" }).first().click();
    await page.getByRole("button", { name: "Boba (+₱10)" }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.getByText("1 items")).toBeVisible();

    await page.getByLabel("Customer name").fill("E2E Customer");
    await page.getByRole("button", { name: "Check Out" }).click();

    await expect(page.getByRole("heading", { name: "Order successful" })).toBeVisible();
    await expect(page.getByText("Your order has been sent to the queue.")).toBeVisible();

    expect(createdOrders).toHaveLength(1);
    expect(createdOrders[0].customer_name).toBe("E2E Customer");
    expect(createdOrders[0].order_details).toContain("1x");
    expect(cartItems).toHaveLength(0);
  });
});
