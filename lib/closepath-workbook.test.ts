import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { emptyFile, emptyWorkspace } from "./closepath-model";
import { projectWorkspace } from "./closepath-project";
import { sampleFiles } from "./closepath-samples";
import { closepathWorkbook } from "./closepath-workbook";

async function sheetText(buffer: Buffer, name: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.getWorksheet(name);
  assert.ok(sheet);
  const values: string[] = [];
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (cell.value !== null && cell.value !== undefined) values.push(String(cell.value));
    });
  });
  return values.join("\n");
}

test("export contains the buyer’s file and not the samples", async () => {
  const file = emptyFile("file-1234");
  file.address = "123 Test Lane";
  file.client = "Ada Lane";
  file.side = "Listing";
  file.salePrice = 200000;
  file.ratePercent = 3;
  file.splitPercent = 50;
  file.closeDate = "2026-12-01";
  const workspace = emptyWorkspace();
  workspace.files = [file];
  const buffer = await closepathWorkbook(projectWorkspace(workspace, "2026-11-07"));
  const deals = await sheetText(buffer, "Deals");
  assert.match(deals, /123 Test Lane/);
  assert.doesNotMatch(deals, /1842 Maple Street/);
  const commissions = new ExcelJS.Workbook();
  await commissions.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = commissions.getWorksheet("Commissions");
  const gross = sheet?.getCell("E2").value;
  assert.ok(gross && typeof gross === "object" && "formula" in gross);
  assert.match(String(gross.formula), /C2\*D2/);
});

test("sample export still names both properties", async () => {
  const workspace = emptyWorkspace();
  workspace.files = sampleFiles();
  const buffer = await closepathWorkbook(projectWorkspace(workspace, "2026-11-07"));
  const deals = await sheetText(buffer, "Deals");
  assert.match(deals, /1842 Maple Street/);
  assert.match(deals, /910 Cedar Avenue/);
  const start = await sheetText(buffer, "Start here");
  assert.match(start, /browser/);
});
