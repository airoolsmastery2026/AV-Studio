
import React, { useState } from 'react';
import { 
  Wand2, Target, Rocket, Zap, 
  BarChart, Users, ChevronRight, 
  Sparkles, Globe, ShieldCheck, 
  Search, PlayCircle, Plus, FileText, Settings, Key
} from 'lucide-react';
import NeonButton from './NeonButton';

interface CampaignWizardProps {
  onStartProduction: (topic: string) => void;
  onNavigateToSettings: () => void;
  t: any;
}

const OBJECTIVES = [
  { id: 'affiliate', label: 'Affiliate Sales', icon: Zap, desc: 'Tập trung chuyển đổi & chốt đơn sản phẩm.' },
  { id: 'viral', label: 'Viral Growth', icon: Rocket, desc: 'Tối ưu lượt xem & tương tác cực đại.' },
  { id: 'brand', label: 'Brand Awareness', icon: Users, desc: 'Xây dựng uy tín & độ nhận diện thương hiệu.' },
];

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onStartProduction, onNavigateToSettings, t }) => {
  const [step, setStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState('affiliate');
  const [targetTopic, setTargetTopic] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onStartProduction(targetTopic);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-8">
      {/* Step Indicator */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary text-white shadow-neon' : 'bg-slate-800 text-slate-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 bg-slate-800 rounded ${step > s ? 'bg-primary' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Mục Tiêu Chiến Dịch</h2>
              <p className="text-slate-400">Chọn mục tiêu để AI tối ưu hóa kịch bản & điểm chạm khách hàng.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 group ${selectedObjective === obj.id ? 'bg-primary/10 border-primary shadow-neon' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className={`p-3 rounded-xl w-fit ${selectedObjective === obj.id ? 'bg-primary text-white' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}`}>
                    <obj.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 uppercase text-xs">{obj.label}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{obj.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-8 border-t border-slate-800 flex justify-center">
              <button onClick={onNavigateToSettings} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                <Key size={14} /> Kiểm tra kết nối tài khoản / API trước khi bắt đầu
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Tín Hiệu Đầu Vào</h2>
              <p className="text-slate-400">Dán link sản phẩm hoặc nhập chủ đề để AI tiến hành Recon.</p>
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-inner flex items-center gap-4">
                <Search className="text-primary" />
                <input 
                  autoFocus
                  value={targetTopic}
                  onChange={(e) => setTargetTopic(e.target.value)}
                  placeholder="Link TikTok/Shopee hoặc từ khóa (VD: Top 3 AI Tools)..."
                  className="bg-transparent border-none outline-none text-white flex-1 font-medium placeholder:text-slate-800"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Mỹ phẩm trending', 'Gadgets Amazon', 'Khóa học AI'].map(tag => (
                  <button key={tag} onClick={() => setTargetTopic(tag)} className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 hover:text-white transition-colors">
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Xác Nhận Lộ Trình</h2>
              <p className="text-slate-400">Xem lại cấu hình trước khi đẩy vào Studio sản xuất.</p>
            </div>
            <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-[32px] p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mục tiêu</span>
                <span className="text-primary font-black uppercase text-xs">{selectedObjective}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nội dung</span>
                <span className="text-white font-bold text-xs truncate max-w-[150px]">{targetTopic || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Engine</span>
                <span className="text-purple-500 font-bold text-xs uppercase">AI Neural Core</span>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 italic text-[10px] text-slate-400">
                <Sparkles size={16} className="text-primary shrink-0" />
                <span>Bot sẽ tự động trích xuất Viral DNA từ các nguồn để tạo kịch bản đột phá nhất.</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="text-slate-500 hover:text-white font-bold text-[10px] uppercase disabled:opacity-0 transition-all tracking-widest"
          >
            Quay lại
          </button>
          <NeonButton 
            onClick={handleNext} 
            disabled={step === 2 && !targetTopic}
            className="min-w-[200px] h-14"
          >
            {step === 3 ? 'KÍCH HOẠT STUDIO' : 'TIẾP TỤC'} <ChevronRight size={18} />
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
