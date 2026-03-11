"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Search,
  Trash,
  Pencil,
  PlusCircle,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchNotesData, saveNotesData } from "@/lib/school-api"
import { defaultSchoolNotes, type SchoolNote } from "@/lib/school-data"

export default function NotesPage() {
  const { toast } = useToast()
  const [notes, setNotes] = useState<SchoolNote[]>(defaultSchoolNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    images: [] as string[],
  })
  const [editingNote, setEditingNote] = useState<SchoolNote | null>(null)

  // إضافة حالة لمعاينة الصور
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadNotes = async () => {
      try {
        const response = await fetchNotesData()
        if (!isMounted) {
          return
        }
        setNotes(Array.isArray(response.notes) && response.notes.length > 0 ? response.notes : defaultSchoolNotes)
      } catch {
        if (!isMounted) {
          return
        }
        setNotes(defaultSchoolNotes)
      }
    }

    void loadNotes()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredNotes = notes.filter((note) => note.title.includes(searchQuery) || note.content.includes(searchQuery))

  const persistNotes = async (nextNotes: SchoolNote[]) => {
    const previousNotes = notes
    setNotes(nextNotes)
    setIsSaving(true)

    try {
      const response = await saveNotesData(nextNotes)
      setNotes(response.notes)
      return true
    } catch (error) {
      setNotes(previousNotes)
      toast({
        title: "تعذر حفظ الملاحظات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الملاحظات",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesToProcess = Array.from(files)
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB

    // التحقق من حجم الملفات
    const oversizedFiles = filesToProcess.filter((file) => file.size > maxSizeInBytes)
    if (oversizedFiles.length > 0) {
      toast({
        title: "خطأ",
        description: `${oversizedFiles.length} من الصور تتجاوز الحد الأقصى للحجم (5 ميجابايت)`,
        variant: "destructive",
      })
      return
    }

    try {
      // تحويل جميع الملفات إلى Base64
      const base64Promises = filesToProcess.map((file) => convertToBase64(file))
      const base64Results = await Promise.all(base64Promises)

      if (isEditing && editingNote) {
        setEditingNote({
          ...editingNote,
          images: [...editingNote.images, ...base64Results],
        })
      } else {
        setNewNote({
          ...newNote,
          images: [...newNote.images, ...base64Results],
        })
      }

      toast({
        title: "تم تحميل الصور",
        description: `تم تحميل ${base64Results.length} صورة بنجاح`,
      })

      // إعادة تعيين قيمة حقل الإدخال
      e.target.value = ""
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الصور",
        variant: "destructive",
      })
    }
  }

  const removeImage = (index: number, isEditing = false) => {
    if (isEditing && editingNote) {
      const updatedImages = [...editingNote.images]
      updatedImages.splice(index, 1)
      setEditingNote({ ...editingNote, images: updatedImages })
    } else {
      const updatedImages = [...newNote.images]
      updatedImages.splice(index, 1)
      setNewNote({ ...newNote, images: updatedImages })
    }

    toast({
      title: "تم إزالة الصورة",
      description: "تم إزالة الصورة بنجاح",
    })
  }

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const id = Math.random().toString(36).substring(2, 9)
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]

    const noteToAdd = {
      id,
      ...newNote,
      date: formattedDate,
    }

    const updatedNotes = [...notes, noteToAdd]
    const saved = await persistNotes(updatedNotes)
    if (!saved) {
      return
    }

    setNewNote({
      title: "",
      content: "",
      images: [],
    })
    setIsAddDialogOpen(false)

    toast({
      title: "تم إضافة الملاحظة",
      description: `تم إضافة ${noteToAdd.title} بنجاح`,
    })
  }

  const handleEditNote = async () => {
    if (!editingNote) return

    const updatedNotes = notes.map((note) => (note.id === editingNote.id ? editingNote : note))
    const saved = await persistNotes(updatedNotes)
    if (!saved) {
      return
    }

    setIsEditDialogOpen(false)
    setEditingNote(null)

    toast({
      title: "تم تحديث الملاحظة",
      description: `تم تحديث ${editingNote.title} بنجاح`,
    })
  }

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id)
    const updatedNotes = notes.filter((note) => note.id !== id)
    const saved = await persistNotes(updatedNotes)
    if (!saved) {
      return
    }

    toast({
      title: "تم حذف الملاحظة",
      description: `تم حذف ${noteToDelete?.title} بنجاح`,
      variant: "destructive",
    })
  }

  // دالة لفتح معاينة الصور
  const openImagePreview = (images: string[], startIndex = 0) => {
    setPreviewImages(images)
    setCurrentImageIndex(startIndex)
    setImageZoom(1) // إعادة تعيين التكبير
    setImageRotation(0) // إعادة تعيين الدوران
    setIsImagePreviewOpen(true)
  }

  // دالة للانتقال إلى الصورة التالية
  const goToNextImage = () => {
    setImageZoom(1) // إعادة تعيين التكبير عند تغيير الصورة
    setImageRotation(0) // إعادة تعيين الدوران عند تغيير الصورة
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % previewImages.length)
  }

  // دالة للانتقال إلى الصورة السابقة
  const goToPrevImage = () => {
    setImageZoom(1) // إعادة تعيين التكبير عند تغيير الصورة
    setImageRotation(0) // إعادة تعيين الدوران عند تغيير الصورة
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + previewImages.length) % previewImages.length)
  }

  // دالة لتكبير الصورة
  const zoomIn = () => {
    setImageZoom((prevZoom) => Math.min(prevZoom + 0.25, 3))
  }

  // دالة لتصغير الصورة
  const zoomOut = () => {
    setImageZoom((prevZoom) => Math.max(prevZoom - 0.25, 0.5))
  }

  // دالة لتدوير الصورة
  const rotateImage = () => {
    setImageRotation((prevRotation) => prevRotation + 90)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الملاحظات</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-64 pl-8 rtl:pr-8 rtl:pl-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة ملاحظة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
                <DialogDescription>أدخل معلومات الملاحظة الجديدة هنا. اضغط على حفظ عند الانتهاء.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">المحتوى</Label>
                  <Textarea
                    id="content"
                    className="min-h-[80px]"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">الصور (اختياري)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      تحميل صور
                    </Button>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </div>
                  {newNote.images.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground mb-2">تم تحميل {newNote.images.length} صورة</div>
                      <div className="grid grid-cols-3 gap-2">
                        {newNote.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md cursor-pointer"
                              onClick={() => openImagePreview(newNote.images, index)}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => void handleAddNote()} disabled={isSaving}>حفظ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{note.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingNote(note)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => void handleDeleteNote(note.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{note.date}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {note.images && note.images.length > 0 && (
                <div className="mb-3 relative">
                  {note.images.length === 1 ? (
                    <img
                      src={note.images[0] || "/placeholder.svg"}
                      alt="صورة مرفقة"
                      className="w-full h-auto max-h-32 object-contain rounded-md cursor-pointer"
                      onClick={() => openImagePreview(note.images, 0)}
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-1 relative">
                      {note.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md cursor-pointer"
                          onClick={() => openImagePreview(note.images, index)}
                        />
                      ))}
                      {note.images.length > 3 && (
                        <div
                          className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-bl-md cursor-pointer"
                          onClick={() => openImagePreview(note.images, 0)}
                        >
                          +{note.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <ScrollArea className="h-32">{note.content}</ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الملاحظة</DialogTitle>
            <DialogDescription>قم بتعديل معلومات الملاحظة هنا. اضغط على حفظ عند الانتهاء.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">العنوان</Label>
              <Input
                id="edit-title"
                value={editingNote?.title}
                onChange={(e) => editingNote && setEditingNote({ ...editingNote, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">المحتوى</Label>
              <Textarea
                id="edit-content"
                className="min-h-[80px]"
                value={editingNote?.content}
                onChange={(e) => editingNote && setEditingNote({ ...editingNote, content: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">الصور (اختياري)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("edit-image-upload")?.click()}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  إضافة صور
                </Button>
                <input
                  type="file"
                  id="edit-image-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                />
              </div>
              {editingNote?.images && editingNote.images.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground mb-2">تم تحميل {editingNote.images.length} صورة</div>
                  <div className="grid grid-cols-3 gap-2">
                    {editingNote.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md cursor-pointer"
                          onClick={() => openImagePreview(editingNote.images, index)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index, true)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void handleEditNote()} disabled={isSaving}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* معاينة الصور بحجم كامل */}
      <Dialog
        open={isImagePreviewOpen}
        onOpenChange={(open) => {
          setIsImagePreviewOpen(open)
          if (!open) {
            setImageZoom(1)
            setImageRotation(0)
          }
        }}
      >
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/90">
          <div className="relative w-full h-full flex flex-col">
            {/* شريط الأدوات */}
            <div className="flex justify-between items-center p-2 bg-black/50 text-white">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={zoomIn} className="text-white hover:bg-white/20">
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={zoomOut} className="text-white hover:bg-white/20">
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={rotateImage} className="text-white hover:bg-white/20">
                  <RotateCw className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm">
                {currentImageIndex + 1} / {previewImages.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsImagePreviewOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* منطقة عرض الصورة */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              {previewImages.length > 0 && (
                <img
                  src={previewImages[currentImageIndex] || "/placeholder.svg"}
                  alt="معاينة الصورة"
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  }}
                />
              )}

              {/* أزرار التنقل */}
              {previewImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrevImage()
                    }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNextImage()
                    }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
