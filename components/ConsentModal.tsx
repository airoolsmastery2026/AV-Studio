import React from 'react';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';
import NeonButton from './NeonButton';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    // Changed: items-center -> items-start, added pt-20 for top alignment ("hiển thị đầu trang")
    // Changed: z-50 -> z-[100] to ensure it's above sidebar and headers
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all scale-100 relative">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 text-amber-500">
            <ShieldAlert size={28} />
            <h2 className="text-xl font-bold text-white">Xác nhận Tuân thủ Chính sách</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
          <p className="font-semibold text-white">Trước khi bắt đầu quy trình AutoPilot, bạn cần xác nhận:</p>
          
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Không tải video gốc:</strong> Hệ thống chỉ phân tích <em>metadata công khai</em> (tiêu đề, mô tả, tags, thumbnails). Video/Audio gốc sẽ không được tải xuống.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Paraphrase bắt buộc:</strong> Nội dung tạo ra là bản phái sinh (derivative) với mức độ tương đồng ngữ nghĩa tối đa 60-70%.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Trách nhiệm pháp lý:</strong> Bạn chịu trách nhiệm hoàn toàn về quyền sở hữu trí tuệ đối với sản phẩm cuối cùng.
              </span>
            </li>
          </ul>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 mt-4">
            <p>Việc nhấn "Xác nhận & Bắt đầu" sẽ được ghi lại trong <code>consent_log</code> phục vụ mục đích kiểm toán.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Huỷ bỏ
          </button>
          <NeonButton onClick={onConfirm} size="md">
            Xác nhận & Bắt đầu
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;