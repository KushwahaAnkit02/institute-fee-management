import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CreateSubjectForm, SubjectRecord } from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (subject: CreateSubjectForm) => void;
  subject?: SubjectRecord | null;
  adminId: string;
  isLoading?: boolean;
}

export function SubjectModal({
  open,
  onClose,
  onSuccess,
  subject,
  isLoading = false,
}: SubjectModalProps) {
  const isEdit = !!subject;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name ?? "",
      description: subject?.description ?? "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: SubjectFormValues) {
    onSuccess({
      name: values.name,
      description: values.description,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary to-accent rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                <GraduationCap className="w-5 h-5 text-primary" />
                {isEdit ? "Edit Subject" : "Create New Subject"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update the subject details below."
                  : "Add a new subject to your institute."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject-name">Subject Name *</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g. Mathematics, Physics"
                  disabled={isLoading}
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                  data-ocid="subject-modal.name_input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="subject-modal.name_error"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject-description">Description</Label>
                <Textarea
                  id="subject-description"
                  placeholder="Optional description..."
                  rows={3}
                  disabled={isLoading}
                  {...register("description")}
                  data-ocid="subject-modal.description_textarea"
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="subject-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="subject-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Subject"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
