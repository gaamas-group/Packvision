import apiClient from "./client.js";

export const ordersAPI = {
  // Get all orders
  getAll: async () => {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  // Generate upload URL for order documents
  generateUploadUrl: async (orderId, filename, contentType, documentType = "general") => {
    const response = await apiClient.post(`/orders/${orderId}/documents/upload-url`, {
      filename,
      contentType,
      documentType,
    });
    return response.data;
  },

  // Generate download URL for order documents
  generateDownloadUrl: async (key) => {
    const response = await apiClient.get(`/orders/${key}/download-url`);
    return response.data;
  },
};

