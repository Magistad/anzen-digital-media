import ExcelJS from "exceljs";
import { parseIsoDate } from "./closepath-model";
import { type SheetRow, type WorkbookData } from "./closepath-project";

const HEADER_FILL = "FF161616";
const HEADER_FONT = "FFF4F0E6";
const EXAMPLE_FILL = "FFF6F1E6";
const INK = "FF1C1916";
const PAPER = "FFF7F4EE";

type Cell = string | number | Date | ExcelJS.CellFormulaValue | null;

function sheetLimit(count: number): number {
  return Math.min(200, Math.max(28, count + 12));
}

function excelDate(iso: string | null): Date | null {
  if (!iso) return null;
  const parsed = parseIsoDate(iso);
  if (!parsed) return null;
  return new Date(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0);
}

function listValidation(options: string): ExcelJS.DataValidation {
  return {
    type: "list",
    allowBlank: true,
    formulae: [`"${options}"`],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Use the list",
    error: "Choose one of the listed values.",
  };
}

function styleHeader(sheet: ExcelJS.Worksheet, headers: string[], widths: number[]) {
  const header = sheet.addRow(headers);
  header.height = 28;
  header.font = { name: "Calibri", bold: true, size: 12, color: { argb: HEADER_FONT } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  header.alignment = { vertical: "middle", wrapText: true };
  headers.forEach((_, index) => {
    sheet.getColumn(index + 1).width = widths[index] ?? 18;
  });
  const last = sheet.getColumn(headers.length).letter;
  sheet.autoFilter = `A1:${last}1`;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: "1:1",
  };
  sheet.headerFooter = {
    oddHeader: "&LClosepath&RAnzen Digital Media",
    oddFooter: "&LListing to close&RPage &P",
  };
  sheet.properties.tabColor = { argb: HEADER_FILL };
}

function writeRow(sheet: ExcelJS.Worksheet, values: Cell[], example: boolean) {
  const row = sheet.addRow(values);
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (cell, col) => {
    cell.font = { name: "Calibri", size: 11, color: { argb: INK } };
    cell.alignment = { vertical: "middle", wrapText: col === values.length };
    if (example) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXAMPLE_FILL } };
    }
  });
  return row;
}

function applyDates(row: ExcelJS.Row, columns: number[]) {
  for (const column of columns) {
    const cell = row.getCell(column);
    if (cell.value instanceof Date) cell.numFmt = "mmm d, yyyy";
  }
}

function applyMoney(row: ExcelJS.Row, columns: number[]) {
  for (const column of columns) {
    const cell = row.getCell(column);
    if (typeof cell.value === "number") cell.numFmt = '"$"#,##0';
  }
}

function applyList(sheet: ExcelJS.Worksheet, column: number, options: string, lastRow: number) {
  for (let row = 2; row <= lastRow; row += 1) {
    sheet.getCell(row, column).dataValidation = listValidation(options);
  }
}

function cells(row: SheetRow, dates: number[]): Cell[] {
  return row.values.map((value, index) => {
    if (dates.includes(index) && typeof value === "string") return excelDate(value);
    return value;
  });
}

function blank(sheet: ExcelJS.Worksheet, lastRow: number, written: number) {
  for (let row = written + 2; row <= lastRow; row += 1) sheet.getRow(row).height = 20;
}

