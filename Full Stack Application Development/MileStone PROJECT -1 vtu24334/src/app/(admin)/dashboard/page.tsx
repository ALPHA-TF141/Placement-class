
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Sparkles,
  RefreshCw,
  Plus
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { suggestOptimalReorderQuantities, SuggestOptimalReorderQuantitiesOutput } from "@/ai/flows/suggest-optimal-reorder-quantities-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const { products, transactions } = useStore()
  
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<SuggestOptimalReorderQuantitiesOutput>([])
  const [isMounted, setIsMounted] = useState(false)

  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.quantity <= (p.safetyStock || 0))
  const recentTransactions = transactions.slice(0, 10)

  const runAiAnalysis = async () => {
    if (products.length === 0) return;
    setIsAiLoading(true)
    try {
      const input = products.map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.quantity,
        averageDailySales: p.averageDailySales || 0,
        leadTimeDays: p.leadTimeDays || 0,
        safetyStock: p.safetyStock || 0
      }))
      const result = await suggestOptimalReorderQuantities(input)
      setAiSuggestions(result.filter(s => s.suggestedReorderQuantity > 0))
    } catch (err) {
      console.error("AI Analysis failed:", err)
    } finally {
      setIsAiLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    if (products.length > 0) {
      runAiAnalysis()
    }
  }, [products.length])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
        <p className="text-muted-foreground">Monitor your stock levels in real-time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
          onClick={() => router.push('/products')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active catalog items</p>
          </CardContent>
        </Card>
        
        <Card 
          className="hover:shadow-md transition-all cursor-pointer hover:border-destructive/50 group"
          onClick={() => router.push('/products')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Items requiring attention</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-all cursor-pointer hover:border-accent/50 group"
          onClick={() => router.push('/transactions')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Recent movements</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-all cursor-pointer bg-primary text-primary-foreground group"
          onClick={() => router.push('/dashboard')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-primary-foreground/70">Based on projections</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI Reorder Suggestions</CardTitle>
              <CardDescription>Intelligent demand forecasting for low-stock items.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={runAiAnalysis} disabled={isAiLoading || products.length === 0}>
              <RefreshCw className={`h-4 w-4 ${isAiLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isAiLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : aiSuggestions.length > 0 ? (
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion.productId} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group"
                    onClick={() => router.push('/products')}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{suggestion.productName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.reasoning}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">Level: {suggestion.reorderLevel}</Badge>
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-[10px]">Suggest: +{suggestion.suggestedReorderQuantity}</Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/transactions');
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Reorder
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground bg-accent/5 rounded-lg border border-dashed">
                <Sparkles className="h-10 w-10 mb-2 opacity-20" />
                <p>All stock levels are optimal</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest inventory movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center gap-4 hover:bg-accent/5 p-2 rounded-md transition-colors cursor-pointer group"
                      onClick={() => router.push('/transactions')}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                        tx.type === 'purchase' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {tx.type === 'purchase' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{tx.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.type === 'purchase' ? 'Restocked' : 'Sold'} {tx.quantity} units
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isMounted && tx.date ? new Date(tx.date).toLocaleDateString() : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-10">No recent transactions recorded.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
