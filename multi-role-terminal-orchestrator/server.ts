import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient helper to call Gemini with model fallback, dynamic cooldowns, and retries
const FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];
const modelCooldowns = new Map<string, number>();

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    responseSchema?: any;
    temperature?: number;
  }
) {
  let lastError: any = null;
  const now = Date.now();

  for (const model of FALLBACK_MODELS) {
    const cooldownUntil = modelCooldowns.get(model) || 0;
    if (cooldownUntil > now) {
      // Model is currently in cooldown, skip to next available model
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          temperature: params.temperature ?? 0.8,
          ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isNotFound = errMsg.includes('404') || errMsg.includes('not found');
      const isQuotaOrOverload =
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('high demand') ||
        errMsg.includes('quota') ||
        errMsg.includes('UNAVAILABLE');

      if (isNotFound) {
        // Model not available in this tier or region, disable for 24h
        modelCooldowns.set(model, Date.now() + 24 * 60 * 60 * 1000);
      } else if (isQuotaOrOverload) {
        // Cooldown for 5 minutes
        modelCooldowns.set(model, Date.now() + 5 * 60 * 1000);
      }
      // Continue trying next candidate model
    }
  }

  throw lastError || new Error('All AI models are currently unavailable.');
}

const app = express();
app.use(express.json());
const PORT = 3000;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Fallback procedural events generator in case API key is missing or model rate-limited
function generateProceduralEvents(count = 2, existingContext?: string) {
  const getUniqueSuffix = () => `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  const templates = [
    {
      id: `med_${getUniqueSuffix()}`,
      module: 'medical',
      event_type: 'chart_update',
      urgency: 'critical',
      sender: 'ER Triage Bay 3',
      payload: {
        patient_name: 'Elena Rostova',
        age: 34,
        vitals: 'HR 142 bpm, BP 82/52 mmHg, SpO2 91%, Temp 39.1°C',
        symptoms: 'Acute abdominal rigidity, rebound tenderness, altered sensorium following trauma. High risk of septic or hemorrhagic shock.',
        history: 'No known allergies. Found unconscious near Industrial District.',
        triage_category: 'Immediate / Red',
        actions_available: ['Administer 2L IV Normal Saline Bolus', 'Order Emergency FAST Ultrasound', 'Administer Broad-Spectrum Antibiotics', 'Surgical Consult for Exploratory Laparotomy'],
      },
    },
    {
      id: `inv_${getUniqueSuffix()}`,
      module: 'investigation',
      event_type: 'system_report',
      urgency: 'elevated',
      sender: 'Digital Forensics & Ballistics',
      payload: {
        case_file_id: `CF-${Math.floor(700 + Math.random() * 300)}`,
        suspect_name: 'Marcus Vance (Alias: "Specter")',
        evidence_summary: 'Encrypted flash drive recovered from warehouse docks. Decrypted audio log references a synchronized power grid sabotage scheduled for 22:00.',
        clue_type: 'Digital & Acoustic Spectrum',
        confidence_level: '88%',
        actions_available: ['Cross-reference Transit CCTV on 4th Street', 'Issue Subpoena for Telemetry Logs', 'Deploy Field Unit for Geo-Tracking', 'Request Interrogation Warrant'],
      },
    },
    {
      id: `disp_${getUniqueSuffix()}`,
      module: 'dispatch',
      event_type: 'incoming_call',
      urgency: 'critical',
      sender: 'City Metro 911 Communications',
      payload: {
        system_alert: 'Code 3 Multi-Vehicle Collision with hazardous material tanker leak on Sector 4 Elevated Highway.',
        required_action: 'Deploy Fire Suppression Unit 4, EMT Paramedic Squads 2 & 7, and enforce 500m Police Perimeter.',
        location: 'Sector 4 Junction & 9th Ave Bridge',
        units_recommended: ['Engine-04', 'Medic-02', 'Medic-07', 'Patrol-12', 'Hazmat-01'],
        actions_available: ['Dispatch Full Hazmat & Rescue Task Force', 'Route Medical Evac to Saint Jude ER', 'Issue City Transit Reroute Advisory', 'Request Police Tactical Crowd Control'],
      },
    },
    {
      id: `med_${getUniqueSuffix()}`,
      module: 'medical',
      event_type: 'incoming_call',
      urgency: 'elevated',
      sender: 'Cardiology Telemetry ICU',
      payload: {
        patient_name: 'David Chen',
        age: 58,
        vitals: 'HR 48 bpm (Sinus Bradycardia), BP 105/65, SpO2 96%',
        symptoms: 'Intermittent crushing substernal chest discomfort radiating to left jaw. ST-elevation in leads II, III, aVF.',
        history: 'Type 2 Diabetes, Hypertension.',
        triage_category: 'Urgent / Orange',
        actions_available: ['Activate Cardiac Catheterization Lab', 'Administer Chewable Aspirin 324mg & Nitroglycerin Sublingual', 'Order STAT Troponin I & CK-MB', 'Administer IV Heparin Bolus'],
      },
    },
    {
      id: `inv_${getUniqueSuffix()}`,
      module: 'investigation',
      event_type: 'chart_update',
      urgency: 'routine',
      sender: 'City Cyber Crimes Bureau',
      payload: {
        case_file_id: `CF-${Math.floor(500 + Math.random() * 200)}`,
        suspect_name: 'Dr. Arthur Sterling',
        evidence_summary: 'Financial audit reveals 14 offshore shell transactions matching pharmaceutical supply divert logs.',
        clue_type: 'Financial Ledger Analysis',
        confidence_level: '94%',
        actions_available: ['Freeze Offshore Accounts', 'Summon for Deposition', 'Link with ER Medical Inventory Audit', 'Issue International Travel Flag'],
      },
    },
    {
      id: `disp_${getUniqueSuffix()}`,
      module: 'dispatch',
      event_type: 'system_report',
      urgency: 'elevated',
      sender: 'Substation Grid Supervisory Control',
      payload: {
        system_alert: 'Grid Overload Sensor tripped in Commercial District. Brownout imminent in Substation 9.',
        required_action: 'Reroute auxiliary backup battery reserves and deploy Rapid Response Utility crew.',
        location: 'Substation 9, Commercial Hub',
        units_recommended: ['Utility-03', 'Patrol-08'],
        actions_available: ['Authorize Auxiliary Grid Switchover', 'Dispatch Emergency Maintenance Crew', 'Alert District Hospitals to Diesel Generator Readiness'],
      },
    },
  ];

  // Deep clone each template item and regenerate unique IDs on every dispatch
  const shuffled = [...templates]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map((tmpl) => ({
      ...tmpl,
      id: `${tmpl.module.slice(0, 3)}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    }));

  return shuffled;
}