function buildStart(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Start here", {
    properties: { tabColor: { argb: HEADER_FILL } },
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 1 },
  });
  sheet.getColumn(1).width = 108;
  sheet.properties.tabColor = { argb: HEADER_FILL };

  const lines: { text: string; size: number; bold?: boolean; height: number }[] = [
    { text: "Closepath", size: 32, bold: true, height: 42 },
    {
      text: "A copy of your listing-to-close book. The book you work in is the one in the browser. Editing this spreadsheet does not change that book.",
      size: 14,
      height: 48,
    },
    { text: "", size: 12, height: 12 },
    { text: "What this file is", size: 16, bold: true, height: 24 },
    {
      text: "One row here is one property there. The lead, showings, offers, critical dates, and commission on a file share that address. This is not a Follow Up Boss or BoldTrail replacement. Those are full CRMs.",
      size: 12,
      height: 48,
    },
    { text: "", size: 12, height: 12 },
    { text: "How a deal moves", size: 16, bold: true, height: 24 },
    {
      text: "1. Leads — who they are, where they came from, and the next time you will contact them. A file starts when there is a property.",
      size: 12,
      height: 32,
    },
    {
      text: "2. Showings — one row every time you open a door. Keep what they said.",
      size: 12,
      height: 22,
    },
    {
      text: "3. Offers — price, earnest money, concessions, and whether the offer is still alive.",
      size: 12,
      height: 22,
    },
    {
      text: "4. Critical dates — the morning sheet. Inspection, appraisal, loan contingency, and close. Days-left cells turn warm inside three days and red after the date passes.",
      size: 12,
      height: 36,
    },
    {
      text: "5. Commissions — sale price times your rate, then your split. Mark it paid only when the money is in your account.",
      size: 12,
      height: 32,
    },
    {
      text: "6. Deals — one row per property. The same address is the deal on every sheet. Outcome is Open, Closed, or Did not close. Closed means the deal funded. The file stays in the book either way.",
      size: 12,
      height: 48,
    },
    { text: "", size: 12, height: 12 },
    { text: "Morning check", size: 16, bold: true, height: 24 },
    {
      text: "Open Critical dates before you open your inbox. Anything at three days or under gets done today. Closed and did not close files stay out of that morning list. Write every deadline the day the contract is ratified, not the night before it expires.",
      size: 12,
      height: 48,
    },
    { text: "", size: 12, height: 12 },
    { text: "Examples", size: 16, bold: true, height: 24 },
    {
      text: "Shaded rows are a sample listing at 1842 Maple Street (Elena Vasquez) and a sample buyer deal at 910 Cedar Avenue (Marcus Hale). They are not your clients. They use obviously fake 555 numbers and .test emails.",
      size: 12,
      height: 48,
    },
    { text: "", size: 12, height: 16 },
    { text: "Anzen Digital Media LLC", size: 12, bold: true, height: 22 },
  ];

  lines.forEach((line, index) => {
    const cell = sheet.getCell(index + 1, 1);
    cell.value = line.text;
    cell.font = { name: "Calibri", size: line.size, bold: line.bold ?? false, color: { argb: INK } };
    cell.alignment = { wrapText: true, vertical: "top" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };
    sheet.getRow(index + 1).height = line.height;
  });
}

function buildDeals(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Deals");
  const headers = [
    "Address",
    "Side",
    "Client",
    "Status",
    "Outcome",
    "List price",
    "Contract price",
    "Next date to watch",
    "What that date is",
    "Close date",
    "Commission expected",
    "Notes",
  ];
  styleHeader(sheet, headers, [28, 14, 22, 20, 18, 16, 18, 22, 24, 16, 22, 42]);
  const lastRow = sheetLimit(rows.length);
  rows.forEach((row) => {
    const written = writeRow(sheet, cells(row, [7, 9]), row.example);
    applyMoney(written, [6, 7, 11]);
    applyDates(written, [8, 10]);
  });
  blank(sheet, lastRow, rows.length);
  applyList(sheet, 2, "Listing,Buyer", lastRow);
  applyList(sheet, 4, "Prospect,Showing,Offer out,Under contract,Clear to close", lastRow);
  applyList(sheet, 5, "Open,Closed,Did not close", lastRow);
}

function buildLeads(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Leads");
  styleHeader(
    sheet,
    ["Name", "Phone", "Email", "Source", "Side", "Property or search", "First contact", "Next follow-up", "Status", "Notes"],
    [22, 16, 32, 24, 14, 36, 18, 18, 18, 42],
  );
  const lastRow = sheetLimit(rows.length);
  rows.forEach((row) => {
    const written = writeRow(sheet, cells(row, [6, 7]), row.example);
    applyDates(written, [7, 8]);
  });
  blank(sheet, lastRow, rows.length);
  applyList(sheet, 5, "Listing,Buyer", lastRow);
  applyList(sheet, 9, "New,Contacted,Nurture,Appointment set,Active,Cold", lastRow);
}

