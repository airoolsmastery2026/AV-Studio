
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
}

type DocSection = 'status' | 'intro' | 'setup' | 'studio' | 'autopilot' | 'analytics' | 'marketplace' | 'risk' | 'commander';

const Documentation: React.FC<DocumentationProps> = ({ 
  apiKeys, knowledgeBase, scriptModel, visualModel, voiceModel, appLang 
}) => {
  const [activeSection, setActiveSection] = useState<DocSection>('status');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeSection]);

  const menuItems: { id: DocSection; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'status', label: '0. Kiểm tra hệ thống', icon: Activity, highlight: true },
    { id: 'intro', label: '1. Tổng quan & Triết lý', icon: BookOpen },
    { id: 'setup', label: '2. Cấu hình API Vault', icon: Key },
    { id: 'studio', label: '3. Viral DNA Studio', icon: Dna },
    { id: 'autopilot', label: '4. Infinity Auto-Pilot', icon: InfinityIcon },
    { id: 'analytics', label: '5. Tình báo Chiến lược', icon: Radar },
    { id: 'marketplace', label: '6. Chợ Sản phẩm AI', icon: ShoppingBag },
    { id: 'risk', label: '7. Trung tâm Rủi ro', icon: ShieldAlert },
    { id: 'commander', label: '8. AI Commander', icon: Zap },
  ];

  // Logic kiểm tra cấu hình
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
      pdf.save('AV_Studio_Configured_Manual.pdf');
      element.style.display = 'none';
    } catch (error) { console.error(error); } finally { setIsGeneratingPdf(false); }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden animate-fade-in relative shadow-2xl">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-primary" size={24} /> DOCS CENTER
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
                {isGeneratingPdf ? 'EXPORTING...' : 'EXPORT YOUR SETUP GUIDE'}
            </NeonButton>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-12 bg-[#050b14] scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
          
          {/* SECTION: SYSTEM STATUS (DYNAMIC) */}
          {activeSection === 'status' && (
            <div className="animate-fade-in space-y-10">
              <div className="space-y-4">
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase">0. Kiểm tra hệ thống của bạn</h1>
                  <p className="text-slate-500 font-medium">Bản hướng dẫn này đã được tùy biến dựa trên các API và cài đặt hiện tại trong Vault của bạn.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Card 1 */}
                  <div className={`p-6 rounded-[32px] border-2 transition-all ${hasGemini ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20 shadow-neon'}`}>
                      <div className="flex justify-between items-center mb-4">
                          <div className={`p-3 rounded-2xl ${hasGemini ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Cpu size={24} />
                          </div>
                          {hasGemini ? <CheckCircle className="text-green-500" /> : <AlertOctagon className="text-red-500 animate-pulse" />}
                      </div>
                      <h4 className="text-white font-black uppercase text-sm mb-2">Động cơ Gemini (AI Core)</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                          {hasGemini ? "Hệ thống đã sẵn sàng phân tích DNA và viết kịch bản." : "Cảnh báo: Bạn chưa kết nối Google API Key. Hầu hết các tính năng tự động sẽ bị vô hiệu hóa."}
                      </p>
                  </div>

                  {/* Status Card 2 */}
                  <div className={`p-6 rounded-[32px] border-2 transition-all ${hasSocial ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-4">
                          <div className={`p-3 rounded-2xl ${hasSocial ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Globe size={24} />
                          </div>
                          {hasSocial ? <CheckCircle className="text-blue-500" /> : <Info className="text-slate-500" />}
                      </div>
                      <h4 className="text-white font-black uppercase text-sm mb-2">Kênh đăng bài (Social)</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                          {hasSocial ? `Đã kết nối các kênh mạng xã hội. Bạn có thể sử dụng Smart Scheduler.` : "Bạn chưa kết nối kênh nào. Video sau khi render sẽ chỉ có thể tải xuống thủ công."}
                      </p>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Sliders className="text-primary"/> Cấu hình Render hiện tại</h3>
                  <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-500 font-black uppercase">Engine kịch bản</div>
                          <div className="text-sm text-white font-bold">{scriptModel}</div>
                      </div>
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-500 font-black uppercase">Engine Video</div>
                          <div className="text-sm text-primary font-bold">{visualModel}</div>
                      </div>
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-500 font-black uppercase">Ngôn ngữ kịch bản</div>
                          <div className="text-sm text-white font-bold">{appLang === 'vi' ? 'Tiếng Việt' : 'English'}</div>
                      </div>
                  </div>
                  {visualModel === 'VEO' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-4 items-start">
                          <Zap size={20} className="text-blue-400 shrink-0 mt-1" />
                          <div>
                              <h5 className="text-xs font-black text-white uppercase mb-1">Mẹo cho Google VEO</h5>
                              <p className="text-[11px] text-slate-400">Model VEO bạn đang chọn yêu cầu Prompt cực kỳ chi tiết về ánh sáng (cinematic lighting). Hãy dùng AI Commander để tối ưu Prompt trước khi Render.</p>
                          </div>
                      </div>
                  )}
              </div>
            </div>
          )}

          {/* SECTION: INTRO */}
          {activeSection === 'intro' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">1. Triết lý vận hành</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Enterprise Content Factory</p>
                  </div>
              </div>
              <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300 leading-relaxed">
                      Hệ thống được thiết kế để giải quyết bài toán <strong>"Nội dung số lượng lớn nhưng không vi phạm bản quyền"</strong>. 
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                      <div className="space-y-4">
                          <h4 className="text-primary font-black uppercase text-xs tracking-widest">Nguyên tắc 1: Metadata Only</h4>
                          <p className="text-sm text-slate-400">Robot không bao giờ tải xuống file MP4 của đối thủ. Nó chỉ đọc "linh hồn" của video thông qua tiêu đề và phụ đề để học hỏi cấu trúc thành công.</p>
                      </div>
                      <div className="space-y-4">
                          <h4 className="text-primary font-black uppercase text-xs tracking-widest">Nguyên tắc 2: Generative Originality</h4>
                          <p className="text-sm text-slate-400">Toàn bộ hình ảnh được tạo ra 100% từ AI (VEO/Imagen). Điều này giúp video của bạn luôn được các nền tảng đánh giá là nội dung gốc (Original Content).</p>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: SETUP (Tùy biến theo Key đã có) */}
          {activeSection === 'setup' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-500/20 rounded-2xl text-red-400 shadow-neon"><Key size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">2. API Vault & Security</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Infrastructure Fueling</p>
                  </div>
              </div>

              {!hasGemini && (
                <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-3xl flex gap-5 items-start animate-pulse">
                    <AlertTriangle className="text-red-500 shrink-0" size={24} />
                    <div className="space-y-2">
                        <h4 className="text-sm font-black text-white uppercase">Hành động khẩn cấp: Thêm Gemini Key</h4>
                        <p className="text-xs text-slate-400">Tài liệu của bạn cho thấy bạn chưa có khóa Google. Hãy truy cập ngay <a href="https://aistudio.google.com" className="text-primary underline font-bold">Google AI Studio</a> để lấy khóa miễn phí.</p>
                    </div>
                </div>
              )}

              <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6">
                  <h3 className="text-lg font-black text-white uppercase">Cấu hình đúng cho Affiliate</h3>
                  <div className="space-y-4">
                      <div className="flex gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
                          <div className="p-3 bg-slate-900 rounded-xl text-green-500"><Wallet size={20}/></div>
                          <div className="space-y-1">
                              <h5 className="text-xs font-black text-white uppercase">Shopee/Amazon ID</h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed">Luôn sử dụng <strong>Tracking ID</strong> chuyên biệt cho video (VD: <code>video_reels_01</code>). Điều này giúp bạn đo lường được chuyển đổi đến từ chính video AI tạo ra hay từ các nguồn khác.</p>
                          </div>
                      </div>
                      <div className="flex gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
                          <div className="p-3 bg-slate-900 rounded-xl text-blue-500"><ShieldCheck size={20}/></div>
                          <div className="space-y-1">
                              <h5 className="text-xs font-black text-white uppercase">Bảo mật Vault</h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed">Chúng tôi sử dụng <strong>Encryption tại máy khách (LocalStorage)</strong>. Mã API của bạn không bao giờ lưu trên Server của AV Studio.</p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: COMMANDER */}
          {activeSection === 'commander' && (
            <div className="animate-fade-in space-y-10">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400 shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">8. AI Commander Control</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Natural Language UI Interface</p>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-8">
                  <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white uppercase">Trí não hiện tại của bạn</h3>
                      <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-black uppercase mb-3">Quy tắc bạn đã dạy cho Robot:</div>
                          <div className="flex flex-wrap gap-2">
                              {brainTrained ? (
                                  knowledgeBase.learnedPreferences.map((p, i) => (
                                      <span key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-lg uppercase tracking-tight">
                                          "{p}"
                                      </span>
                                  ))
                              ) : (
                                  <div className="text-xs text-slate-600 italic">"Chưa có dữ liệu huấn luyện. Hãy trò chuyện với Commander để Robot học phong cách của bạn."</div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3">Lệnh nên dùng:</h4>
                          <ul className="text-xs text-white space-y-3 font-medium">
                              <li className="flex gap-2"><ChevronRight size={14} className="text-primary"/> "Hãy trinh sát ngách mỹ phẩm và lập kế hoạch chiến dịch."</li>
                              <li className="flex gap-2"><ChevronRight size={14} className="text-primary"/> "Kiểm tra sức khỏe kênh TikTok của tôi."</li>
                          </ul>
                      </div>
                      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3">Chế độ rảnh tay:</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Bạn có thể nhấn Micro và nói trực tiếp. Commander hỗ trợ đa ngôn ngữ nhưng tối ưu nhất cho tiếng Việt trong các nghiệp vụ nội dung.</p>
                      </div>
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 
        ================================================================
        HIDDEN PDF TEMPLATE (RENDERED FOR CAPTURE)
        Tùy biến cho PDF: In ra cấu hình thực tế của người dùng
        ================================================================
      */}
      <div 
        ref={pdfRef} 
        style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '210mm', backgroundColor: 'white', color: '#1e293b', fontFamily: 'sans-serif' }}
      >
          <div className="p-[20mm] min-h-[297mm] flex flex-col justify-between border-b-2 border-slate-100">
              <div className="mt-20">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">AV STUDIO CONFIG REPORT</h1>
                  <h2 className="text-2xl text-slate-400 uppercase tracking-widest font-light">Custom Operations Manual</h2>
                  
                  <div className="mt-16 grid grid-cols-2 gap-10">
                      <div>
                          <h3 className="font-black text-slate-900 uppercase text-xs mb-4">Account Configuration</h3>
                          <ul className="text-sm space-y-2 text-slate-600">
                              <li className="flex justify-between border-b pb-2"><span>AI Engine (Gemini):</span> <strong>{hasGemini ? 'CONNECTED' : 'MISSING'}</strong></li>
                              <li className="flex justify-between border-b pb-2"><span>Social Accounts:</span> <strong>{apiKeys.filter(k => k.category === 'social').length} channels</strong></li>
                              <li className="flex justify-between border-b pb-2"><span>Affiliate Vault:</span> <strong>{apiKeys.filter(k => k.category === 'affiliate').length} connections</strong></li>
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-black text-slate-900 uppercase text-xs mb-4">Neural Stack</h3>
                          <ul className="text-sm space-y-2 text-slate-600">
                              <li className="flex justify-between border-b pb-2"><span>Script Model:</span> <strong>{scriptModel}</strong></li>
                              <li className="flex justify-between border-b pb-2"><span>Visual Engine:</span> <strong>{visualModel}</strong></li>
                              <li className="flex justify-between border-b pb-2"><span>Voice Talent:</span> <strong>{voiceModel}</strong></li>
                          </ul>
                      </div>
                  </div>

                  <div className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Hành động kiến nghị cho bạn:</h3>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                          {!hasGemini ? "Bạn cần bổ sung API Key để bắt đầu sản xuất." : 
                           !hasAffiliate ? "Bạn nên kết nối ít nhất 1 sàn (Shopee/Amazon) để AI có thể săn tìm sản phẩm." :
                           "Hệ thống của bạn đang ở trạng thái tối ưu. Hãy bắt đầu chiến dịch đầu tiên tại tab Wizard."}
                      </p>
                  </div>
              </div>
              
              <div className="border-t pt-8 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  <span>Authorized Deployment Report</span>
                  <span>Generated on {new Date().toLocaleString()}</span>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Documentation;
