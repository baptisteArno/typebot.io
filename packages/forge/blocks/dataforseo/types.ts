export interface KeywordDataResponse<T> {
  version: string
  status_code: number
  status_message: string
  time: string
  cost: number
  tasks_count: number
  tasks_error: number
  tasks: Task<T>[]
}

export interface Task<T> {
  id: string
  status_code: number
  status_message: string
  time: string
  cost: number
  result_count: number
  path: string[]
  data: {
    api: string
    function: string
    se: string
    search_partners?: boolean
    keywords?: string[]
    language_code?: string
    sort_by?: string
  }
  result: T[]
}

export interface KeywordData {
  keyword: string
  spell: string | null
  location_code: string | null
  language_code: string
  search_partners: boolean
  competition: string
  competition_index: number
  search_volume: number
  low_top_of_page_bid: number
  high_top_of_page_bid: number
  cpc: number
  monthly_searches: {
    year: number
    month: number
    search_volume: number
  }
}

export interface LanguageData {
  language_name: string
  language_code: string
}
