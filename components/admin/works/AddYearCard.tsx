"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AddYearCardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (year: string) => void
  trigger: ReactNode
  title?: string
  description?: string
  label?: string
  placeholder?: string
  confirmLabel?: string
  validate?: (value: string) => string | null
}

const singleYearPattern = /^\d{4}$/
const yearRangePattern = /^(\d{4})-(\d{4})$/

const defaultValidate = (value: string) => {
  if (!value) return "Enter a year or year range."
  if (!singleYearPattern.test(value) && !yearRangePattern.test(value)) {
    return "단일 연도(예. 2027) 또는 연도 범위를 포멧에 맞게 업로드해주세요.(예. 2022-2025 또는 2022~2025)."
  }
  const rangeMatch = value.match(yearRangePattern)
  if (rangeMatch && Number(rangeMatch[1]) >= Number(rangeMatch[2])) {
    return "연도 카테고리의 시작년도가 종료년도보다 클 수 없습니다."
  }
  return null
}

export default function AddYearCard({
  open,
  onOpenChange,
  onConfirm,
  trigger,
  title = "Add year",
  description = "Create a new year category for works.",
  label = "Year or range",
  placeholder = "ex. 2027 또는 2022-2025",
  confirmLabel = "Add year",
  validate = defaultValidate,
}: AddYearCardProps) {
  const [yearInput, setYearInput] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const resetTimeout = setTimeout(() => {
      setYearInput("")
      setError("")
    }, 0)
    return () => clearTimeout(resetTimeout)
  }, [open])

  const handleConfirm = () => {
    const trimmed = yearInput.trim()
    const validationError = validate(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }
    onConfirm(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4/5 md:max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="year-input">{label}</Label>
          <Input
            id="year-input"
            value={yearInput}
            onChange={(event) => setYearInput(event.target.value)}
            placeholder={placeholder}
            inputMode="text"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="highlight" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
