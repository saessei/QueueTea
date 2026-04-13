import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus } from '../services/orders';
import supabase from '../config/supabaseClient';

// Define a mock function that we can control inside each test
const mockSupabaseResponse = vi.fn();

// Mock the Supabase client structure
vi.mock('../config/supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (onfulfilled: any) => onfulfilled(mockSupabaseResponse()),
    }))
  }
}));

describe('Order Service Endpoint Testing', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

//   Happy Route: Create Order
  it('should successfully create an order and return data', async () => {
    const mockOrder = {
      customer_name: 'Cardo Dalisay',
      order_details: 'Matcha Milk Tea, Large, 50% Sugar',
      status: 'pending'
    };

    const mockResponse = [{ id: '123', ...mockOrder }];

    mockSupabaseResponse.mockReturnValue({
      data: mockResponse,
      error: null
    });

    const result = await createOrder(mockOrder);

    expect(result).toEqual(mockResponse);
    expect(supabase.from).toHaveBeenCalledWith('orders');
  });

//   Happy Route: Update Status
  it('should successfully update order status', async () => {
    const orderId = '123';
    const newStatus = 'preparing';
    const mockResponse = [{ id: orderId, status: newStatus }];

    mockSupabaseResponse.mockReturnValue({
      data: mockResponse,
      error: null
    });

    const result = await updateOrderStatus(orderId, newStatus);

    expect(result).toEqual(mockResponse);
    expect(result?.[0].status).toBe('preparing');
  });

//   Sad Route: Failed Update
  it('should return null and log error when update fails', async () => {
    mockSupabaseResponse.mockReturnValue({
      data: null,
      error: { message: 'Database Connection Error' }
    });

    const result = await updateOrderStatus('123', 'completed');

    expect(result).toBeNull();
  });
});