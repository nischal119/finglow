export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
  categoryName?: string
  categoryColor?: string
}

export interface Category {
  id: string
  name: string
  color: string
}
