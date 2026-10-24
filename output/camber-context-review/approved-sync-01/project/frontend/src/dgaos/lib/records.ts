export type Kind = 'case'|'evidence'|'examination'|'report'|'profile';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LabRecord = {id:string;kind:Kind;caseId:string|null;revision:number;created:string;data:Record<string,any>};
export type Template = {id:string;name:string;module:string;method:string;fields:Array<{name:string;label:string;type:'text'|'textarea'|'select';options?:string[]}>;description?:string;isDefault?:boolean};

export const templates:Template[] = [
 {id:'tpl-glass-1',name:'Glass Fragment Analysis',module:'trace',method:'Stereomicroscopy',fields:[{name:'color',label:'Color observation',type:'select',options:['Colorless','Light amber','Dark amber','Other']},{name:'morphology',label:'Shape and morphology',type:'textarea'},{name:'fracture_pattern',label:'Fracture pattern',type:'select',options:['Conchoidal','Radial','Irregular','Not visible']},{name:'surface_condition',label:'Surface condition',type:'textarea'}],description:'Standard template for glass fragment microscopy examination',isDefault:true},
 {id:'tpl-fiber-1',name:'Fiber Examination',module:'trace',method:'Comparative microscopy',fields:[{name:'fiber_type',label:'Fiber type',type:'select',options:['Natural','Synthetic','Blend','Unknown']},{name:'color',label:'Color',type:'text'},{name:'diameter_microns',label:'Diameter (microns)',type:'text'},{name:'length_mm',label:'Length (mm)',type:'text'},{name:'cross_section',label:'Cross-sectional shape',type:'select',options:['Round','Triangular','Irregular','Flat','Other']}],description:'Standard fiber analysis template',isDefault:true},
 {id:'tpl-substance-1',name:'Substance Identification - Color Test',module:'toxicology',method:'Screening review',fields:[{name:'sample_amount',label:'Sample amount',type:'text'},{name:'reagent',label:'Reagent used',type:'text'},{name:'color_change',label:'Color change observed',type:'textarea'},{name:'presumptive_result',label:'Presumptive result',type:'select',options:['Positive','Negative','Inconclusive','Requires additional testing']}],description:'Initial substance screening template',isDefault:true},
 {id:'tpl-document-1',name:'Document Examination',module:'documents',method:'Feature comparison',fields:[{name:'document_type',label:'Document type',type:'select',options:['Handwriting','Printed','Mixed','Signature']},{name:'observable_features',label:'Observable features',type:'textarea'},{name:'variations_noted',label:'Variations noted',type:'textarea'},{name:'comparison_result',label:'Comparison result',type:'select',options:['Consistent with','Inconsistent with','Insufficient data']}],description:'Document analysis template',isDefault:true},
];

