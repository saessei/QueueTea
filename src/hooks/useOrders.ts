import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at');
    if (data) setOrders(data);
  }, []); 

useEffect(() => {
    const initializeOrders = async () => {
      await fetchOrders();
    };

    initializeOrders();

    const channel = supabase
      .channel('queue-tea-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]); 

  return { orders, fetchOrders };
};