'use client'

import { useState } from 'react'
import { NestedLevelSelector } from '@/components/NestedLevelSelector'

// Dummy data
const balanceSheetData = {
  date: '2024-12-26',
  assets: [
    { name: 'asset:dbs:asdf', amount: 2630, currency: 'sgd' },
    { name: 'asset:apartment:tecco', amount: 1900000000, currency: 'vnd' },
    { name: 'asset:vietinbank:saving2', amount: 190000058, currency: 'vnd' },
    { name: 'asset:vietinbank:saving3', amount: 150000000, currency: 'vnd' },
    { name: 'asset:family:dad', amount: 100000000, currency: 'vnd' },
    { name: 'asset:vietinbank:checking', amount: 86259744, currency: 'vnd' },
    { name: 'asset:family:brother', amount: 50000000, currency: 'vnd' },
    { name: 'asset:vietinbank:card', amount: 35893655, currency: 'vnd' },
    { name: 'asset:vietinbank:credit', amount: -250464, currency: 'vnd' },
  ],
  liabilities: [],
}

function sortByAmountAndCurrency(items: any[]) {
  return items.sort((a, b) => {
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency)
    }
    return b.amount - a.amount
  })
}

function groupByNestedLevel(items: any[], level: number) {
  return items.reduce((acc, item) => {
    const key = item.name.split(':').slice(0, level).join(':')
    if (!acc[key]) {
      acc[key] = { ...item, children: [] }
    } else {
      acc[key].amount += item.amount
    }
    if (item.name.split(':').length > level) {
      acc[key].children.push(item)
    }
    return acc
  }, {})
}

export default function BalanceSheet() {
  const [data, setData] = useState(balanceSheetData)
  const [nestedLevel, setNestedLevel] = useState(2)

  const handleLevelChange = (level: number) => {
    setNestedLevel(level)
  }

  const renderItems = (items: any[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level)
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems))

    return sortedItems.map((item: any, index: number) => (
      <tr key={index} className="border-b border-muted-foreground/20">
        <td className="px-4 py-2 text-left">{item.name}</td>
        <td className="px-4 py-2 text-right">{item.amount.toLocaleString()} {item.currency}</td>
      </tr>
    ))
  }

  const totalAssets = data.assets.reduce((acc, asset) => {
    if (!acc[asset.currency]) {
      acc[asset.currency] = 0
    }
    acc[asset.currency] += asset.amount
    return acc
  }, {} as Record<string, number>)

  const netWorth = Object.entries(totalAssets).map(([currency, amount]) => (
    `${amount.toLocaleString()} ${currency}`
  )).join(', ')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Balance Sheet</h1>
      <NestedLevelSelector onLevelChange={handleLevelChange} />
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted-foreground/20">
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-right">{data.date}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-muted-foreground/20 bg-muted/50">
              <td colSpan={2} className="px-4 py-2 font-bold">Assets</td>
            </tr>
            {renderItems(data.assets, nestedLevel)}
            <tr className="border-b border-muted-foreground/20">
              <td className="px-4 py-2 text-right font-bold">Total Assets:</td>
              <td className="px-4 py-2 text-right">{netWorth}</td>
            </tr>
            <tr className="border-b border-muted-foreground/20 bg-muted/50">
              <td colSpan={2} className="px-4 py-2 font-bold">Liabilities</td>
            </tr>
            {data.liabilities.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-2 text-center">No liabilities</td>
              </tr>
            ) : (
              renderItems(data.liabilities, nestedLevel)
            )}
            <tr className="border-b border-muted-foreground/20">
              <td className="px-4 py-2 text-right font-bold">Total Liabilities:</td>
              <td className="px-4 py-2 text-right">0</td>
            </tr>
            <tr className="bg-muted/50">
              <td className="px-4 py-2 text-right font-bold">Net Worth:</td>
              <td className="px-4 py-2 text-right">{netWorth}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

