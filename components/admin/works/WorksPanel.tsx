"use client"

import WorkUploadModal, {
} from "@/components/admin/works/WorkUploadModal"
import WorksYearSection from "@/components/admin/works/WorksYearSection"
import { useWorksPanelData } from "@/components/admin/works/hooks/useWorksPanelData"
import YearInputDialog from "@/components/admin/shared/YearInputDialog"
import { Plus } from "lucide-react"

export default function WorksPanel() {
  const {
    isUploadOpen,
    setIsUploadOpen,
    isUploading,
    errorMessage,
    yearOptions,
    groupedByYear,
    yearSelectOptions,
    selectedYearCategory,
    rangeLabel,
    editingItem,
    modalInitialValues,
    isYearDialogOpen,
    setIsYearDialogOpen,
    handleSave,
    handleAdd,
    handleEdit,
    handleDelete,
    handleReorder,
    handleYearConfirm,
  } = useWorksPanelData()

  return (
    <div className="space-y-4">
      {yearOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No works yet.</p>
      ) : (
        <div className="space-y-4">
          {Array.from(groupedByYear.entries()).map(([year, items]) => (
            <WorksYearSection
              key={year}
              yearLabel={year}
              items={items}
              onAdd={() => handleAdd(year)}
              onEdit={handleEdit}
              onDelete={(item) => {
                void handleDelete(item)
              }}
              onReorder={(orderedItems) => {
                void handleReorder(year, orderedItems)
              }}
            />
          ))}
        </div>
      )}
      <WorkUploadModal
        key={editingItem?.id ?? "new"}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title={editingItem ? "Edit work" : "Add work"}
        description="작업 이미지와 캡션 텍스트를 업로드 및 수정할 수 있습니다"
        yearOptions={yearSelectOptions}
        isYearSelectDisabled={selectedYearCategory !== rangeLabel}
        selectedYearCategory={selectedYearCategory}
        onSave={handleSave}
        initialValues={modalInitialValues}
        isEditMode={Boolean(editingItem)}
        confirmLabel={editingItem ? "Save updates" : "Save work"}
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
      <YearInputDialog
        open={isYearDialogOpen}
        onOpenChange={setIsYearDialogOpen}
        onConfirm={handleYearConfirm}
        trigger={
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            aria-label="Add a new year category "
          >
            <Plus className="h-4 w-4" />
            <span>Add a new year category</span>
          </button>
        }
      />
    </div>
  )
}
