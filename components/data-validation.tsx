"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  info: string[]
  dataQuality: {
    totalRows: number
    validRows: number
    missingValues: number
    duplicates: number
  }
}

interface DataValidationProps {
  data: any[]
  onValidationComplete: (result: ValidationResult) => void
}

export default function DataValidation({ data, onValidationComplete }: DataValidationProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const validateData = () => {
    const errors: string[] = []
    const warnings: string[] = []
    const info: string[] = []

    // データの基本チェック
    if (!data || data.length === 0) {
      errors.push("データが見つかりません")
      return {
        isValid: false,
        errors,
        warnings,
        info,
        dataQuality: { totalRows: 0, validRows: 0, missingValues: 0, duplicates: 0 },
      }
    }

    let validRows = 0
    let missingValues = 0
    const productNames = new Set()
    let duplicates = 0

    // 各行をチェック
    data.forEach((row, index) => {
      let isRowValid = true

      // 商品名のチェック
      if (!row.product || row.product.trim() === "") {
        errors.push(`行 ${index + 1}: 商品名が空です`)
        isRowValid = false
      } else {
        if (productNames.has(row.product)) {
          duplicates++
          warnings.push(`重複する商品名: ${row.product}`)
        }
        productNames.add(row.product)
      }

      // 数値データのチェック
      if (row.target === undefined || row.target === null) {
        missingValues++
        warnings.push(`行 ${index + 1}: 予定売上が未入力`)
      }

      if (row.actual === undefined || row.actual === null) {
        missingValues++
        warnings.push(`行 ${index + 1}: 実績売上が未入力`)
      }

      // 負の値のチェック
      if (row.target < 0 || row.actual < 0) {
        warnings.push(`行 ${index + 1}: 負の値が含まれています`)
      }

      if (isRowValid) validRows++
    })

    // データ品質の評価
    const qualityScore = (validRows / data.length) * 100
    if (qualityScore < 80) {
      warnings.push(`データ品質スコア: ${qualityScore.toFixed(1)}% (80%未満)`)
    } else {
      info.push(`データ品質スコア: ${qualityScore.toFixed(1)}%`)
    }

    // 前年データの有無をチェック
    const hasLastYearData = data.some((row) => row.lastYear && row.lastYear > 0)
    if (!hasLastYearData) {
      info.push("前年データが含まれていません。前年比は計算されません。")
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      dataQuality: {
        totalRows: data.length,
        validRows,
        missingValues,
        duplicates,
      },
    }

    setValidationResult(result)
    onValidationComplete(result)
  }

  // コンポーネントマウント時に検証実行
  useState(() => {
    if (data && data.length > 0) {
      validateData()
    }
  })

  if (!validationResult) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validationResult.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          データ検証結果
        </CardTitle>
        <CardDescription>インポートされたデータの品質と整合性をチェックしました</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* データ品質サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{validationResult.dataQuality.totalRows}</div>
            <div className="text-sm text-gray-600">総行数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{validationResult.dataQuality.validRows}</div>
            <div className="text-sm text-gray-600">有効行数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{validationResult.dataQuality.missingValues}</div>
            <div className="text-sm text-gray-600">欠損値</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{validationResult.dataQuality.duplicates}</div>
            <div className="text-sm text-gray-600">重複</div>
          </div>
        </div>

        {/* エラー */}
        {validationResult.errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="font-medium text-red-800 mb-2">エラーが見つかりました:</div>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 警告 */}
        {validationResult.warnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="font-medium text-yellow-800 mb-2">警告:</div>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                {validationResult.warnings.slice(0, 5).map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning}
                  </li>
                ))}
                {validationResult.warnings.length > 5 && (
                  <li className="text-sm">...他 {validationResult.warnings.length - 5} 件</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 情報 */}
        {validationResult.info.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="font-medium text-blue-800 mb-2">情報:</div>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                {validationResult.info.map((info, index) => (
                  <li key={index} className="text-sm">
                    {info}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* ステータスバッジ */}
        <div className="flex gap-2">
          <Badge variant={validationResult.isValid ? "default" : "destructive"}>
            {validationResult.isValid ? "検証成功" : "検証失敗"}
          </Badge>
          {validationResult.warnings.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {validationResult.warnings.length} 件の警告
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