// Multi-Agent Orchestrator Event Generation Route
app.post('/api/orchestrator/generate-events', async (req, res) => {
  try {
    const {
      activeEvents = [],
      recentActions = [],
      scenarioTheme = '',
      urgencyBias = 'balanced',
      count = 2,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Return rich procedural simulation events
      const events = generateProceduralEvents(count);
      return res.json({
        source: 'procedural_engine',
        event_queue: events,
        orchestrator_note: 'Operating in local simulation mode (API key unconfigured or running offline).',
      });
    }

    const systemPrompt = `You are the central Multi-Agent Orchestrator Engine for a high-intensity multi-role desktop simulation game.
The player operates a master terminal connecting three distinct professional systems:
1. "medical" (Hospital ER / ICU patient charting, diagnosis, vitals, clinical emergency interventions)
2. "investigation" (Detective forensic bureau, suspect dossiers, encrypted evidence, wiretaps, ballistics)
3. "dispatch" (Metropolitan 911 emergency coordination, grid infrastructure, rapid police/fire/EMT deployment)

CORE CONSTRAINTS:
1. Output ONLY valid JSON matching the exact schema. No markdown backticks outside the JSON or conversational filler.
2. Contextual Consistency: Reference past events or actions when provided. Connect clues or causal threads between modules when interesting (e.g. an investigation suspect injured and brought to Medical, or a Dispatch crash yielding a Forensics case).
3. Schema Strictness: Output an object with key "event_queue" containing ${count} realistic, compelling event objects.

SCHEMA RULES:
- id: unique string (e.g. "med_8492", "inv_3301", "disp_7210")
- module: "medical" | "investigation" | "dispatch"
- event_type: "incoming_call" | "text_message" | "system_report" | "chart_update"
- urgency: "routine" | "elevated" | "critical"
- sender: department or caller name (e.g. "ER Triage Bay 2", "Forensics Lab", "Central 911 Dispatch")
- payload:
  * For medical: { "patient_name": string, "age"?: number, "vitals": string (e.g. "HR 130, BP 90/60, SpO2 92%"), "symptoms": string, "history"?: string, "triage_category"?: string, "actions_available": string[] }
  * For investigation: { "case_file_id": string, "suspect_name": string, "evidence_summary": string, "clue_type"?: string, "confidence_level"?: string, "actions_available": string[] }
  * For dispatch: { "system_alert": string, "required_action": string, "location"?: string, "units_recommended"?: string[], "actions_available": string[] }`;

    const userPrompt = `Generate ${count} proactive incoming orchestrator events for the simulation.
Current Scenario Theme: ${scenarioTheme || 'Active Metro Shift Under Pressure'}
Urgency Bias: ${urgencyBias}
Recent Resolved Actions: ${JSON.stringify(recentActions.slice(-3))}
Active Unresolved Count: ${activeEvents.length}

Generate compelling, interconnected events.`;

    const response = await callGeminiWithFallback(ai, {
      contents: userPrompt,
      systemInstruction: systemPrompt,
      temperature: 0.85,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          event_queue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                module: { type: Type.STRING },
                event_type: { type: Type.STRING },
                urgency: { type: Type.STRING },
                sender: { type: Type.STRING },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    patient_name: { type: Type.STRING },
                    age: { type: Type.NUMBER },
                    vitals: { type: Type.STRING },
                    symptoms: { type: Type.STRING },
                    history: { type: Type.STRING },
                    triage_category: { type: Type.STRING },
                    case_file_id: { type: Type.STRING },
                    suspect_name: { type: Type.STRING },
                    evidence_summary: { type: Type.STRING },
                    clue_type: { type: Type.STRING },
                    confidence_level: { type: Type.STRING },
                    system_alert: { type: Type.STRING },
                    required_action: { type: Type.STRING },
                    location: { type: Type.STRING },
                    units_recommended: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    actions_available: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['id', 'module', 'event_type', 'urgency', 'sender', 'payload'],
            },
          },
        },
        required: ['event_queue'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.event_queue || !Array.isArray(parsed.event_queue) || parsed.event_queue.length === 0) {
      throw new Error('Empty event queue returned');
    }

    return res.json({
      source: 'gemini_orchestrator',
      event_queue: parsed.event_queue,
      orchestrator_note: 'Generated live via Gemini Supervisor.',
    });
  } catch (error: any) {
    console.log('[Orchestrator] Operating via local simulation engine:', error?.message?.slice(0, 100) || 'Standby mode');
    const fallbackEvents = generateProceduralEvents(2);
    return res.json({
      source: 'fallback_engine',
      event_queue: fallbackEvents,
      orchestrator_note: 'Operating via Real-Time Dynamic Simulation Core.',
    });
  }
});

