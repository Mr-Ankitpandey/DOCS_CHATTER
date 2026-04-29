export interface ChunkInfo {
  id: string
  page_number: number | null
  content: string
}

export interface MessageSource {
  chunk: ChunkInfo
  score: number | null
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources: MessageSource[]
  created_at: string
}
