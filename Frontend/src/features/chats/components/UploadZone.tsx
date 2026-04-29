import { motion } from "framer-motion"
import { FileText, Loader2, Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"

import { useUploadChat } from "../hooks/useChats"

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

export default function UploadZone() {
  const upload = useUploadChat()

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPTED,
    maxFiles: 1,
    multiple: false,
    disabled: upload.isPending,
    onDrop: (files) => {
      if (files[0]) upload.mutate(files[0])
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition",
          upload.isPending && "pointer-events-none opacity-70",
          isDragReject
            ? "border-red-500/60 bg-red-500/5"
            : isDragActive
              ? "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/20"
              : "border-border/60 bg-card/30 hover:border-violet-500/50 hover:bg-card/50",
        )}
      >
        <input {...getInputProps()} />

      {upload.isPending ? (
        <>
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-violet-400" />
          <p className="text-base font-medium">Uploading…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hang tight — your document will be ready in a few seconds.
          </p>
        </>
      ) : (
        <>
          <motion.div
            animate={isDragActive ? { y: -8 } : { y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/30"
          >
            {isDragActive ? (
              <Upload className="h-7 w-7 text-violet-300" />
            ) : (
              <FileText className="h-7 w-7 text-violet-300" />
            )}
          </motion.div>

          <p className="text-base font-medium">
            {isDragActive
              ? isDragReject
                ? "Only PDF or DOCX, please"
                : "Drop it here"
              : "Drop a PDF or Word document here"}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            or <span className="text-foreground underline">click to browse</span>
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Max 25 MB · .pdf · .docx
          </p>
        </>
      )}
      </div>
    </motion.div>
  )
}
