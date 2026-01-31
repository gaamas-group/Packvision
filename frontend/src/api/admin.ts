import apiClient from './client.js';

export const adminAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Get all orders (via recordings endpoint which includes order info)
  getOrders: async () => {
    const response = await apiClient.get('/admin/recordings');
    // Transform recordings data to orders format
    const recordings = response.data.recordings || [];

    // Group by order_id and create order objects
    const orderMap = new Map();

    recordings.forEach((recording: any) => {
      const orderId = recording.order_id || recording.package_code;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          package_code: recording.package_code,
          status: recording.status || 'packed',
          external_order_id: recording.external_order_id,
          created_at: recording.created_at,
          updated_at: recording.ended_at,
          packager_name: recording.packager_name,
          duration_seconds: recording.duration_seconds,
          file_size: recording.file_size,
          object_key: recording.object_key,
          bucket: recording.bucket,
        });
      }
    });

    return Array.from(orderMap.values());
  },

  getPackagers: async () => {
    const response = await apiClient.get('/admin/packagers');
    return response.data.packagers;
  },

  createPackager: async (data: any) => {
    const response = await apiClient.post('/admin/packagers', data);
    return response.data.packager;
  },
};
