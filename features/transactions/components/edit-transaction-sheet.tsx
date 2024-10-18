import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { insertTransActionSchema } from "@/db/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetTransaction } from "../api/use-get-transaction";
import { useEditTransaction } from "../api/use-edit-transaction";
import { useDeleteTransaction } from "../api/use-delete-transaction";
import { useOpenTransaction } from "../hooks/use-open-transaction";
import { TransactionForm } from "./transaction-form";
const formSchema = insertTransActionSchema.omit({
  id: true,
});
type FormValues = z.input<typeof formSchema>;
export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();
  const [ConfirmDialog, confirm] = useConfirm(
    "are you sure?",
    "You are about to delete this transaction"
  );
  const transactionQuery = useGetTransaction(id);
  const editMutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading = transactionQuery.isLoading;
  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };
  const defaultValues = transactionQuery.data
    ? {
        accountId: transactionQuery.data.accountId,
        categoryId: transactionQuery.data.categoryId,
        amoount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes,
      }
    : {
        acountId: "",
        categoryId: "",
        amount: "",
        date: "",
        payee: "",
        notes: "",
      };
  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Edit an existing transaction</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TransactionForm
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              id={id}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
