"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Settings,
  Link,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"

interface SpreadsheetData {
  product: string
  lastYear?: number
  target: number
  actual: number
  yoyGrowth: number
  achievementRate: number
}

interface SpreadsheetImportProps {
  onDataImported: (data: SpreadsheetData[]) => void
}

interface FileInfo {
  name: string
  size: number
  type: string
  sheets: string[]
  rowCount: number
  columnCount: number
}

interface HeaderDetectionResult {
  headerRowIndex: number
  headers: string[]
  columnMap: { [key: string]: number }
  confidence: number
}

export default function SpreadsheetImport({ onDataImported }: SpreadsheetImportProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [rawData, setRawData] = useState<any[][]>([])
  const [headerDetection, setHeaderDetection] = useState<HeaderDetectionResult | null>(null)
  const [manualHeaderRow, setManualHeaderRow] = useState<number | null>(null)
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("")

  // スプレッドシートファイルの列マッピング設定
  const columnMappings = {
    product: ["商品名", "主力商品名", "商品", "product", "name", "品名", "アイテム", "item", "製品名", "製品"],
    lastYear: ["前年", "前年売上", "昨年", "last_year", "previous", "前年度", "昨年度", "去年"],
    target: ["予定", "目標", "予算", "target", "plan", "計画", "目標値", "予定値", "budget"],
    actual: ["実績", "売上", "実売", "actual", "sales", "実績値", "売上実績", "成果", "結果"],
  }

  // Google SheetsのURLをCSV形式に変換
  const convertGoogleSheetsUrl = (url: string): string => {
    try {
      // Google Sheetsの共有URLパターンをチェック
      const googleSheetsRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
      const match = url.match(googleSheetsRegex)

      if (match) {
        const sheetId = match[1]
        // GIDを抽出（存在する場合）
        const gidMatch = url.match(/[#&]gid=([0-9]+)/)
        const gid = gidMatch ? gidMatch[1] : "0"

        // CSV形式のURLに変換
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
      }

      // 既にCSV形式の場合はそのまま返す
      return url
    } catch (error) {
      console.error("URL変換エラー:", error)
      return url
    }
  }

  // URL から CSV 文字列を取得（複数プロキシを順に試す）
  const fetchDataFromUrl = async (originalUrl: string): Promise<string> => {
    // Google Sheets URL を CSV 形式に変換
    const csvUrl = convertGoogleSheetsUrl(originalUrl)

    // 試行する URL リスト（順番に試す）
    const candidateUrls: string[] = [
      // 直接アクセス
      csvUrl,
      // allorigins (raw は Content‐Type を維持しつつ CORS を許可)
      `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`,
      // thingproxy
      `https://thingproxy.freeboard.io/fetch/${csvUrl}`,
      // jina.ai 経由（text/plain で返る）
      `https://r.jina.ai/http://${csvUrl.replace(/^https?:\/\//, "")}`,
    ]

    let lastError: any = null

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          mode: "cors",
          headers: { Accept: "text/csv,text/plain,*/*" },
        })
        // fetch 自体が失敗(TypeError) なら catch へ
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const text = await res.text()
        if (text.trim().length === 0) throw new Error("取得したデータが空です")
        return text
      } catch (err) {
        lastError = err
        // 次の候補 URL へフォールバック
        continue
      }
    }

    // すべて失敗
    throw new Error(
      `データの取得に失敗しました。\n${lastError instanceof Error ? lastError.message : String(lastError)}\n\n` +
        "・URL が公開設定になっているか\n" +
        "・URL が正しいか\n" +
        "をご確認ください。",
    )
  }

  // 数値の正規化関数
  const normalizeNumber = (value: any): number => {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const cleaned = value.replace(/[,¥$]/g, "")
      const num = Number.parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
    return 0
  }

  // 列名から対応するフィールドを特定
  const identifyColumn = (columnName: string): string | null => {
    if (!columnName || typeof columnName !== "string") return null

    const normalizedName = columnName.toLowerCase().trim()

    for (const [field, patterns] of Object.entries(columnMappings)) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.toLowerCase()
        if (
          normalizedName === normalizedPattern ||
          normalizedName.includes(normalizedPattern) ||
          normalizedPattern.includes(normalizedName)
        ) {
          return field
        }
      }
    }
    return null
  }

  // セルが有効なヘッダーかどうかを判定
  const isValidHeader = (cell: any): boolean => {
    if (!cell) return false
    const str = cell.toString().trim()
    if (str.length === 0) return false
    if (!isNaN(Number(str)) && str.length < 10) return false
    if (str.match(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/)) return false
    return true
  }

  // ヘッダー行を自動検出する関数
  const detectHeaderRow = (csvData: any[][]): HeaderDetectionResult[] => {
    const results: HeaderDetectionResult[] = []

    for (let rowIndex = 0; rowIndex < Math.min(15, csvData.length); rowIndex++) {
      const row = csvData[rowIndex]
      if (!row || row.length === 0) continue

      const validHeaders = row.filter(isValidHeader)
      if (validHeaders.length < 2) continue

      const columnMap: { [key: string]: number } = {}
      let matchCount = 0

      row.forEach((cell, colIndex) => {
        if (!isValidHeader(cell)) return
        const cellStr = cell.toString().trim()
        const field = identifyColumn(cellStr)
        if (field) {
          columnMap[field] = colIndex
          matchCount++
        }
      })

      // 商品名列の自動検出
      if (!columnMap.product && validHeaders.length >= 2) {
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          if (!isValidHeader(row[colIndex])) continue

          let stringCount = 0
          let totalCount = 0

          for (let checkRow = rowIndex + 1; checkRow < Math.min(rowIndex + 6, csvData.length); checkRow++) {
            const checkCell = csvData[checkRow]?.[colIndex]
            if (checkCell !== undefined && checkCell !== null && checkCell !== "") {
              totalCount++
              const cellStr = checkCell.toString().trim()
              if (isNaN(Number(cellStr)) && cellStr.length > 0) {
                stringCount++
              }
            }
          }

          if (totalCount > 0 && stringCount / totalCount >= 0.7) {
            columnMap.product = colIndex
            matchCount++
            break
          }
        }
      }

      let confidence = 0
      if (validHeaders.length > 0) {
        confidence = matchCount / validHeaders.length
        if (columnMap.product !== undefined) confidence += 0.3
        const numericColumns = Object.keys(columnMap).filter((key) => key !== "product").length
        if (numericColumns >= 2) confidence += 0.2
      }

      results.push({
        headerRowIndex: rowIndex,
        headers: validHeaders.map((h) => h.toString()),
        columnMap,
        confidence: Math.min(confidence, 1.0),
      })
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  // CSVデータの解析
  const parseCSVData = (csvText: string): SpreadsheetData[] => {
    // CSV 内セルの前後空白と BOM を除去
    const clean = (str: string) => str.replace(/^\uFEFF/, "").trim()

    // --- 行前処理 ----------------------------------------------------------
    // 1) CRLF / CR を LF に統一し BOM を除去
    const normalized = csvText
      .replace(/^\uFEFF/, "") // BOM 削除
      .replace(/\r\n|\r/g, "\n") // 改行統一
      .trim() // 全体前後の空白除去

    // 2) 連続改行を 1 行として扱い、空行を除去
    const lines = normalized
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    //-----------------------------------------------------------------------

    if (lines.length < 2) {
      throw new Error(
        `CSVデータが不足しています。\n取得内容の先頭 200 文字:\n${csvText.slice(
          0,
          200,
        )}\n\nURL が正しいか、公開設定が有効か確認してください。`,
      )
    }

    const csvData = lines.map((line) => {
      // より高度なCSV解析（引用符内のカンマを考慮）
      const result = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(clean(current.replace(/^"|"$/g, "")))
          current = ""
        } else {
          current += char
        }
      }
      result.push(clean(current.replace(/^"|"$/g, "")))
      return result
    })

    const headerResults = detectHeaderRow(csvData)

    if (headerResults.length === 0) {
      throw new Error("CSVファイルでヘッダー行が見つかりません。")
    }

    const selectedResult = headerResults[0]
    const { headerRowIndex, columnMap } = selectedResult

    if (!columnMap.product) {
      throw new Error(`商品名の列が見つかりません。\n検出されたヘッダー: ${selectedResult.headers.join(", ")}`)
    }

    const processedData: SpreadsheetData[] = []

    for (let i = headerRowIndex + 1; i < csvData.length; i++) {
      const values = csvData[i]
      const product = clean(values[columnMap.product] || "")

      if (!product || product === "合計" || product === "総計" || product === "計") continue

      const lastYear = columnMap.lastYear !== undefined ? normalizeNumber(values[columnMap.lastYear]) : undefined
      const target = columnMap.target !== undefined ? normalizeNumber(values[columnMap.target]) : 0
      const actual = columnMap.actual !== undefined ? normalizeNumber(values[columnMap.actual]) : 0

      let yoyGrowth = 0
      if (lastYear && lastYear > 0 && actual > 0) {
        yoyGrowth = ((actual - lastYear) / lastYear) * 100
      }

      let achievementRate = 0
      if (target > 0 && actual > 0) {
        achievementRate = (actual / target) * 100
      }

      if (target > 0 || actual > 0 || (lastYear && lastYear > 0)) {
        processedData.push({
          product,
          lastYear,
          target,
          actual,
          yoyGrowth: Math.round(yoyGrowth * 10) / 10,
          achievementRate: Math.round(achievementRate * 10) / 10,
        })
      }
    }

    return processedData
  }

  // URLからデータを処理
  const processUrlData = async (url: string) => {
    setIsProcessing(true)
    setImportStatus("idle")
    setErrorMessage("")
    setFileInfo(null)
    setPreviewData([])
    setHeaderDetection(null)
    setRawData([])

    try {
      const csvText = await fetchDataFromUrl(url)
      const processedData = parseCSVData(csvText)

      // ファイル情報を設定
      setFileInfo({
        name: `スプレッドシート (${new URL(url).hostname})`,
        size: csvText.length,
        type: "text/csv",
        sheets: ["Sheet1"],
        rowCount: csvText.split("\n").length,
        columnCount: csvText.split("\n")[0]?.split(",").length || 0,
      })

      // プレビューデータを設定
      setPreviewData(processedData.slice(0, 5))

      // データをコールバックに渡す
      onDataImported(processedData)
      setImportStatus("success")
    } catch (error) {
      console.error("URL処理エラー:", error)
      setImportStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "URLからのデータ取得中にエラーが発生しました。")
    } finally {
      setIsProcessing(false)
    }
  }

  // スプレッドシートデータの解析（ファイル用）
  const parseSpreadsheetData = (worksheet: XLSX.WorkSheet, headerRowIndex?: number): SpreadsheetData[] => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length < 2) {
      throw new Error("データが不足しています。ヘッダー行とデータ行が必要です。")
    }

    setRawData(jsonData)

    let selectedHeaderResult: HeaderDetectionResult | null = null

    if (headerRowIndex !== undefined) {
      const row = jsonData[headerRowIndex]
      if (row) {
        const validHeaders = row.filter(isValidHeader)
        const columnMap: { [key: string]: number } = {}

        row.forEach((cell, colIndex) => {
          if (!isValidHeader(cell)) return
          const cellStr = cell.toString().trim()
          const field = identifyColumn(cellStr)
          if (field) {
            columnMap[field] = colIndex
          }
        })

        selectedHeaderResult = {
          headerRowIndex,
          headers: validHeaders.map((h) => h.toString()),
          columnMap,
          confidence: 1.0,
        }
      }
    } else {
      const headerDetectionResults = detectHeaderRow(jsonData)
      selectedHeaderResult = headerDetectionResults[0] || null
    }

    if (!selectedHeaderResult) {
      throw new Error("ヘッダー行が見つかりません。")
    }

    setHeaderDetection(selectedHeaderResult)

    const { headerRowIndex: headerRow, columnMap } = selectedHeaderResult

    if (columnMap.product === undefined) {
      throw new Error("商品名の列が見つかりません。")
    }

    const processedData: SpreadsheetData[] = []
    const dataStartRow = headerRow + 1

    for (let i = dataStartRow; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row || row.length === 0) continue

      const productValue = row[columnMap.product]
      const product = productValue ? productValue.toString().trim() : ""

      if (!product || product === "合計" || product === "総計" || product === "計") continue

      const lastYear = columnMap.lastYear !== undefined ? normalizeNumber(row[columnMap.lastYear]) : undefined
      const target = columnMap.target !== undefined ? normalizeNumber(row[columnMap.target]) : 0
      const actual = columnMap.actual !== undefined ? normalizeNumber(row[columnMap.actual]) : 0

      let yoyGrowth = 0
      if (lastYear && lastYear > 0 && actual > 0) {
        yoyGrowth = ((actual - lastYear) / lastYear) * 100
      }

      let achievementRate = 0
      if (target > 0 && actual > 0) {
        achievementRate = (actual / target) * 100
      }

      if (target > 0 || actual > 0 || (lastYear && lastYear > 0)) {
        processedData.push({
          product,
          lastYear,
          target,
          actual,
          yoyGrowth: Math.round(yoyGrowth * 10) / 10,
          achievementRate: Math.round(achievementRate * 10) / 10,
        })
      }
    }

    if (processedData.length === 0) {
      throw new Error("有効なデータが見つかりませんでした。")
    }

    return processedData
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setImportStatus("idle")
    setErrorMessage("")
    setFileInfo(null)
    setPreviewData([])
    setHeaderDetection(null)
    setRawData([])

    try {
      const arrayBuffer = await file.arrayBuffer()
      let processedData: SpreadsheetData[] = []
      let sheets: string[] = []
      let rowCount = 0
      let columnCount = 0

      if (file.name.endsWith(".csv")) {
        const text = new TextDecoder().decode(arrayBuffer)
        processedData = parseCSVData(text)
        sheets = ["CSV"]
        rowCount = text.split("\n").length
        columnCount = text.split("\n")[0]?.split(",").length || 0
      } else {
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        sheets = workbook.SheetNames

        if (sheets.length === 0) {
          throw new Error("スプレッドシートファイルにシートが見つかりません。")
        }

        const sheetName = selectedSheet || sheets[0]
        const worksheet = workbook.Sheets[sheetName]

        if (!worksheet) {
          throw new Error(`シート "${sheetName}" が見つかりません。`)
        }

        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
        rowCount = range.e.r + 1
        columnCount = range.e.c + 1

        processedData = parseSpreadsheetData(worksheet, manualHeaderRow || undefined)
      }

      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        sheets,
        rowCount,
        columnCount,
      })

      setPreviewData(processedData.slice(0, 5))
      onDataImported(processedData)
      setImportStatus("success")
    } catch (error) {
      console.error("ファイル処理エラー:", error)
      setImportStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "ファイルの処理中にエラーが発生しました。")
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        processFile(file)
      }
    },
    [selectedSheet, manualHeaderRow],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const downloadSampleFile = () => {
    try {
      // CSVデータを生成
      const sampleData = [
        ["主力商品名", "前年", "予定", "実績"],
        ["バターフィナンシェ4入り", "2454", "1820", "1726"],
        ["バターフィナンシェ8入り", "", "2800", "2346"],
        ["バターフィナンシェ12入り", "1539", "1260", "1317"],
        ["チーズケーキ", "750", "800", "850"],
        ["モンブラン", "580", "600", "720"],
      ]

      // CSVテキストを生成
      const csvContent = sampleData.map((row) => row.join(",")).join("\n")

      // BOMを追加してUTF-8で正しく表示されるようにする
      const bom = "\uFEFF"
      const csvWithBom = bom + csvContent

      // Blobを作成してダウンロード
      const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "売上データサンプル.csv"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("サンプルファイル生成エラー:", error)
      alert("サンプルファイルの生成に失敗しました。")
    }
  }

  // Google Sheetsテンプレートを開く関数を追加:
  const openGoogleSheetsTemplate = () => {
    // Google Sheetsで新しいスプレッドシートを作成するURL
    const templateUrl = "https://docs.google.com/spreadsheets/create"
    window.open(templateUrl, "_blank")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          スプレッドシートインポート
        </CardTitle>
        <CardDescription>ファイルアップロードまたはスプレッドシートのURLから売上データを読み込みます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              ファイルアップロード
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL読み込み
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-6">
            {/* ファイルアップロードエリア */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />

              {isProcessing ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-lg font-medium text-gray-700">ファイルを解析中...</p>
                  <p className="text-sm text-gray-500">ヘッダー行を自動検出しています</p>
                </div>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-blue-600">ファイルをドロップしてください</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">ファイルをドラッグ＆ドロップ</p>
                  <p className="text-gray-500">または</p>
                  <Button variant="outline">ファイルを選択</Button>
                  <p className="text-sm text-gray-500 mt-2">対応形式: Excel (.xlsx, .xls), CSV (.csv)</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            {/* URL入力エリア */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">スプレッドシートのURL</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/... または CSV ファイルのURL"
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => processUrlData(spreadsheetUrl)}
                    disabled={!spreadsheetUrl.trim() || isProcessing}
                    className="px-6"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        読み込み
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* URL形式の説明 */}
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">対応するURL形式:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Google Sheets の共有URL（公開設定が必要）</li>
                      <li>CSVファイルの直接URL</li>
                      <li>その他のスプレッドシートサービスのCSVエクスポートURL</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">
                      ※ Google Sheetsの場合、「リンクを知っている全員」に共有設定してください
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {isProcessing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">データを取得中...</p>
                  <p className="text-sm text-gray-500">スプレッドシートからデータを読み込んでいます</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 手動設定オプション */}
        {rawData.length > 0 && importStatus === "error" && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                手動設定
              </CardTitle>
              <CardDescription>自動検出に失敗した場合、手動でヘッダー行を指定できます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ヘッダー行を選択:</label>
                  <Select
                    value={manualHeaderRow?.toString() || ""}
                    onValueChange={(value) => setManualHeaderRow(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ヘッダー行を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawData.slice(0, 15).map((row, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          行{index + 1}:{" "}
                          {row
                            .slice(0, 3)
                            .map((cell) => cell || "(空)")
                            .join(", ")}
                          ...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {manualHeaderRow !== null && (
                  <Button
                    onClick={() => {
                      if (fileInfo) {
                        setImportStatus("idle")
                        setErrorMessage("")
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                        if (fileInput?.files?.[0]) {
                          processFile(fileInput.files[0])
                        }
                      }
                    }}
                    className="w-full"
                  >
                    この行をヘッダーとして再処理
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* サンプルファイルダウンロード */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={downloadSampleFile} className="text-blue-600">
              <Download className="h-4 w-4 mr-2" />
              サンプルCSVをダウンロード
            </Button>
            <Button variant="ghost" size="sm" onClick={openGoogleSheetsTemplate} className="text-green-600">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Google Sheetsで作成
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              CSVファイルをダウンロードしてGoogle Sheetsにインポートするか、
              <br />
              Google Sheetsで新しいスプレッドシートを作成してサンプルデータを入力してください
            </p>
            <details className="mt-2">
              <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                サンプルデータの形式を確認
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-left text-xs font-mono">
                <div>主力商品名,前年,予定,実績</div>
                <div>バターフィナンシェ4入り,2454,1820,1726</div>
                <div>バターフィナンシェ8入り,,2800,2346</div>
                <div>チーズケーキ,750,800,850</div>
                <div>モンブラン,580,600,720</div>
              </div>
            </details>
          </div>
        </div>

        {/* ヘッダー検出結果 */}
        {headerDetection && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800">ヘッダー検出結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">検出された行:</span> {headerDetection.headerRowIndex + 1}行目
                </p>
                <p>
                  <span className="font-medium">信頼度:</span> {(headerDetection.confidence * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="font-medium">検出された列:</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(headerDetection.columnMap).map(([field, index]) => (
                    <Badge key={field} variant="outline" className="text-green-700">
                      {field}: 列{index + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ファイル情報 */}
        {fileInfo && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                データ情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ソース:</span>
                  <p className="text-gray-600">{fileInfo.name}</p>
                </div>
                <div>
                  <span className="font-medium">サイズ:</span>
                  <p className="text-gray-600">{formatFileSize(fileInfo.size)}</p>
                </div>
                <div>
                  <span className="font-medium">行数:</span>
                  <p className="text-gray-600">{fileInfo.rowCount}行</p>
                </div>
                <div>
                  <span className="font-medium">列数:</span>
                  <p className="text-gray-600">{fileInfo.columnCount}列</p>
                </div>
              </div>

              {fileInfo.sheets.length > 1 && (
                <div>
                  <span className="font-medium">シート:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {fileInfo.sheets.map((sheet) => (
                      <Badge key={sheet} variant="outline">
                        {sheet}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* プレビューデータ */}
        {previewData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">データプレビュー</CardTitle>
              <CardDescription>読み込まれたデータの最初の5行</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">商品名</th>
                      <th className="border border-gray-300 p-2 text-right">前年</th>
                      <th className="border border-gray-300 p-2 text-right">予定</th>
                      <th className="border border-gray-300 p-2 text-right">実績</th>
                      <th className="border border-gray-300 p-2 text-right">前年比</th>
                      <th className="border border-gray-300 p-2 text-right">達成率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{item.product}</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {item.lastYear ? item.lastYear.toLocaleString() : "-"}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">{item.target.toLocaleString()}</td>
                        <td className="border border-gray-300 p-2 text-right">{item.actual.toLocaleString()}</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {item.yoyGrowth !== 0 ? `${item.yoyGrowth > 0 ? "+" : ""}${item.yoyGrowth}%` : "-"}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {item.achievementRate !== 0 ? `${item.achievementRate}%` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ステータス表示 */}
        {importStatus === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              データが正常に読み込まれました。{previewData.length}件のデータが処理されました。
            </AlertDescription>
          </Alert>
        )}

        {importStatus === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-2">エラーが発生しました:</div>
              <div className="whitespace-pre-wrap text-sm">{errorMessage}</div>
              <div className="mt-2 text-sm">
                <strong>対処方法:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Google Sheetsの場合、「リンクを知っている全員」に共有設定してください</li>
                  <li>URLが正しく、アクセス可能であることを確認してください</li>
                  <li>列名が「商品名」「商品」「product」などになっているか確認してください</li>
                  <li>サンプルファイルをダウンロードして形式を参考にしてください</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
