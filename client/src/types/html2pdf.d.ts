declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number;
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: any; // Changed to 'any' to fix type error
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2PdfInstance {
    from(element: HTMLElement | string): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}