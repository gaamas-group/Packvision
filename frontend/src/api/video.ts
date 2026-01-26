import apiClient from "./client.js"

export const videoAPI = {
    viewVideo: async (objectKey: any) => {
        if (!objectKey) {
          throw new Error("objectKey is required")
        }
        const response = await apiClient.get(
          `/videos/download-url/${encodeURIComponent(objectKey)}`
        )
        return response.data 
      }
}

