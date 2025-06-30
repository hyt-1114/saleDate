"use client"

interface SummaryData {
  currentYear: {
    sales: number
    customers: number
    avgSpend: number
  }
  lastYear: {
    sales: number
    customers: number
    avgSpend: number
  }
  difference: {
    sales: number
    customers: number
    avgSpend: number
  }
  ratio: {
    sales: number
    customers: number
    avgSpend: number
  }
}

interface SalesSummaryTableProps {
  data: SummaryData
}

export default function SalesSummaryTable({ data }: SalesSummaryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP").format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left font-medium">項目</th>
            <th className="border border-gray-300 px-4 py-2 text-right font-medium">売上（点数）</th>
            <th className="border border-gray-300 px-4 py-2 text-right font-medium">客数</th>
            <th className="border border-gray-300 px-4 py-2 text-right font-medium">客単価</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">本年度</td>
            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(data.currentYear.sales)}</td>
            <td className="border border-gray-300 px-4 py-2 text-right">
              {formatCurrency(data.currentYear.customers)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(data.currentYear.avgSpend)}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">前年度</td>
            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(data.lastYear.sales)}</td>
            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(data.lastYear.customers)}</td>
            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(data.lastYear.avgSpend)}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">差</td>
            <td className={`border border-gray-300 px-4 py-2 text-right ${getChangeColor(data.difference.sales)}`}>
              {data.difference.sales >= 0 ? "+" : ""}
              {formatCurrency(data.difference.sales)}
            </td>
            <td className={`border border-gray-300 px-4 py-2 text-right ${getChangeColor(data.difference.customers)}`}>
              {data.difference.customers >= 0 ? "+" : ""}
              {formatCurrency(data.difference.customers)}
            </td>
            <td className={`border border-gray-300 px-4 py-2 text-right ${getChangeColor(data.difference.avgSpend)}`}>
              {data.difference.avgSpend >= 0 ? "+" : ""}
              {formatCurrency(data.difference.avgSpend)}
            </td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2 font-medium">前年比</td>
            <td
              className={`border border-gray-300 px-4 py-2 text-right font-medium ${getChangeColor(data.ratio.sales - 100)}`}
            >
              {formatPercentage(data.ratio.sales)}
            </td>
            <td
              className={`border border-gray-300 px-4 py-2 text-right font-medium ${getChangeColor(data.ratio.customers - 100)}`}
            >
              {formatPercentage(data.ratio.customers)}
            </td>
            <td
              className={`border border-gray-300 px-4 py-2 text-right font-medium ${getChangeColor(data.ratio.avgSpend - 100)}`}
            >
              {formatPercentage(data.ratio.avgSpend)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
