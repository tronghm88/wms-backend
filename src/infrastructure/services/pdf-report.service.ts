import { Injectable, OnModuleInit } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { Decimal } from "decimal.js";
import { IPdfReportService } from "../../domain/contracts/pdf-report.service.interface";

@Injectable()
export class PdfReportService implements IPdfReportService, OnModuleInit {
  private readonly templatesDir = path.join(__dirname, "../pdf-templates");

  onModuleInit() {
    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper("formatDecimal", (value: any) => {
      if (value === null || value === undefined) return "0.000";
      try {
        const d = new Decimal(value.toString());
        return d.toFixed(3);
      } catch {
        return "0.000";
      }
    });

    Handlebars.registerHelper("formatDate", (date: any) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleString();
    });
  }

  async generatePdf(templateName: string, data: any): Promise<Buffer> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateSource);
    const html = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
