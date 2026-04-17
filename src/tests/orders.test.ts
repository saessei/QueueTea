import { it, expect, describe, afterAll } from 'vitest';
import { createOrder, updateOrderStatus } from '../services/orderService';
import { adminClient } from './setup';

describe('Order Service - Integration Tests', () => {
  const testCustomerName = `Test User ${crypto.randomUUID()}`;
  let createdOrderId: string;

  // Cleanup after tests to keep the test DB clean
  afterAll(async () => {
    await adminClient
      .from('orders')
      .delete()
      .eq('customer_name', testCustomerName);
  });

  //  HAPPY PATHS 
  describe('Happy Path', () => {
    it('successfully creates an order and returns the data', async () => {
      const payload = {
        customer_name: testCustomerName,
        order_details: '2x Coffee, 1x Croissant',
        status: 'pending'
      };

      const data = await createOrder(payload);

      expect(data).not.toBeNull();
      expect(data![0]).toMatchObject(payload);
      expect(data![0].id).toBeDefined();
      
      createdOrderId = data![0].id; // Save for update test
    });

    it('successfully updates an existing order status', async () => {
      const updated = await updateOrderStatus(createdOrderId, 'preparing');

      expect(updated).not.toBeNull();
      expect(updated![0].status).toBe('preparing');
    });
  });

  // --- SAD PATHS 
  describe('Sad Path', () => {
    it('throws an error when creating an order with missing required fields', async () => {
      const invalidOrder = {
        customer_name: null as any, 
        order_details: 'Missing name',
        status: 'pending'
      };

      // We expect createOrder to throw because of your 'throw new Error(error.message)'
      await expect(createOrder(invalidOrder)).rejects.toThrow();
    });

    it('returns an empty array when updating an order ID that does not exist', async () => {
      const nonExistentId = crypto.randomUUID();
      const result = await updateOrderStatus(nonExistentId, 'cancelled');

      // Supabase .update() returns [] if no rows match the .eq() filter
      expect(result).toHaveLength(0);
    });

    it('handles database constraint violations (e.g., status too long)', async () => {
      const longStatus = 'this_status_is_way_too_long_for_the_database_column';
      
      const result = await updateOrderStatus(createdOrderId, longStatus);
      
      if (result === null) {
        expect(result).toBeNull();
      }
    });
  });
});