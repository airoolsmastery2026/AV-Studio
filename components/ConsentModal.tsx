
import React from 'react';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';
import NeonButton from './NeonButton';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: any;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onConfirm, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all scale-100 relative">
        
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 text-amber-500">
            <ShieldAlert size={28} />
            <h2 className="text-xl font-bold text-white">{t.app_lang === 'vi' ? 'Xác nhận Tuân thủ Chính sách' : 'Policy Compliance Confirmation'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
          <p className="font-semibold text-white">{t.app_lang === 'vi' ? 'Trước khi bắt đầu quy trình AutoPilot, bạn cần xác nhận:' : 'Before starting the AutoPilot process, please confirm:'}</p>
          
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">{t.app_lang === 'vi' ? 'Không tải video gốc:' : 'No raw video downloads:'}</strong> {t.app_lang === 'vi' ? 'Hệ thống chỉ phân tích metadata công khai.' : 'System only analyzes public metadata.'}
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">{t.app_lang === 'vi' ? 'Paraphrase bắt buộc:' : 'Mandatory Paraphrasing:'}</strong> {t.app_lang === 'vi' ? 'Nội dung tạo ra là bản phái sinh với sự khác biệt rõ rệt.' : 'Generated content is a derivative work with distinct differences.'}
              </span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            {t.cancel}
          </button>
          <NeonButton onClick={onConfirm} size="md">
            {t.confirm_start}
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
