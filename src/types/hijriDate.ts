export interface HijriInfo {
  day: string | number;
  month_name_arabic: string;
  year: string | number;
}

export interface HijriDateResponse {
  success: boolean;
  service?: string;
  data?: {
    hijri?: HijriInfo | HijriInfo[];
  };
}
