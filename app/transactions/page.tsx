'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Dummy data
const transactionsData = [
  {
    date: '2024-12-26',
    id: '436112436643',
    description: 'tran_id:126S24C17GBCU52B',
    amount: 423200,
    currency: 'vnd',
    category: 'expense:family:meo',
    account: 'asset:vietinbank:checking',
  },
  {
    date: '2024-12-26',
    id: '126k24c17vj7uycg',
    description: 'Le tien chien chuyen tien hoa qua cho meo',
    amount: 292000,
    currency: 'vnd',
    category: 'expense:family:meo',
    account: 'asset:vietinbank:checking',
  },
  {
    date: '2024-12-25',
    id: '126j24c17vj7uyca',
    description: 'Salary payment',
    amount: 10000000,
    currency: 'vnd',
    category: 'income:salary',
    account: 'asset:vietinbank:checking',
  },
  // Add more transactions here...
]

function sortByAmountAndCurrency(items: any[]) {
  return items.sort((a, b) => {
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency)
    }
    return b.amount - a.amount
  })
}

export default function Transactions() {
  const [transactions, setTransactions] = useState(transactionsData)
  const [filteredTransactions, setFilteredTransactions] = useState(transactionsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterTransactions(query, categoryFilter)
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    filterTransactions(searchQuery, category)
  }

  const filterTransactions = (query: string, category: string) => {
    const filtered = transactions.filter(transaction =>
      (transaction.description.toLowerCase().includes(query.toLowerCase()) ||
       transaction.category.toLowerCase().includes(query.toLowerCase())) &&
      (category === '' || transaction.category.toLowerCase().includes(category.toLowerCase()))
    )
    setFilteredTransactions(filtered)
  }

  const sortedTransactions = sortByAmountAndCurrency(filteredTransactions)

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

