export type CaseItem = {
  case_brought: string;
  case_number: string;
  case_type: string;
  case_url: string;
  citation: string;
  date: string;
  decision_category: string;
  final_decision: string;
  has_publication_ban: boolean;
  has_sealing_order: boolean;
  judges: string[];
  num_judges: number;
  pdf_url: string;
  province: string;
  report_citation: string;
  subject: string[];
  title: string;
};

export {};

declare global {
interface Window {
  dataLayer: any[];
  gtag?: (...args: any[]) => void;
}
}

export type YearStats = {
  case_brought_summary: Record<string, number>;
  case_count: number;
  case_type_summary: Record<string, number>;
  cases: CaseItem[];
  decision_summary: Record<string, number>;
  province_summary: Record<string, number>;
  subject_summary: Record<string, number>;
  year: string;
};
