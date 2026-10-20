import React from 'react';
import { 
  FileText,
  X,
  BookOpen,
  Printer,
  Upload,
  Edit2,
  Trash2,
  Users,
  Eye
} from 'lucide-react';
import { Student, UnitInfoSettings } from '../types';

interface DecisionDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  filteredStudents: Student[];
  unitInfo?: UnitInfoSettings;
}

const DecisionDocsModalInner: React.FC<DecisionDocsModalProps> = ({
  isOpen,
  onClose,
  students,
  filteredStudents,
  unitInfo
}) => {
  const [activeTab, setActiveTab] = React.useState('Quyết định');

  const displayStudents = (filteredStudents !== undefined)
    ? filteredStudents
    : (students && Array.isArray(students))
      ? students.filter(s => {
          const sClass = String(s.classId || '').trim().toLowerCase();
          const target = String(unitInfo?.classId || '').trim().toLowerCase();
          return sClass === target || (!s.classId && target === 'cđk19.2-ot1.clc');
        })
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003b7a] via-[#005bb5] to-[#0074d9] px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl border border-white/25 shadow-inner">
              <BookOpen className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight uppercase">
                Sổ Quản Lý & Tải Lên Quyết Định, Văn Bản Lớp Học
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setActiveTab('Quyết định')}
                className={`${activeTab === 'Quyết định' ? 'bg-white/20' : 'bg-white/5'} hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5`}>
              <BookOpen className="w-3.5 h-3.5" /> Quyết định 6
            </button>
            <button 
                onClick={() => setActiveTab('BB họp lớp')}
                className={`${activeTab === 'BB họp lớp' ? 'bg-white/20' : 'bg-white/5'} hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5`}>
              <Users className="w-3.5 h-3.5" /> BB họp lớp 4
            </button>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Xuất Excel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
                <input type="text" placeholder="Tìm số QĐ, trích yếu, nội dung..." className="px-3 py-1.5 border border-slate-300 rounded-lg w-64" />
                <select className="px-3 py-1.5 border border-slate-300 rounded-lg">
                    <option>Tất cả quyết định (6)</option>
                </select>
                <select className="px-3 py-1.5 border border-slate-300 rounded-lg">
                    <option>Mọi đối tượng áp dụng</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Xuất Excel
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> In Biểu Mẫu A4
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> + Tải Lên Quyết Định / Văn Bản
                </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[65vh] bg-white">
            <table className="w-full text-[11px] text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-30 select-none shadow-xs text-slate-900 bg-slate-100">
                <tr className="border-b-2 border-slate-300">
                  <th className="p-3 border-r border-slate-300">STT</th>
                  <th className="p-3 border-r border-slate-300">{activeTab === 'Quyết định' ? 'SỐ / KÝ HIỆU' : 'SỐ BIÊN BẢN'}</th>
                  <th className="p-3 border-r border-slate-300">{activeTab === 'Quyết định' ? 'TRÍCH YẾU NỘI DUNG' : 'TIÊU ĐỀ CUỘC HỌP'}</th>
                  <th className="p-3 border-r border-slate-300">{activeTab === 'Quyết định' ? 'LOẠI QUYẾT ĐỊNH' : 'PHÂN LOẠI'}</th>
                  <th className="p-3 border-r border-slate-300">{activeTab === 'Quyết định' ? 'NGÀY KÝ' : 'NGÀY HỌP'}</th>
                  <th className="p-3 border-r border-slate-300">{activeTab === 'Quyết định' ? 'CƠ QUAN BAN HÀNH' : 'CHỦ TỌA (GVCN)'}</th>
                  <th className="p-3">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(activeTab === 'Quyết định' ? [
                    { stt: 1, so: '717/QĐ-CP', noiDung: 'Về việc biên chế lớp cho sinh viên xin chuyển chương trình đào tạo', loai: 'QĐ Tuyển sinh / Biên chế', ngay: '08/09/2026', coQuan: 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG KỸ THUẬT' },
                    { stt: 2, so: '1974/QĐ-BL', noiDung: 'Về việc ghép lớp và biên chế lại HSSV, phân công giáo viên chủ nhiệm các lớp', loai: 'QĐ Tuyển sinh / Biên chế', ngay: '08/09/2026', coQuan: 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG KỸ THUẬT' },
                ] : [
                    { stt: 1, so: '04/BB-SHL', noiDung: 'Biên bản sinh hoạt lớp tuần 4 tháng 09/2026', loai: 'Sinh hoạt lớp tuần', ngay: '28/09/2026', coQuan: 'ThS. Nguyễn Chí Dũng (GVCN)' },
                    { stt: 2, so: '02/BB-HB', noiDung: 'Biên bản họp bình xét học bổng khuyến khích & rèn luyện Học kỳ 1', loai: 'Họp xét cấp học bổng', ngay: '15/09/2026', coQuan: 'ThS. Nguyễn Chí Dũng (GVCN)' },
                ]).map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="p-3 border-r border-slate-200 font-bold">{item.stt}</td>
                    <td className="p-3 border-r border-slate-200 font-bold text-blue-900">{item.so}</td>
                    <td className="p-3 border-r border-slate-200">{item.noiDung}</td>
                    <td className="p-3 border-r border-slate-200"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-[10px] font-semibold">{item.loai}</span></td>
                    <td className="p-3 border-r border-slate-200">{item.ngay}</td>
                    <td className="p-3 border-r border-slate-200">{item.coQuan}</td>
                    <td className="p-3 flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                        <button className="text-blue-600 hover:text-blue-800"><Upload className="w-4 h-4" /></button>
                        <button className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                        <button className="text-rose-600 hover:text-rose-800"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 sm:px-8 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Tổng số văn bản lưu trữ: 6 (Đang hiển thị: 6)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-sm active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const DecisionDocsModal: React.FC<DecisionDocsModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <DecisionDocsModalInner {...props} />;
};
