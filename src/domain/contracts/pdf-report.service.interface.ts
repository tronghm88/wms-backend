export const PDF_REPORT_SERVICE = "PDF_REPORT_SERVICE";

export interface IPdfReportService {
  /**
   * Generates a PDF buffer from a template name and data.
   * @param templateName Name of the template (e.g., 'pn', 'px', 'pt')
   * @param data Data to be injected into the template
   */
  generatePdf(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<Buffer>;
}
