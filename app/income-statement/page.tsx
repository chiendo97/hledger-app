'use client'

import { useState, useMemo, useEffect } from 'react'
import { NestedLevelSelector } from '@/components/NestedLevelSelector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Expense, IncomeStatementData, Revenue } from '../interfaces'
import { fetchIncomeStatement } from '../apis'

const currentYear = new Date().getFullYear()
const currentMonth = new Date().toISOString().slice(0, 7)

function sortByAmountAndCurrency(items: {
  amount: number;
  children: Expense[] | Revenue[];
  name: string;
  currency: string;
}[]) {
  return items.sort((a, b) => {
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency)
    }
    return b.amount - a.amount
  })
}

function groupByNestedLevel(items: Expense[] | Revenue[], level: number) {
  return items.reduce((acc, item) => {
    const key = item.name.split(':').slice(0, level).join(':')
    if (!acc[key]) {
      acc[key] = { ...item, children: [], amount: 0, name: key }
    }
    acc[key].amount += item.amount
    if (item.name.split(':').length > level) {
      acc[key].children.push(item)
    }
    return acc
  }, {} as {
    [key: string]: {
      amount: number;
      children: Expense[] | Revenue[];
      name: string;
      currency: string;
    }
  })
}

export default function IncomeStatement() {
  const [data, setData] = useState<IncomeStatementData>({
    startDate: ``,
    endDate: ``,
    revenues: [],
    expenses: [],
  })
  const [nestedLevel, setNestedLevel] = useState(2)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  useEffect(() => {
    fetchIncomeStatement().then(setData)
  }, [])

  const handleLevelChange = (level: number) => {
    setNestedLevel(level)
  }

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year)
    setSelectedYear(newYear)
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const filteredData = useMemo(() => {
    if (selectedMonth === 'total') {
      return data
    }
    return {
      ...data,
      revenues: data.revenues.filter(item => item.date.startsWith(selectedMonth)),
      expenses: data.expenses.filter(item => item.date.startsWith(selectedMonth)),
    }
  }, [data, selectedMonth])

  const renderItems = (items: Expense[] | Revenue[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level)
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems))

    return sortedItems.map((item, index: number) => (
      <tr key={index} className="border-b border-muted-foreground/20">
        <td className="px-4 py-2 text-left">{item.name}</td>
        <td className="px-4 py-2 text-right">{item.amount.toLocaleString()} {item.currency}</td>
      </tr>
    ))
  }

  const totalRevenues = useMemo(() => filteredData.revenues.reduce((sum, item) => sum + item.amount, 0), [filteredData]);
  const totalExpenses = useMemo(() => filteredData.expenses.reduce((sum, item) => sum + item.amount, 0), [filteredData]);

  const netIncome = totalRevenues - totalExpenses

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Income Statement</h1>
      <div className="flex flex-wrap gap-4">
        <NestedLevelSelector onLevelChange={handleLevelChange} />
        <Select onValueChange={handleYearChange} defaultValue={selectedYear.toString()}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleMonthChange} defaultValue={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(selectedYear, i, 15)
              const monthStr = date.toISOString().slice(0, 7)
              return (
                <SelectItem key={monthStr} value={monthStr}>
                  {date.toLocaleString('default', { month: 'long' })}
                </SelectItem>
              )
            }).reverse()}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted-foreground/20">
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-muted-foreground/20 bg-muted/50">
              <td colSpan={2} className="px-4 py-2 font-bold">Revenues</td>
            </tr>
            {renderItems(filteredData.revenues, nestedLevel)}
            <tr className="border-b border-muted-foreground/20 font-bold">
              <td className="px-4 py-2 text-right">Total Revenues:</td>
              <td className="px-4 py-2 text-right">{totalRevenues.toLocaleString()} vnd</td>
            </tr>
            <tr className="border-b border-muted-foreground/20 bg-muted/50">
              <td colSpan={2} className="px-4 py-2 font-bold">Expenses</td>
            </tr>
            {renderItems(filteredData.expenses, nestedLevel)}
            <tr className="border-b border-muted-foreground/20 font-bold">
              <td className="px-4 py-2 text-right">Total Expenses:</td>
              <td className="px-4 py-2 text-right">{totalExpenses.toLocaleString()} vnd</td>
            </tr>
            <tr className="bg-muted/50 font-bold">
              <td className="px-4 py-2 text-right">Net Income:</td>
              <td className="px-4 py-2 text-right">{netIncome.toLocaleString()} vnd</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

