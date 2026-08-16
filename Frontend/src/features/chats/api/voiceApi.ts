import { api } from "@/lib/axios"

export const voiceApi = {
  transcribe: async (audio: Blob): Promise<string> => {
    const formData = new FormData()
    const extension = audio.type.includes("mp4") ? "mp4" : "webm"
    formData.append("audio", audio, `recording.${extension}`)
    const response = await api.post<{ text: string }>(
      "/api/voice/transcribe",
      formData,
    )
    return response.data.text
  },
}
