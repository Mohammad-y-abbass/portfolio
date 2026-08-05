export type WebsiteType = 'static' | 'dynamic';

export interface SelectorConfig {
  selector: string;
  type: 'text' | 'html' | 'href' | 'attr';
  attr?: string;
  index?: number;
}

export interface PaginationConfig {
  enabled: boolean;
  param: string;
  maxPages: number;
  startPage?: number;
}

export interface DateParseConfig {
  format: string;
  timezone: string;
  relative?: boolean;
}

export interface ListingsConfig {
  url: string;
  pagination?: PaginationConfig;
  jobCardSelector: string;
  fields: Record<string, SelectorConfig>;
}

export interface DetailsConfig {
  urlTemplate: string;
  idExtractor?: SelectorConfig;
  fields: Record<string, SelectorConfig>;
}

export interface WebsiteConfig {
  name: string;
  baseUrl: string;
  type: WebsiteType;
  listings: ListingsConfig;
  details?: DetailsConfig;
  dateParse?: DateParseConfig;
  skipDateFilter?: boolean;
}

export interface ScraperConfig {
  websites: WebsiteConfig[];
}

export interface JobRaw {
  source: string;
  title: string;
  url: string;
  company: string;
  location: string;
  datePosted: Date;
  summary: string;
  description?: string;
  category?: string;
  categories?: string;
  salary?: string;
  employeeType?: string;
  employmentType?: string;
  jobType?: string;
  jobId?: string;
}
