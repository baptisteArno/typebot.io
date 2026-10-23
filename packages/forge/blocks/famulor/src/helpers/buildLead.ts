import { isNotEmpty } from "@typebot.io/lib/utils";

export const buildLead = ({
  leadName,
  leadEmail,
  leadPhone,
  leadCompany,
}: {
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  leadCompany?: string;
}) => {
  const lead: Record<string, string> = {};
  const name = leadName?.trim();
  const email = leadEmail?.trim();
  const phone = leadPhone?.trim();
  const company = leadCompany?.trim();

  if (isNotEmpty(name)) lead.name = name;
  if (isNotEmpty(email)) lead.email = email;
  if (isNotEmpty(phone)) lead.phone = phone;
  if (isNotEmpty(company)) lead.company = company;

  return Object.keys(lead).length > 0 ? lead : undefined;
};
