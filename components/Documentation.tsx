
import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle,
  MousePointer2, Sliders, ToggleLeft, ToggleRight, MessageSquare,
  ShoppingBag, ShieldAlert, Activity, Radar, Clock, Cpu, Globe, ShieldCheck,
  AlertOctagon, Info, Wallet
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, ScriptModel, VisualModel, VoiceModel, AppLanguage } from '../types';

interface DocumentationProps {
  apiKeys: ApiKeyConfig[];
  knowledgeBase: KnowledgeBase;
  scriptModel: ScriptModel;
  visualModel: VisualModel;
  voiceModel: VoiceModel;
  appLang: AppLanguage;
  t: any; // Added translations prop
}

type DocSection = 'status' | 'intro' | 'setup' | 'studio' | 'autopilot' | 'analytics' | 'marketplace' | 'risk' | 'commander';

const Documentation: React.FC<DocumentationProps> = ({ 
  apiKeys, knowledgeBase, scriptModel, visualModel, voiceModel, appLang, t
}) => {
  const [activeSection, setActiveSection] = useState<DocSection>('status');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeSection]);

  const menuItems: { id: DocSection; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'status', label: t.docs_system_check, icon: Activity, highlight: true },
    { id: 'intro', label: t.docs_philosophy, icon: BookOpen },
    { id: 'setup', label: t.docs_setup, icon: Key },
    { id: 'studio', label: t.docs_studio, icon: Dna },
    { id: 'autopilot', label: t.docs_autopilot, icon: InfinityIcon },
    { id: 'analytics', label: t.docs_analytics, icon: Radar },
    { id: 'marketplace', label: t.docs_marketplace, icon: ShoppingBag },
    { id: 'risk', label: t.docs_risk, icon: ShieldAlert },
    { id: 'commander', label: t.docs_commander, icon: Zap },
  ];

  const hasGemini = apiKeys.some(k => k.provider === 'google' && k.status === 'active');
  const hasSocial = apiKeys.some(k => k.category === 'social');
  const hasAffiliate = apiKeys.some(k => k.category === 'affiliate');
  const brainTrained = knowledgeBase.learnedPreferences.length > 0;

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = pdfRef.current;
      element.style.display = 'block'; 
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`AV_Studio_Manual_${appLang.toUpperCase()}.pdf`);
      element.style.display = 'none';
    } catch (error) { console.error(error); } finally { setIsGeneratingPdf(false); }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden animate-fade-in relative shadow-2xl">
      
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-primary" size={24} /> {t.docs_title}
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Dynamic Config Edition</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-tight flex items-center gap-4 transition-all ${
                activeSection === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon-hover' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              } ${item.highlight ? 'border-l-4 border-l-primary' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <NeonButton onClick={handleDownloadPDF} disabled={isGeneratingPdf} size="sm" className="w-full h-12">
                {isGeneratingPdf ? t.loading : t.export_manual}
            </NeonButton>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto p-12 bg-[#050b14] scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
          
          {activeSection === 'status' && (
            <div className="animate-fade-in space-y-10">
              <div className="space-y-4">
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t.docs_system_check}</h1>
                  <p className="text-slate-500 font-medium">{appLang === 'vi' ? 'Bản hướng dẫn này đã được tùy biến dựa trên các API và cài đặt hiện tại trong Vault của bạn.' : 'This manual has been customized based on your current APIs and Vault settings.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-[32px] border-2 transition-all ${hasGemini ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20 shadow-neon'}`}>
                      <div className="flex justify-between items-center mb-4">
                          <div className={`p-3 rounded-2xl ${hasGemini ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Cpu size={24} />
                          </div>
                          {hasGemini ? <CheckCircle className="text-green-500" /> : <AlertOctagon className="text-red-500 animate-pulse" />}
                      </div>
                      <h4 className="text-white font-black uppercase text-sm mb-2">{appLang === 'vi' ? 'Động cơ Gemini (AI Core)' : 'Gemini AI Core Engine'}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                          {hasGemini 
                            ? (appLang === 'vi' ? "Hệ thống đã sẵn sàng phân tích DNA và viết kịch bản." : "System ready for DNA analysis and scripting.")
                            : (appLang === 'vi' ? "Cảnh báo: Bạn chưa kết nối Google API Key." : "Warning: Google API Key not connected.")}
                      </p>
                  </div>

                  <div className={`p-6 rounded-[32px] border-2 transition-all ${hasSocial ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-4">
                          <div className={`p-3 rounded-2xl ${hasSocial ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Globe size={24} />
                          </div>
                          {hasSocial ? <CheckCircle className="text-blue-500" /> : <Info className="text-slate-500" />}
                      </div>
                      <h4 className="text-white font-black uppercase text-sm mb-2">{t.social_hub}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                          {hasSocial 
                            ? (appLang === 'vi' ? `Đã kết nối các kênh mạng xã hội.` : "Social accounts connected.")
                            : (appLang === 'vi' ? "Bạn chưa kết nối kênh nào." : "No accounts connected yet.")}
                      </p>
                  </div>
              </div>
            </div>
          )}

          {activeSection === 'intro' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t.docs_philosophy}</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Enterprise Content Factory</p>
                  </div>
              </div>
              <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300 leading-relaxed">
                      {appLang === 'vi' 
                        ? 'Hệ thống được thiết kế để giải quyết bài toán "Nội dung số lượng lớn nhưng không vi phạm bản quyền".' 
                        : 'System designed to solve the "Mass content production without copyright issues" problem.'}
                  </p>
              </div>
            </div>
          )}

          {activeSection === 'commander' && (
            <div className="animate-fade-in space-y-10">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400 shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t.docs_commander}</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Natural Language UI Interface</p>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-8">
                  <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white uppercase">{appLang === 'vi' ? 'Trí não hiện tại của bạn' : 'Your Neural State'}</h3>
                      <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-black uppercase mb-3">{appLang === 'vi' ? 'Quy tắc bạn đã dạy cho Robot:' : 'Rules taught to Robot:'}</div>
                          <div className="flex flex-wrap gap-2">
                              {brainTrained ? (
                                  knowledgeBase.learnedPreferences.map((p, i) => (
                                      <span key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-lg uppercase tracking-tight">
                                          "{p}"
                                      </span>
                                  ))
                              ) : (
                                  <div className="text-xs text-slate-600 italic">"Empty training set."</div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div 
        ref={pdfRef} 
        style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '210mm', backgroundColor: 'white', color: '#1e293b', fontFamily: 'sans-serif' }}
      >
          <div className="p-[20mm] min-h-[297mm] flex flex-col justify-between border-b-2 border-slate-100">
              <div className="mt-20">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">AV STUDIO CONFIG REPORT</h1>
                  <h2 className="text-2xl text-slate-400 uppercase tracking-widest font-light">Custom Operations Manual</h2>
                  <div className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">System Language: {appLang.toUpperCase()}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        Manual generated successfully for {appLang === 'vi' ? 'phiên bản Tiếng Việt' : 'English edition'}.
                      </p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Documentation;
