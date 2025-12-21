import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle,
  MousePointer2, Sliders, ToggleLeft, ToggleRight, MessageSquare,
  ShoppingBag, ShieldAlert, Activity, Radar, Clock, Cpu, Globe
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NeonButton from './NeonButton';

type DocSection = 'intro' | 'setup' | 'studio' | 'autopilot' | 'analytics' | 'marketplace' | 'risk' | 'commander';

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DocSection>('intro');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const menuItems: { id: DocSection; label: string; icon: any }[] = [
    { id: 'intro', label: '1. Tổng quan & Triết lý', icon: BookOpen },
    { id: 'setup', label: '2. Cấu hình API Vault (Nhiên liệu)', icon: Key },
    { id: 'studio', label: '3. Viral DNA Studio (Thủ công)', icon: Dna },
    { id: 'autopilot', label: '4. Infinity Auto-Pilot (Tự động)', icon: InfinityIcon },
    { id: 'analytics', label: '5. Tình báo Chiến lược (Recon)', icon: Radar },
    { id: 'marketplace', label: '6. Chợ Sản phẩm AI (Real-time)', icon: ShoppingBag },
    { id: 'risk', label: '7. Trung tâm Rủi ro & Sức khỏe', icon: ShieldAlert },
    { id: 'commander', label: '8. AI Commander (Điều khiển)', icon: Zap },
  ];

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
      pdf.save('AV_Studio_Detailed_Manual_AZ.pdf');
      element.style.display = 'none';
    } catch (error) {
      console.error("PDF Gen Error:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in relative">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="text-primary" size={24} /> MANUAL A-Z
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Deployment Guide</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-3 transition-all ${
                activeSection === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-neon-hover' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <NeonButton onClick={handleDownloadPDF} disabled={isGeneratingPdf} size="sm" className="w-full">
                {isGeneratingPdf ? 'EXPORTING...' : 'DOWNLOAD FULL PDF'}
            </NeonButton>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-10 bg-[#050b14] scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
          
          {/* SECTION: INTRO */}
          {activeSection === 'intro' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter">1. TỔNG QUAN HỆ THỐNG</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Autonomous Content Factory v3.1</p>
                  </div>
              </div>
              <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300 leading-relaxed">
                      AV Studio không chỉ là một công cụ chỉnh sửa video. Đây là một <strong>Hệ điều hành Sản xuất Nội dung Phân tán</strong>, được thiết kế để thay thế hoàn toàn một Agency nội dung truyền thống bằng sức mạnh của Gemini 3 Pro và Google Veo.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                          <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-primary"><Target size={18}/> Triết lý: 1-Click AutoPilot</h4>
                          <p className="text-sm text-slate-400">Tối thiểu hóa sự can thiệp của con người. Người dùng chỉ cần cung cấp "Tín hiệu" (Signal), AI sẽ lo từ Phân tích DNA cho đến Render video cuối cùng.</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                          <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-primary"><Shield size={18}/> Nguyên tắc 3 KHÔNG</h4>
                          <ul className="text-xs text-slate-400 space-y-2">
                              <li>• <strong>KHÔNG</strong> tải video gốc: Chỉ lấy metadata.</li>
                              <li>• <strong>KHÔNG</strong> sao chép 1:1: Luôn Paraphrase kịch bản.</li>
                              <li>• <strong>KHÔNG</strong> vi phạm bản quyền: Sử dụng render gốc từ VEO/Imagen.</li>
                          </ul>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: SETUP */}
          {activeSection === 'setup' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-500/20 rounded-2xl text-red-400 shadow-neon"><Key size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">2. Cấu hình API Vault</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Fueling the Intelligence Engine</p>
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Cpu size={18} className="text-primary"/> BƯỚC 1: GOOGLE GEMINI KEY</h3>
                      <p className="text-sm text-slate-400 mb-4">Đây là "trái tim" của hệ thống. Gemini xử lý toàn bộ logic phân tích, viết kịch bản và cung cấp thông tin thị trường thời gian thực qua Search Grounding.</p>
                      <ul className="text-xs text-slate-500 space-y-2 mb-4">
                          <li>1. Truy cập <a href="https://aistudio.google.com" className="text-primary underline">Google AI Studio</a>.</li>
                          <li>2. Tạo API Key mới (Free hoặc Paid).</li>
                          <li>3. Vào <strong>Settings -> Vault -> Model</strong> và dán khóa vào.</li>
                      </ul>
                      <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-xl flex gap-3 italic text-xs text-yellow-500">
                          <AlertTriangle size={16} className="shrink-0" />
                          Lưu ý: Nếu dùng bản miễn phí, hệ thống sẽ tự động xoay vòng Key để tránh lỗi giới hạn (Quota Limit).
                      </div>
                  </div>
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-primary"/> BƯỚC 2: KẾT NỐI SOCIAL & AFFILIATE</h3>
                      <p className="text-sm text-slate-400">Kết nối các mạng xã hội để AI có thể tự động "Dispatch" (đăng tải) nội dung khi hoàn tất.</p>
                      <p className="text-xs text-slate-500 italic mt-2">Hỗ trợ: TikTok, YouTube Shorts, Facebook Reels, Zalo OA/Personal.</p>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: STUDIO */}
          {activeSection === 'studio' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-teal-500/20 rounded-2xl text-teal-400 shadow-neon"><Dna size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">3. Viral DNA Studio</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Professional Human-in-the-loop Production</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">01</div>
                      <h4 className="text-white font-bold uppercase text-xs">Phân tích (Recon)</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Dán 1-3 link video đối thủ. AI sẽ quét metadata, tìm ra tần suất dùng từ khóa, tốc độ chuyển cảnh (Pacing) và cảm xúc chủ đạo (Emotion).</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">02</div>
                      <h4 className="text-white font-bold uppercase text-xs">Cấu hình (Specs)</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Chọn độ phân giải (4K/1080p), Tỷ lệ (9:16 cho TikTok/Reels) và Độ mạnh của Hook (1-10). Hook Level 8+ sẽ tạo các kịch bản gây tranh cãi mạnh.</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">03</div>
                      <h4 className="text-white font-bold uppercase text-xs">Render (Full-Stack)</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">AI sẽ gọi Google VEO để tạo video và Gemini Chirp để tổng hợp giọng nói. Kết quả là một video hoàn chỉnh có thể đăng ngay.</p>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: AUTOPILOT */}
          {activeSection === 'autopilot' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-pink-500/20 rounded-2xl text-pink-400 shadow-neon"><InfinityIcon size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">4. Infinity Auto-Pilot</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">24/7 Autonomous Money Engine</p>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                  <div className="p-8 space-y-6">
                      <p className="text-slate-300 leading-relaxed italic border-l-4 border-pink-500 pl-4">
                          "Hãy kích hoạt Auto-Pilot, chọn ngách AI SaaS, và đi ngủ. Agent sẽ tự động săn tìm sản phẩm, viết kịch bản, dựng phim và lên lịch đăng bài cho bạn."
                      </p>
                      <div className="space-y-4">
                          <h4 className="text-white font-black text-xs uppercase tracking-widest">CÁCH HOẠT ĐỘNG:</h4>
                          <div className="flex items-center gap-6 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                              <div className="flex flex-col items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">1</div>
                                  <div className="w-px h-8 bg-slate-800"></div>
                                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">2</div>
                                  <div className="w-px h-8 bg-slate-800"></div>
                                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">3</div>
                              </div>
                              <div className="space-y-6">
                                  <div>
                                      <h5 className="text-sm font-bold text-white uppercase">Discovery (Dò tìm)</h5>
                                      <p className="text-xs text-slate-500">Quét Shopee/Amazon/TikTok Shop tìm sản phẩm "nóng" có hoa hồng cao qua Google Search.</p>
                                  </div>
                                  <div>
                                      <h5 className="text-sm font-bold text-white uppercase">Paraphrasing (Chuyển thể)</h5>
                                      <p className="text-xs text-slate-500">Viết lại nội dung từ đối thủ thành một phiên bản độc bản, đảm bảo 0% trùng lặp văn bản.</p>
                                  </div>
                                  <div>
                                      <h5 className="text-sm font-bold text-white uppercase">Smart Scheduler (Lên lịch)</h5>
                                      <p className="text-xs text-slate-500">Dùng AI dự đoán "Giờ Vàng" thực tế của từng kênh để tối ưu lượt tiếp cận tự nhiên.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: ANALYTICS */}
          {activeSection === 'analytics' && (
            <div className="animate-fade-in space-y-8">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-500/20 rounded-2xl text-red-400 shadow-neon"><Radar size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">5. Tình báo Chiến lược</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Deep Network Reconnaissance</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Target size={18} className="text-red-500"/> STANDARD RECON</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">Nhập một từ khóa ngách. Hệ thống sẽ quét toàn bộ Internet để tìm ra các "Winning Channel" (Kênh đang thắng lớn) trong ngách đó. Phân tích điểm yếu của đối thủ để bạn có "Winning Angle" (Góc chiến thắng) riêng.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                      {/* Fixed: Added Globe to imports to resolve line 266 error */}
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-purple-500"/> DEEP NETWORK AUDIT</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">Sử dụng Google Search Grounding để dò tìm các "lỗ hổng thị trường". Tìm kiếm những sản phẩm có CPM cao nhưng độ cạnh tranh nội dung video hiện tại đang thấp.</p>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: MARKETPLACE */}
          {activeSection === 'marketplace' && (
            <div className="animate-fade-in space-y-8">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-500/20 rounded-2xl text-orange-400 shadow-neon"><ShoppingBag size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">6. AI Product Marketplace</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Real-time Opportunity Stream</p>
                  </div>
              </div>
              <p className="text-slate-300">
                Module này hoạt động như một <strong>"Bản tin tài chính"</strong> cho dân làm Affiliate. Cứ mỗi 45 giây, hệ thống tự động cập nhật danh sách các sản phẩm AI SaaS hoặc Gadgets đang có xu hướng tìm kiếm tăng vọt.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">Ý nghĩa các chỉ số:</h4>
                  <ul className="text-xs text-slate-400 space-y-3">
                      <li>• <strong className="text-white">Opportunity Score:</strong> Đánh giá mức độ dễ Viral của sản phẩm này dựa trên dữ liệu Google Trends.</li>
                      <li>• <strong className="text-white">Content Angle:</strong> Gợi ý hướng tiếp cận nội dung (VD: "So sánh với ChatGPT", "Bóc phốt sự thật").</li>
                      <li>• <strong className="text-white">Quick Produce:</strong> Nhấn nút để đẩy ngay sản phẩm đó vào Studio sản xuất.</li>
                  </ul>
              </div>
            </div>
          )}

          {/* SECTION: COMMANDER */}
          {activeSection === 'commander' && (
            <div className="animate-fade-in space-y-8">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400 shadow-neon"><Zap size={40} /></div>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter uppercase">8. AI Chat Commander</h1>
                      <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Natural Language Command Center</p>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={160} /></div>
                  <h3 className="text-xl font-bold text-white mb-6">Trò chuyện để điều khiển</h3>
                  <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2">Lệnh điều hướng:</p>
                          <p className="text-sm text-white italic">"Commander, hãy vào phần Cài đặt và xem lại các Key của tôi."</p>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2">Lệnh sản xuất:</p>
                          <p className="text-sm text-white italic">"Phân tích kịch bản của video [Link] và viết lại một bản hài hước hơn."</p>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2">Chế độ giọng nói (Live Mode):</p>
                          <p className="text-sm text-slate-400">Nhấn biểu tượng Micro trong cửa sổ chat để nói chuyện trực tiếp với Commander bằng giọng nói qua <strong>Gemini Live API</strong>.</p>
                      </div>
                  </div>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                  <h4 className="text-primary font-bold mb-2">Mẹo: AI Memory (Trí nhớ AI)</h4>
                  <p className="text-xs text-slate-400">Bạn có thể nói: "Commander, từ nay hãy luôn viết kịch bản theo phong cách dành cho GenZ". AI sẽ lưu điều này vào <strong>Knowledge Base</strong> và áp dụng cho mọi video sau này.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 
        ================================================================
        HIDDEN PDF TEMPLATE (RENDERED FOR CAPTURE)
        ================================================================
      */}
      <div 
        ref={pdfRef} 
        style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '210mm', backgroundColor: 'white', color: '#1e293b', fontFamily: 'sans-serif' }}
      >
          <div className="p-[20mm] min-h-[297mm] flex flex-col justify-between border-b-2 border-slate-100">
              <div className="mt-20 text-center">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">AV STUDIO PRO</h1>
                  <h2 className="text-2xl text-slate-400 uppercase tracking-widest font-light">Hướng dẫn vận hành từ A-Z</h2>
                  <p className="mt-8 text-slate-500 max-w-md mx-auto">Tài liệu chi tiết về hệ thống sản xuất video tự động hóa 1-Click tích hợp Gemini 3 Pro & Google VEO.</p>
              </div>
              <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm tracking-widest">Danh mục tài liệu</h3>
                  <ul className="text-sm space-y-2 text-slate-600">
                      <li>1. Triết lý vận hành & Tổng quan</li>
                      <li>2. Cấu hình API Vault & Bảo mật</li>
                      <li>3. Vận hành Viral DNA Studio (Manual Mode)</li>
                      <li>4. Vận hành Infinity Auto-Pilot (Robot Mode)</li>
                      <li>5. Tình báo thị trường & Reconnaissance</li>
                      <li>6. AI Commander & Hệ thống ra lệnh</li>
                      <li>7. Xử lý sự cố & Tối ưu hóa RPM</li>
                  </ul>
              </div>
              <div className="border-t pt-8 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  <span>Version 1.0.1 (Enterprise)</span>
                  <span>Generated on {new Date().toLocaleDateString()}</span>
              </div>
          </div>
          {/* Detailed pages would follow similarly in a real app generation, but for this XML we focus on the core structure */}
      </div>

    </div>
  );
};

export default Documentation;