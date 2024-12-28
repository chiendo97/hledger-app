'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchTransactions } from '../apis'
import { TransactionData } from '../interfaces'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const currentYear = new Date().getFullYear()
const currentMonth = new Date().toISOString().slice(0, 7)

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  useEffect(() => {
    fetchTransactions().then(transactions => {
      setTransactions(transactions.reverse().sort((t1, t2) => {
        if (t1.date === t2.date) {
          return t2.index - t1.index
        }
        return t2.date.localeCompare(t1.date)
      }))
    })
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const sortedTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (searchQuery !== '' && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (categoryFilter !== '' && !transaction.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      if (selectedMonth !== 'total' && !transaction.date.startsWith(selectedMonth)) {
        return false;
      }
      return true;
    }).slice(0, 200)
  }, [searchQuery, categoryFilter, transactions, selectedMonth])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <div className="flex flex-wrap gap-4">
        <Input
          className="w-[180px]"
          id="search"
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Input
          className="w-[180px]"
          id="category"
          type="text"
          placeholder="Enter category..."
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        />
        <Select onValueChange={handleMonthChange} defaultValue={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(currentYear, i, 15)
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Account</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-muted-foreground/20">
                  <td className="px-4 py-2">{transaction.date}</td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className={`px-4 py-2 text-right ${transaction.amount < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </td>
                  <td className="px-4 py-2">{transaction.category}</td>
                  <td className="px-4 py-2">{transaction.account}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

