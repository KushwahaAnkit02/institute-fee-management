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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ClassRecord,
  CreateSectionForm,
  SectionRecord,
} from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  class_id: z.string().min(1, "Please select a class"),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (section: CreateSectionForm) => void;
  section?: SectionRecord | null;
  classId?: string;
  classes: ClassRecord[];
  isLoading?: boolean;
}

export function SectionModal({
  open,
  onClose,
  onSuccess,
  section,
  classId,
  classes,
  isLoading = false,
}: SectionModalProps) {
  const isEdit = !!section;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section?.name ?? "",
      class_id: section?.class_id ?? classId ?? "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: SectionFormValues) {
    onSuccess({ name: values.name, class_id: values.class_id });
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
                <Layers className="w-5 h-5 text-primary" />
                {isEdit ? "Edit Section" : "Create New Section"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update the section details below."
                  : "Add a new section to a class."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Controller
                  name="class_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={cn(errors.class_id && "border-destructive")}
                        data-ocid="section-modal.class_select"
                      >
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.class_id && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="section-modal.class_error"
                  >
                    {errors.class_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="section-name">Section Name *</Label>
                <Input
                  id="section-name"
                  placeholder="e.g. A, Morning, Batch 1"
                  disabled={isLoading}
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                  data-ocid="section-modal.name_input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="section-modal.name_error"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="section-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="section-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Section"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
