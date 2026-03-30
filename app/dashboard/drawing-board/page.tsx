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

type Point = {
  x: number
  y: number
}

export default function DrawingBoardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"pen" | "eraser">("pen")
  const [canvasTitle, setCanvasTitle] = useState("لوح الرسم")

  const configureContext = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
    ctx.fillStyle = tool === "eraser" ? "#ffffff" : color
  }

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const snapshot = document.createElement("canvas")
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0)

    const dpr = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (snapshot.width > 0 && snapshot.height > 0) {
      ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height)
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  useEffect(() => {
    resizeCanvas()

    const handleResize = () => resizeCanvas()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getPointerPosition = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const point = getPointerPosition(event)
    if (!canvas || !ctx || !point) return

    event.preventDefault()
    canvas.setPointerCapture(event.pointerId)
    configureContext(ctx)

    ctx.beginPath()
    ctx.arc(point.x, point.y, Math.max(brushSize / 2, 1), 0, Math.PI * 2)
    ctx.fill()

    isDrawingRef.current = true
    lastPointRef.current = point
    setIsDrawing(true)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return

    const ctx = canvasRef.current?.getContext("2d")
    const point = getPointerPosition(event)
    if (!ctx || !point) return

    event.preventDefault()
    configureContext(ctx)

    const previousPoint = lastPointRef.current || point
    ctx.beginPath()
    ctx.moveTo(previousPoint.x, previousPoint.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    lastPointRef.current = point
  }

  const stopDrawing = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas && event && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }

    isDrawingRef.current = false
    lastPointRef.current = null
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
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
        <p className="mt-1 text-gray-500">مساحة شرح واسعة تدعم الرسم بالإصبع أو بالقلم أو بالماوس</p>
      </div>

      <Tabs defaultValue="drawing">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drawing">لوح الرسم</TabsTrigger>
          <TabsTrigger value="gallery">معرض الرسومات</TabsTrigger>
        </TabsList>

        <TabsContent value="drawing">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>
                    <Input
                      value={canvasTitle}
                      onChange={(event) => setCanvasTitle(event.target.value)}
                      className="h-auto border-none p-0 text-xl font-bold focus-visible:ring-0"
                      placeholder="عنوان اللوح"
                    />
                  </CardTitle>
                  <CardDescription>
                    {isDrawing ? "جاري الرسم الآن" : "اسحب بإصبعك أو بالقلم أو بالماوس للرسم مباشرة"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
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
              <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">اللون</Label>
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        className="h-10 w-full p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brushSize">حجم الفرشاة: {brushSize}</Label>
                      <Slider
                        id="brushSize"
                        min={1}
                        max={24}
                        step={1}
                        value={[brushSize]}
                        onValueChange={(value) => setBrushSize(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tool">الأداة</Label>
                      <Select value={tool} onValueChange={(value) => setTool(value as "pen" | "eraser")}>
                        <SelectTrigger id="tool">
                          <SelectValue placeholder="اختر الأداة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pen">قلم</SelectItem>
                          <SelectItem value="eraser">ممحاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                      مساحة الرسم موسعة للأجهزة اللمسية، ولن يتحرك المتصفح أثناء السحب داخل اللوحة.
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-white">
                  <canvas
                    ref={canvasRef}
                    className="h-[62vh] min-h-[420px] w-full max-h-[80vh] touch-none select-none bg-white md:h-[70vh]"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex aspect-video items-center justify-center rounded-md border bg-gray-100">
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
