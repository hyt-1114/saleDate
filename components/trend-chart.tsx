"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { MonthlyTrendData } from "@/lib/data-service"

interface TrendChartProps {
  data: MonthlyTrendData[]
}

export default function TrendChart({ data }: TrendChartProps) {
  const maxValue = Math.max(...data.flatMap((item) => [item.actual, item.target]))
  const minValue = Math.min(...data.flatMap((item) => [item.actual, item.target]))
  const range = maxValue - minValue
  const padding = range * 0.05 // 5%のパディングに縮小
  const adjustedMin = minValue - padding
  const adjustedMax = maxValue + padding
  const adjustedRange = adjustedMax - adjustedMin

  return (
    <Card>
      <CardHeader>
        <CardTitle>月別売上推移</CardTitle>
        <CardDescription>実績と目標の推移比較</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full p-4">
          <div className="h-full flex flex-col">
            {/* Y軸ラベル */}
            <div className="flex justify-between text-xs text-gray-500 mb-2 h-4">
              <span></span>
              <span>{(adjustedMax / 1000).toFixed(0)}千円</span>
            </div>

            {/* グラフエリア */}
            <div className="flex-1 relative bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm">
              {/* グリッド線 */}
              <div className="absolute inset-0 p-4">
                {/* 水平グリッド線 */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                  <div
                    key={ratio}
                    className="absolute w-full border-t border-gray-200 border-dashed"
                    style={{ top: `${ratio * 100}%` }}
                  />
                ))}
              </div>

              {/* SVG折れ線グラフ */}
              <div className="absolute inset-4">
                <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  {/* エリア塗りつぶし（実績） */}
                  <defs>
                    <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* 実績エリア */}
                  <path
                    fill="url(#actualGradient)"
                    d={`M 0,400 ${data
                      .map((item, index) => {
                        const x = (index / (data.length - 1)) * 1000
                        const y = 400 - ((item.actual - adjustedMin) / adjustedRange) * 400
                        return `L ${x},${y}`
                      })
                      .join(" ")} L 1000,400 Z`}
                  />

                  {/* 実績ライン */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={data
                      .map((item, index) => {
                        const x = (index / (data.length - 1)) * 1000
                        const y = 400 - ((item.actual - adjustedMin) / adjustedRange) * 400
                        return `${x},${y}`
                      })
                      .join(" ")}
                    className="drop-shadow-sm"
                  />

                  {/* 目標ライン */}
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={data
                      .map((item, index) => {
                        const x = (index / (data.length - 1)) * 1000
                        const y = 400 - ((item.target - adjustedMin) / adjustedRange) * 400
                        return `${x},${y}`
                      })
                      .join(" ")}
                    className="drop-shadow-sm"
                  />

                  {/* 実績データポイント */}
                  {data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 1000
                    const y = 400 - ((item.actual - adjustedMin) / adjustedRange) * 400
                    return (
                      <g key={`actual-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="white"
                          stroke="#2563eb"
                          strokeWidth="3"
                          className="drop-shadow-sm"
                        />
                        <circle cx={x} cy={y} r="3" fill="#2563eb" />
                      </g>
                    )
                  })}

                  {/* 目標データポイント */}
                  {data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 1000
                    const y = 400 - ((item.target - adjustedMin) / adjustedRange) * 400
                    return (
                      <g key={`target-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="white"
                          stroke="#dc2626"
                          strokeWidth="2.5"
                          className="drop-shadow-sm"
                        />
                        <circle cx={x} cy={y} r="2.5" fill="#dc2626" />
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* ホバー情報表示エリア */}
              <div className="absolute inset-4 flex">
                {data.map((item, index) => (
                  <div key={index} className="flex-1 h-full relative group cursor-pointer">
                    {/* ホバー時の縦線 */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 opacity-0 group-hover:opacity-50 transition-opacity"></div>

                    {/* ツールチップ */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                      <div className="font-bold text-center mb-2 text-yellow-300">{item.month}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>実績: {(item.actual / 1000).toFixed(0)}千円</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>目標: {(item.target / 1000).toFixed(0)}千円</span>
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-1">
                          <div className="text-center">
                            <span
                              className={`font-semibold ${item.actual >= item.target ? "text-green-400" : "text-red-400"}`}
                            >
                              差: {item.actual >= item.target ? "+" : ""}
                              {((item.actual - item.target) / 1000).toFixed(0)}千円
                            </span>
                          </div>
                          <div className="text-center text-xs text-gray-300">
                            達成率: {((item.actual / item.target) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      {/* ツールチップの矢印 */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* X軸ラベル */}
            <div className="flex justify-between text-sm text-gray-700 mt-3 px-4">
              {data.map((item, index) => (
                <span key={index} className="font-medium">
                  {item.month}
                </span>
              ))}
            </div>

            {/* Y軸の値表示 */}
            <div className="absolute left-0 top-16 bottom-16 flex flex-col justify-between text-xs text-gray-500 w-12">
              <span className="text-right">{(adjustedMax / 1000).toFixed(0)}千</span>
              <span className="text-right">{((adjustedMax + adjustedMin) / 2 / 1000).toFixed(0)}千</span>
              <span className="text-right">{(adjustedMin / 1000).toFixed(0)}千</span>
            </div>

            {/* 凡例 */}
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full -ml-1.5 border-2 border-white shadow-sm"></div>
                </div>
                <span className="font-medium text-gray-700">実績売上</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-1 bg-red-600 border-dashed border-t-2 border-red-600"></div>
                  <div className="w-3 h-3 bg-red-600 rounded-full -ml-1.5 border-2 border-white shadow-sm"></div>
                </div>
                <span className="font-medium text-gray-700">目標売上</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <TrendingUp className="h-4 w-4" />
          年間売上推移の分析
        </div>
        <p className="text-sm text-gray-500 mt-1">月別の実績と目標の推移を詳細比較</p>
      </div>
    </Card>
  )
}
