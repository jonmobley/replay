import React, { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { useDebounce } from '../hooks/useDebounce'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: {
    fileTypes: string[]
    selectedTypes: string[]
  }
  onFilterChange: (selectedTypes: string[]) => void
  resultCount: number
  totalCount: number
}

export function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  resultCount, 
  totalCount 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    onSearchChange(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearchChange])

  const clearSearch = () => {
    setSearchTerm('')
  }

  const toggleFileType = (fileType: string) => {
    const newSelected = filters.selectedTypes.includes(fileType)
      ? filters.selectedTypes.filter(type => type !== fileType)
      : [...filters.selectedTypes, fileType]
    onFilterChange(newSelected)
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  const hasActiveFilters = filters.selectedTypes.length > 0
  const hasActiveSearch = searchTerm.length > 0

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks, artists, albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20"
        />
        {hasActiveSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <Filter className={`h-3 w-3 ${hasActiveFilters ? 'text-blue-600' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm">File Types</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {filters.fileTypes.map(fileType => (
                  <div key={fileType} className="flex items-center space-x-2">
                    <Checkbox
                      id={fileType}
                      checked={filters.selectedTypes.includes(fileType)}
                      onCheckedChange={() => toggleFileType(fileType)}
                    />
                    <label htmlFor={fileType} className="text-sm cursor-pointer flex-1">
                      {fileType.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters & Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-wrap">
          {hasActiveFilters && (
            <>
              {filters.selectedTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.toUpperCase()}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFileType(type)}
                    className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {hasActiveSearch || hasActiveFilters ? (
            <>Showing {resultCount} of {totalCount} tracks</>
          ) : (
            <>{totalCount} tracks</>
          )}
        </div>
      </div>
    </div>
  )
}