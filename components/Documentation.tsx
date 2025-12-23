
import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle,
  Activity, Radar, Clock, Cpu, Globe, ShieldCheck,
  AlertOctagon, Info, Wallet,
  // Fix: Added missing icon imports used in menuItems
  ShoppingBag, ShieldAlert
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
  t: any;
}

const Documentation: React.FC<DocumentationProps> = ({ 
  apiKeys, knowledgeBase, scriptModel, visualModel, voiceModel, appLang, t
}) => {
  const [activeSection, setActiveSection] = useState<string>('status');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'status', label: t.docs_system_check, icon: Activity },
    { id: 'intro', label: t.docs_philosophy, icon: BookOpen },
    { id: 'setup', label: t.docs_setup, icon: Key },
    { id: 'studio', label: t.docs_studio, icon: Dna },
    { id: 'autopilot', label: t.docs_autopilot, icon: InfinityIcon },
    { id: 'analytics', label: t.docs_analytics, icon: Radar },
    { id: 'marketplace', label: t.docs_marketplace, icon: ShoppingBag },
    { id: 'risk', label: t.docs_risk, icon: ShieldAlert },
    { id: 'commander', label: t.docs_commander, icon: Zap },
  ];

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);
    const element = pdfRef.current;
    element.style.display = 'block';
    const canvas = await html2canvas(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`AV_Manual_${appLang}.pdf`);
    element.style.display = 'none';
    setIsGeneratingPdf(false);
  };

  const getLocalizedContent = () => {
    const contents: any = {
      vi: { intro: "Hệ thống sản xuất nội dung quy mô lớn dựa trên AI.", status: "Kiểm tra tình trạng API và Node của bạn." },
      en: { intro: "Mass production AI content factory system.", status: "Check your API and Node status." },
      jp: { intro: "AIベースの大規模コンテンツ制作システム。", status: "APIとノードのステータスを確認してください。" },
      es: { intro: "Sistema de fábrica de contenido AI a gran escala.", status: "Verifique el estado de su API y nodos." },
      zh: { intro: "基于AI的大规模内容生产工厂系统。", status: "检查您的API和节点状态。" }
    };
    return contents[appLang] || contents.en;
  };

  const localText = getLocalizedContent();

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden animate-fade-in shadow-2xl">
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-primary" size={24} /> {t.docs_title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-4 transition-all ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-500 hover:text-slate-300'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-800">
            <NeonButton onClick={handleDownloadPDF} disabled={isGeneratingPdf} size="sm" className="w-full h-12">
                {isGeneratingPdf ? t.loading : t.export_manual}
            </NeonButton>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto p-12 bg-[#050b14] custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-16">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{activeSection.toUpperCase()}</h1>
          <p className="text-slate-400 text-lg">{localText.intro}</p>
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[32px]">
             <h3 className="text-white font-bold mb-4">{t.docs_system_check}</h3>
             <p className="text-slate-500 text-sm leading-relaxed">{localText.status}</p>
          </div>
        </div>
      </div>

      <div ref={pdfRef} style={{ display: 'none' }}>Manual Content For PDF</div>
    </div>
  );
};

export default Documentation;
