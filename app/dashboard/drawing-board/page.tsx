"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eraser } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export default function DrawingBoardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"pen" | "eraser">("pen")
  const [canvasTitle, setCanvasTitle] = useState("لوح الرسم")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set initial canvas background to white
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.putImageData(imageData, 0, 0)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = `${canvasTitle || "drawing"}.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوح الرسم</h1>
        <p className="text-gray-500 mt-1">أداة تفاعلية للرسم والشرح</p>
      </div>

      <Tabs defaultValue="drawing">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drawing">لوح الرسم</TabsTrigger>
          <TabsTrigger value="gallery">معرض الرسومات</TabsTrigger>
        </TabsList>
        <TabsContent value="drawing">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    <Input
                      value={canvasTitle}
                      onChange={(e) => setCanvasTitle(e.target.value)}
                      className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0"
                      placeholder="عنوان اللوح"
                    />
                  </CardTitle>
                  <CardDescription>استخدم الأدوات للرسم والشرح</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadCanvas}>
                    <Download className="ml-2 h-4 w-4" />
                    حفظ
                  </Button>
                  <Button variant="outline" onClick={clearCanvas}>
                    <Eraser className="ml-2 h-4 w-4" />
                    مسح
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="space-y-2">
                    <Label htmlFor="color">اللون</Label>
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-8 p-1"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="brushSize">حجم الفرشاة: {brushSize}</Label>
                    <Slider
                      id="brushSize"
                      min={1}
                      max={20}
                      step={1}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tool">الأداة</Label>
                    <Select value={tool} onValueChange={(value) => setTool(value as "pen" | "eraser")}>
                      <SelectTrigger id="tool" className="w-32">
                        <SelectValue placeholder="اختر الأداة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pen">قلم</SelectItem>
                        <SelectItem value="eraser">ممحاة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[500px] touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>معرض الرسومات</CardTitle>
              <CardDescription>الرسومات المحفوظة سابقاً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">لا توجد رسومات محفوظة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
