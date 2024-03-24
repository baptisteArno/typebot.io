export interface SerpResponse {
  /** List of processed URLs */
  items: SerpItem[]
  /** List of topic clusters, where each cluster has "cluster_entities" and "label" */
  cluster_info: {
    cluster_entities: {
      entity: string
      /** Count entity of occurences in all results */
      count: number
      frequency: number
      /** Count entity of occurences in headers */
      header_count: number
      header_frequency: number
      item_count: number
      /** syntactical analysis of an entity, e.g. conversation with ChatGPT = NOUN ADP NOUN */
      pos: string
      /** lowercase singular form */
      sing_lower: string
      /** lowercase plural form */
      plural_lower: string
      /** count of entity occurences in article titles */
      title_count: number
      type: 'ORGANIZATION' | 'PERSON' | 'THING'
    }[]
    /** number of entities in the cluster */
    count: number
    /** cluster label */
    label: string
  }[]

  /** Average word count, average headers, and average external links per item. This will also include avg. topic score if "user_url" was part of the payload. */
  aggregate_metrics: {
    avg_word_count: number
    avg_headers: number
    avg_external_links: number
    avg_score?: number
  }
  /** This field is only returned if "user_url" was part of the payload. */
  user_url_metrics?: {
    score: number
    word_count: number
    headers: number
    external_links: number
  }
}

export interface SerpItem {
  /** Title tag */
  title: string
  /** Canonical URL */
  url: string
  /** Description tag */
  description: string
  /** Date published tag - format any, even empty string */
  date: string
  /** Author tag */
  author: string
  /** List of hyperlinks */
  links?: string[]
  /** List of image URLs */
  images?: string[]
  /** List of video URLs */
  videos?: string[]
  /** Language tag */
  language: string
  /** Full clean text */
  clean_text: string
  /** Clean HTML for content */
  html: string
  /** Clean text word count */
  word_count: number
  /** List of sections with headings and text */
  assets: {
    header: string
    header_tag: string
    text: string[]
    html: string[]
    title: string
    product_info: string | null
  }[]

  /** List of question headings */
  questions: string[]
  /** List of sentences containing stats */
  statistics: string[]
  /** List of topics sorted by count */
  entities: {
    entity: string
    type: 'ORGANIZATION' | 'PERSON' | 'THING'
    pos: string
    count: number
    sing_lower: string
    plural_lower: string
  }[]
}
