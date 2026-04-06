import axios from "axios"

export const videoAPI = {
    viewVideo: async (objectKey: any) => {
        if (!objectKey) {
          throw new Error("objectKey is required")
        }
        const response = await axios.get(
          `/videos/download-url/${encodeURIComponent(objectKey)}`
        )
        return response.data 
      }
}

