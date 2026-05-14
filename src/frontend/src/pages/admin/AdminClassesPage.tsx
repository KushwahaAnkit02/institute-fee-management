import {
  useClasses,
  useCreateClass,
  useCreateSection,
  useDeleteClass,
  useDeleteSection,
  useSections,
  useUpdateClass,
} from "@/hooks/useClasses";
import type {
  ClassRecord,
  CreateClassForm,
  CreateSectionForm,
} from "@/types/student";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Class form dialog
// ---------------------------------------------------------------------------
function ClassFormDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ClassRecord;
}) {
  const createMut = useCreateClass();
  const updateMut = useUpdateClass();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const isEdit = !!initial;
  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    const form: CreateClassForm = {
      name: name.trim(),
      description: description.trim(),
    };
    if (isEdit) {
      await updateMut.mutateAsync({ id: initial.id, form });
    } else {
      await createMut.mutateAsync(form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="classes.class_form.dialog"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Class" : "Add New Class"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update class details."
              : "Create a new class for your institute."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name *</Label>
            <Input
              id="class-name"
              placeholder="e.g. Class 10, BCA, B.Tech"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="classes.class_name.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-desc">Description</Label>
            <Input
              id="class-desc"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-ocid="classes.class_description.input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="classes.class_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            data-ocid="classes.class_form.submit_button"
          >
            {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Section row
// ---------------------------------------------------------------------------
function SectionRow({
  id,
  name,
}: {
  id: string;
  name: string;
  classId: string;
}) {
  const deleteMut = useDeleteSection();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    await deleteMut.mutateAsync(id);
    setConfirming(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/40 group">
      <span className="text-sm font-medium">{name}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
        onClick={() => setConfirming(true)}
        data-ocid={`classes.section_delete_button.${id}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="classes.section_delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Section?</DialogTitle>
            <DialogDescription>
              Remove section "{name}" permanently?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
              data-ocid="classes.section_delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              data-ocid="classes.section_delete.confirm_button"
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Class card with sections
// ---------------------------------------------------------------------------
function ClassCard({ cls, index }: { cls: ClassRecord; index: number }) {
  const { data: sections = [], isLoading: sectionsLoading } = useSections(
    cls.id,
  );
  const deleteMut = useDeleteClass();
  const createSection = useCreateSection();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleAddSection = async () => {
    if (!newSection.trim()) return;
    const form: CreateSectionForm = {
      class_id: cls.id,
      name: newSection.trim(),
    };
    await createSection.mutateAsync(form);
    setNewSection("");
    setAddingSection(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="glass-card border-border/50 hover:shadow-elevated transition-all duration-200"
        data-ocid={`classes.class_card.${cls.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 text-left"
              onClick={() => setExpanded((v) => !v)}
            >
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate font-display">
                  {cls.name}
                </CardTitle>
                {cls.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {cls.description}
                  </p>
                )}
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-xs">
                {sections.length} section{sections.length !== 1 ? "s" : ""}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={() => setEditing(true)}
                data-ocid={`classes.class_edit_button.${cls.id}`}
                aria-label="Edit class"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
                data-ocid={`classes.class_delete_button.${cls.id}`}
                aria-label="Delete class"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0 space-y-3">
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Sections
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-primary hover:text-primary"
                      onClick={() => {
                        setAddingSection(true);
                      }}
                      data-ocid={`classes.add_section_button.${cls.id}`}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>

                  {sectionsLoading ? (
                    <div className="space-y-1.5">
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-2/3" />
                    </div>
                  ) : sections.length === 0 && !addingSection ? (
                    <p
                      className="text-xs text-muted-foreground py-3 text-center bg-muted/30 rounded-lg"
                      data-ocid={`classes.sections_empty_state.${cls.id}`}
                    >
                      No sections — click Add to create one
                    </p>
                  ) : (
                    <AnimatePresence>
                      {sections.map((s) => (
                        <SectionRow
                          key={s.id}
                          id={s.id}
                          name={s.name}
                          classId={cls.id}
                        />
                      ))}
                    </AnimatePresence>
                  )}

                  {addingSection && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Section name (e.g. A, Morning)"
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddSection()
                        }
                        className="h-8 text-sm"
                        autoFocus
                        data-ocid="classes.new_section_name.input"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 gradient-accent text-primary-foreground"
                        onClick={handleAddSection}
                        disabled={createSection.isPending}
                        data-ocid="classes.new_section_save.button"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() => {
                          setAddingSection(false);
                          setNewSection("");
                        }}
                        data-ocid="classes.new_section_cancel.button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {editing && (
        <ClassFormDialog
          open={editing}
          onClose={() => setEditing(false)}
          initial={cls}
        />
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="classes.class_delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Class?</DialogTitle>
            <DialogDescription>
              Delete &quot;{cls.name}&quot; and all its sections permanently?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              data-ocid="classes.class_delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await deleteMut.mutateAsync(cls.id);
                setConfirmDelete(false);
              }}
              disabled={deleteMut.isPending}
              data-ocid="classes.class_delete.confirm_button"
            >
              {deleteMut.isPending ? "Deleting..." : "Delete Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function AdminClassesPage() {
  const { data: classes = [], isLoading } = useClasses();
  const [showAddClass, setShowAddClass] = useState(false);

  // Compute total sections count across all class data (use per-card counts shown in badges)
  const totalClasses = classes.length;

  return (
    <div className="space-y-6 p-4 sm:p-6" data-ocid="classes.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Class Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage classes and their sections
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddClass(true)}
          className="gradient-accent text-primary-foreground shadow-soft gap-2 shrink-0"
          data-ocid="classes.add_class_button"
        >
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">
                  {totalClasses}
                </p>
                <p className="text-xs text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">
                  {isLoading ? "—" : totalClasses > 0 ? "✓" : "0"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sections Managed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card border-border/50">
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 space-y-4"
          data-ocid="classes.empty_state"
        >
          <div className="p-5 rounded-2xl bg-primary/10">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-display font-semibold">
              No classes yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create your first class to start organising students into groups.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowAddClass(true)}
            className="gradient-accent text-primary-foreground gap-2"
            data-ocid="classes.empty_state.add_class_button"
          >
            <Plus className="h-4 w-4" /> Add First Class
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, i) => (
              <ClassCard key={cls.id} cls={cls} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {showAddClass && (
        <ClassFormDialog
          open={showAddClass}
          onClose={() => setShowAddClass(false)}
        />
      )}
    </div>
  );
}
