import {
  type DealFile,
  type LooseLead,
  type Workspace,
  commissionFigures,
  nextWatch,
} from "./closepath-model";

export type SheetRow = {
  values: (string | number | null)[];
  example: boolean;
};

export type WorkbookData = {
  deals: SheetRow[];
  leads: SheetRow[];
  showings: SheetRow[];
  offers: SheetRow[];
  dates: SheetRow[];
  commissions: SheetRow[];
};

function leadValues(lead: {
  name: string;
  phone: string;
  email: string;
  source: string;
  side: string;
  propertyOrSearch: string;
  firstContact: string | null;
  nextFollowUp: string | null;
  status: string;
  notes: string;
}): (string | number | null)[] {
  return [
    lead.name,
    lead.phone,
    lead.email,
    lead.source,
    lead.side,
    lead.propertyOrSearch,
    lead.firstContact,
    lead.nextFollowUp,
    lead.status,
    lead.notes,
  ];
}

function fileHasLead(file: DealFile): boolean {
  return Boolean(file.client || file.phone || file.email || file.leadNotes || file.source);
}

function projectFile(file: DealFile, today: string): {
  deal: SheetRow;
  lead: SheetRow | null;
  dates: SheetRow;
  commission: SheetRow;
} {
  const next = file.funded === "Yes" ? null : nextWatch(file, today);
  const { net } = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
  const deal: SheetRow = {
    example: Boolean(file.example),
    values: [
      file.address,
      file.side,
      file.client,
      file.status,
      file.listPrice,
      file.contractPrice,
      next?.date ?? null,
      next?.label ?? (file.funded === "Yes" ? "Funded" : ""),
      file.closeDate,
      net,
      file.notes,
    ],
  };
  const lead = fileHasLead(file)
    ? {
        example: Boolean(file.example),
        values: leadValues({
          name: file.client,
          phone: file.phone,
          email: file.email,
          source: file.source,
          side: file.side,
          propertyOrSearch: file.propertyOrSearch || file.address,
          firstContact: file.firstContact,
          nextFollowUp: file.nextFollowUp,
          status: file.leadStatus,
          notes: file.leadNotes,
        }),
      }
    : null;
  const dates: SheetRow = {
    example: Boolean(file.example),
    values: [
      file.address,
      file.client,
      file.side,
      file.contractDate,
      file.inspectionDeadline,
      null,
      file.appraisalDeadline,
      null,
      file.loanContingency,
      null,
      file.closeDate,
      null,
      file.funded || "No",
      file.dateNotes,
    ],
  };
  const commission: SheetRow = {
    example: Boolean(file.example),
    values: [
      file.address,
      file.side,
      file.salePrice,
      file.ratePercent === null ? null : file.ratePercent / 100,
      null,
      file.splitPercent === null ? null : file.splitPercent / 100,
      null,
      file.closeDate,
      file.paidDate,
      file.commissionStatus,
      file.commissionNotes,
    ],
  };
  return { deal, lead, dates, commission };
}

function projectLooseLead(lead: LooseLead): SheetRow {
  return { example: Boolean(lead.example), values: leadValues(lead) };
}

/** Flatten a book into the workbook sheets. The address on every sheet is the file’s address. */
export function projectWorkspace(workspace: Workspace, today: string): WorkbookData {
  const deals: SheetRow[] = [];
  const leads: SheetRow[] = [];
  const showings: SheetRow[] = [];
  const offers: SheetRow[] = [];
  const dates: SheetRow[] = [];
  const commissions: SheetRow[] = [];

  for (const file of workspace.files) {
    const projected = projectFile(file, today);
    deals.push(projected.deal);
    if (projected.lead) leads.push(projected.lead);
    dates.push(projected.dates);
    commissions.push(projected.commission);
    for (const showing of file.showings) {
      showings.push({
        example: Boolean(file.example),
        values: [
          showing.date,
          showing.time,
          file.client,
          file.address,
          file.side,
          showing.confirmed,
          showing.result,
          showing.feedback,
          showing.nextStep,
        ],
      });
    }
    for (const offer of file.offers) {
      offers.push({
        example: Boolean(file.example),
        values: [
          offer.date,
          file.address,
          file.client,
          file.side,
          offer.listPrice,
          offer.offerPrice,
          offer.earnestMoney,
          offer.concessions,
          offer.status,
          offer.expires,
          offer.notes,
        ],
      });
    }
  }

  for (const lead of workspace.leads) leads.push(projectLooseLead(lead));

  return { deals, leads, showings, offers, dates, commissions };
}
