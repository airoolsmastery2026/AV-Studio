
import React, { useState, useRef } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle,
  Activity, Radar, Clock, Cpu, Globe, ShieldCheck,
  AlertOctagon, Info, Wallet, ShoppingBag, ShieldAlert, Star, Sparkles, Trophy, Rocket, MessageCircle
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

  const menuItems = [
    { id: 'status', label: t.docs_system_check, icon: Activity, color: 'text-primary' },
    { id: 'philosophy', label: t.docs_philosophy, icon: BookOpen, color: 'text-blue-400' },
    { id: 'setup', label: t.docs_setup, icon: Key, color: 'text-yellow-400' },
    { id: 'studio', label: t.docs_studio, icon: Dna, color: 'text-purple-400' },
    { id: 'autopilot', label: t.docs_autopilot, icon: InfinityIcon, color: 'text-pink-400' },
    { id: 'analytics', label: t.docs_analytics, icon: Radar, color: 'text-red-400' },
    { id: 'marketplace', label: t.docs_marketplace, icon: ShoppingBag, color: 'text-orange-400' },
    { id: 'tips', label: t.docs_tips, icon: Trophy, color: 'text-green-400' },
  ];

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);
    const element = pdfRef.current;
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`AV_Manual_${appLang.toUpperCase()}.pdf`);
    
    element.style.display = originalDisplay;
    setIsGeneratingPdf(false);
  };

  const content = t.manual_content;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'status':
        return (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <Activity className="text-primary" size={40} /> {content.status.title}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">{content.status.content}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.status.check_list.map((item: string, i: number) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-3">
                  <CheckCircle className="text-green-500" />
                  <span className="text-xs font-black text-white uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'philosophy':
        return (
          <div className="space-y-8 animate-fade-in">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <BookOpen className="text-blue-400" size={40} /> {content.philosophy.title}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">{content.philosophy.content}</p>
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-8 rounded-r-3xl">
              <h4 className="text-blue-400 font-black mb-2 flex items-center gap-2"><Sparkles size={18}/> PRO STRATEGY</h4>
              <p className="text-slate-300 italic">"{content.philosophy.pro_tip}"</p>
            </div>
          </div>
        );
      case 'tips':
        return (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <Trophy className="text-green-400" size={40} /> {content.tips.title}
            </h1>
            
            <div className="space-y-6">
               <h3 className="text-xl font-black text-white uppercase flex items-center gap-3 border-b border-slate-800 pb-4">
                 <Video className="text-primary" /> Video Production Secret
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  {content.tips.video_tips.map((tip: string, i: number) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-start gap-4">
                       <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">{i+1}</div>
                       <p className="text-slate-300 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-black text-white uppercase flex items-center gap-3 border-b border-slate-800 pb-4">
                 <ShoppingBag className="text-orange-400" /> Affiliate Conversion Hacks
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.tips.affiliate_tips.map((tip: string, i: number) => (
                    <div key={i} className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[32px] space-y-3 relative overflow-hidden">
                       <div className="absolute -top-4 -right-4 opacity-5"><Target size={80} /></div>
                       <p className="text-slate-200 font-bold leading-relaxed relative z-10">{tip}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-2xl">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-neon shrink-0"><Rocket size={40} className="text-white"/></div>
               <div className="space-y-2">
                 <h4 className="text-xl font-black text-white uppercase tracking-tight">Kích hoạt AutoPilot ngay hôm nay</h4>
                 <p className="text-slate-400 text-sm">Áp dụng công thức 3 video/ngày để phủ sóng ngách của bạn. Hệ thống sẽ học hỏi sau mỗi chu kỳ để tối ưu hóa tỷ lệ chuyển đổi.</p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center space-y-4 opacity-30">
            <Info size={80} className="mx-auto" />
            <h2 className="text-2xl font-black uppercase">Nội dung đang được biên soạn...</h2>
            <p>Học viện AI liên tục cập nhật kiến thức mới từ dữ liệu thuật toán 2025.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-950 border border-slate-800 rounded-[40px] overflow-hidden animate-fade-in shadow-2xl relative">
      {/* SIDEBAR */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20">
          <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter">
            <BookOpen className="text-primary" size={24} /> {t.docs_title}
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">V5.0 Operational Guide</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)} 
              className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-4 transition-all group ${
                activeSection === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon' 
                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
              }`}
            >
              <item.icon size={18} className={activeSection === item.id ? item.color : 'text-slate-700 group-hover:text-slate-400'} /> 
              {item.label}
              {activeSection === item.id && <ChevronRight size={14} className="ml-auto animate-pulse" />}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/10">
            <NeonButton onClick={handleDownloadPDF} disabled={isGeneratingPdf} size="sm" className="w-full h-12">
                {isGeneratingPdf ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>}
                {isGeneratingPdf ? t.loading : t.export_manual}
            </NeonButton>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-12 bg-[#020617] custom-scrollbar selection:bg-primary selection:text-white">
        <div className="max-w-4xl mx-auto pb-20">
          {renderSectionContent()}
        </div>
      </div>

      {/* HIDDEN PDF CONTENT (Full Manual) */}
      <div ref={pdfRef} className="bg-white p-20 text-slate-900 space-y-10 font-sans" style={{ display: 'none', position: 'absolute', width: '800px', top: 0, left: 0, zIndex: -1 }}>
          <div className="border-b-4 border-primary pb-10">
            <h1 className="text-6xl font-black tracking-tighter uppercase mb-4">AV STUDIO ALPHA</h1>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-500">Official Operational Academy Handbook</h2>
          </div>
          <div className="space-y-10">
            <section>
              <h3 className="text-3xl font-black mb-4 uppercase">{content.status.title}</h3>
              <p className="leading-relaxed text-xl">{content.status.content}</p>
            </section>
            <section>
              <h3 className="text-3xl font-black mb-4 uppercase">{content.philosophy.title}</h3>
              <p className="leading-relaxed text-xl">{content.philosophy.content}</p>
            </section>
            <section>
              <h3 className="text-3xl font-black mb-4 uppercase">{content.tips.title}</h3>
              <div className="space-y-4">
                 {content.tips.video_tips.map((t:any, i:any) => <p key={i} className="text-lg">✅ {t}</p>)}
              </div>
            </section>
          </div>
          <div className="pt-20 text-slate-400 text-sm italic">
            © 2025 AV Studio AI System. Continuous Learning Enabled.
          </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const Loader2 = ({size, className}: {size:number, className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default Documentation;
