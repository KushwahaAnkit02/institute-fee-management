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
import type { ClassRecord, CreateClassForm } from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  description: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (classRecord: CreateClassForm) => void;
  classData?: ClassRecord | null;
  adminId: string;
  isLoading?: boolean;
}

export function ClassModal({
  open,
  onClose,
  onSuccess,
  classData,
  isLoading = false,
}: ClassModalProps) {
  const isEdit = !!classData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classData?.name ?? "",
      description: classData?.description ?? "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: ClassFormValues) {
    onSuccess({
      name: values.name,
      description: values.description ?? "",
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
                <BookOpen className="w-5 h-5 text-primary" />
                {isEdit ? "Edit Class" : "Create New Class"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update the class details below."
                  : "Add a new class to your institute."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="class-name">Class Name *</Label>
                <Input
                  id="class-name"
                  placeholder="e.g. Class 10, B.Tech Year 2"
                  disabled={isLoading}
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                  data-ocid="class-modal.name_input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="class-modal.name_error"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class-description">Description</Label>
                <Textarea
                  id="class-description"
                  placeholder="Optional description for this class..."
                  rows={3}
                  disabled={isLoading}
                  {...register("description")}
                  data-ocid="class-modal.description_textarea"
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="class-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="class-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
