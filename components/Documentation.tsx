
import React, { useState, useRef } from 'react';
import { 
  BookOpen, Dna, Infinity as InfinityIcon, Zap, Shield, 
  ChevronRight, Play, Settings, Target, Video, 
  Lightbulb, AlertTriangle, Layers, Key, Download, Printer, FileText, CheckCircle,
  MousePointer2, Sliders, ToggleLeft, ToggleRight, MessageSquare,
  ShoppingBag, ShieldAlert
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
      element.style.display = 'block'; 
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });

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

      pdf.save('AV_Studio_Detailed_Manual_v1.pdf');
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
                {isGeneratingPdf ? 'Đang xuất PDF...' : 'Tải Sách HDSD (Full)'}
            </NeonButton>
        </div>
      </div>

      {/* CONTENT AREA (Preview) */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-900 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-12">
          {activeSection === 'intro' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Hướng dẫn sử dụng chi tiết</h1>
              <p className="text-slate-300">
                Chào mừng bạn đến với tài liệu vận hành AV Studio. Bạn có thể xem tóm tắt tại đây hoặc nhấn nút 
                <strong>"Tải Sách HDSD (Full)"</strong> ở góc trái để tải về bản PDF đầy đủ 10 trang, bao gồm:
              </p>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Giải thích ý nghĩa từng thông số (Hook Strength, Risk Level).</li>
                <li>Cách vận hành Cash Cow Engine để tối ưu RPM.</li>
                <li>Cách cấu hình Auto-Pilot để chạy Affiliate tự động.</li>
                <li>Hướng dẫn ra lệnh cho Chatbot Commander.</li>
              </ul>
            </div>
          )}
          {/* Other preview sections omitted for brevity as PDF contains full content */}
          {activeSection !== 'intro' && (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <FileText size={48} className="mb-4" />
                <p>Nội dung chi tiết của mục này đã được biên soạn trong file PDF.</p>
                <p className="text-sm mt-2">Vui lòng nhấn nút Tải về để xem toàn bộ.</p>
             </div>
          )}
        </div>
      </div>

      {/* 
        ================================================================
        HIDDEN PRINT TEMPLATE (THE PDF CONTENT)
        ================================================================
        This section is rendered off-screen and captured by html2canvas.
      */}
      <div 
        ref={pdfRef} 
        style={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '210mm', // A4 Width
            backgroundColor: 'white',
            color: '#1e293b', // Slate 800
            fontFamily: 'Inter, sans-serif'
        }}
      >
          {/* --- PAGE 1: COVER --- */}
          <div className="p-[20mm] h-[297mm] flex flex-col justify-between border-b-2 border-slate-200">
              <div className="mt-20 text-center">
                  <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 bg-slate-900 text-white rounded-3xl flex items-center justify-center">
                          <Zap size={60} />
                      </div>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">AV STUDIO PRO</h1>
                  <h2 className="text-2xl text-slate-500 font-light uppercase tracking-widest">Sổ Tay Vận Hành Hệ Thống</h2>
              </div>
              
              <div className="mb-20">
                  <div className="grid grid-cols-2 gap-8 border-t-2 border-slate-900 pt-8">
                      <div>
                          <h3 className="font-bold text-lg mb-1">Phiên bản</h3>
                          <p className="text-sm text-slate-600">v1.0.1 (Enterprise)</p>
                      </div>
                      <div className="text-right">
                          <h3 className="font-bold text-lg mb-1">Ngày xuất bản</h3>
                          <p className="text-sm text-slate-600">{new Date().toLocaleDateString('vi-VN')}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* --- PAGE 2: MỤC LỤC & CẤU HÌNH API --- */}
          <div className="p-[20mm] min-h-[297mm] border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-300">1. Thiết Lập Ban Đầu (API Vault)</h3>
              <p className="text-sm mb-6 text-slate-600">Trước khi sử dụng bất kỳ tính năng nào, bạn cần nạp nhiên liệu (API Key) cho hệ thống.</p>

              <div className="space-y-6">
                  <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-300">
                          <Key size={24} className="text-slate-600"/>
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900">Google Gemini API (Bắt buộc)</h4>
                          <p className="text-xs text-slate-600 mb-2">Đóng vai trò là "Bộ não". Xử lý phân tích DNA, viết kịch bản và nhận diện hình ảnh.</p>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700">
                              Settings {'->'} Vault {'->'} AI Models {'->'} Google AI Studio
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-300">
                          <ShoppingBag size={24} className="text-slate-600"/>
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900">Affiliate Networks (Tùy chọn)</h4>
                          <p className="text-xs text-slate-600 mb-2">Để Auto-Pilot có thể tự lấy link tiếp thị liên kết.</p>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                              <ul className="list-disc pl-4 space-y-1">
                                  <li><strong>Shopee/Lazada:</strong> Dành cho thị trường VN.</li>
                                  <li><strong>ClickBank/Digistore24:</strong> Dành cho thị trường Global (High Ticket).</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* --- PAGE 3: VIRAL DNA STUDIO CHI TIẾT --- */}
          <div className="p-[20mm] min-h-[297mm] border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-300">2. Vận hành Viral DNA Studio</h3>
              <p className="text-sm mb-6 font-bold text-green-700">Mục tiêu: Tối ưu lượt xem (Views) và doanh thu quảng cáo (RPM/CPM).</p>

              {/* SECTION: INPUT */}
              <div className="mb-8">
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                      Nguồn & Phân tích (Source Tab)
                  </h4>
                  <div className="pl-8 space-y-3">
                      <p className="text-sm text-slate-600">Nhập 1-3 liên kết kênh đối thủ. Tại sao là 3?</p>
                      <ul className="text-sm list-disc pl-5 bg-slate-50 p-3 rounded border border-slate-200">
                          <li>Để AI tìm ra <strong>"Mẫu số chung"</strong> (Pattern) giữa các kênh thành công.</li>
                          <li>Tránh việc sao chép 1-1 (Clone) quá lộ liễu.</li>
                      </ul>
                      <div className="flex items-center gap-2 mt-2">
                          <div className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded">Run Deep Analysis</div>
                          <span className="text-xs text-slate-500">{'->'} Nhấn nút này để trích xuất DNA (Keywords, Pacing, Emotion).</span>
                      </div>
                  </div>
              </div>

              {/* SECTION: CONFIGURATION */}
              <div className="mb-8">
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                      Giải thích thông số (Settings Tab)
                  </h4>
                  <div className="pl-8 grid grid-cols-2 gap-6">
                      <div className="border border-slate-200 p-3 rounded-lg">
                          <div className="font-bold text-sm mb-2 flex items-center gap-2"><Sliders size={14}/> Hook Strength (1-10)</div>
                          <p className="text-xs text-slate-600 mb-2">Độ mạnh của 3 giây đầu video.</p>
                          <ul className="text-[10px] space-y-1 text-slate-500">
                              <li><strong>1-4 (Soft):</strong> Kể chuyện nhẹ nhàng, Vlog.</li>
                              <li><strong>5-7 (Standard):</strong> Review sản phẩm, Tin tức.</li>
                              <li><strong>8-10 (Clickbait):</strong> Sự thật sốc, Cảnh báo, Tranh cãi.</li>
                          </ul>
                      </div>
                      <div className="border border-slate-200 p-3 rounded-lg">
                          <div className="font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Risk Level</div>
                          <p className="text-xs text-slate-600 mb-2">Mức độ an toàn nội dung.</p>
                          <ul className="text-[10px] space-y-1 text-slate-500">
                              <li><strong>Safe:</strong> Nội dung 100% gốc, an toàn cho Brand.</li>
                              <li><strong>Medium:</strong> Có thể dùng lại meme/clip ngắn.</li>
                              <li><strong>High:</strong> Re-up bán phần, dễ viral nhưng rủi ro gậy.</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>

          {/* --- PAGE 4: AUTO PILOT CHI TIẾT --- */}
          <div className="p-[20mm] min-h-[297mm] border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-300">3. Vận hành Infinity Auto-Pilot</h3>
              <p className="text-sm mb-6 font-bold text-blue-700">Mục tiêu: Bán hàng (Sales) và Tiếp thị liên kết (Affiliate) tự động.</p>

              {/* MISSION CONFIG */}
              <div className="mb-8 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Cấu hình Nhiệm vụ (Mission Config)</h4>
                  <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                          <div className="font-bold text-xs w-32 shrink-0">Target Niche</div>
                          <div className="text-xs">
                              <p><strong>AUTO:</strong> Bot tự động chọn ngách đang hot (AI, Crypto, Gadgets) theo chu kỳ.</p>
                              <p><strong>Manual:</strong> Chọn cụ thể (VD: "Mẹ & Bé").</p>
                          </div>
                      </div>
                      <div className="flex gap-4 items-start">
                          <div className="font-bold text-xs w-32 shrink-0">Draft Mode</div>
                          <div className="text-xs">
                              <p><strong>BẬT:</strong> Video tạo xong sẽ nằm trong hàng chờ (Queue), không đăng ngay.</p>
                              <p><strong>TẮT:</strong> Video sẽ tự động đăng lên các kênh đã kết nối (Cần cân nhắc kỹ).</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* PROCESS FLOW */}
              <div className="mb-8">
                  <h4 className="font-bold text-slate-800 mb-4">Chu trình hoạt động (The Loop)</h4>
                  <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-3 p-2 border rounded">
                          <span className="font-bold bg-slate-200 px-2 py-1 rounded">B1. Hunting</span>
                          <span>Bot quét sàn (Shopee/Clickbank) tìm sản phẩm có hoa hồng cao & trend tăng.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded">
                          <span className="font-bold bg-slate-200 px-2 py-1 rounded">B2. Planning</span>
                          <span>Chọn "Góc tiếp cận" (Angle). VD: So sánh, Hướng dẫn, Bóc phốt.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded">
                          <span className="font-bold bg-slate-200 px-2 py-1 rounded">B3. Rendering</span>
                          <span>Tạo hình ảnh (Veo/Imagen), Giọng đọc (Chirp) và dựng video.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded">
                          <span className="font-bold bg-slate-200 px-2 py-1 rounded">B4. Cooldown</span>
                          <span>Nghỉ (theo Interval) để tránh bị Spam, sau đó lặp lại B1.</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* --- PAGE 5: AI COMMANDER & CHATBOT --- */}
          <div className="p-[20mm] min-h-[297mm] border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-300">4. Trợ lý ảo AI Commander</h3>
              <p className="text-sm mb-6 text-slate-600">
                  Biểu tượng Robot ở góc dưới màn hình không chỉ để trang trí. Đó là trung tâm điều khiển bằng ngôn ngữ tự nhiên.
              </p>

              <div className="grid grid-cols-2 gap-8">
                  <div>
                      <h4 className="font-bold text-slate-800 mb-3">Các lệnh cơ bản</h4>
                      <ul className="text-xs space-y-2 text-slate-700 list-disc pl-4">
                          <li><strong>Điều hướng:</strong> "Mở phần cài đặt", "Vào Studio", "Xem hàng chờ".</li>
                          <li><strong>Nhập liệu:</strong> "Phân tích kênh [Link]", "Tìm sản phẩm về AI".</li>
                          <li><strong>Học tập:</strong> "Hãy nhớ rằng khán giả của tôi thích video nhanh, nhạc sôi động". (Bot sẽ lưu vào Brain).</li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-800 mb-3">Thao tác cửa sổ</h4>
                      <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 text-xs space-y-2">
                          <div className="flex items-center gap-2">
                              <MousePointer2 size={14}/> <strong>Kéo thả:</strong>
                              <span>Giữ chuột vào thanh tiêu đề để di chuyển cửa sổ chat.</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <MessageSquare size={14}/> <strong>Lịch sử:</strong>
                              <span>Nhấn icon Đồng hồ để xem lại các đoạn hội thoại cũ.</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Zap size={16}/> Mẹo nâng cao: Chế độ "Huấn luyện"</h4>
                  <p className="text-xs text-yellow-900 mb-2">
                      Trong phần <strong>Settings {'->'} AI Brain</strong>, bạn có thể nhập "Custom Instructions".
                  </p>
                  <p className="text-xs text-yellow-900 italic">
                      Ví dụ: "Bạn là chuyên gia Marketing đanh đá. Hãy luôn chỉ trích các điểm yếu của đối thủ khi viết kịch bản."
                  </p>
              </div>
          </div>

          {/* --- PAGE 6: KHẮC PHỤC SỰ CỐ --- */}
          <div className="p-[20mm] min-h-[297mm]">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-300">5. Khắc phục sự cố (Troubleshooting)</h3>
              
              <div className="space-y-6">
                  <div>
                      <h4 className="font-bold text-red-600 mb-1">Lỗi: "Quota Exceeded" / 429 Error</h4>
                      <p className="text-xs text-slate-700">
                          <strong>Nguyên nhân:</strong> Google API Key miễn phí có giới hạn số lần gọi trong 1 phút.<br/>
                          <strong>Cách sửa:</strong> 
                          1. Chờ khoảng 60 giây. 
                          2. Vào Settings thêm nhiều Key khác nhau (Hệ thống sẽ tự động xoay vòng Key).
                      </p>
                  </div>

                  <div>
                      <h4 className="font-bold text-red-600 mb-1">Lỗi: Auto-Pilot dừng đột ngột</h4>
                      <p className="text-xs text-slate-700">
                          <strong>Nguyên nhân:</strong> Có thể do mất kết nối mạng hoặc lỗi API liên tục.<br/>
                          <strong>Cách sửa:</strong> Kiểm tra lại kết nối mạng. Nhấn nút "Start" lại. Xem log lỗi chi tiết ở khung bên phải Dashboard.
                      </p>
                  </div>

                  <div>
                      <h4 className="font-bold text-red-600 mb-1">Video không đăng được (Status: Failed)</h4>
                      <p className="text-xs text-slate-700">
                          <strong>Nguyên nhân:</strong> Token mạng xã hội hết hạn hoặc bị thu hồi quyền.<br/>
                          <strong>Cách sửa:</strong> Vào Settings {'->'} Vault {'->'} Social. Xóa kết nối cũ và tạo lại Token mới.
                      </p>
                  </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
                  <p>Tài liệu này được tạo tự động bởi hệ thống AV Studio Pro.</p>
                  <p>Liên hệ hỗ trợ kỹ thuật nếu vấn đề vẫn tiếp diễn.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Documentation;
