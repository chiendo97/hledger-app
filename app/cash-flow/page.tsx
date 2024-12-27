'use client'

import { useState } from 'react'
import { NestedLevelSelector } from '@/components/NestedLevelSelector'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Dummy data
const cashFlowData = {
  startDate: '2024-01-01',
  endDate: '2024-12-26',
  cashFlows: [
    { name: 'asset:vietinbank:checking', amount: 86259744, currency: 'vnd' },
    { name: 'asset:cash:wallet', amount: 5000000, currency: 'vnd' },
    { name: 'asset:momo:e-wallet', amount: 2000000, currency: 'vnd' },
    { name: 'asset:dbs:savings', amount: 5000, currency: 'sgd' },
    { name: 'asset:cash:usd', amount: 1000, currency: 'usd' },
  ],
}

function groupAndSortByAmount(items: any[], level: number) {
  const grouped = items.reduce((acc, item) => {
    const parts = item.name.split(':').slice(0, level)
    const key = parts.join(':')
    if (!acc[key]) {
      acc[key] = { ...item, name: key, children: [] }
    }
    if (parts.length < item.name.split(':').length) {
      acc[key].children.push(item)
    }
    return acc
  }, {})

  return Object.values(grouped).sort((a: any, b: any) => b.amount - a.amount)
}

function groupByCurrency(items: any[]) {
  return items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = []
    }
    acc[item.currency].push(item)
    return acc
  }, {})
}

export default function CashFlow() {
  const [data, setData] = useState(cashFlowData)
  const [nestedLevel, setNestedLevel] = useState(2)

  const handleLevelChange = (level: number) => {
    setNestedLevel(level)
  }

  const renderItems = (items: any[], level: number) => {
    const groupedItems = groupByCurrency(groupAndSortByAmount(items, level))

    return Object.entries(groupedItems).map(([currency, currencyItems]: [string, any]) => (
      <div key={currency} className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{currency.toUpperCase()}</h3>
        <ul className="space-y-2">
          {currencyItems.map((item: any, index: number) => (
            <li key={index} className="flex justify-between items-center">
              <span>{item.name}</span>
              <span>{item.amount.toLocaleString()} {item.currency.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </div>
    ))
  }

  const totalCashFlow = Object.entries(groupByCurrency(data.cashFlows)).map(([currency, items]: [string, any]) => ({
    currency,
    total: items.reduce((sum: number, item: any) => sum + item.amount, 0)
  }))

  const chartData = groupAndSortByAmount(data.cashFlows, nestedLevel).map((item: any) => ({
    name: item.name.split(':').pop(),
    amount: item.amount,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
      <NestedLevelSelector onLevelChange={handleLevelChange} />
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium leading-6 text-foreground">
            Cash Flow Statement from {data.startDate} to {data.endDate}
          </h2>
        </div>
        <div className="border-t border-muted-foreground/20">
          <dl>
            <div className="bg-muted/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Cash Flows</dt>
              <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                {renderItems(data.cashFlows, nestedLevel)}
              </dd>
            </div>
            <div className="bg-background px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Total Cash Flow</dt>
              <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                {totalCashFlow.map((cf, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{cf.currency.toUpperCase()}</span>
                    <span>{cf.total.toLocaleString()} {cf.currency.toUpperCase()}</span>
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden p-6">
        <h3 className="text-lg font-medium leading-6 text-foreground mb-4">Cash Flow Visualization</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

