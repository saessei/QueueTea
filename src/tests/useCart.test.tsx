import { afterAll, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCart, type CartItem } from "../hooks/useCart";
import { supabaseAdmin, supabaseTest } from "../lib/supabaseTestClient";

type CartRow = {
  id: string;
  barista_user_id: string;
  status: "active" | "checked_out" | "abandoned";
};

type CartItemRow = Pick<
  CartItem,
  "id" | "cart_id" | "drink_id" | "drink_name" | "drink_price" | "sugar" | "toppings" | "quantity"
>;

describe("useCart (integration, real Supabase DB)", () => {
  const testRunId = `vitest-useCart-${Date.now()}`;
  const baristaUserId = crypto.randomUUID();
  let cartId: string | null = null;

  // Global Cleanup
  afterAll(async () => {
    if (cartId) {
      await supabaseAdmin.from("cart_items").delete().eq("cart_id", cartId);
      await supabaseAdmin.from("carts").delete().eq("id", cartId);
    } else {
      await supabaseAdmin.from("carts").delete().eq("barista_user_id", baristaUserId);
    }
  });

  it("creates and mutates a real cart through the hook", async () => {
    // 1. Initialize the hook
    const { result } = renderHook(() => useCart(baristaUserId));

    // 2. Wait for initial cart creation
    await waitFor(() => expect(result.current.cartId).not.toBeNull(), { timeout: 10000 });
    
    cartId = result.current.cartId;
    const activeCartId = cartId as string;

    // Verify DB State for the Cart
    const { data: createdCart, error: cartErr } = await supabaseTest
      .from("carts")
      .select("id, barista_user_id, status")
      .eq("id", activeCartId)
      .single<CartRow>();

    expect(cartErr).toBeNull();
    expect(createdCart?.barista_user_id).toBe(baristaUserId);
    expect(createdCart?.status).toBe("active");

    // 3. Test Upsert (Insert)
    const baseItem = {
      drink_id: `drink-${testRunId}`,
      drink_name: `Hook Test Milk Tea (${testRunId})`,
      drink_price: 5.5,
      sugar: "75%",
      toppings: ["pearls"],
      quantity: 1,
    };

    await result.current.upsertItem(baseItem);

    await waitFor(() => {
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]?.quantity).toBe(1);
    });

    // 4. Test Upsert (Update/Increment)
    await result.current.upsertItem(baseItem);

    await waitFor(() => {
      expect(result.current.cart[0]?.quantity).toBe(2);
    });

    // Verify DB State for Items
    const { data: items } = await supabaseTest
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", activeCartId)
      .single();
    
    expect(items?.quantity).toBe(2);

    // 5. Test Index Mutation (Increment)
    await result.current.incrementItemAtIndex(0);
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(3));

    // 6. Test Index Mutation (Decrement)
    await result.current.decrementItemAtIndex(0);
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(2));

    // 7. Test Remove Item
    await result.current.removeItemAtIndex(0);
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    // 8. Test Clear Cart
    // Add two items first
    await result.current.upsertItem(baseItem);
    await result.current.upsertItem({
      ...baseItem,
      drink_id: `drink-${testRunId}-2`,
      drink_name: `Hook Test Taro (${testRunId})`,
    });

    await waitFor(() => expect(result.current.cart).toHaveLength(2));

    // Action
    await result.current.clearCart();

    // Assertion
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    const { data: finalItems } = await supabaseTest
      .from("cart_items")
      .select("id")
      .eq("cart_id", activeCartId);

    expect(finalItems).toHaveLength(0);
  }, 20000); // Higher timeout for real DB latency
});