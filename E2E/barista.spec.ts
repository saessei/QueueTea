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

interface OrderRow {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
  created_at: string;
  claimed_by: string | null;
  claimed_by_name: string | null;
  claimed_at: string | null;
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

test.describe("Barista flow", () => {
  test("barista can claim and complete an order", async ({ page }) => {
    const baristaUserId = "barista-user-1";

    let orders: OrderRow[] = [
      {
        id: "order-1001",
        customer_name: "Alice",
        order_details: "1x Wintermelon (50%, Boba)",
        status: "pending",
        created_at: new Date("2026-04-20T10:00:00.000Z").toISOString(),
        claimed_by: null,
        claimed_by_name: null,
        claimed_at: null,
      },
    ];

    await page.addInitScript((session: AuthSession) => {
      window.localStorage.setItem("queuetea-auth", JSON.stringify(session));
    }, buildSession("barista", "barista@example.com", baristaUserId));

    await page.route("**/rest/v1/**", async (route) => {
      const req = route.request();
      const method = req.method();
      const url = new URL(req.url());
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

      if (pathname.endsWith("/orders") && method === "GET") {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify(orders) });
        return;
      }

      if (pathname.endsWith("/orders") && method === "PATCH") {
        const id = readEqParam(url.searchParams.get("id"));
        const patch = req.postDataJSON() as Partial<OrderRow>;
        const onlyIfUnclaimed = url.searchParams.get("claimed_by") === "is.null";

        const target = orders.find((order) => order.id === id);
        if (!target) {
          await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
          return;
        }

        if (onlyIfUnclaimed && target.claimed_by !== null) {
          await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
          return;
        }

        Object.assign(target, patch);

        if (patch.status === "preparing") {
          target.claimed_by = baristaUserId;
          target.claimed_by_name = "Barista QA";
          target.claimed_at = new Date().toISOString();
        }

        await route.fulfill({ status: 200, ...common, body: JSON.stringify([target]) });
        return;
      }

      await route.fulfill({ status: 200, ...common, body: "[]" });
    });

    await page.goto("/queued-orders");

    await expect(page.getByRole("heading", { name: "Barista Station" })).toBeVisible();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByRole("article").getByText("Incoming")).toBeVisible();

    await page.getByRole("button", { name: "Start Preparing" }).click();
    await expect(page.getByText("In queue")).toBeVisible();
    await expect(page.getByText("Barista: Barista QA")).toBeVisible();

    await page.getByRole("button", { name: "Mark as Complete" }).click();

    await page.getByRole("button", { name: "Completed" }).click();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive Order" })).toBeVisible();

    expect(orders[0].status).toBe("completed");
  });
});
