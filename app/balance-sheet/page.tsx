'use client'

import { useEffect, useState } from 'react'
import { NestedLevelSelector } from '@/components/NestedLevelSelector'
import { BalanceSheetData } from '../interfaces'
import { fetchBalanceSheet } from '../apis'

// Dummy data
const balanceSheetData = {
  date: '2024-12-26',
  assets: [],
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
  const [data, setData] = useState<BalanceSheetData>(balanceSheetData)
  const [nestedLevel, setNestedLevel] = useState(2)

  useEffect(() => {
    fetchBalanceSheet(nestedLevel).then((data) => {
      setData(data)
    })
  }, [nestedLevel])

  const handleLevelChange = (level: number) => {
    setNestedLevel(level)
  }

  const renderItems = (items: any[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level)
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems))

    return sortedItems.map((item: any, index: number) => (
      <tr key={index} className="border-b border-muted-foreground/20">
        <td className="px-4 py-2 text-left">{item.name}</td>
        <td className="px-4 py-2 text-right text-green-500">{item.amount.toLocaleString()} {item.currency}</td>
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
            {data.assets.length !== 0 && <tr className="border-b border-muted-foreground/20">
              <td className="px-4 py-2 text-right font-bold">Total Assets:</td>
              <td className="px-4 py-2 text-right">{netWorth}</td>
            </tr>}
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
            {data.liabilities.length !== 0 &&
              <tr className="border-b border-muted-foreground/20">
                <td className="px-4 py-2 text-right font-bold">Total Liabilities:</td>
                <td className="px-4 py-2 text-right">0</td>
              </tr>
            }
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