// Resolve Action & Generate Narrative Consequence Route
app.post('/api/orchestrator/resolve-action', async (req, res) => {
  try {
    const { event, actionTaken, playerNotes } = req.body;
    const ai = getGeminiClient();

    if (!ai || !event) {
      // Procedural action evaluation
      const isCritical = event?.urgency === 'critical';
      const score = Math.floor(85 + Math.random() * 15);
      return res.json({
        success: true,
        score,
        outcome_title: 'Order Executed Successfully',
        outcome_details: `The directive "${actionTaken}" was processed by the department. Personnel have executed the order with standard operational efficiency.`,
        department_rep_gain: isCritical ? '+25' : '+15',
        status: 'optimal',
        follow_up_narrative: 'Field units report positive status development following the intervention.',
      });
    }

    const prompt = `Evaluate the player's action in this simulation event:
EVENT DATA:
${JSON.stringify(event, null, 2)}

PLAYER ACTION TAKEN:
"${actionTaken}"
ADDITIONAL NOTES: "${playerNotes || 'None'}"

Evaluate if this action was clinically, forensically, or tactically appropriate.
Return a JSON object with:
- "score": number from 0 to 100
- "outcome_title": short 4-8 word title of the outcome
- "outcome_details": 2-3 sentences explaining the realistic consequences and outcomes
- "department_rep_gain": string (e.g. "+20" or "-10")
- "status": "optimal" | "acceptable" | "suboptimal" | "critical_failure"
- "follow_up_narrative": 1 sentence summarizing the situation progression`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      temperature: 0.7,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          outcome_title: { type: Type.STRING },
          outcome_details: { type: Type.STRING },
          department_rep_gain: { type: Type.STRING },
          status: { type: Type.STRING },
          follow_up_narrative: { type: Type.STRING },
        },
        required: ['score', 'outcome_title', 'outcome_details', 'department_rep_gain', 'status'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.log('[Orchestrator] Action resolved via procedural logic core');
    return res.json({
      score: 88,
      outcome_title: 'Order Processed',
      outcome_details: 'The command was successfully transmitted and executed by on-duty personnel.',
      department_rep_gain: '+15',
      status: 'acceptable',
      follow_up_narrative: 'Situation remains stable under current operational procedures.',
    });
  }
});