export const seed:LabRecord[] = [
  {
    "id": "EX-2026-068DD6F4",
    "kind": "examination",
    "caseId": "FS-2026-13AD9A0D",
    "revision": 1,
    "created": "2026-09-30T16:11:41.134Z",
    "data": {
      "title": "DGA TOXICOLOGY Requisition Protocol",
      "tags": [],
      "evidenceId": "EV-2026-1F2C475B",
      "module": "toxicology",
      "method": "Sample assessment",
      "analyst": "TRACE Forensic Specialist",
      "templateId": "",
      "worksheetValues": {},
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "suggestions": [],
      "history": []
    }
  },
  {
    "id": "EV-2026-1F2C475B",
    "kind": "evidence",
    "caseId": "FS-2026-13AD9A0D",
    "revision": 1,
    "created": "2026-09-30T16:11:41.095Z",
    "data": {
      "title": "Blood Specimen 412-A (Ambassador Vance)",
      "tags": [],
      "type": "Biological specimen",
      "description": "5mL whole blood extracted under nitrogen atmosphere. Refrigerated at 4Â°C in bio-transport container.",
      "seal": "SEAL-EV-194-A",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T16:11:41.095Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-A",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "FS-2026-13AD9A0D",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-30T16:11:41.046Z",
    "data": {
      "title": "[DGA LINKED] Operation Velvet Cord: Diplomatic Toxin Exposure",
      "tags": [
        "DGA-TRANSFER",
        "TRACE",
        "DGA-26-194"
      ],
      "summary": "Ambassador Christian Vance collapsed during closed-door bilateral trade discussions at Embassy Row. Initial toxicology indicates cholinesterase inhibition with an uncatalogued organophosphate analog. Immediate TRACE mass spectrometry and chemical profiling required to determine sovereign state origin.\n\n[Originating DGA Case: DGA-26-194 | Classification: TOP SECRET // NOFORN]",
      "submitter": "Special Agent Miracle Jerome",
      "module": "toxicology",
      "category": "Forensic Specimen Triage",
      "priority": "Priority",
      "status": "Active"
    }
  },
  {
    "id": "EX-2026-3006CEF4",
    "kind": "examination",
    "caseId": "FS-2026-255B3C1B",
    "revision": 1,
    "created": "2026-09-30T14:51:10.594Z",
    "data": {
      "title": "DGA BIOLOGY Requisition Protocol",
      "tags": [],
      "evidenceId": "EV-2026-10D3B2A8",
      "module": "biology",
      "method": "Visual examination",
      "analyst": "TRACE Forensic Specialist",
      "templateId": "",
      "worksheetValues": {},
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "suggestions": [],
      "history": []
    }
  },
  {
    "id": "EV-2026-3E422493",
    "kind": "evidence",
    "caseId": "FS-2026-255B3C1B",
    "revision": 1,
    "created": "2026-09-30T14:51:10.569Z",
    "data": {
      "title": "Audio Recording Summit Table Lapel Mic",
      "tags": [],
      "type": "Digital storage media",
      "description": "Encrypted WAV file capturing the 14 minutes preceding the collapse. Labored breathing detected at minute 11.",
      "seal": "SEAL-EV-194-C",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:51:10.569Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-C",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "EV-2026-61236E7D",
    "kind": "evidence",
    "caseId": "FS-2026-255B3C1B",
    "revision": 1,
    "created": "2026-09-30T14:51:10.542Z",
    "data": {
      "title": "Crystal Water Tumbler Rim Swab",
      "tags": [],
      "type": "Physical artifact",
      "description": "Sterile cotton swab of glassware edge handled by envoy prior to sudden loss of consciousness.",
      "seal": "SEAL-EV-194-B",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:51:10.542Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-B",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "EV-2026-10D3B2A8",
    "kind": "evidence",
    "caseId": "FS-2026-255B3C1B",
    "revision": 1,
    "created": "2026-09-30T14:51:10.516Z",
    "data": {
      "title": "Blood Specimen 412-A (Ambassador Vance)",
      "tags": [],
      "type": "Biological specimen",
      "description": "5mL whole blood extracted under nitrogen atmosphere. Refrigerated at 4Â°C in bio-transport container.",
      "seal": "SEAL-EV-194-A",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:51:10.516Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-A",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "FS-2026-255B3C1B",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-30T14:51:10.486Z",
    "data": {
      "title": "[DGA LINKED] Operation Velvet Cord: Diplomatic Toxin Exposure",
      "tags": [
        "DGA-TRANSFER",
        "TRACE",
        "DGA-26-194"
      ],
      "summary": "Ambassador Christian Vance collapsed during closed-door bilateral trade discussions at Embassy Row. Initial toxicology indicates cholinesterase inhibition with an uncatalogued organophosphate analog. Immediate TRACE mass spectrometry and chemical profiling required to determine sovereign state origin.\n\n[Originating DGA Case: DGA-26-194 | Classification: TOP SECRET // NOFORN]",
      "submitter": "Special Agent Miracle Jerome",
      "module": "toxicology",
      "category": "Forensic Specimen Triage",
      "priority": "Priority",
      "status": "Active"
    }
  },
  {
    "id": "EX-2026-EA69C501",
    "kind": "examination",
    "caseId": "FS-2026-9623E2D5",
    "revision": 1,
    "created": "2026-09-30T14:49:03.315Z",
    "data": {
      "title": "DGA TOXICOLOGY Requisition Protocol",
      "tags": [],
      "evidenceId": "EV-2026-B27AFCD5",
      "module": "toxicology",
      "method": "Sample assessment",
      "analyst": "TRACE Forensic Specialist",
      "templateId": "",
      "worksheetValues": {},
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "suggestions": [],
      "history": []
    }
  },
  {
    "id": "EV-2026-71C558E1",
    "kind": "evidence",
    "caseId": "FS-2026-9623E2D5",
    "revision": 1,
    "created": "2026-09-30T14:49:03.289Z",
    "data": {
      "title": "Audio Recording Summit Table Lapel Mic",
      "tags": [],
      "type": "Digital storage media",
      "description": "Encrypted WAV file capturing the 14 minutes preceding the collapse. Labored breathing detected at minute 11.",
      "seal": "SEAL-EV-194-C",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:49:03.289Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-C",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "EV-2026-1B2D73BF",
    "kind": "evidence",
    "caseId": "FS-2026-9623E2D5",
    "revision": 1,
    "created": "2026-09-30T14:49:03.262Z",
    "data": {
      "title": "Crystal Water Tumbler Rim Swab",
      "tags": [],
      "type": "Physical artifact",
      "description": "Sterile cotton swab of glassware edge handled by envoy prior to sudden loss of consciousness.",
      "seal": "SEAL-EV-194-B",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:49:03.262Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-B",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "EV-2026-B27AFCD5",
    "kind": "evidence",
    "caseId": "FS-2026-9623E2D5",
    "revision": 1,
    "created": "2026-09-30T14:49:03.234Z",
    "data": {
      "title": "Blood Specimen 412-A (Ambassador Vance)",
      "tags": [],
      "type": "Biological specimen",
      "description": "5mL whole blood extracted under nitrogen atmosphere. Refrigerated at 4Â°C in bio-transport container.",
      "seal": "SEAL-EV-194-A",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T14:49:03.234Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-194-A",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "FS-2026-9623E2D5",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-30T14:49:03.203Z",
    "data": {
      "title": "[DGA LINKED] Operation Velvet Cord: Diplomatic Toxin Exposure",
      "tags": [
        "DGA-TRANSFER",
        "TRACE",
        "DGA-26-194"
      ],
      "summary": "Ambassador Christian Vance collapsed during closed-door bilateral trade discussions at Embassy Row. Initial toxicology indicates cholinesterase inhibition with an uncatalogued organophosphate analog. Immediate TRACE mass spectrometry and chemical profiling required to determine sovereign state origin.\n\n[Originating DGA Case: DGA-26-194 | Classification: TOP SECRET // NOFORN]",
      "submitter": "Special Agent Miracle Jerome",
      "module": "toxicology",
      "category": "Forensic Specimen Triage",
      "priority": "Priority",
      "status": "Active"
    }
  },
  {
    "id": "EX-2026-B0212774",
    "kind": "examination",
    "caseId": "FS-2026-548D8C97",
    "revision": 1,
    "created": "2026-09-30T13:10:59.324Z",
    "data": {
      "title": "DGA TRACE Requisition Protocol",
      "tags": [],
      "evidenceId": "EV-2026-144A4622",
      "module": "trace",
      "method": "Stereomicroscopy",
      "analyst": "TRACE Forensic Specialist",
      "templateId": "",
      "worksheetValues": {},
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "suggestions": [],
      "history": []
    }
  },
  {
    "id": "EX-2026-4C1B3AFC",
    "kind": "examination",
    "caseId": "FS-2026-548D8C97",
    "revision": 1,
    "created": "2026-09-30T13:10:59.293Z",
    "data": {
      "title": "DGA TOXICOLOGY Requisition Protocol",
      "tags": [],
      "evidenceId": "EV-2026-144A4622",
      "module": "toxicology",
      "method": "Sample assessment",
      "analyst": "TRACE Forensic Specialist",
      "templateId": "",
      "worksheetValues": {},
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "suggestions": [],
      "history": []
    }
  },
  {
    "id": "EV-2026-144A4622",
    "kind": "evidence",
    "caseId": "FS-2026-548D8C97",
    "revision": 1,
    "created": "2026-09-30T13:10:59.259Z",
    "data": {
      "title": "EEPROM Flash Memory Chip (Substation 14-B)",
      "tags": [],
      "type": "Digital storage media",
      "description": "Physical SPI flash memory desoldered from motherboard.",
      "seal": "SEAL-EV-091-A",
      "location": "TRACE Vault Room B - Biohazard Lock 4",
      "custodian": "TRACE Evidence Officer",
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-30T13:10:59.259Z",
          "from": "Special Agent Miracle Jerome",
          "to": "TRACE Evidence Officer",
          "location": "TRACE Vault Room B - Biohazard Lock 4",
          "seal": "SEAL-EV-091-A",
          "reason": "Initial receipt"
        }
      ]
    }
  },
  {
    "id": "FS-2026-548D8C97",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-30T13:10:59.212Z",
    "data": {
      "title": "[DGA LINKED] Operation Iron Grid: SCADA Logic Controller Infiltration",
      "tags": [
        "DGA-TRANSFER",
        "CIPHER",
        "CYB-26-091"
      ],
      "summary": "Malicious payload identified in Siemens S7-1500 controller firmware controlling electrical substation 14-B. Ingress utilized custom command injection targeting safety trip governors. Immediate forensic analysis of binary memory dumps required.\n\n[Originating DGA Case: CYB-26-091 | Classification: TOP SECRET // NOFORN]",
      "submitter": "Special Agent Miracle Jerome",
      "module": "toxicology",
      "category": "Forensic Specimen Triage",
      "priority": "Priority",
      "status": "Active"
    }
  },
  {
    "id": "FS-2026-10888390",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-29T12:45:23.043Z",
    "data": {
      "title": "[DGA LINKED] Operation Test Verification",
      "tags": [
        "DGA-TRANSFER",
        "TEST"
      ],
      "summary": "Verification of DGA to TRACE API transmission protocol.",
      "submitter": "Special Agent Miracle Jerome",
      "module": "toxicology",
      "category": "Forensic Specimen Triage",
      "priority": "Priority",
      "status": "Active"
    }
  },
  {
    "id": "FS-2026-00422",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-12T02:15:00Z",
    "data": {
      "title": "The Broad Street Vault Breach: Sub-Level Infiltration",
      "category": "Commercial Burglary & Cyber Intrusion",
      "module": "trace",
      "priority": "Critical",
      "status": "Awaiting Acceptance",
      "summary": "Perpetrators breached Sub-Level 2 reinforced steel vault using an exothermic thermite lance and RFID credential replay. Awaiting Lead Investigator review and official acceptance signature.",
      "submitter": "First Federal Depository & Police Liaison",
      "sample": false,
      "tags": [
        "cyber-intrusion",
        "thermite",
        "vault-burglary",
        "metallurgy"
      ]
    }
  },
  {
    "id": "RP-2026-0001",
    "kind": "report",
    "caseId": "FS-2026-00421",
    "revision": 2,
    "created": "2026-09-08T15:00:00Z",
    "data": {
      "title": "Laboratory Examination Report: Fiber Comparison",
      "examinationId": "EX-0004",
      "author": "Lab analyst",
      "status": "Approved",
      "summary": "Comparative optical and polarized light microscopy of questioned fiber specimen EV-0002 confirmed consistent trilobal cross-section, diameter (18 Âµm), and birefringence with reference textile standard.",
      "limitations": "Microscopic fiber comparisons are class-characteristic associations. They do not constitute an exclusive or unique source attribution.",
      "history": [
        {
          "at": "2026-09-08T15:30:00Z",
          "status": "In review",
          "reviewer": "Technical Reviewer",
          "note": "Submitted draft for independent peer review and administrative verification."
        },
        {
          "at": "2026-09-09T14:40:13.862Z",
          "status": "Approved",
          "reviewer": "Technical Reviewer",
          "note": "Methodology verified, findings supported by observations."
        }
      ],
      "examinationSnapshot": {
        "title": "Polarized light fiber examination",
        "analyst": "Lab analyst",
        "method": "Comparative microscopy"
      }
    }
  },
  {
    "id": "EX-0004",
    "kind": "examination",
    "caseId": "FS-2026-00421",
    "revision": 3,
    "created": "2026-09-08T13:30:00Z",
    "data": {
      "title": "Polarized light fiber examination",
      "evidenceId": "EV-0002",
      "module": "trace",
      "method": "Comparative microscopy",
      "status": "Completed",
      "observations": "Mounted fiber specimen examined under cross-polarized light at 100x and 200x. Observed synthetic trilobal cross-section with high birefringence and second-order interference colors. Diameter: approx 18 microns. Matching reference acrylic/wool blend.",
      "conclusion": "The questioned blue fibers exhibit morphological dimensions and optical birefringence characteristics consistent with the supplied reference standard.",
      "limitations": "Fiber examination provides class-level association. Shared morphological and optical properties indicate consistent origin, but do not provide individual source identification.",
      "analyst": "Lab analyst",
      "templateId": "tpl-fiber-1",
      "suggestions": []
    }
  },
  {
    "id": "EX-0001",
    "kind": "examination",
    "caseId": "FS-2026-00421",
    "revision": 2,
    "created": "2026-09-08T12:00:00Z",
    "data": {
      "title": "Glass morphology assessment",
      "evidenceId": "EV-0001",
      "module": "trace",
      "method": "Stereomicroscopy",
      "status": "In progress",
      "observations": "Three colorless glass fragments examined under comparison bridge.\nRefractive match observed.",
      "conclusion": "Consistent with window glass standard.",
      "limitations": "Non-destructive optical screening only; density not determined.",
      "analyst": "Lab analyst",
      "templateId": "tpl-glass-1",
      "suggestions": [
        "Count and measure fragments if microscopically distinguishable"
      ]
    }
  },
  {
    "id": "EV-0002",
    "kind": "evidence",
    "caseId": "FS-2026-00421",
    "revision": 1,
    "created": "2026-09-08T10:05:00Z",
    "data": {
      "title": "Blue textile fibers",
      "type": "Fiber",
      "seal": "Intact",
      "location": "Secure storage Â· A-05",
      "custodian": "Lab analyst",
      "description": "Paper bindle enclosed in a sealed evidence envelope.",
      "tags": [
        "fiber",
        "textile"
      ],
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-08T10:05:00Z",
          "from": "Teaching collection",
          "to": "Lab analyst",
          "location": "Secure storage Â· A-05",
          "reason": "Initial receipt",
          "seal": "Intact"
        }
      ]
    }
  },
  {
    "id": "EV-0001",
    "kind": "evidence",
    "caseId": "FS-2026-00421",
    "revision": 1,
    "created": "2026-09-08T10:00:00Z",
    "data": {
      "title": "Glass fragments",
      "type": "Glass",
      "seal": "Intact",
      "location": "Secure storage Â· A-04",
      "custodian": "Lab analyst",
      "description": "Sealed rigid container containing three simulated glass fragments.",
      "tags": [
        "glass",
        "reference-material"
      ],
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-08T10:00:00Z",
          "from": "Teaching collection",
          "to": "Lab analyst",
          "location": "Secure storage Â· A-04",
          "reason": "Initial receipt",
          "seal": "Intact"
        }
      ]
    }
  },
  {
    "id": "FS-2026-00421",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-08T09:30:00Z",
    "data": {
      "title": "The conservatory window",
      "category": "Material comparison",
      "module": "trace",
      "priority": "Routine",
      "status": "Active",
      "summary": "Training scenario: assess whether recovered glass fragments and fibers are consistent with the supplied reference materials.",
      "submitter": "TRACE teaching collection",
      "sample": true,
      "tags": [
        "material-comparison",
        "training"
      ]
    }
  },
  {
    "id": "EX-0002",
    "kind": "examination",
    "caseId": "FS-2026-00420",
    "revision": 2,
    "created": "2026-09-07T11:00:00Z",
    "data": {
      "title": "Presumptive chemical spot screening",
      "evidenceId": "EV-0003",
      "module": "toxicology",
      "method": "Screening review",
      "status": "In progress",
      "observations": "Aliquots prepared for microchemical screening. Marquis reagent and negative control blanks staged in spot test plate.\n\n--- OPEN BENCH FINDINGS IMPORTED (8:02:04 PM) ---\n[20:01:55 Spot Test Plate Â· Specimen: Standard Architectural Float Glass Shard]\nChemical Spot Plate (Sodium Rhodizonate)\nPresumptive chemical spot test performed using Sodium Rhodizonate. Tested aliquot findings: [Sample A (Primary Residue): rapid color shift to scarlet-to-dark violet complex (lead positive) (Presumptive Positive with Sodium Rhodizonate); Positive Reference Standard: rapid color shift to scarlet-to-dark violet complex (lead positive) (Presumptive Positive with Sodium Rhodizonate); Sample B (Confirmatory Aliquot): rapid color shift to scarlet-to-dark violet complex (lead positive) (Presumptive Positive with Sodium Rhodizonate)] within 0.2s. Negative control blank: remained clear/colorless (QC verified intact, no reagent contamination). Confirmatory instrumental testing recommended prior to final attribution.\nReaction time: 0.2s | Result: Presumptive Positive with Sodium Rhodizonate | Negative control: Verified",
      "conclusion": "",
      "limitations": "",
      "analyst": "Lab analyst",
      "templateId": "tpl-substance-1",
      "suggestions": [
        "Positive results should be confirmed with more specific techniques",
        "Document reagent batch and expiration date",
        "Consider interferences or false positives"
      ],
      "worksheetValues": {}
    }
  },
  {
    "id": "EV-0003",
    "kind": "evidence",
    "caseId": "FS-2026-00420",
    "revision": 1,
    "created": "2026-09-07T10:15:00Z",
    "data": {
      "title": "Crystalline residue vial",
      "type": "Powder / Chemical",
      "seal": "Intact",
      "location": "Toxicology locker Â· T-02",
      "custodian": "Lab analyst",
      "description": "Sealed glass vial containing approx. 15mg off-white crystalline residue recovered from scene.",
      "tags": [
        "toxicology",
        "screening",
        "powder"
      ],
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-07T10:15:00Z",
          "from": "Teaching collection",
          "to": "Lab analyst",
          "location": "Toxicology locker Â· T-02",
          "reason": "Initial intake",
          "seal": "Intact"
        }
      ]
    }
  },
  {
    "id": "FS-2026-00420",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-07T10:00:00Z",
    "data": {
      "title": "An unknown substance",
      "category": "Substance identification",
      "module": "toxicology",
      "priority": "Priority",
      "status": "Active",
      "summary": "Training scenario: document a screening review and its limitations. No analytical instrument results are generated automatically.",
      "submitter": "TRACE teaching collection",
      "sample": true,
      "tags": [
        "substance-id",
        "toxicology"
      ]
    }
  },
  {
    "id": "EX-0003",
    "kind": "examination",
    "caseId": "FS-2026-00419",
    "revision": 1,
    "created": "2026-09-06T12:30:00Z",
    "data": {
      "title": "Handwriting feature and ink comparison",
      "evidenceId": "EV-0004",
      "module": "documents",
      "method": "Feature comparison",
      "status": "Planned",
      "observations": "",
      "conclusion": "",
      "limitations": "",
      "analyst": "Lab analyst",
      "templateId": "tpl-document-1",
      "suggestions": [
        "Compare baseline slant and terminal pen strokes against known exemplars",
        "Document lighting angle to reveal indented impressions"
      ]
    }
  },
  {
    "id": "EV-0004",
    "kind": "evidence",
    "caseId": "FS-2026-00419",
    "revision": 1,
    "created": "2026-09-06T11:20:00Z",
    "data": {
      "title": "Questioned robbery demand note",
      "type": "Document",
      "seal": "Intact",
      "location": "Document vault Â· D-01",
      "custodian": "Lab analyst",
      "description": "Single-page lined notepad paper with black ballpoint ink inscription, secured in transparent evidence sleeve.",
      "tags": [
        "questioned-document",
        "handwriting"
      ],
      "attachments": [],
      "custody": [
        {
          "at": "2026-09-06T11:20:00Z",
          "from": "Teaching collection",
          "to": "Lab analyst",
          "location": "Document vault Â· D-01",
          "reason": "Initial intake",
          "seal": "Intact"
        }
      ]
    }
  },
  {
    "id": "FS-2026-00419",
    "kind": "case",
    "caseId": null,
    "revision": 1,
    "created": "2026-09-06T11:00:00Z",
    "data": {
      "title": "A handwritten note",
      "category": "Document comparison",
      "module": "documents",
      "priority": "Routine",
      "status": "Active",
      "summary": "Training scenario: compare observable features and distinguish observations from interpretation.",
      "submitter": "TRACE teaching collection",
      "sample": true,
      "tags": [
        "document",
        "comparison"
      ]
    }
  }
];
