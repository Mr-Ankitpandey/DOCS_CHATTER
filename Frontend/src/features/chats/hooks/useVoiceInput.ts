import { useCallback, useEffect, useRef, useState } from "react"

import { voiceApi } from "../api/voiceApi"

export type VoiceState = "idle" | "recording" | "transcribing"

const MAX_RECORDING_MS = 60_000

/** Browsers disagree on container support: Chrome/Firefox do webm, Safari does mp4. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceState>("idle")
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Keep the latest callback without making start() a new function each render.
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const stop = useCallback(() => {
    clearTimer()
    const recorder = recorderRef.current
    if (recorder && recorder.state !== "inactive") recorder.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)

    if (!supported) {
      setError("Voice input is not supported in this browser")
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError("Microphone access was blocked")
      return
    }

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunksRef.current = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      recorderRef.current = null

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      })
      chunksRef.current = []

      if (blob.size === 0) {
        setState("idle")
        return
      }

      setState("transcribing")
      try {
        const text = (await voiceApi.transcribe(blob)).trim()
        if (text) onTranscriptRef.current(text)
        else setError("Didn't catch that — try speaking again")
      } catch {
        setError("Could not transcribe the recording")
      } finally {
        setState("idle")
      }
    }

    recorder.start()
    recorderRef.current = recorder
    setState("recording")

    // Safety net so a forgotten recording can't run forever.
    timeoutRef.current = setTimeout(stop, MAX_RECORDING_MS)
  }, [supported, stop])

  const toggle = useCallback(() => {
    if (state === "recording") stop()
    else if (state === "idle") void start()
  }, [state, start, stop])

  useEffect(() => {
    return () => {
      clearTimer()
      const recorder = recorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
    }
  }, [])

  return { state, error, supported, start, stop, toggle, clearError: () => setError(null) }
}
