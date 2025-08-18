export interface ReportGenerationRequest {
  budget_years: string[];
  fund_codes: string[];
  dept_ids: string[];
  sessionId: string;
  userId: string;
  report_name: string;
  measures_requested_rev: string | null;
  dimension_filter_rev: string | null;
  measures_filter_rev: string | null;
  measures_requested_exp: string | null;
  dimension_filter_exp: string | null;
  measures_filter_exp: string | null;
  measureFilters: Record<string, any> | null; // Add measureFilters as JSON object
  dimensionFilters: Record<string, any> | null; // Add dimensionFilters as JSON object
}