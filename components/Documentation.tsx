
import React, { useState, useRef } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NeonButton from './NeonButton';

type DocSection = 'intro' | 'cashcow' | 'autopilot' | 'config' | 'tips';

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DocSection>('intro');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const menuItems: { id: DocSection; label: string; icon: any }[] = [
    { id: 'intro', label: '1. Tổng quan & Triết lý', icon: BookOpen },
    { id: 'cashcow', label: '2. Viral DNA Studio (View/RPM)', icon: Dna },
    { id: 'autopilot', label: '3. Infinity Auto-Pilot (Sales)', icon: InfinityIcon },
    { id: 'config', label: '4. Cấu hình & API Vault', icon: Settings },
    { id: 'tips', label: '5. Kỹ năng Tối ưu Nâng cao', icon: Lightbulb },
  ];

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfRef.current;
      // Temporarily reveal the hidden PDF container for capture
      element.style.display = 'block'; 
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit A4
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // If content is longer than one page, simple implementation usually just scales it or cuts it.
      // For this "Manual", we fit it nicely or handle page breaks (simplified here as one long scroll converted or single page fit).
      // A better approach for long manuals is adding pages.
      
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

      pdf.save('AV_Studio_Pro_Manual.pdf');
      
      // Hide again
      element.style.display = 'none';
    } catch (error) {
      console.error("PDF Gen Error:", error);
      alert("Lỗi khi tạo PDF. Vui lòng thử lại.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in relative">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="text-primary" size={20} /> User Guide
          </h2>
          <p className="text-xs text-slate-500 mt-1">v1.0.1 - PRO Edition</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                activeSection === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
            <NeonButton 
                onClick={handleDownloadPDF} 
                disabled={isGeneratingPdf} 
                size="sm" 
                className="w-full"
            >
                {isGeneratingPdf ? 'Đang tạo sách...' : 'Tải Sách PDF'}
            </NeonButton>
        </div>
      </div>

      {/* CONTENT AREA (Interactive View) */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-900 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-12">
          
          {/* SECTION: INTRO */}
          {activeSection === 'intro' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-3xl font-bold text-white mb-4">Chào mừng đến với AV Studio Pro</h1>
              <p className="text-slate-300 leading-relaxed">
                AV Studio (Affiliate Video Studio) không chỉ là một công cụ chỉnh sửa video. Đây là một **Trung tâm Chỉ huy (Command Center)** tích hợp AI để tự động hóa quy trình sản xuất nội dung kiếm tiền (MMO).
              </p>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">Hệ thống Lõi kép (Dual-Core Engine)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-green-400 font-bold">
                      <Dna size={20} /> CASH COW ENGINE
                    </div>
                    <p className="text-xs text-slate-400">
                      Tối ưu cho **Views, RPM, CPM**. Dùng để xây kênh tin tức, kể chuyện, sự thật lạ, nơi mục tiêu là giữ chân người xem lâu nhất để ăn tiền quảng cáo.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                      <InfinityIcon size={20} /> SALES ENGINE
                    </div>
                    <p className="text-xs text-slate-400">
                      Tối ưu cho **Conversion, Click**. Dùng để làm Affiliate, bán hàng, review sản phẩm. AI tập trung vào "Pain point" và "Solution".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CASH COW */}
          {activeSection === 'cashcow' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-3xl font-bold text-green-400 mb-4 flex items-center gap-3">
                <Dna /> Viral DNA Studio (Hướng dẫn)
              </h1>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border border-slate-700">1</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Bước 1: Nhập nguồn (Competitor Cloning)</h4>
                    <p className="text-sm text-slate-400">
                      Tại Tab <strong>Source</strong>, nhập 1-3 link kênh hoặc video của đối thủ (TikTok/Shorts) đang viral trong ngách bạn muốn làm.
                      <br/><em>Ví dụ: Link kênh @KienThucThuVi nếu bạn làm content kiến thức.</em>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border border-slate-700">2</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Bước 2: Phân tích DNA</h4>
                    <p className="text-sm text-slate-400">
                      Nhấn <strong>RUN DEEP ANALYSIS</strong>. Hệ thống sẽ:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Phân tích cấu trúc Hook (3s đầu).</li>
                        <li>Đo lường nhịp độ (Pacing) và cảm xúc (Emotional Curve).</li>
                        <li>Trích xuất từ khóa có RPM cao (để tăng doanh thu quảng cáo).</li>
                      </ul>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border border-slate-700">3</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Bước 3: Tạo kịch bản & Quality Gate</h4>
                    <p className="text-sm text-slate-400">
                      Chuyển sang Tab <strong>Story Flow</strong> để tạo kịch bản. Sau đó kiểm tra tại <strong>Quality Gate</strong>.
                      <br/>⚠️ <strong>Lưu ý:</strong> Nếu điểm Retention dưới 80%, hãy chỉnh lại "Hook Strength" trong phần Settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/10 border-l-4 border-green-500 p-4 mt-6">
                <h5 className="font-bold text-green-400 text-sm mb-1">Mẹo Cash Cow:</h5>
                <p className="text-xs text-slate-300">
                  Đừng cố bán hàng ở đây. Hãy tập trung vào sự tò mò. Kịch bản Cash Cow tốt là kịch bản khiến người xem phải chờ đến giây cuối cùng để biết kết quả.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: AUTO PILOT */}
          {activeSection === 'autopilot' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-3xl font-bold text-blue-400 mb-4 flex items-center gap-3">
                <InfinityIcon /> Infinity Auto-Pilot (Hướng dẫn)
              </h1>
              
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4">
                <h3 className="font-bold text-white">Cơ chế hoạt động</h3>
                <p className="text-sm text-slate-400">
                  Đây là chế độ "Set & Forget". Bot sẽ tự động lặp lại quy trình:
                  <strong> Săn tìm sản phẩm {'->'} Viết kịch bản bán hàng {'->'} Dựng video {'->'} Đăng bài.</strong>
                </p>
              </div>

              <div className="space-y-4">
                 <h3 className="font-bold text-white">Cấu hình Chiến dịch (Mission Config)</h3>
                 <ul className="space-y-3">
                    <li className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 font-bold text-white text-sm"><Target size={16} className="text-red-500"/> Target Niche</div>
                        <p className="text-xs text-slate-400 mt-1">Chọn ngách sản phẩm. Nếu chọn <strong>AUTO</strong>, bot sẽ tự xoay vòng các ngách hot (AI, Crypto, Gadgets).</p>
                    </li>
                    <li className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 font-bold text-white text-sm"><Settings size={16} className="text-yellow-500"/> Draft Mode</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Nếu bật, video sẽ chỉ được lưu vào <strong>Queue</strong> (Hàng chờ) chứ không đăng ngay. Khuyên dùng khi mới bắt đầu để kiểm duyệt nội dung.
                        </p>
                    </li>
                 </ul>
              </div>

              <div className="bg-blue-900/10 border-l-4 border-blue-500 p-4 mt-6">
                <h5 className="font-bold text-blue-400 text-sm mb-1">Chiến thuật Affiliate:</h5>
                <p className="text-xs text-slate-300">
                  Sử dụng tính năng <strong>"Auto-Hunter"</strong> trong Marketplace để tìm các sản phẩm High-Ticket (hoa hồng >$50). Auto-Pilot sẽ tự động ưu tiên các sản phẩm này.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: CONFIG */}
          {activeSection === 'config' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-3xl font-bold text-purple-400 mb-4 flex items-center gap-3">
                <Settings /> Cấu hình & API Vault
              </h1>
              
              <div className="grid grid-cols-1 gap-6">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                      <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Key size={18} /> API Keys (Bắt buộc)</h3>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                          <li><strong>Google Gemini API:</strong> Bắt buộc phải có để chạy mọi tính năng AI (Phân tích, viết kịch bản).</li>
                          <li><strong>Zalo/TikTok/YouTube:</strong> Cần thiết nếu muốn dùng tính năng Auto-Post. Nếu không có, hệ thống vẫn tạo video nhưng sẽ lưu vào Queue.</li>
                      </ul>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                      <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Layers size={18} /> Google Ecosystem</h3>
                      <p className="text-sm text-slate-400 mb-2">
                          Hệ thống hỗ trợ <strong>Prefer Google Stack</strong> trong Cài đặt chung. Khi bật:
                      </p>
                      <ul className="text-sm text-slate-300 space-y-1">
                          <li>Visual: Sử dụng <strong>Google Veo</strong> hoặc <strong>Imagen 3</strong>.</li>
                          <li>Voice: Sử dụng <strong>Google Chirp (USM)</strong>.</li>
                          <li>Script: Sử dụng <strong>Gemini 3 Pro</strong>.</li>
                      </ul>
                  </div>
              </div>
            </div>
          )}

          {/* SECTION: TIPS */}
          {activeSection === 'tips' && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
                <Lightbulb /> Mẹo Tối ưu & Kỹ năng Nâng cao
              </h1>

              {/* Tip 1 */}
              <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Zap size={18} className="text-yellow-500" /> Hack RPM (Doanh thu quảng cáo)
                  </h3>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
                      <p className="mb-2">RPM (Revenue Per Mille) phụ thuộc vào ngách và từ khóa. Để tăng RPM:</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Sử dụng <strong>Cash Cow Engine</strong>.</li>
                          <li>Trong phần <strong>Manual Targeting</strong> (Analytics), hãy nhập các từ khóa tài chính: <em>"Crypto", "Insurance", "Hosting", "Make Money Online"</em>.</li>
                          <li>Hệ thống sẽ tự động chèn các từ khóa đắt tiền vào Metadata video.</li>
                      </ul>
                  </div>
              </div>

              {/* Tip 2 */}
              <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield size={18} className="text-red-500" /> Tránh bản quyền & Re-up
                  </h3>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
                      <p className="mb-2">AI tạo nội dung phái sinh (Derivative), nhưng để an toàn 100%:</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Vào <strong>Settings {'->'} Studio Config</strong>.</li>
                          <li>Đặt <strong>Min Originality Score</strong> lên trên <strong>90%</strong>.</li>
                          <li>Sử dụng các Visual Model tạo sinh (Sora, Veo) thay vì dùng ảnh stock có sẵn.</li>
                      </ul>
                  </div>
              </div>

              {/* Tip 3 */}
              <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Video size={18} className="text-blue-500" /> Zalo Video Strategy
                  </h3>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
                      <p className="mb-2">Zalo Video đang ưu tiên nội dung đời sống và review thực tế:</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Dùng <strong>Sales Engine</strong>.</li>
                          <li>Chọn các sản phẩm gia dụng, mẹ bé.</li>
                          <li>Trong phần Prompt Control (Studio), giảm <strong>Hook Strength</strong> xuống mức 5-6 để tạo cảm giác chân thực, ít "công nghiệp".</li>
                      </ul>
                  </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 
        HIDDEN PRINT TEMPLATE 
        This is what will be converted to PDF. 
        High contrast (Black on White) for readability and printing. 
        Visuals are simulated with CSS boxes to look like screenshots.
      */}
      <div 
        ref={pdfRef} 
        style={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '210mm', // A4 Width
            minHeight: '297mm',
            backgroundColor: 'white',
            color: '#1e293b', // Slate 800
            padding: '20mm',
            fontFamily: 'Inter, sans-serif'
        }}
      >
          {/* PAGE 1: COVER */}
          <div className="h-[250mm] flex flex-col justify-center items-center text-center border-b-4 border-slate-800 mb-10">
              <div className="mb-8">
                  {/* Logo Simulation */}
                  <div className="flex gap-4 items-center justify-center">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                          <Zap size={40} />
                      </div>
                      <h1 className="text-5xl font-black tracking-tight text-slate-900">AV STUDIO PRO</h1>
                  </div>
              </div>
              <h2 className="text-2xl font-light text-slate-600 uppercase tracking-widest mb-4">Manual Guide Book</h2>
              <div className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-300">
                  Version 1.0.1 • Enterprise Edition
              </div>
              
              <div className="mt-20 grid grid-cols-2 gap-8 text-left w-full max-w-lg">
                  <div className="p-4 border border-slate-300 rounded-lg">
                      <div className="font-bold text-lg mb-2 flex items-center gap-2 text-green-600"><Dna/> Cash Cow Engine</div>
                      <p className="text-xs text-slate-500">Tối ưu Views & RPM cao.</p>
                  </div>
                  <div className="p-4 border border-slate-300 rounded-lg">
                      <div className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-600"><InfinityIcon/> Auto-Pilot</div>
                      <p className="text-xs text-slate-500">Tối ưu Affiliate & Sales.</p>
                  </div>
              </div>
          </div>

          {/* PAGE 2: CONTENT */}
          <div className="space-y-8">
              {/* Intro */}
              <section>
                  <h3 className="text-2xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">1. Tổng Quan Hệ Thống</h3>
                  <p className="text-sm leading-relaxed mb-4">
                      AV Studio là hệ thống tự động hóa video marketing dựa trên AI (Gemini, Veo). Hệ thống hoạt động dựa trên triết lý "Lõi Kép" (Dual-Core) để phục vụ hai mục đích chính: Xây kênh kiếm tiền từ lượt xem (Views) và Kiếm tiền từ bán hàng (Sales).
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="font-bold text-sm mb-2">Cấu trúc API Vault:</h4>
                      <p className="text-xs text-slate-600">Bạn cần nhập Google API Key để kích hoạt toàn bộ tính năng AI (Script, Vision, Audit). Kết nối TikTok/Youtube là tùy chọn để Auto-Post.</p>
                  </div>
              </section>

              {/* Cash Cow Visual Guide */}
              <section>
                  <h3 className="text-2xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">2. Viral DNA Studio (Giao diện Cash Cow)</h3>
                  <p className="text-sm mb-4">Sử dụng để sao chép (Clone) thành công của đối thủ.</p>
                  
                  {/* Simulated Screenshot */}
                  <div className="w-full h-48 bg-slate-100 border border-slate-300 rounded-lg p-4 relative mb-4 flex flex-col gap-2">
                      <div className="absolute top-2 right-2 text-[10px] bg-white border px-2 rounded">Simulated UI</div>
                      <div className="flex gap-2">
                          <div className="w-1/4 h-32 bg-white border border-slate-200 rounded p-2 text-[8px] text-slate-400">
                              INPUT SOURCE
                              <div className="mt-1 w-full h-4 bg-slate-100 rounded"></div>
                              <div className="mt-1 w-full h-4 bg-slate-100 rounded"></div>
                          </div>
                          <div className="flex-1 h-32 bg-white border border-slate-200 rounded p-2 flex items-center justify-center">
                              <div className="text-center">
                                  <Dna className="mx-auto text-green-500 mb-1" size={24}/>
                                  <div className="text-[10px] font-bold">DNA Analysis</div>
                              </div>
                          </div>
                      </div>
                      <div className="text-[10px] text-center text-slate-500 italic">Hình 1: Quy trình nhập nguồn và phân tích DNA</div>
                  </div>
                  
                  <ul className="text-sm list-disc pl-5 space-y-1">
                      <li><strong>B1:</strong> Nhập link kênh đối thủ vào mục Source.</li>
                      <li><strong>B2:</strong> Bấm "Run Deep Analysis" để AI tìm ra công thức Hook & Retention.</li>
                      <li><strong>B3:</strong> Chuyển sang Story Flow để AI viết lại kịch bản mới dựa trên DNA đó.</li>
                  </ul>
              </section>

              {/* Auto Pilot Visual Guide */}
              <section className="mt-8">
                  <h3 className="text-2xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">3. Infinity Auto-Pilot (Chế độ Treo máy)</h3>
                  
                  {/* Simulated Screenshot */}
                  <div className="w-full h-40 bg-slate-900 border border-slate-800 rounded-lg p-4 relative mb-4 text-white flex flex-col justify-center items-center">
                      <div className="text-2xl font-bold flex items-center gap-2"><InfinityIcon className="text-blue-400"/> RUNNING...</div>
                      <div className="text-xs text-slate-400 mt-2">Status: Hunting Product {'->'} Scripting {'->'} Rendering</div>
                      <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                          <div className="w-1/2 h-full bg-blue-500"></div>
                      </div>
                  </div>

                  <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>Dành cho Affiliate Marketing.</li>
                      <li>Bot tự động vào các Network (Shopee, Clickbank) tìm sản phẩm hoa hồng cao.</li>
                      <li>Tự động tạo video review và đăng lên các kênh đã kết nối.</li>
                      <li><strong>Lưu ý:</strong> Cần treo tab trình duyệt để Bot hoạt động liên tục.</li>
                  </ul>
              </section>

              {/* Advanced Tips */}
              <section className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2"><Lightbulb size={18}/> Mẹo tối ưu RPM</h4>
                  <p className="text-xs text-yellow-900">
                      Để tăng doanh thu quảng cáo (RPM), hãy chèn các từ khóa tài chính (Crypto, Insurance, Hosting) vào phần "Manual Targeting" trong Analytics Dashboard trước khi chạy Studio. Hệ thống sẽ ưu tiên các chủ đề này.
                  </p>
              </section>
          </div>
      </div>
    </div>
  );
};

export default Documentation;