// Create Full Scenario Theme Preset Route
app.post('/api/orchestrator/generate-scenario', async (req, res) => {
  try {
    const { scenarioTitle } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        scenario_title: scenarioTitle || 'Operation Midnight Surge',
        briefing: 'A series of synchronized incidents across the metropolitan sector require coordinated triage, detective investigation, and emergency dispatch.',
        events: generateProceduralEvents(3),
      });
    }

    const prompt = `Generate a multi-department crisis scenario named "${scenarioTitle || 'Harbor Blackout & Transit Crisis'}" for our Multi-Agent Orchestrator simulation.
Generate:
1. "scenario_title": string
2. "briefing": string (2-3 sentences briefing the player on the overarching situation)
3. "events": array of 3 events (exactly one "medical", one "investigation", and one "dispatch") that tie into this single crisis storyline!`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      temperature: 0.8,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenario_title: { type: Type.STRING },
          briefing: { type: Type.STRING },
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                module: { type: Type.STRING },
                event_type: { type: Type.STRING },
                urgency: { type: Type.STRING },
                sender: { type: Type.STRING },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    patient_name: { type: Type.STRING },
                    age: { type: Type.NUMBER },
                    vitals: { type: Type.STRING },
                    symptoms: { type: Type.STRING },
                    case_file_id: { type: Type.STRING },
                    suspect_name: { type: Type.STRING },
                    evidence_summary: { type: Type.STRING },
                    system_alert: { type: Type.STRING },
                    required_action: { type: Type.STRING },
                    location: { type: Type.STRING },
                    actions_available: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['id', 'module', 'event_type', 'urgency', 'sender', 'payload'],
            },
          },
        },
        required: ['scenario_title', 'briefing', 'events'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.log('[Orchestrator] Scenario generated via local scenario matrix');
    return res.json({
      scenario_title: 'Harbor Emergency Surge',
      briefing: 'High-volume crisis requiring simultaneous triage, forensic analysis, and priority route dispatch.',
      events: generateProceduralEvents(3),
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multi-Role Orchestrator Server running on port ${PORT}`);
  });
}

startServer();
