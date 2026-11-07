import assert from "node:assert/strict";
import test from "node:test";
import {
  commissionFigures,
  daysUntil,
  emptyFile,
  emptyWorkspace,
  fileFromLead,
  filesByAttention,
  morningLines,
  nextWatch,
  sanitizeWorkspace,
  urgency,
  type LooseLead,
} from "./closepath-model";
import { projectWorkspace } from "./closepath-project";
import { sampleFiles } from "./closepath-samples";

const TODAY = "2026-11-07";

test("days left matches the morning rule", () => {
  assert.equal(daysUntil("2026-11-09", TODAY), 2);
  assert.equal(daysUntil("2026-11-07", TODAY), 0);
  assert.equal(daysUntil("2026-11-10", TODAY), 3);
  assert.equal(daysUntil("2026-11-11", TODAY), 4);
  assert.equal(daysUntil("2026-11-06", TODAY), -1);
  assert.equal(urgency(0), "soon");
  assert.equal(urgency(3), "soon");
  assert.equal(urgency(4), "later");
  assert.equal(urgency(-1), "past");
  assert.equal(urgency(null), "none");
});

test("commission is sale price times rate times split", () => {
  const maple = commissionFigures(418000, 3, 50);
  assert.equal(maple.gross, 12540);
  assert.equal(maple.net, 6270);
  const cedar = commissionFigures(380000, 3, 50);
  assert.equal(cedar.gross, 11400);
  assert.equal(cedar.net, 5700);
  assert.deepEqual(commissionFigures(100, null, 50), { gross: null, net: null });
});

test("sample files put the next deadline first", () => {
  const files = sampleFiles();
  const maple = files[0];
  assert.ok(maple);
  const next = nextWatch(maple, TODAY);
  assert.equal(next?.label, "Inspection deadline");
  assert.equal(next?.date, "2026-11-09");
  const lines = morningLines(files, TODAY);
  assert.equal(lines[0]?.address, "1842 Maple Street");
  assert.equal(lines[0]?.days, 2);
  assert.equal(lines[0]?.urgency, "soon");
  assert.equal(lines[1]?.address, "910 Cedar Avenue");
  assert.equal(lines[1]?.days, 3);
  const ordered = filesByAttention(files, TODAY);
  assert.equal(ordered[0]?.address, "1842 Maple Street");
});

test("a funded file leaves the morning list", () => {
  const [maple] = sampleFiles();
  assert.ok(maple);
  maple.funded = "Yes";
  assert.equal(morningLines([maple], TODAY).length, 0);
});

test("sanitize keeps a real file and drops a bad status", () => {
  const file = emptyFile("file-1234");
  file.address = "123 Test Lane";
  file.status = "Under contract";
  const workspace = sanitizeWorkspace({
    files: [{ ...file, status: "Not a status", showings: [{ id: "show-1234", feedback: "  door  " }] }],
    leads: [],
    examplesLoaded: false,
    examplesDismissed: true,
  });
  assert.ok(workspace);
  assert.equal(workspace.files[0]?.status, "");
  assert.equal(workspace.files[0]?.address, "123 Test Lane");
  assert.equal(workspace.files[0]?.showings[0]?.feedback, "door");
  assert.equal(workspace.examplesDismissed, true);
});

test("sanitize refuses a book that is too large", () => {
  const files = Array.from({ length: 101 }, () => emptyFile());
  assert.equal(sanitizeWorkspace({ files, leads: [], examplesLoaded: false, examplesDismissed: false }), null);
  assert.equal(sanitizeWorkspace(null), null);
});

test("a listing lead becomes a file at that address", () => {
  const lead: LooseLead = {
    id: "lead-1234",
    name: "Elena Vasquez",
    phone: "555-0148",
    email: "elena.example@email.test",
    source: "Past client referral",
    side: "Listing",
    propertyOrSearch: "1842 Maple Street",
    firstContact: "2026-10-12",
    nextFollowUp: "2026-11-08",
    status: "Active",
    notes: "Keep the listing.",
  };
  const file = fileFromLead(lead);
  assert.equal(file.address, "1842 Maple Street");
  assert.equal(file.client, "Elena Vasquez");
  assert.notEqual(file.id, lead.id);
});

test("export threads one address through every sheet", () => {
  const file = emptyFile("file-1234");
  file.address = "123 Test Lane";
  file.client = "Ada Lane";
  file.side = "Listing";
  file.inspectionDeadline = "2026-11-09";
  file.salePrice = 200000;
  file.ratePercent = 3;
  file.splitPercent = 50;
  file.showings = [{ id: "show-1234", date: "2026-11-01", time: "1:00 PM", confirmed: "Yes", result: "Completed", feedback: "Quiet street.", nextStep: "Write the offer." }];
  file.offers = [{ id: "offer-123", date: "2026-11-02", listPrice: 210000, offerPrice: 200000, earnestMoney: 4000, concessions: 0, status: "Accepted", expires: "2026-11-03", notes: "" }];
  const book = emptyWorkspace();
  book.files = [file];
  const sheets = projectWorkspace(book, TODAY);
  assert.equal(sheets.deals.length, 1);
  assert.equal(sheets.deals[0]?.values[0], "123 Test Lane");
  assert.equal(sheets.showings[0]?.values[3], "123 Test Lane");
  assert.equal(sheets.offers[0]?.values[1], "123 Test Lane");
  assert.equal(sheets.dates[0]?.values[0], "123 Test Lane");
  assert.equal(sheets.commissions[0]?.values[0], "123 Test Lane");
  assert.equal(sheets.leads[0]?.values[0], "Ada Lane");
  assert.equal(sheets.deals[0]?.values[9], 3000);
  assert.equal(sheets.showings.some((row) => row.values.includes("1842 Maple Street")), false);
});
