import { describe, it, expect, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOrders } from "../hooks/useOrders";
import { supabaseTest, supabaseAdmin } from "../lib/supabaseTestClient";
import { createOrder } from "../services/orderService";

describe("useOrders (integration, test DB)", () => {
  const testRunId = `vitest-useOrders-${Date.now()}`;
  const testCustomer = `HookUser-${testRunId}`;
  const createdOrderIds: string[] = [];

  // CLEANUP: Always use admin client to wipe data after tests
  afterAll(async () => {
    if (createdOrderIds.length) {
      await supabaseAdmin.from("orders").delete().in("id", createdOrderIds);
    } else {
      await supabaseAdmin
        .from("orders")
        .delete()
        .like("order_details", `%${testRunId}%`);
    }
  });

  it("fetchOrders loads orders from test DB and updates state", async () => {
    // 1. Seed data into the real DB
    const a = await createOrder(
      {
        customer_name: testCustomer,
        order_details: `A (${testRunId})`,
        status: "pending",
      },
      supabaseTest,
    );
    const b = await createOrder(
      {
        customer_name: testCustomer,
        order_details: `B (${testRunId})`,
        status: "pending",
      },
      supabaseTest,
    );

    if (a?.[0]?.id && b?.[0]?.id) {
      createdOrderIds.push(a[0].id, b[0].id);
    }

    // 2. Render the hook using Testing Library
    const { result } = renderHook(() => useOrders(supabaseTest));

    // 3. Trigger the fetch logic inside the hook
    // No manual act() needed—waitFor or the trigger itself handles it
    await result.current.fetchOrders();

    // 4. Use waitFor to observe the state change
    await waitFor(() => {
      const mine = result.current.orders.filter(
        (o) => o.customer_name === testCustomer
      );
      expect(mine.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 10000 });

    // 5. Final assertions on the state
    const mine = result.current.orders.filter(
      (o) => o.customer_name === testCustomer
    );
    
    const times = mine.map((o) => new Date(o.created_at).getTime());
    // Ensure orders are sorted by time (ascending)
    expect(times).toEqual([...times].sort((x, y) => x - y));
  });
});