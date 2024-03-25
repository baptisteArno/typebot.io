export interface ApiResponse<T> {
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

export interface KeywordInfo {
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
  }[]
}

export interface SerpData {
  keyword: string
  type: string
  se_domain: string
  location_code: number
  language_code: string
  check_url: string
  datetime: string
  spell: string | null
  item_types: string[]
  se_results_count: number
  items_count: number
  items: SerpDataItem[]
}

interface SerpDataItem {
  type: string
  rank_group: number
  rank_absolute: number
  position: string
  xpath: string
  items: any[]
  rectangle: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface SerpDataPAA extends SerpDataItem {
  items: SerpDataPAAElement[]
}

export interface SerpDataPAAElement {
  type: 'people_also_ask_element'
  title: string
  seed_question: string | null
  xpath: string
  expanded_element: SerpDataPAAExpandedElement[]
}

export interface SerpDataPAAExpandedElement {
  type: 'people_also_ask_expanded_element'
  featured_title: string | null
  url: string
  domain: string
  title: string
  description: string
  images: string | null
  timestamp: string
  table: string | null
}

export interface LanguageData {
  language_name: string
  language_code: string
}

export interface KeywordData {
  se_type: string
  keyword: string
  location_code: number
  language_code: string
  keyword_info: KeywordInfo

  impressions_info: {
    se_type: string
    last_updated_time: string
    bid: number
    match_type: string
    ad_position_min: number
    ad_position_max: number
    ad_position_average: number
    cpc_min: number
    cpc_max: number
    cpc_average: number
    daily_impressions_min: number
    daily_impressions_max: number
    daily_impressions_average: number
    daily_clicks_min: number
    daily_clicks_max: number
    daily_clicks_average: number
    daily_cost_min: number
    daily_cost_max: number
    daily_cost_average: number
  }
  serp_info: {
    se_type: string
    check_url: string
    serp_item_types: string[]
    se_results_count: number
    last_updated_time: string
    previous_updated_time: string
  }
  keyword_properties: {
    se_type: string
    core_keyword: string | null
    synonym_clustering_algorithm: string
    keyword_difficulty: number
    detected_language: string
    is_another_language: boolean
  }
  search_intent_info: {
    se_type: string
    main_intent: string
    foreign_intent: string[]
    last_updated_time: string
  }
  avg_backlinks_info: {
    se_type: string
    backlinks: number
    dofollow: number
    referring_pages: number
    referring_domains: number
    referring_main_domains: number
    rank: number
    main_domain_rank: number
    last_updated_time: string
  }
}

export interface KeywordSuggestion {
  se_type: string
  seed_keyword: string
  seed_keyword_data: KeywordData
  location_code: number
  language_code: string
  total_count: number
  items_count: number
  offset: number
  offset_token: string
  items: KeywordData[]
}
