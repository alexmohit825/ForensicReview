import React, { useState } from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Flame, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  Scale,
  Award
} from 'lucide-react';
import { MedicolegalCaseAnalysis, ExpertRole, DepositionAttackAngle, CaseSpecificQnA } from '../types/medicolegal';
import { askDepositionQuestionWithGemini, getSavedGeminiApiKey } from '../services/geminiService';

interface Deliverable6DepositionPrepProps {
  caseData: MedicolegalCaseAnalysis;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export const Deliverable6DepositionPrep: React.FC<Deliverable6DepositionPrepProps> = ({
  caseData,
  onOpenApiKeyModal,
  hasApiKey
}) => {
  // Retained Expert Role: Plaintiff vs. Defense
  const [selectedRole, setSelectedRole] = useState<ExpertRole>(
    caseData.deliverable6_depositionPrep?.expertRole || 'PLAINTIFF'
  );

  // Category filter for cross-examination attack angles
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Custom Q&A State
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>('');
  const [qnaHistory, setQnaHistory] = useState<CaseSpecificQnA[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prepData = caseData.deliverable6_depositionPrep;
  const attackAngles = prepData?.crossExaminationVulnerabilities || [];

  const filteredAngles = selectedCategory === 'ALL'
    ? attackAngles
    : attackAngles.filter(a => a.category === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQuestion.trim()) return;

    const apiKey = getSavedGeminiApiKey();
    if (!apiKey) {
      onOpenApiKeyModal();
      return;
    }

    setIsQuerying(true);
    setQueryError('');

    try {
      const result = await askDepositionQuestionWithGemini(
        customQuestion.trim(),
        selectedRole,
        caseData,
        apiKey
      );

      const newQnA: CaseSpecificQnA = {
        id: `qna-${Date.now()}`,
        question: customQuestion.trim(),
        role: selectedRole,
        answer: result.answer,
        crossExamTrap: result.opposingCounselTrap,
        keyEvidentiaryPoints: result.keyEvidentiaryPoints || []
      };

      setQnaHistory(prev => [newQnA, ...prev]);
      setCustomQuestion('');
    } catch (err: unknown) {
      setQueryError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsQuerying(false);
    }
  };

  const samplePromptQuestions = selectedRole === 'PLAINTIFF' ? [
    'How do I answer defense counsel asking if Ms. Quinonez was already suffering from pre-existing degenerative disc disease before the collision?',
    'What is my response if defense points out there was no ER visit on the actual day of the accident?',
    'Defense will claim that property damage was under $1,500 and therefore inadequate to tear an L5-S1 disc. How do I dismantle this?',
    'How do I defend recommending surgery nearly 3 years after the accident?'
  ] : [
    'As defense expert, how do I emphasize that lumbar disc protrusions are naturally occurring in 30% of asymptomatic 36-year-olds?',
    'How do I counter plaintiff’s argument that Washington WPI 30.17 Eggshell Skull applies here?',
    'What do I point to in the records regarding gaps in treatment between PT and pain management?',
    'How do I frame the subjective nature of radicular pain in the absence of acute emergency room motor deficits?'
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Deliverable 6: Adversarial Deposition & Trial Prep</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Deposition Strategy & Attack Deconstruction
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Prepare for adversarial cross-examination by opposing counsel. Anticipate rhetoric, trap questions, and impeachment traps tailored specifically to whether you are retained as the <strong className="text-slate-900 font-semibold">Plaintiff Expert</strong> or <strong className="text-slate-900 font-semibold">Defense Expert</strong>.
            </p>
          </div>

          {/* Expert Role Selector Toggle */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center border border-slate-200 self-start lg:self-center shadow-xs">
            <button
              onClick={() => setSelectedRole('PLAINTIFF')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRole === 'PLAINTIFF'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Plaintiff Expert</span>
            </button>
            <button
              onClick={() => setSelectedRole('DEFENSE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRole === 'DEFENSE'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Defense Expert</span>
            </button>
          </div>
        </div>

        {/* Strategic Roadmap Banner based on Role */}
        <div className={`mt-6 p-4 sm:p-5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
          selectedRole === 'PLAINTIFF'
            ? 'bg-blue-50/70 border-blue-200 text-blue-950'
            : 'bg-slate-50 border-slate-300 text-slate-800'
        }`}>
          <div className="font-bold flex items-center gap-2 text-slate-900 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {selectedRole === 'PLAINTIFF' 
                ? 'Strategic Objective (Plaintiff Retainer): Establish Proximate Causation & Eggshell Traumatic Aggravation' 
                : 'Strategic Objective (Defense Retainer): Scrutinize Degenerative Chronicity & Biomechanical Attenuation'}
            </span>
          </div>
          <p className="mt-1">
            {selectedRole === 'PLAINTIFF'
              ? (prepData?.plaintiffSpecificStrategy || 'Anchor testimony on Washington WPI 30.17: pre-collision records document zero prior radicular symptoms. The collision traumatically disrupted an asymptomatic substrate. Counter low-speed arguments with rotational pre-stress physics.')
              : (prepData?.defenseSpecificStrategy || 'Scrutinize the chronicity of degenerative disc disease, lack of acute ER trauma imaging, and explain that asymptomatic disc bulges are standard anatomical findings across 30%+ of adults regardless of minor impacts.')
            }
          </p>
        </div>
      </div>

      {/* Golden Rules for the Deposition Witness Stand */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>The 5 Golden Rules for Dr. Mohit on the Deposition Record</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(prepData?.goldenRulesForDeposition || [
            'Never adopt opposing counsel’s adjectives or rhetorical framing.',
            'Always anchor answers on objective test results: TRA MRI, EMA EMG, motor exam.',
            'Concede pre-existing degeneration readily under Washington WPI 30.17 Eggshell Skull doctrine.',
            'Pause 2–3 seconds before answering to allow retaining counsel time for objections.',
            'Do not speculate outside the four corners of the medical record.'
          ]).map((rule, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-700 leading-snug font-medium">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Deposition Inquiry Console (Direct Question to Gemini) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Ask Specific Deposition Questions & Simulate Attacks
            </h2>
            <p className="text-xs text-slate-300">
              Query Google Gemini to devise how opposing counsel will attack you on any specific record, date, or topic—and receive a bulletproof response.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAskQuestion} className="mt-5 space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={`Ask anything about this case file as a ${selectedRole.toLowerCase()} expert (e.g. "How will opposing counsel attack the 3-year timeline to surgery?", "What if they confront me with a prior chiropractic visit?")`}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Quick Prompts:</span>
              {samplePromptQuestions.slice(0, 2).map((q, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCustomQuestion(q)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors truncate max-w-xs text-[11px]"
                  title={q}
                >
                  "{q.slice(0, 42)}..."
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isQuerying || !customQuestion.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isQuerying || !customQuestion.trim()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
              }`}
            >
              {isQuerying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Devising Counter-Strategy...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Deconstruct Attack & Generate Response</span>
                </>
              )}
            </button>
          </div>

          {queryError && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{queryError}</span>
            </div>
          )}
        </form>

        {/* Live Q&A History Generated on Demand */}
        {qnaHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Interactive Deposition Analysis & Scripts ({qnaHistory.length})
            </h4>

            {qnaHistory.map((qna) => (
              <div key={qna.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
                
                {/* User's Question */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {qna.role} Query
                    </span>
                    <h5 className="font-bold text-sm text-white">"{qna.question}"</h5>
                  </div>
                  <button
                    onClick={() => handleCopy(qna.answer, qna.id)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    title="Copy Witness Stand Response"
                  >
                    {copiedId === qna.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Opposing Counsel Trap Exposed */}
                <div className="p-3 bg-amber-950/40 border border-amber-700/40 rounded-lg text-xs text-amber-200">
                  <strong className="text-amber-300 flex items-center gap-1.5 mb-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Opposing Counsel's Trap Deconstruction:
                  </strong>
                  {qna.crossExamTrap}
                </div>

                {/* Scripted Witness Stand Answer */}
                <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-700/60">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recommended Response for Dr. Mohit on the Record:
                  </div>
                  <p className="text-xs text-slate-100 font-mono leading-relaxed select-text whitespace-pre-wrap">
                    {qna.answer}
                  </p>
                </div>

                {/* Key Evidentiary Record Citations */}
                {qna.keyEvidentiaryPoints && qna.keyEvidentiaryPoints.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-slate-200 block mb-1">Key Evidentiary Benchmarks to Cite:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                      {qna.keyEvidentiaryPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anticipated Cross-Examination Attack Angles Library */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <span>Anticipated Cross-Examination Attack Angles ({filteredAngles.length})</span>
            </h2>
            <p className="text-xs text-slate-600">
              Pre-computed adversarial attack theories and scripted responses tailored to {caseData.patientInfo.patientName}'s clinical file.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['ALL', 'PRE_EXISTING_CONDITIONS', 'MECHANISM_OF_INJURY', 'OBJECTIVE_VS_SUBJECTIVE', 'GAP_IN_CARE', 'SURGICAL_NECESSITY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Angles' : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAngles.map((angle, idx) => (
            <div 
              key={angle.id || idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center justify-center border border-rose-200">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {angle.category.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {angle.opposingCounselAngle}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(angle.recommendedResponse, angle.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  title="Copy Recommended Response"
                >
                  {copiedId === angle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Response</span>
                    </>
                  )}
                </button>
              </div>

              {/* Likely Opposing Counsel Cross-Examination Traps */}
              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Opposing Counsel Cross-Examination Trap Questions:
                </span>
                <ul className="space-y-1.5 text-xs text-rose-950 font-medium pl-1">
                  {angle.likelyQuestions.map((q, qIdx) => (
                    <li key={qIdx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">Q:</span>
                      <span className="italic">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Script for Dr. Mohit */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recommended Response for Dr. Mohit:
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Under Oath Script</span>
                </div>
                <p className="text-xs text-slate-100 font-mono leading-relaxed select-text whitespace-pre-wrap">
                  {angle.recommendedResponse}
                </p>
              </div>

              {/* Trap to Avoid & Evidence Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900 block mb-1">Trap to Avoid / What NOT to Concede:</span>
                  <p className="text-amber-800 leading-snug">
                    {angle.trapToAvoid}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-1">Key Evidentiary Record Citations:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-800 font-medium">
                    {angle.keyRecordCitations.map((cit, cIdx) => (
                      <li key={cIdx}>{cit}</li>
                    ))}
                  </ul>
                  {angle.supportingLiterature && (
                    <div className="mt-2 text-[11px] text-blue-700 border-t border-blue-200 pt-1 font-sans">
                      <strong>Literature:</strong> {angle.supportingLiterature}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
