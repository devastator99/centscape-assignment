export interface PreviewRequest {
    url: string;
    raw_html?: string;
  }
  
  export interface PreviewResponse {
    title: string;
    image: string;
    price: string;
    currency: string;
    siteName: string;
    sourceUrl: string;
  }
  