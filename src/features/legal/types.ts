export type LegalSection = {
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export type LegalDocument = {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
};
