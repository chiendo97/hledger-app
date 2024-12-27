'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchTransactions } from '../apis'
import { TransactionData } from '../interfaces'

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchTransactions().then(transactions => {
      setTransactions(transactions.reverse().sort((t1, t2) => t2.id - t1.id).slice(0, 10))
    })
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
  }

  const sortedTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction =>
      (transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === '' || transaction.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    )
    return filtered
  }, [searchQuery, categoryFilter, transactions])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-1/2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/2">
          <Label htmlFor="category">Filter by Category</Label>
          <Input
            id="category"
            type="text"
            placeholder="Enter category..."
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          />
        </div>
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
                  <td className="px-4 py-2 text-right">
                    {transaction.amount.toLocaleString()} {transaction.currency.toUpperCase()}
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

