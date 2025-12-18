import apiClient from "./client.js";

export const videosAPI = {
  // Generate upload URL for videos
  generateUploadUrl: async (filename, contentType, folder = "videos") => {
    const response = await apiClient.post("/videos/upload-url", {
      filename,
      contentType,
      folder,
    });
    return response.data;
  },

  // Generate download URL for videos
  generateDownloadUrl: async (key) => {
    const response = await apiClient.get(`/videos/download-url/${key}`);
    return response.data;
  },
};

