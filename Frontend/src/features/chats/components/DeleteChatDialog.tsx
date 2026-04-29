import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useDeleteChat } from "../hooks/useChats"

interface DeleteChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
  chatTitle: string
}

export default function DeleteChatDialog({
  open,
  onOpenChange,
  chatId,
  chatTitle,
}: DeleteChatDialogProps) {
  const deleteChat = useDeleteChat()

  const handleConfirm = () => {
    deleteChat.mutate(chatId, {
      onSettled: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-medium">{chatTitle}</span>{" "}
            and its uploaded document. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteChat.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteChat.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteChat.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