function buildShowings(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Showings");
  styleHeader(
    sheet,
    ["Date", "Time", "Client", "Address", "Side", "Confirmed", "Result", "Feedback", "Next step"],
    [16, 14, 22, 28, 14, 14, 16, 42, 42],
  );
  const lastRow = sheetLimit(rows.length);
  rows.forEach((row) => {
    const written = writeRow(sheet, cells(row, [0]), row.example);
    applyDates(written, [1]);
  });
  blank(sheet, lastRow, rows.length);
  applyList(sheet, 5, "Listing,Buyer", lastRow);
  applyList(sheet, 6, "Yes,No", lastRow);
  applyList(sheet, 7, "Scheduled,Completed,No-show,Cancelled", lastRow);
}

function buildOffers(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Offers");
  styleHeader(
    sheet,
    ["Date", "Address", "Client", "Side", "List price", "Offer price", "Earnest money", "Concessions", "Status", "Expires", "Notes"],
    [16, 28, 22, 14, 16, 16, 16, 16, 14, 16, 42],
  );
  const lastRow = sheetLimit(rows.length);
  rows.forEach((row) => {
    const written = writeRow(sheet, cells(row, [0, 9]), row.example);
    applyDates(written, [1, 10]);
    applyMoney(written, [5, 6, 7, 8]);
  });
  blank(sheet, lastRow, rows.length);
  applyList(sheet, 4, "Listing,Buyer", lastRow);
  applyList(sheet, 9, "Draft,Submitted,Counter,Accepted,Rejected,Expired", lastRow);
}

function buildCriticalDates(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Critical dates");
  const headers = [
    "Address",
    "Client",
    "Side",
    "Contract date",
    "Inspection deadline",
    "Days to inspection",
    "Appraisal deadline",
    "Days to appraisal",
    "Loan contingency",
    "Days to loan contingency",
    "Close date",
    "Days to close",
    "Outcome",
    "Notes",
  ];
  styleHeader(sheet, headers, [28, 20, 12, 16, 20, 18, 20, 18, 18, 24, 16, 16, 18, 46]);
  sheet.getCell("F1").note =
    "Blank until you enter the deadline. Warm when the date is inside three days. Red after it passes.";
  const lastRow = sheetLimit(rows.length);
  rows.forEach((row) => {
    const written = writeRow(sheet, cells(row, [3, 4, 6, 8, 10]), row.example);
    applyDates(written, [4, 5, 7, 9, 11]);
  });

  for (let row = 2; row <= lastRow; row += 1) {
    const days: [string, string][] = [
      ["F", "E"],
      ["H", "G"],
      ["J", "I"],
      ["L", "K"],
    ];
    for (const [target, source] of days) {
      const cell = sheet.getCell(`${target}${row}`);
      cell.value = { formula: `IF(${source}${row}="","",${source}${row}-TODAY())` };
      cell.numFmt = "0";
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", size: 11, color: { argb: INK } };
      if (row <= rows.length + 1 && rows[row - 2]?.example) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXAMPLE_FILL } };
      }
    }
    if (row > rows.length + 1) sheet.getRow(row).height = 20;
  }

  applyList(sheet, 3, "Listing,Buyer", lastRow);
  applyList(sheet, 13, "Open,Closed,Did not close", lastRow);
  sheet.addConditionalFormatting({
    ref: `F2:L${lastRow}`,
    rules: [
      {
        type: "cellIs",
        operator: "lessThan",
        formulae: ["0"],
        priority: 1,
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0D6D0" } },
          font: { name: "Calibri", bold: true, color: { argb: "FF6B2A24" } },
        },
      },
      {
        type: "cellIs",
        operator: "between",
        formulae: ["0", "3"],
        priority: 2,
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF6E3C4" } },
          font: { name: "Calibri", bold: true, color: { argb: "FF6A4B16" } },
        },
      },
    ],
  });
}

