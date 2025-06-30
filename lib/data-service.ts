import mockData from "../data/mock-data.json"

export interface SalesData {
  product: string
  lastYear: number
  target: number
  actual: number
  yoyGrowth: number
  achievementRate: number
}

export interface SummaryData {
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

export interface MonthlyTrendData {
  month: string
  actual: number
  target: number
}

export interface DashboardData {
  salesData: SalesData[]
  summaryData: SummaryData
  monthlyTrend: MonthlyTrendData[]
}

// データを取得する関数（将来的にはAPIから取得）
export const getDashboardData = async (): Promise<DashboardData> => {
  // 本番環境では、ここでAPIからデータを取得
  // const response = await fetch('/api/dashboard-data')
  // return response.json()

  // 現在はモックデータを返す
  return mockData as DashboardData
}

// 集計データを計算する関数
export const calculateTotals = (salesData: SalesData[]) => {
  return salesData.reduce(
    (acc, item) => ({
      lastYear: acc.lastYear + (item.lastYear || 0),
      target: acc.target + item.target,
      actual: acc.actual + item.actual,
    }),
    { lastYear: 0, target: 0, actual: 0 },
  )
}

// 前年比成長率を計算する関数
export const calculateYoyGrowth = (actual: number, lastYear: number): number => {
  return lastYear > 0 ? ((actual - lastYear) / lastYear) * 100 : 0
}

// 目標達成率を計算する関数
export const calculateAchievementRate = (actual: number, target: number): number => {
  return target > 0 ? (actual / target) * 100 : 0
}
