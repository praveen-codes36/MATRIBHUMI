/**
 * 5. Policy Maker / Analytics Portal
 * Answers, not raw tables: AI Delay Risk Gauge + SHAP explainability bars (Effect #3),
 * AI Priority Queue re-sort (Effect #7), OCR Document Intelligence scanner (Effect #9),
 * and grounded AI Policy Copilot Chat Widget.
 */

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Sparkles, Send, FileSpreadsheet, 
  FileText, CheckCircle2, ShieldCheck, Download, Bot, MessageSquare
} from 'lucide-react';
import { AIDelayRiskGauge } from '../effects/AIDelayRiskGauge';
import { AIPriorityQueue } from '../effects/AIPriorityQueue';
import { OCRDocumentScan } from '../effects/OCRDocumentScan';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';
import { ProjectItem } from '../../types/nlams';

interface PolicyMakerPortalProps {
  projects: ProjectItem[];
}

export function PolicyMakerPortal({ projects }: PolicyMakerPortalProps) {
  const { push } = useToast();
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(projects[0]);
  const [activeTab, setActiveTab] = useState<'risk' | 'priority' | 'ocr' | 'copilot'>('risk');

  // Copilot questions & simulated answers grounded in projects
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; citation?: string }>
  >([
    {
      sender: 'bot',
      text: 'Greetings. I am the NLAMS Statutory Policy Copilot. Ask any question regarding national land acquisition bottlenecks, RFCTLARR Solatium compliance, or delay risks across active corridors.',
    },
    {
      sender: 'user',
      text: 'Which project has the highest probability of delay this quarter and why?',
    },
    {
      sender: 'bot',
      text: 'Project MOR/2026/WDFC-JNPT (Western Dedicated Freight Corridor JNPT Port Linkage, Maharashtra) has the highest risk score at 72%. The top root causes identified are Title Disputed Claims in High Court (56% SHAP weight) and Solatium Revision Arbitration (28%).',
      citation: 'Cited: MOR/2026/WDFC-JNPT · District: Raigad',
    },
  ]);

  const handleSendCopilotQuery = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotQuery.trim()) return;

    const userText = copilotQuery;
    setCopilotQuery('');
    setCopilotMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      let botResponse = '';
      let cite = '';

      if (userText.toLowerCase().includes('solatium') || userText.toLowerCase().includes('compensation')) {
        botResponse =
          'Under the RFCTLARR Act 2013 First Schedule, all 1,482 projects automatically calculate 100% Solatium on the market value determined via circle rate and rural multiplier factor (1.0x - 2.0x). Total disbursed to date is ₹42,850 Cr across PFMS direct bank links.';
        cite = 'Cited: Statutory Section 30 · PFMS Gateway';
      } else if (userText.toLowerCase().includes('gujarat') || userText.toLowerCase().includes('vadodara')) {
        botResponse =
          'The PM GatiShakti Multi-Modal Logistics Hub in Vadodara, Gujarat (GATISHAKTI/2026/NOD-09) has achieved 89% progress with 1,890 Cr disbursed. Physical possession has been formally taken for 2,150 acres with only minor utility relocation remaining.';
        cite = 'Cited: GATISHAKTI/2026/NOD-09 · District: Vadodara';
      } else {
        botResponse = `Analyzing national land repository for query "${userText}". All statutory notifications under Section 11 and Section 19 are verified against cadastral village boundaries with 99.4% OCR precision.`;
        cite = 'Cited: National Registry Database (All 28 States)';
      }

      setCopilotMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botResponse, citation: cite },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0b2c52] text-white">
              PORTAL 05
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0ea5a3]">
              NITI Aayog & Cabinet Secretariat Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2c52] mt-1">
            Policy Maker & Predictive Analytics Portal
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Synthesis, explainable ML risk modeling, and exportable executive intelligence
          </p>
        </div>

        {/* Clean Report Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MicroPressButton
            variant="outline"
            size="sm"
            onClick={() => {
              push('success', 'Cabinet Briefing PDF Exported', 'Clean executive summary generated with zero raw database dumps.');
            }}
          >
            <FileText className="w-3.5 h-3.5 text-[#0ea5a3]" />
            <span>Export Cabinet Briefing (PDF)</span>
          </MicroPressButton>

          <MicroPressButton
            variant="secondary"
            size="sm"
            onClick={() => {
              push('success', 'PFMS Audit Ledger Exported', 'Section 11-to-DBT reconciliation dataset downloaded.');
            }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>Excel Ledger</span>
          </MicroPressButton>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('risk')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'risk'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>AI Delay Risk & SHAP Explainability</span>
        </button>

        <button
          onClick={() => setActiveTab('priority')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'priority'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Priority Queue Re-Sort</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ocr'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Document OCR Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'copilot'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Grounded Policy Copilot</span>
        </button>
      </div>

      {/* Tab 1: Effect #3 AI Delay Risk Gauge */}
      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <AIDelayRiskGauge
              score={selectedProject.riskScore}
              title={`Delay Risk: ${selectedProject.name}`}
              subtitle={`Project Code: ${selectedProject.code} · District: ${selectedProject.district}`}
              delayReasons={selectedProject.delayReasons}
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0b2c52] mb-2">
                Select Corridor to Inspect ML Risk Factors
              </h3>
              <p className="text-xs text-[#64748b] mb-4">
                Trained on 10,000+ historical land acquisition cases from 2014-2025
              </p>

              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      selectedProject.id === p.id
                        ? 'border-[#0ea5a3] bg-[#eef4fa] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#0b2c52] block">{p.name}</span>
                      <span className="text-[10px] text-[#64748b]">
                        {p.district}, {p.state} · {p.stage}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.riskScore >= 70
                          ? 'bg-red-100 text-[#dc2626]'
                          : p.riskScore >= 40
                          ? 'bg-amber-100 text-[#d97706]'
                          : 'bg-green-100 text-[#16a34a]'
                      }`}
                    >
                      {p.riskScore}% Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Effect #7 AI Priority Queue */}
      {activeTab === 'priority' && (
        <AIPriorityQueue
          initialProjects={projects}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setActiveTab('risk');
            push('info', `Switched to project ${p.code}`);
          }}
        />
      )}

      {/* Tab 3: Effect #9 Document OCR Scan */}
      {activeTab === 'ocr' && (
        <OCRDocumentScan />
      )}

      {/* Tab 4: Grounded Policy Copilot */}
      {activeTab === 'copilot' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[#0b2c52] text-white">
                <Bot className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b2c52]">
                  Grounded AI Policy Copilot
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Strictly cites verified project IDs and statutory RFCTLARR parameters
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#eef4fa] text-[#0ea5a3] font-semibold">
              RAG Model: NLAMS-Policy-V3
            </span>
          </div>

          {/* Chat Messages */}
          <div className="h-72 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {copilotMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0b2c52] text-white'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.citation && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] font-mono text-[#0ea5a3] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{msg.citation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Query Input */}
          <form onSubmit={handleSendCopilotQuery} className="flex gap-2">
            <input
              type="text"
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              placeholder="E.g., What are the total PFMS disbursements and Solatium mandates for Raigad?"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] bg-white"
            />
            <MicroPressButton
              variant="primary"
              size="sm"
              type="submit"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Copilot</span>
            </MicroPressButton>
          </form>
        </div>
      )}
    </div>
  );
}
