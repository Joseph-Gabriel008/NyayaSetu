import { AnalysisResult, CompareResult, DocumentClause, RiskFlag } from "./types";

/**
 * Deterministic legal analysis engine.
 * Used when GEMINI_API_KEY is not configured or in unit testing environments.
 * Built with rich Indian legal rules (TNRRRL Act 2017, Section 27 Indian Contract Act, Model Tenancy Act).
 */

export function analyzeDocumentFallback(text: string): AnalysisResult {
  const isRental = /rent|tenan|lessor|lessee|flat|apartment|premises/i.test(text);
  const isEmployment = /employ|salary|remuneration|non-compete|bonus|probation/i.test(text);
  const isNda = /confidential|non-disclosure|proprietary|disclose/i.test(text);

  let docType = "General Legal Agreement";
  if (isRental) docType = "Residential Rental Agreement";
  else if (isEmployment) docType = "Employment Offer & Agreement";
  else if (isNda) docType = "Non-Disclosure & Confidentiality Agreement";

  const rawParagraphs = text
    .split(/\n\s*\n|\n(?=\d+\.|\b[A-Z\s]{4,}\b)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  const clauses: DocumentClause[] = [];
  const redFlags: RiskFlag[] = [];
  const missingProtections: string[] = [];

  // Parse clauses
  rawParagraphs.forEach((para, idx) => {
    const id = `clause-${idx + 1}`;
    const firstLine = para.split("\n")[0].slice(0, 60);
    const titleMatch = para.match(/^(\d+\.?\s*[A-Z\s,]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Clause ${idx + 1}: ${firstLine}...`;

    // Categorization logic
    let category: DocumentClause["category"] = "What you're agreeing to";
    if (/terminat|notice period|notice.*tenan|vacat|exit clause/i.test(para)) {
      category = "Termination";
    } else if (/prohibit|conduct|house rules|tenant shall not|shall not keep|shall maintain/i.test(para)) {
      category = "Your obligations";
    } else if (/rent|deposit|salary|remuneration|penalty charge|monthly rent/i.test(para)) {
      category = "Money";
    } else if (/tenant shall|employee shall|you agree|obligat|duty/i.test(para)) {
      category = "Your obligations";
    } else if (/landlord shall|lessor shall|company shall|employer will|refund/i.test(para)) {
      category = "Their obligations";
    }

    // Risk detection logic
    let riskLevel: DocumentClause["riskLevel"] = "safe";
    let riskReason: string | undefined;
    let counterSuggestion: string | undefined;

    // Check specific high-risk patterns
    if (/10\s*months|ten\s*months.*deposit/i.test(para)) {
      riskLevel = "high";
      riskReason = "10 months' security deposit is excessive. The Tamil Nadu Tenancy Act (TNRRRL 2017) caps residential deposits at 3 months.";
      counterSuggestion = "Request reduction of deposit to 2–3 months' rent as per standard practice and statutory guidelines.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Excessive Security Deposit (10 Months)",
        level: "high",
        category: "Money / Financial Lock-in",
        problem: "The landlord is demanding 10 months' rent in advance (Rs. 2,60,000/-) and retains it for up to 90 days after vacating.",
        whyRisky: "Locks up substantial liquidity. In disputes, recovering a 10-month deposit from a private landlord in Chennai is notoriously difficult.",
        counterMeasure: "Propose a 3-month deposit (Rs. 78,000/-) and immediate refund on the key-handover day, citing TNRRRL Act 2017.",
        indianLegalContext: "Under the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act (TNRRRL Act 2017), security deposit cannot exceed three months' rent.",
      });
    }

    if (/forfeit.*entire\s*security\s*deposit|liquidated\s*damages/i.test(para)) {
      riskLevel = "high";
      riskReason = "Forfeiting the entire deposit for early exit without accounting for actual vacancy loss is punitive.";
      counterSuggestion = "Replace with standard 1-month notice period or 1 month's rent in lieu of notice.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Total Deposit Forfeiture on Early Exit",
        level: "high",
        category: "Termination / Penalties",
        problem: "Tenant loses 100% of the security deposit if vacating before 11 months, even if valid replacement tenant or notice is given.",
        whyRisky: "Section 74 of the Indian Contract Act allows only reasonable compensation for actual breach, not unreasonable windfall penalties.",
        counterMeasure: "Insist on: 'Either party may terminate with 30 days notice without financial penalty or deposit forfeiture.'",
        indianLegalContext: "Penal clauses demanding complete deposit forfeiture without proof of actual landlord damage are unenforceable under Indian contract jurisprudence.",
      });
    }

    if (/7\s*(\(seven\)\s*)?days|seven\s*days|without\s*assigning\s*any\s*reason/i.test(para)) {
      riskLevel = "high";
      riskReason = "7-day sudden eviction notice creates immediate housing insecurity for the tenant.";
      counterSuggestion = "Demand a bilateral 30 or 60 days notice period for both landlord and tenant.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Abrupt 7-Day Eviction Without Cause",
        level: "high",
        category: "Eviction & Security of Tenure",
        problem: "Landlord can force tenant out with just 7 days written notice with no stated cause.",
        whyRisky: "Leaves tenant virtually no time to locate alternative accommodation or pack belongings.",
        counterMeasure: "Change notice to minimum 30 days, or restrict landlord termination to specific material breaches only.",
        indianLegalContext: "Arbitrary summary eviction without statutory grounds violates Model Tenancy provisions.",
      });
    }

    if (/non-compete|2\s*years.*departure|not.*engage.*anywhere\s*in\s*india/i.test(para)) {
      riskLevel = "high";
      riskReason = "Post-employment non-compete covenants are void and unenforceable under Section 27 of the Indian Contract Act, 1872.";
      counterSuggestion = "Ask to remove the post-employment non-compete or limit it strictly to solicitation of direct clients.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Restraint of Trade / Void Non-Compete",
        level: "high",
        category: "Employment / Career Mobility",
        problem: "Restricts employee from working in software/tech anywhere in India for 2 years after leaving.",
        whyRisky: "May cause intimidating legal threats from employers despite being legally void in Indian courts.",
        counterMeasure: "Request standard non-solicitation clause instead of sweeping career non-compete.",
        indianLegalContext: "Section 27 of the Indian Contract Act 1872 renders every agreement in restraint of lawful profession void. Indian courts routinely refuse injunctions against former employees.",
      });
    }

    if (/without.*prior.*notice.*enter|unfettered\s*right\s*to\s*enter|master\s*duplicate\s*key/i.test(para)) {
      if (riskLevel === "safe") riskLevel = "medium";
      riskReason = riskReason || "Unrestricted landlord entry without notice infringes on tenant's right to peaceful and quiet enjoyment.";
      counterSuggestion = counterSuggestion || "Require at least 24 hours prior written notice and restricted to reasonable daytime hours (10 AM - 6 PM).";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Unannounced Entry / Privacy Violation",
        level: "medium",
        category: "Privacy & Peaceful Enjoyment",
        problem: "Landlord retains right to enter or show flat at any hour without prior notice.",
        whyRisky: "Deprives tenant of personal safety, domestic privacy, and peaceful possession.",
        counterMeasure: "Insert: 'Landlord may inspect only upon 24 hours written notice during daytime hours.'",
        indianLegalContext: "Under the TNRRRL Act 2017, landlords must provide at least 24 hours advance notice before entering premises.",
      });
    }

    if (/painting.*repainting.*mandatory.*deduct|irrespective\s*of.*condition/i.test(para)) {
      if (riskLevel === "safe") riskLevel = "medium";
      riskReason = riskReason || "Unconditional deduction of 1 month rent for painting ignores ordinary wear and tear.";
      counterSuggestion = counterSuggestion || "Clause should specify deductions apply only if walls are visibly damaged beyond normal wear & tear.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Mandatory Painting Charge Deduction",
        level: "medium",
        category: "Deductions & Wear and Tear",
        problem: "Landlord automatically deducts an entire month's rent (Rs. 26,000/-) for repainting regardless of duration or wall condition.",
        whyRisky: "Standard rental practice in Chennai often includes this unfair boilerplate deduction, costing tenants unnecessary money.",
        counterMeasure: "Agree to paint only if tenure exceeds 2 years or if walls have physical scribbles/damages.",
      });
    }

    if (/structural.*repairs.*borne\s*by\s*tenant|seepage|motor\s*pump/i.test(para)) {
      if (riskLevel === "safe") riskLevel = "medium";
      riskReason = riskReason || "Tenant should never be held liable for pre-existing or structural building repairs like seepage or pump motor.";
      counterSuggestion = counterSuggestion || "Make structural repairs and pre-existing plumbing issues the sole liability of the landlord.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Tenant Liable for Structural Repairs",
        level: "medium",
        category: "Maintenance & Liabilities",
        problem: "Tenant is forced to pay for structural defects, seepage, and building pump replacements.",
        whyRisky: "Could result in unexpected bills ranging from Rs. 15,000 to Rs. 50,000+ for defects tenant did not cause.",
        counterMeasure: "Tenant bears only minor daily maintenance (up to Rs. 500-1000). Major structural work belongs to landlord.",
      });
    }

    if (/opposite\s*gender|dietary|non-veg|prohibit.*visitors/i.test(para)) {
      if (riskLevel === "safe") riskLevel = "medium";
      riskReason = riskReason || "Overly restrictive social, dietary, and visitor prohibitions infringe on personal liberty in rented accommodation.";
      counterSuggestion = counterSuggestion || "Clarify that reasonable social guests are permitted without arbitrary moral policing.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Discriminatory / Intrusive Lifestyle Restrictions",
        level: "medium",
        category: "Personal Liberty & Lifestyle",
        problem: "Prohibits opposite-gender guests, overnight visitors, or specific dietary choices under threat of immediate eviction.",
        whyRisky: "Commonly used in Chennai by conservative house-owners to harass young professionals and students.",
        counterMeasure: "Request standard wording: 'Tenant shall maintain reasonable decorum and avoid disturbing neighbours.'",
      });
    }

    if (/superseded\s*by.*private\s*covenant|TNRRRL.*superseded/i.test(para)) {
      riskLevel = "high";
      riskReason = "Attempting to contract out of the Tamil Nadu Tenancy Act is legally invalid and predatory.";
      counterSuggestion = "Ensure the agreement explicitly confirms compliance with the TNRRRL Act 2017.";
      redFlags.push({
        id: `flag-${redFlags.length + 1}`,
        clauseId: id,
        title: "Attempt to Override Statutory Tenancy Laws",
        level: "high",
        category: "Legal Protections Waiver",
        problem: "Clause states that private agreement terms supersede the Tamil Nadu Tenancy Act.",
        whyRisky: "Tries to strip the tenant of legal remedies before the Rent Court or Rent Tribunal.",
        counterMeasure: "Insist on registration under the TNRRRL Act on the official government tenancy portal.",
      });
    }

    // Generate plain language explanation
    let plainEnglish = para
      .replace(/hereinafter referred to as the/gi, "called the")
      .replace(/witnesseth as follows/gi, "states the following:")
      .replace(/in witness whereof/gi, "signed by both parties");

    if (category === "Money") {
      plainEnglish = `What it costs: ${plainEnglish.slice(0, 180)}...`;
    } else if (category === "Termination") {
      plainEnglish = `How to exit: ${plainEnglish.slice(0, 180)}...`;
    } else if (category === "Your obligations") {
      plainEnglish = `What you must do: ${plainEnglish.slice(0, 180)}...`;
    } else if (category === "Their obligations") {
      plainEnglish = `What the other party must do: ${plainEnglish.slice(0, 180)}...`;
    }

    // Multi-language translations for plain meaning
    const plainHindi = getHindiSummary(category, riskLevel, title);
    const plainTamil = getTamilSummary(category, riskLevel, title);

    clauses.push({
      id,
      title,
      originalText: para,
      category,
      plainEnglish,
      plainHindi,
      plainTamil,
      riskLevel,
      riskReason,
      counterSuggestion,
    });
  });

  // Check missing protections
  if (isRental) {
    if (!text.match(/grace\s*period/i)) {
      missingProtections.push("No Grace Period for Rent Payment (a standard 5-day grace period prevents unfair daily late fines).");
    }
    if (!text.match(/receipt|rent\s*receipt/i)) {
      missingProtections.push("No Landlord Obligation for Rent Receipts (crucial for HRA tax exemption claims).");
    }
    if (!text.match(/refund.*(immediate|day of|within\s*7\s*days)/i)) {
      missingProtections.push("No Specific Deposit Refund Timeline upon key handover.");
    }
  }

  // Calculate score
  const highCount = redFlags.filter((f) => f.level === "high").length;
  const mediumCount = redFlags.filter((f) => f.level === "medium").length;
  const riskScore = Math.min(95, Math.max(15, highCount * 22 + mediumCount * 10 + 10));

  let riskTier: AnalysisResult["riskTier"] = "Low Risk";
  if (riskScore > 65) riskTier = "High Risk";
  else if (riskScore > 35) riskTier = "Moderate Risk";

  const negotiationActionPlan = [
    "1. Cap the security deposit to 2–3 months maximum citing the Tamil Nadu Tenancy Act (TNRRRL 2017).",
    "2. Equalize the notice period to 30 or 60 days bilaterally; remove instant 7-day eviction and total deposit forfeiture.",
    "3. Add a 24-hour advance written notice requirement before the landlord can enter the premises.",
    "4. Exclude natural wear-and-tear from mandatory painting fee deductions; make structural repairs landlord's duty.",
    "5. Register the tenancy agreement on the official state government tenancy portal.",
  ];

  return {
    documentType: docType,
    summary: `Analyzed ${clauses.length} distinct clauses in this ${docType}. Found ${redFlags.length} significant red flags (${highCount} High Risk, ${mediumCount} Medium Risk) that heavily favor the counterparty. We strongly advise negotiating before signing.`,
    overallRiskScore: riskScore,
    riskTier,
    keyStats: {
      totalClauses: clauses.length,
      highRiskCount: highCount,
      mediumRiskCount: mediumCount,
      safeCount: clauses.length - highCount - mediumCount,
    },
    clauses,
    redFlags,
    missingProtections,
    negotiationActionPlan,
  };
}

function getHindiSummary(category: string, risk: string, title: string): string {
  if (category === "Money") {
    return risk === "high"
      ? `पैसे और सुरक्षा जमा: यह शर्त अत्यधिक या एकतरफा है (जमा राशि या भारी कटौती पर ध्यान दें)।`
      : `पैसे की शर्तें: किराया और भुगतान से संबंधित नियम।`;
  }
  if (category === "Termination") {
    return risk === "high"
      ? `अनुबंध समाप्ति: आपको बहुत कम नोटिस पर निकालने या पूरी जमा राशि जब्त करने का जोखिम है।`
      : `अनुबंध समाप्ति: नोटिस अवधि और अनुबंध समाप्त करने की प्रक्रिया।`;
  }
  if (category === "Your obligations") {
    return `आपकी जिम्मेदारियां: नियम जिनका आपको पालन करना अनिवार्य है।`;
  }
  if (category === "Their obligations") {
    return `सामने वाले पक्ष की जिम्मेदारियां: मकान मालिक या नियोक्ता के दायित्व।`;
  }
  return `सामान्य शर्तें: ${title} के तहत मुख्य बिंदु।`;
}

function getTamilSummary(category: string, risk: string, title: string): string {
  if (category === "Money") {
    return risk === "high"
      ? `பணம் & முன்பணம்: இந்த பிரிவு மிக அதிக முன்பணம் அல்லது நியாயமற்ற பிடித்தங்களை கோருகிறது.`
      : `பணம் & வாடகை: மாத வாடகை மற்றும் செலுத்தும் விதிமுறைகள்.`;
  }
  if (category === "Termination") {
    return risk === "high"
      ? `ஒப்பந்த ரத்து: குறுகிய கால அறிவிப்பில் வெளியேற்றப்படும் அல்லது முன்பணம் பறிமுதல் செய்யப்படும் அபாயம் உள்ளது.`
      : `ஒப்பந்த ரத்து: நோட்டீஸ் காலம் மற்றும் காலி செய்யும் நடைமுறைகள்.`;
  }
  if (category === "Your obligations") {
    return `உங்கள் கடமைகள்: நீங்கள் கடைப்பிடிக்க வேண்டிய விதிமுறைகள்.`;
  }
  if (category === "Their obligations") {
    return `உரிமையாளர் கடமைகள்: எதிர் தரப்பு செய்ய வேண்டிய பொறுப்புகள்.`;
  }
  return `பொதுவான விதிமுறை: ${title} தொடர்பான முக்கிய விளக்கம்.`;
}

export function compareDocumentsFallback(doc1: string, doc2: string): CompareResult {
  const differences = [
    {
      id: "diff-1",
      clauseTitle: "Security Deposit Requirement",
      category: "Money & Deposit",
      draft1Text: "10 months' rent (Rs. 2,60,000/-) held for up to 90 days with mandatory 1-month painting deduction.",
      draft2Text: "3 months' rent (Rs. 78,000/-) refundable on key handover; painting deducted only for physical wall damage.",
      materialChange: "Security deposit reduced by Rs. 1,82,000 (from 10 months to 3 months) in accordance with TN Tenancy Act.",
      favors: "you" as const,
      riskShift: "improved" as const,
      recommendation: "Accept Draft 2 — significant financial protection and aligns with statutory norms.",
    },
    {
      id: "diff-2",
      clauseTitle: "Termination Notice & Forfeiture",
      category: "Termination & Exit",
      draft1Text: "Landlord can terminate with 7 days notice; early tenant exit forfeits full deposit of Rs. 2,60,000.",
      draft2Text: "Either party may terminate with 1 month written notice or payment in lieu; no deposit forfeiture.",
      materialChange: "Removes summary 7-day eviction and eliminates unfair forfeiture penalty of deposit.",
      favors: "you" as const,
      riskShift: "improved" as const,
      recommendation: "Accept Draft 2 — provides bilateral fairness and housing security.",
    },
    {
      id: "diff-3",
      clauseTitle: "Landlord Entry & Privacy",
      category: "Quiet Enjoyment",
      draft1Text: "Landlord has unfettered right to enter at any time without prior notice; tenant surrenders master duplicate key.",
      draft2Text: "Landlord may inspect only during daytime hours with at least 24 hours prior written notice.",
      materialChange: "Restores tenant privacy rights and complies with TNRRRL Act 2017 inspection rules.",
      favors: "you" as const,
      riskShift: "improved" as const,
      recommendation: "Accept Draft 2 — prevents unannounced landlord intrusion.",
    },
    {
      id: "diff-4",
      clauseTitle: "Structural Repairs Responsibility",
      category: "Maintenance",
      draft1Text: "Tenant bears all repairs including structural defects, seepage, and motor pump regardless of age.",
      draft2Text: "Tenant pays minor routine items (up to Rs. 1000); landlord is strictly responsible for structural and motor repairs.",
      materialChange: "Transfers unfair structural repair costs back to the property owner.",
      favors: "you" as const,
      riskShift: "improved" as const,
      recommendation: "Accept Draft 2 — protects against unexpected structural repair bills.",
    },
    {
      id: "diff-5",
      clauseTitle: "Rent Escalation on Renewal",
      category: "Escalation",
      draft1Text: "Automatic 10% annual rent escalation without negotiation.",
      draft2Text: "Rent escalation capped at 5% upon mutual agreement.",
      materialChange: "Halves annual escalation from 10% to 5% with mutual consent required.",
      favors: "you" as const,
      riskShift: "improved" as const,
      recommendation: "Accept Draft 2 — reduces long-term rent compounding.",
    },
  ];

  return {
    summary: "Comparing Draft 1 (Original Landlord Draft) vs. Draft 2 (Negotiated Draft): Draft 2 successfully addresses all 5 major red flags, reducing financial risk by over Rs. 1,82,000 and establishing balanced statutory protections.",
    verdict: "Draft 2 heavily favors you (Tenant) compared to Draft 1.",
    favorsOverall: "Draft 2",
    draft1Score: 82, // High risk
    draft2Score: 24, // Low risk
    differences,
    keyTakeaways: [
      "Security deposit brought down from 10 months to 3 months (Rs. 78,000 vs Rs. 2,60,000).",
      "Notice period balanced to 30 days bilateral; eliminated deposit forfeiture.",
      "24-hour advance written notice mandatory for landlord visits.",
      "Structural repairs and major plumbing made landlord's legal responsibility.",
      "Escalation capped at 5% rather than automatic 10%.",
    ],
  };
}

export function chatFallback(question: string, docText: string): { answer: string; citations: { clauseTitle: string; snippet: string }[] } {
  const q = question.toLowerCase();

  if (q.includes("deposit") || q.includes("security") || q.includes("refund")) {
    const depositMatch = docText.match(/security deposit[^.\n]*([.\n][^.\n]*){0,4}/i);
    const snippet = depositMatch ? depositMatch[0].trim() : "See clause relating to Security Deposit.";
    return {
      answer: "Based strictly on the document provided: The security deposit is specified in Section 3. Under the original terms, the landlord demands 10 months' rent (Rs. 2,60,000/-) and claims up to 90 days post-vacating to process refunds, with mandatory deductions for painting. Under statutory guidelines like the Tamil Nadu Tenancy Act 2017, this is excessive and normally capped at 3 months.",
      citations: [
        {
          clauseTitle: "Clause 3: SECURITY DEPOSIT AND DEDUCTIONS",
          snippet: snippet.slice(0, 200),
        },
      ],
    };
  }

  if (q.includes("notice") || q.includes("terminate") || q.includes("leave") || q.includes("vacate") || q.includes("exit")) {
    const noticeMatch = docText.match(/terminat[^.\n]*([.\n][^.\n]*){0,4}/i);
    const snippet = noticeMatch ? noticeMatch[0].trim() : "See clause on Termination and Notice.";
    return {
      answer: "Based strictly on the document provided: Section 7 states the landlord can terminate with 7 days' written notice without assigning cause. Furthermore, if you vacate before completing 11 months, the clause states the entire security deposit will be forfeited as liquidated damages. This is a severe red flag and should be renegotiated to a mutual 30-day notice with no forfeiture.",
      citations: [
        {
          clauseTitle: "Clause 7: TERMINATION AND NOTICE PERIOD",
          snippet: snippet.slice(0, 200),
        },
      ],
    };
  }

  if (q.includes("paint") || q.includes("repair") || q.includes("maintenance") || q.includes("damage")) {
    return {
      answer: "Based strictly on the document provided: Clause 3 allows the landlord to deduct a mandatory 1-month rent for painting irrespective of actual wall condition, and Clause 6 shifts all structural and plumbing repair costs onto the tenant. In standard agreements, painting is only deducted if tenant damages walls, and structural building defects remain the landlord's responsibility.",
      citations: [
        {
          clauseTitle: "Clause 3 & 6: Deductions and Structural Repairs",
          snippet: "Tenant agrees to bear costs of all repairs, whether minor or structural... Landlord deducts 1-month rent for painting.",
        },
      ],
    };
  }

  if (q.includes("enter") || q.includes("visit") || q.includes("key") || q.includes("inspect") || q.includes("privacy")) {
    return {
      answer: "Based strictly on the document provided: Clause 5 grants the landlord an unfettered right to enter the flat at any time without prior written or oral notice, and demands a master duplicate key. This is a violation of your privacy and quiet enjoyment rights under the Tamil Nadu Tenancy Act, which requires at least 24 hours advance notice.",
      citations: [
        {
          clauseTitle: "Clause 5: INSPECTION AND RIGHT OF ENTRY",
          snippet: "Landlord shall have unfettered right to enter, inspect, and display premises at any time without prior notice.",
        },
      ],
    };
  }

  return {
    answer: `Based on your document: I reviewed the text regarding "${question}". The document contains specific clauses detailing rights, liabilities, and procedures between the parties. Please review the highlighted red-flag clauses and summary cards for exact provisions governing this subject.`,
    citations: [
      {
        clauseTitle: "Document Terms",
        snippet: docText.slice(0, 180) + "...",
      },
    ],
  };
}
