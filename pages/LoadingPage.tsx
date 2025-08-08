import React from 'react'
import { Card, CardContent } from '../components/ui/card'

export const LoadingPage: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-lg font-medium">Connecting to Dropbox</h2>
        <p className="text-sm text-muted-foreground">Checking your connection...</p>
      </CardContent>
    </Card>
  </div>
)