function buildCommissions(workbook: ExcelJS.Workbook, rows: SheetRow[]) {
  const sheet = workbook.addWorksheet("Commissions");
  styleHeader(
    sheet,
    ["Address", "Side", "Sale price", "Commission rate", "Gross commission", "Your split", "Your net", "Close date", "Paid date", "Status", "Notes"],
    [28, 14, 16, 18, 20, 14, 16, 16, 16, 16, 42],
  );
  sheet.getCell("D1").note = "Enter 3% as a percent, not as 3. Gross is sale price times this rate.";
  sheet.getCell("F1").note = "Your share of the gross. 50% is entered as 50%.";
  const lastRow = sheetLimit(rows.length);

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const price = typeof row.values[2] === "number" ? row.values[2] : null;
    const rate = typeof row.values[3] === "number" ? row.values[3] : null;
    const split = typeof row.values[5] === "number" ? row.values[5] : null;
    const gross = price !== null && rate !== null ? price * rate : null;
    const net = gross !== null && split !== null ? gross * split : null;
    const values: Cell[] = cells(row, [7, 8]);
    const grossFormula = `IF(OR(C${rowNumber}="",D${rowNumber}=""),"",C${rowNumber}*D${rowNumber})`;
    const netFormula = `IF(OR(E${rowNumber}="",F${rowNumber}=""),"",E${rowNumber}*F${rowNumber})`;
    values[4] = gross === null ? { formula: grossFormula } : { formula: grossFormula, result: gross };
    values[6] = net === null ? { formula: netFormula } : { formula: netFormula, result: net };
    const written = writeRow(sheet, values, row.example);
    written.getCell(3).numFmt = '"$"#,##0';
    written.getCell(4).numFmt = "0.0%";
    written.getCell(5).numFmt = '"$"#,##0.00';
    written.getCell(6).numFmt = "0.0%";
    written.getCell(7).numFmt = '"$"#,##0.00';
    applyDates(written, [8, 9]);
  });

  for (let row = rows.length + 2; row <= lastRow; row += 1) {
    sheet.getRow(row).height = 20;
    const gross = sheet.getCell(`E${row}`);
    gross.value = { formula: `IF(OR(C${row}="",D${row}=""),"",C${row}*D${row})` };
    gross.numFmt = '"$"#,##0.00';
    const net = sheet.getCell(`G${row}`);
    net.value = { formula: `IF(OR(E${row}="",F${row}=""),"",E${row}*F${row})` };
    net.numFmt = '"$"#,##0.00';
    sheet.getCell(`C${row}`).numFmt = '"$"#,##0';
    sheet.getCell(`D${row}`).numFmt = "0.0%";
    sheet.getCell(`F${row}`).numFmt = "0.0%";
    sheet.getCell(`H${row}`).numFmt = "mmm d, yyyy";
    sheet.getCell(`I${row}`).numFmt = "mmm d, yyyy";
  }

  applyList(sheet, 2, "Listing,Buyer", lastRow);
  applyList(sheet, 10, "Expected,On statement,Funded,Paid", lastRow);
}

export async function closepathWorkbook(data: WorkbookData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Anzen Digital Media";
  workbook.lastModifiedBy = "Anzen Digital Media";
  workbook.company = "Anzen Digital Media LLC";
  workbook.title = "Closepath";
  workbook.subject = "Listing-to-close book for a solo residential agent";
  workbook.description = "A copy of a Closepath book: files, dates, outcomes, and commissions from listing to close.";
  workbook.calcProperties.fullCalcOnLoad = true;

  buildStart(workbook);
  buildDeals(workbook, data.deals);
  buildLeads(workbook, data.leads);
  buildShowings(workbook, data.showings);
  buildOffers(workbook, data.offers);
  buildCriticalDates(workbook, data.dates);
  buildCommissions(workbook, data.commissions);

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}
