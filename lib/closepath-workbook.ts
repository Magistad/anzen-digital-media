import ExcelJS from "exceljs";

const LAST_ROW = 28;
const HEADER_FILL = "FF161616";
const HEADER_FONT = "FFF4F0E6";
const EXAMPLE_FILL = "FFF6F1E6";
const INK = "FF1C1916";
const PAPER = "FFF7F4EE";

type Row = (string | number | Date | ExcelJS.CellFormulaValue | null)[];

function workbookDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12, 0, 0);
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

function writeRow(sheet: ExcelJS.Worksheet, values: Row, example: boolean) {
  const row = sheet.addRow(values);
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (cell, col) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      color: { argb: INK },
    };
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

function applyList(sheet: ExcelJS.Worksheet, column: number, options: string) {
  for (let row = 2; row <= LAST_ROW; row += 1) {
    sheet.getCell(row, column).dataValidation = listValidation(options);
  }
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
      text: "A listing-to-close workbook for a solo residential agent. One file, from the first conversation to a funded commission.",
      size: 14,
      height: 36,
    },
    { text: "", size: 12, height: 12 },
    { text: "What this file is", size: 16, bold: true, height: 24 },
    {
      text: "This is the file underneath. It is not a Follow Up Boss or BoldTrail replacement. Those are monthly CRMs. Use Closepath when you are running listings, showings, and closings out of texts and spreadsheets and cannot afford to miss a date.",
      size: 12,
      height: 48,
    },
    { text: "", size: 12, height: 12 },
    { text: "How a deal moves", size: 16, bold: true, height: 24 },
    {
      text: "1. Leads — who they are, where they came from, and the next time you will contact them.",
      size: 12,
      height: 22,
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
      text: "6. Deals — one row per property. Use the same address on every sheet so the deal stays one deal.",
      size: 12,
      height: 32,
    },
    { text: "", size: 12, height: 12 },
    { text: "Morning check", size: 16, bold: true, height: 24 },
    {
      text: "Open Critical dates before you open your inbox. Anything at three days or under gets done today. Write every deadline the day the contract is ratified, not the night before it expires.",
      size: 12,
      height: 36,
    },
    { text: "", size: 12, height: 12 },
    { text: "Examples", size: 16, bold: true, height: 24 },
    {
      text: "Shaded rows are a sample listing at 1842 Maple Street (Elena Vasquez) and a sample buyer deal at 910 Cedar Avenue (Marcus Hale). Delete them before you add a real client. They use obviously fake 555 numbers and .test emails.",
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

function buildDeals(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Deals");
  const headers = [
    "Address",
    "Side",
    "Client",
    "Status",
    "List price",
    "Contract price",
    "Next date to watch",
    "What that date is",
    "Close date",
    "Commission expected",
    "Notes",
  ];
  styleHeader(sheet, headers, [28, 14, 22, 20, 16, 18, 22, 24, 16, 22, 42]);
  const examples: Row[] = [
    [
      "1842 Maple Street",
      "Listing",
      "Elena Vasquez",
      "Under contract",
      425000,
      418000,
      workbookDate("2026-11-09"),
      "Inspection deadline",
      workbookDate("2026-11-30"),
      6270,
      "Example — delete this row. Your net from Commissions.",
    ],
    [
      "910 Cedar Avenue",
      "Buyer",
      "Marcus Hale",
      "Under contract",
      389000,
      380000,
      workbookDate("2026-11-10"),
      "Inspection deadline",
      workbookDate("2026-12-04"),
      5700,
      "Example — delete this row. Roof is the inspection focus.",
    ],
  ];
  for (const values of examples) {
    const row = writeRow(sheet, values, true);
    applyMoney(row, [5, 6, 10]);
    applyDates(row, [7, 9]);
  }
  for (let row = examples.length + 2; row <= LAST_ROW; row += 1) sheet.getRow(row).height = 20;
  applyList(sheet, 2, "Listing,Buyer");
  applyList(sheet, 4, "Prospect,Showing,Offer out,Under contract,Clear to close,Closed,Funded,Fell through");
}

function buildLeads(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Leads");
  styleHeader(
    sheet,
    ["Name", "Phone", "Email", "Source", "Side", "Property or search", "First contact", "Next follow-up", "Status", "Notes"],
    [22, 16, 32, 24, 14, 36, 18, 18, 18, 42],
  );
  const rows: Row[] = [
    [
      "Elena Vasquez",
      "555-0148",
      "elena.example@email.test",
      "Past client referral",
      "Listing",
      "1842 Maple Street",
      workbookDate("2026-10-12"),
      workbookDate("2026-11-08"),
      "Active",
      "Example — delete this row. Wants the listing live before Thanksgiving.",
    ],
    [
      "Marcus Hale",
      "555-0194",
      "marcus.example@email.test",
      "Open house sign-in",
      "Buyer",
      "3 bed east of the park, under $400k",
      workbookDate("2026-10-20"),
      workbookDate("2026-11-08"),
      "Active",
      "Example — delete this row. Pre-approved. Second showing is done.",
    ],
  ];
  for (const values of rows) {
    const row = writeRow(sheet, values, true);
    applyDates(row, [7, 8]);
  }
  applyList(sheet, 5, "Listing,Buyer");
  applyList(sheet, 9, "New,Contacted,Nurture,Appointment set,Active,Cold");
}

function buildShowings(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Showings");
  styleHeader(
    sheet,
    ["Date", "Time", "Client", "Address", "Side", "Confirmed", "Result", "Feedback", "Next step"],
    [16, 14, 22, 28, 14, 14, 16, 42, 42],
  );
  const rows: Row[] = [
    [
      workbookDate("2026-10-28"),
      "2:00 PM",
      "Elena Vasquez",
      "1842 Maple Street",
      "Listing",
      "Yes",
      "Completed",
      "Example — delete this row. Listing appointment. Agreed to ask $425,000.",
      "Send listing paperwork the same day.",
    ],
    [
      workbookDate("2026-10-18"),
      "11:00 AM",
      "Marcus Hale",
      "910 Cedar Avenue",
      "Buyer",
      "Yes",
      "Completed",
      "Example — delete this row. Liked the yard. Wants the roof looked at.",
      "If the offer is accepted, book the inspector for the roof.",
    ],
  ];
  for (const values of rows) {
    const row = writeRow(sheet, values, true);
    applyDates(row, [1]);
  }
  applyList(sheet, 5, "Listing,Buyer");
  applyList(sheet, 6, "Yes,No");
  applyList(sheet, 7, "Scheduled,Completed,No-show,Cancelled");
}

function buildOffers(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Offers");
  styleHeader(
    sheet,
    ["Date", "Address", "Client", "Side", "List price", "Offer price", "Earnest money", "Concessions", "Status", "Expires", "Notes"],
    [16, 28, 22, 14, 16, 16, 16, 16, 14, 16, 42],
  );
  const rows: Row[] = [
    [
      workbookDate("2026-10-30"),
      "1842 Maple Street",
      "Elena Vasquez",
      "Listing",
      425000,
      418000,
      8000,
      0,
      "Accepted",
      workbookDate("2026-10-31"),
      "Example — delete this row. Ratified November 1.",
    ],
    [
      workbookDate("2026-10-22"),
      "910 Cedar Avenue",
      "Marcus Hale",
      "Buyer",
      389000,
      380000,
      5000,
      2000,
      "Accepted",
      workbookDate("2026-10-23"),
      "Example — delete this row. $2,000 seller credit. Ratified October 24.",
    ],
  ];
  for (const values of rows) {
    const row = writeRow(sheet, values, true);
    applyDates(row, [1, 10]);
    applyMoney(row, [5, 6, 7, 8]);
  }
  applyList(sheet, 4, "Listing,Buyer");
  applyList(sheet, 9, "Draft,Submitted,Counter,Accepted,Rejected,Expired");
}

function buildCriticalDates(workbook: ExcelJS.Workbook) {
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
    "Funded",
    "Notes",
  ];
  styleHeader(sheet, headers, [28, 20, 12, 16, 20, 18, 20, 18, 18, 24, 16, 16, 12, 46]);
  sheet.getCell("F1").note =
    "Blank until you enter the deadline. Warm when the date is inside three days. Red after it passes.";

  const examples: { values: Row }[] = [
    {
      values: [
        "1842 Maple Street",
        "Elena Vasquez",
        "Listing",
        workbookDate("2026-11-01"),
        workbookDate("2026-11-09"),
        null,
        workbookDate("2026-11-16"),
        null,
        workbookDate("2026-11-18"),
        null,
        workbookDate("2026-11-30"),
        null,
        "No",
        "Example — delete this row. Inspection is the next date. Order the appraiser the day it is scheduled.",
      ],
    },
    {
      values: [
        "910 Cedar Avenue",
        "Marcus Hale",
        "Buyer",
        workbookDate("2026-10-24"),
        workbookDate("2026-11-10"),
        null,
        workbookDate("2026-11-17"),
        null,
        workbookDate("2026-11-20"),
        null,
        workbookDate("2026-12-04"),
        null,
        "No",
        "Example — delete this row. Buyer side. The roof clause is the inspection focus.",
      ],
    },
  ];

  examples.forEach(({ values }) => {
    const row = writeRow(sheet, values, true);
    applyDates(row, [4, 5, 7, 9, 11]);
  });

  for (let row = 2; row <= LAST_ROW; row += 1) {
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
      if (row <= examples.length + 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXAMPLE_FILL } };
      }
    }
    if (row > examples.length + 1) sheet.getRow(row).height = 20;
  }

  applyList(sheet, 3, "Listing,Buyer");
  applyList(sheet, 13, "Yes,No");
  sheet.addConditionalFormatting({
    ref: `F2:L${LAST_ROW}`,
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

function buildCommissions(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Commissions");
  styleHeader(
    sheet,
    ["Address", "Side", "Sale price", "Commission rate", "Gross commission", "Your split", "Your net", "Close date", "Paid date", "Status", "Notes"],
    [28, 14, 16, 18, 20, 14, 16, 16, 16, 16, 42],
  );
  sheet.getCell("D1").note = "Enter 3% as a percent, not as 3. Gross is sale price times this rate.";
  sheet.getCell("F1").note = "Your share of the gross. 50% is entered as 50%.";

  const examples: { price: number; rate: number; split: number; close: string; note: string; address: string; side: string }[] = [
    {
      address: "1842 Maple Street",
      side: "Listing",
      price: 418000,
      rate: 0.03,
      split: 0.5,
      close: "2026-11-30",
      note: "Example — delete this row. 3% listing side, 50% split.",
    },
    {
      address: "910 Cedar Avenue",
      side: "Buyer",
      price: 380000,
      rate: 0.03,
      split: 0.5,
      close: "2026-12-04",
      note: "Example — delete this row. 3% buyer side, 50% split.",
    },
  ];

  examples.forEach((example, index) => {
    const rowNumber = index + 2;
    const gross = example.price * example.rate;
    const net = gross * example.split;
    const row = writeRow(
      sheet,
      [
        example.address,
        example.side,
        example.price,
        example.rate,
        { formula: `IF(OR(C${rowNumber}="",D${rowNumber}=""),"",C${rowNumber}*D${rowNumber})`, result: gross },
        example.split,
        { formula: `IF(OR(E${rowNumber}="",F${rowNumber}=""),"",E${rowNumber}*F${rowNumber})`, result: net },
        workbookDate(example.close),
        null,
        "Expected",
        example.note,
      ],
      true,
    );
    row.getCell(3).numFmt = '"$"#,##0';
    row.getCell(4).numFmt = "0.0%";
    row.getCell(5).numFmt = '"$"#,##0.00';
    row.getCell(6).numFmt = "0.0%";
    row.getCell(7).numFmt = '"$"#,##0.00';
    applyDates(row, [8]);
  });

  for (let row = examples.length + 2; row <= LAST_ROW; row += 1) {
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

  applyList(sheet, 2, "Listing,Buyer");
  applyList(sheet, 10, "Expected,On statement,Funded,Paid");
}

export async function closepathWorkbook(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Anzen Digital Media";
  workbook.lastModifiedBy = "Anzen Digital Media";
  workbook.company = "Anzen Digital Media LLC";
  workbook.title = "Closepath";
  workbook.subject = "Listing-to-close workbook for a solo residential agent";
  workbook.description =
    "Track leads, showings, offers, critical dates, and commissions from listing to funded.";
  workbook.calcProperties.fullCalcOnLoad = true;

  buildStart(workbook);
  buildDeals(workbook);
  buildLeads(workbook);
  buildShowings(workbook);
  buildOffers(workbook);
  buildCriticalDates(workbook);
  buildCommissions(workbook);

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

let cached: Buffer | null = null;

export async function getClosepathWorkbook(): Promise<Buffer> {
  if (!cached) cached = await closepathWorkbook();
  return cached;
}
