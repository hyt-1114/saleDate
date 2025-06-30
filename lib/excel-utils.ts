import * as XLSX from "xlsx"

export interface ExcelData {
  [key: string]: any
}

export interface ParsedData {
  headers: string[]
  data: ExcelData[]
  sheetNames: string[]
}

// Excelファイルを読み込む
export const readExcelFile = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        const sheetNames = workbook.SheetNames
        if (sheetNames.length === 0) {
          reject(new Error("Excelファイルにシートが見つかりません"))
          return
        }

        // 最初のシートを読み込み
        const worksheet = workbook.Sheets[sheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length === 0) {
          reject(new Error("データが見つかりません"))
          return
        }

        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1)

        const excelData: ExcelData[] = rows.map((row) => {
          const obj: ExcelData = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ""
          })
          return obj
        })

        resolve({
          headers,
          data: excelData,
          sheetNames,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"))
    reader.readAsArrayBuffer(file)
  })
}

// CSVファイルを読み込む
export const readCSVFile = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length === 0) {
          reject(new Error("CSVファイルが空です"))
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim().replace(/"/g, "")))

        const csvData: ExcelData[] = rows.map((row) => {
          const obj: ExcelData = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ""
          })
          return obj
        })

        resolve({
          headers,
          data: csvData,
          sheetNames: ["CSV"],
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"))
    reader.readAsText(file, "UTF-8")
  })
}

// データの検証
export const validateSalesData = (data: ExcelData[]): boolean => {
  if (!data || data.length === 0) return false

  // 必要な列があるかチェック
  const firstRow = data[0]
  const keys = Object.keys(firstRow)

  const hasProductColumn = keys.some(
    (key) =>
      key.toLowerCase().includes("商品") || key.toLowerCase().includes("product") || key.toLowerCase().includes("name"),
  )

  const hasNumericColumn = keys.some(
    (key) =>
      key.toLowerCase().includes("売上") ||
      key.toLowerCase().includes("実績") ||
      key.toLowerCase().includes("予定") ||
      key.toLowerCase().includes("target") ||
      key.toLowerCase().includes("actual"),
  )

  return hasProductColumn && hasNumericColumn
}

// サンプルExcelファイルを生成
export const generateSampleExcel = () => {
  const sampleData = [
    ["主力商品名", "前年", "予定", "実績"],
    ["バターフィナンシェ4入り", 2454, 1820, 1726],
    ["バターフィナンシェ8入り", "", 2800, 2346],
    ["バターフィナンシェ12入り", 1539, 1260, 1317],
    ["バターフィナンシェ16入り", 1060, 980, 1180],
    ["バターカレット9入り", 344, 140, 123],
    ["アソート(カステラ)", "", 1400, 1433],
    ["セレ16(14)", 1277, 1400, 1245],
    ["バターキャラメルポット", 497, 140, 150],
    ["バターバイヤモンド(ショコラ)", 936, 980, 1138],
    ["抹茶フィナンシェ", 1468, 1400, 871],
    ["レモンケーキ", 798, 1680, 1575],
  ]

  const ws = XLSX.utils.aoa_to_sheet(sampleData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "売上データ")

  return wb
}
