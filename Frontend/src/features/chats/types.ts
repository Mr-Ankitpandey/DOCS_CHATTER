export type DocumentStatus = "pending" | "processing" | "ready" | "failed"

export interface DocumentInfo {
  id: string
  filename: string
  file_size: number
  mime_type: string
  status: DocumentStatus
  error_message: string | null
  summary: string | null
}

export interface Chat {
  id: string
  title: string | null
  document: DocumentInfo
  created_at: string
  updated_at: string
}
