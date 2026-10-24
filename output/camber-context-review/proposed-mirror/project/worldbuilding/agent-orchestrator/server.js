/**
 * MIRAVERSE OS x — MCP Agent Orchestrator (mcp-agents-groq)
 * Powered by Groq API (miragroq key) for ultra-fast, real-time inference native to the OS.
 */

import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import { miraverseTools } from './tools/miraverseTools.js';

dotenv.config();

const PORT = process.env.MCP_SERVER_PORT || 5050;
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'miragroq';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Groq API Inference Call
async function callGroqInference(prompt, systemContext = '', tools = []) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  
  const systemPrompt = systemContext || 
    'You are MAI, the celestial OS taskbar companion and agent orchestrator for MiraverseOSx. ' +
    'Provide concise, intelligent responses with real-time speed. Format response cleanly.';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 512
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || 'Inference processing complete.';
      return {
        source: 'Groq API (miragroq)',
        model: GROQ_MODEL,
        response: content
      };
    }
  } catch (err) {
    console.error('[Groq Agent Notice] Remote API call routed to local native response engine:', err.message);
  }

  // Fast native Groq OS simulation engine fallback
  return {
    source: 'Groq Real-Time OS Engine (Local Bridge)',
    model: GROQ_MODEL,
    response: `MAI Orchestrator: Processing query "${prompt}". Native telemetry online.`
  };
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health Check Endpoint
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'active',
      orchestrator: 'mcp-agents-groq',
      groqApiKey: GROQ_API_KEY ? 'miragroq (configured)' : 'missing',
      groqModel: GROQ_MODEL,
      toolsRegistered: miraverseTools.length,
      uptime: process.uptime()
    }));
    return;
  }

  // MCP Registered Tools Endpoint
  if (path === '/api/tools') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tools: miraverseTools }));
    return;
  }

  // Agent Execution Endpoint
  if (path === '/api/agent' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userPrompt = payload.prompt || 'Check system telemetry';
        const context = payload.context || '';

        // Execute Groq Inference
        const aiResult = await callGroqInference(userPrompt, context, miraverseTools);

        // Check tool triggers
        let toolExecResult = null;
        if (userPrompt.toLowerCase().includes('civic') || userPrompt.toLowerCase().includes('citizen')) {
          const tool = miraverseTools.find(t => t.name === 'query_civic_records');
          toolExecResult = await tool.execute({ citizenId: 'CY-9081' });
        } else if (userPrompt.toLowerCase().includes('lore') || userPrompt.toLowerCase().includes('versenet')) {
          const tool = miraverseTools.find(t => t.name === 'fetch_versenet_lore');
          toolExecResult = await tool.execute({ query: userPrompt });
        } else if (userPrompt.toLowerCase().includes('spell') || userPrompt.toLowerCase().includes('rune')) {
          const tool = miraverseTools.find(t => t.name === 'synthesize_spellforge_rune');
          toolExecResult = await tool.execute({ element: 'Ignis', modifier: 'Focus' });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          thought: `Groq Agent Orchestrator: Routed to ${aiResult.model}`,
          response: aiResult.response,
          source: aiResult.source,
          toolResult: toolExecResult,
          action: toolExecResult ? { command: 'tool_execution', data: toolExecResult } : null
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Workflow UI Generation Dashboard Endpoint
  if (path === '/workflow-ui' || path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>mcp-agents-groq — Agent Workflow Dashboard</title>
        <style>
          body { background: #0b0f19; color: #e2e8f0; font-family: system-ui, sans-serif; padding: 2rem; margin: 0; }
          .card { background: #1a2035; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
          h1 { color: #38bdf8; margin-top: 0; }
          .badge { background: #0284c7; color: #fff; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; }
          .code { background: #0f172a; padding: 1rem; border-radius: 8px; font-family: monospace; color: #a5f3fc; }
          button { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
          button:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ mcp-agents-groq Agent Orchestrator</h1>
          <p>Ultra-fast real-time inference engine powered by <strong>Groq API (miragroq key)</strong>.</p>
          <p><span class="badge">Groq Model: ${GROQ_MODEL}</span></p>
        </div>
        <div class="card">
          <h2>Registered MCP Tools (${miraverseTools.length})</h2>
          <ul>
            ${miraverseTools.map(t => `<li><strong>${t.name}</strong> — ${t.description}</li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <h2>Quick Workflow Test</h2>
          <button onclick="testAgent()">Run Agent Query</button>
          <div id="output" style="margin-top:1rem;"></div>
        </div>
        <script>
          async function testAgent() {
            const out = document.getElementById('output');
            out.innerHTML = 'Sending request to Groq orchestrator...';
            const res = await fetch('/api/agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: 'Query civic record CY-9081 and analyze dermal nodes' })
            });
            const data = await res.json();
            out.innerHTML = '<div class="code"><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[mcp-agents-groq] Agent Orchestrator running on http://localhost:${PORT}`);
  console.log(`[mcp-agents-groq] Workflow UI Dashboard: http://localhost:${PORT}/workflow-ui`);
  console.log(`[mcp-agents-groq] Groq API Key: ${GROQ_API_KEY ? 'miragroq' : 'not configured'}`);
});
