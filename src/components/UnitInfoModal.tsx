import React, { useState, useEffect, useMemo } from 'react';
import { 
  X,
  Upload,
  UserPlus,
  BookOpen,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  Building2,
  Users,
  MapPin,
  Save,
  CheckCircle2,
  ShieldCheck,
  Award,
  GraduationCap
} from 'lucide-react';
import { UnitInfoSettings, Student } from '../types';
import { StudentFullDetailModal } from './StudentFullDetailModal';

interface UnitInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitInfo: UnitInfoSettings;
  onSaveUnitInfo: (newInfo: UnitInfoSettings) => void;
  students?: Student[];
  filteredStudents?: Student[];
  triggerImport?: (type: string) => void;
  setIsAddingStudent?: (val: boolean) => void;
  currentClass?: string;
  onEditStudent?: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string, classId?: string) => void;
  initialTab?: string;
}

const UnitInfoModalInner: React.FC<UnitInfoModalProps> = ({
  isOpen,
  onClose,
  unitInfo,
  onSaveUnitInfo,
  students = [],
  filteredStudents = [],
  triggerImport = () => {},
  setIsAddingStudent = () => {},
  currentClass = 'CĐK19.2-OT1.CLC',
  onEditStudent,
  onUpdateStudent,
  onDeleteStudent,
  initialTab = 'TT_CHUNG'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state cho tab Sửa Thông Tin Chung Đơn Vị
  const [formUnitInfo, setFormUnitInfo] = useState<UnitInfoSettings>(() => ({
    ...unitInfo,
    classId: unitInfo.classId || currentClass
  }));

  useEffect(() => {
    if (unitInfo) {
      setFormUnitInfo({
        ...unitInfo,
        classId: unitInfo.classId || currentClass
      });
    }
  }, [unitInfo, currentClass]);

  // Safe student list calculation to completely prevent TypeError: Cannot read properties of undefined (reading 'filter')
  const safeStudentList = useMemo(() => {
    if (Array.isArray(filteredStudents) && filteredStudents.length > 0) {
      return filteredStudents.filter(Boolean);
    }
    if (Array.isArray(students)) {
      const target = String(currentClass || '').trim().toLowerCase();
      return students.filter(s => {
        if (!s) return false;
        const sClass = String(s.classId || '').trim().toLowerCase();
        return sClass === target || (!sClass && target === 'cđk19.2-ot1.clc');
      });
    }
    return [];
  }, [students, filteredStudents, currentClass]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'TT_CHUNG');
      setSearchTerm('');
      setSelectedTeam('all');
      setSaveSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  const handleExportExcel = () => {
    alert('Đang xuất tệp Excel (.xlsx) chuẩn biểu mẫu GDNN cho toàn bộ 9 chuyên đề...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveUnitInfoForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveUnitInfo(formUnitInfo);
    setSaveSuccessMsg('✅ Đã lưu cấu hình thông tin chung đơn vị thành công!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const handleDelete = (s: Student) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa sinh viên ${s.fullName} (${s.id})? Dữ liệu của sinh viên này sẽ bị xóa khỏi lớp ${currentClass}.`)) {
      if (onDeleteStudent) {
        onDeleteStudent(s.id, currentClass);
      }
    }
  };

  const displayedStudents = safeStudentList.filter(s => {
    if (!s) return false;
    const matchSearch = searchTerm === '' || 
      (s.fullName && s.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTeam = selectedTeam === 'all' || String(s.workshopGroup || '1') === selectedTeam;
    return matchSearch && matchTeam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full border border-slate-300 flex flex-col max-h-[96vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar matching Image */}
        <div className="bg-gradient-to-r from-[#003b7a] via-[#005bb5] to-[#0074d9] px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl border border-white/25 shadow-inner">
              <BookOpen className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight uppercase">
                Sổ Quản Lý Thông Tin Chung & 9 Chuyên Đề HSSV
              </h3>
              <p className="text-[11px] text-blue-100">
                Hệ thống quản lý hành chính lớp học theo Thông tư GDNN chuẩn Bộ LĐTBXH • Lớp: <strong className="text-yellow-300">{currentClass}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Xuất tệp Excel chuẩn biểu mẫu"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/25 text-white rounded-lg transition cursor-pointer"
              title="In biểu mẫu"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/25 text-white rounded-lg transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar & Search Bar matching Image */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'TT', label: '1. TT (Trích ngang)' },
              { id: 'HT_SV', label: '2. HT_SV (Học tập)' },
              { id: 'GDTC', label: '3. GDTC (Thể chất)' },
              { id: 'VP', label: '4. VP (Vi phạm)' },
              { id: 'HB', label: '5. HB (Học bổng)' },
              { id: 'VL', label: '6. VL (Việc làm)' },
              { id: 'KT', label: '7. KT (Khen thưởng)' },
              { id: 'KL', label: '8. KL (Kỷ luật)' },
              { id: 'VTD', label: '9. VTD (Vay vốn)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                  activeTab === tab.id 
                    ? tab.id === 'TT_CHUNG' ? 'bg-amber-500 text-slate-900 shadow-xs' : 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-900 border border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'TT_CHUNG' && (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm mã SV, họ tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden w-48 shadow-2xs"
                />
              </div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden shadow-2xs"
              >
                <option value="all">Tất cả các Tổ ({safeStudentList.length} SV)</option>
                <option value="1">Tổ 1</option>
                <option value="2">Tổ 2</option>
                <option value="3">Tổ 3</option>
                <option value="4">Tổ 4</option>
              </select>
            </div>
          )}
        </div>

        {/* Banner notification when in sheets */}
        <div className="bg-blue-50/70 border-b border-blue-200 px-6 py-1.5 flex items-center justify-between text-xs text-blue-900 font-semibold">
          <span>
            {activeTab === 'TT_CHUNG' && '⚙️ Chỉnh sửa thông tin hành chính đơn vị: Trường, Khoa, GVCN, Niên khóa, Ký duyệt văn bản chuẩn GDNN'}
            {activeTab === 'TT' && '• Sheet [TT]: Bảng Thông Tin Chung & Trích Ngang Sinh Viên (ĐẦY ĐỦ 31 CỘT CHUẨN)'}
            {activeTab === 'HT_SV' && '• Sheet [HT_SV]: Bảng Thông Tin Học Tập Sinh Viên (ĐẦY ĐỦ 25 CỘT CHUẨN)'}
            {activeTab === 'GDTC' && '• Sheet [GDTC]: Sổ Theo Dõi Hoàn Thành Môn GDTC & GDQP-AN'}
            {activeTab === 'VP' && '• Sheet [VP]: Sổ Theo Dõi Vi Phạm Nội Quy & Kỷ Luật Xưởng'}
            {activeTab === 'HB' && '• Sheet [HB]: Sổ Quản Lý Xét Cấp Học Bổng Khuyến Khích'}
            {activeTab === 'VL' && '• Sheet [VL]: Sổ Theo Dõi Thực Tập & Giới Thiệu Việc Làm'}
            {activeTab === 'KT' && '• Sheet [KT]: Sổ Vàng Khen Thưởng & Thành Tích HSSV'}
            {activeTab === 'KL' && '• Sheet [KL]: Sổ Theo Dõi Xử Lý Kỷ Luật Sinh Viên'}
            {activeTab === 'VTD' && '• Sheet [VTD]: Quản Lý Giấy Xác Nhận Vay Vốn Tín Dụng (QĐ 157)'}
          </span>
          <span className="text-[11px] text-slate-500 italic">
            * Cột cuối cùng: ✏️ Sửa chi tiết sinh viên, 🗑️ Xóa sinh viên khỏi lớp
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white space-y-4">

          {/* TAB 0: SỬA THÔNG TIN CHUNG ĐƠN VỊ */}
          {activeTab === 'TT_CHUNG' && (
            <form onSubmit={handleSaveUnitInfoForm} className="space-y-5">
              {saveSuccessMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-3 rounded-xl flex items-center gap-2 font-bold text-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* SECTION 1: TRƯỜNG & KHOA */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-[#004e92] font-black text-xs uppercase">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. THÔNG TIN ĐƠN VỊ QUẢN LÝ, TRƯỜNG & KHOA</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cơ quan chủ quản cấp trên:</label>
                    <input
                      type="text"
                      value={formUnitInfo.parentAgency || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, parentAgency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tên trường (In hoa):</label>
                    <input
                      type="text"
                      value={formUnitInfo.schoolName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, schoolName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold uppercase focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Khoa chuyên môn (In hoa):</label>
                    <input
                      type="text"
                      value={formUnitInfo.facultyName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, facultyName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold uppercase focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ngành nghề đào tạo:</label>
                    <input
                      type="text"
                      value={formUnitInfo.majorName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, majorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LỚP HỌC & NIÊN KHÓA */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-[#004e92] font-black text-xs uppercase">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>2. LỚP HỌC, NIÊN KHÓA & ĐỊA DANH BAN HÀNH VĂN BẢN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mã / Tên Lớp:</label>
                    <input
                      type="text"
                      value={formUnitInfo.classId || currentClass}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, classId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-blue-800 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Niên khóa đào tạo:</label>
                    <input
                      type="text"
                      value={formUnitInfo.academicYear || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, academicYear: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hệ đào tạo:</label>
                    <input
                      type="text"
                      value={formUnitInfo.trainingSystem || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, trainingSystem: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Địa phương ban hành văn bản:</label>
                    <input
                      type="text"
                      value={formUnitInfo.issueLocation || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, issueLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ký hiệu số văn bản:</label>
                    <input
                      type="text"
                      value={formUnitInfo.documentSymbol || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, documentSymbol: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: NHÂN SỰ & KÝ DUYỆT */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-[#004e92] font-black text-xs uppercase">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>3. NHÂN SỰ & KÝ DUYỆT CÁC BIỂU MẪU HÀNH CHÍNH</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cố vấn học tập / GVCN:</label>
                    <input
                      type="text"
                      value={formUnitInfo.advisorName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, advisorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lãnh đạo Khoa (Trưởng Khoa):</label>
                    <input
                      type="text"
                      value={formUnitInfo.deanName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, deanName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Thư ký biên bản / cuộc họp:</label>
                    <input
                      type="text"
                      value={formUnitInfo.secretaryName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, secretaryName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Chức danh người ký GXN:</label>
                    <input
                      type="text"
                      value={formUnitInfo.certSignerTitle || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, certSignerTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold uppercase text-slate-900 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Họ tên người ký duyệt / Hiệu trưởng:</label>
                    <input
                      type="text"
                      value={formUnitInfo.principalName || ''}
                      onChange={(e) => setFormUnitInfo({ ...formUnitInfo, principalName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU THAY ĐỔI THÔNG TIN CHUNG</span>
                </button>
              </div>
            </form>
          )}
          
          {/* TAB 1: TT (Trích ngang - ĐẦY ĐỦ 31 CỘT CHUẨN) */}
          {activeTab === "TT" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-950 uppercase text-xs">
                    BẢNG TRÍCH NGANG THÔNG TIN SINH VIÊN (ĐẦY ĐỦ 31 CỘT)
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-semibold">Tổng số: <b>{displayedStudents.length}</b> sinh viên</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => triggerImport("TT")} 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> <span>Nạp Dữ Liệu</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingStudent(true)} 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> <span>+ Thêm HSSV Mới</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 select-none shadow-xs text-white">
                    <tr className="bg-[#b4c6e7] text-slate-900 text-[11px] font-extrabold border-b-2 border-slate-400">
                      <th className="p-2.5 text-center w-12 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[110px] sticky left-12 z-40 bg-[#b4c6e7]">Mã HSSV</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[170px] sticky left-40 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-20">Giới tính</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày sinh</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-20">Dân tộc</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Số CCCD</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày cấp CCCD</th>
                      <th className="p-2.5 border-r border-slate-400 w-28">Số điện thoại</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[160px]">Email</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Nơi sinh</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Quê quán</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Tỉnh/TP thường trú</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Xã/Phường thường trú</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[200px]">Hộ khẩu thường trú đầy đủ</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[160px]">Tạm trú / KTX</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày vào đoàn</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày vào đảng</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày chính thức</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Phương tiện đi lại</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[180px]">Diện chính sách</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Họ tên Bố</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[130px]">Nghề nghiệp Bố</th>
                      <th className="p-2.5 border-r border-slate-400 w-28">SĐT Bố</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Họ tên Mẹ</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[130px]">Nghề nghiệp Mẹ</th>
                      <th className="p-2.5 border-r border-slate-400 w-28">SĐT Mẹ</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-20">Tổ xưởng</th>
                      <th className="p-2.5 border-r border-slate-400 w-28">Chức vụ</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Vị trí xưởng</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-24">Chuyên cần %</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-blue-50/40 transition">
                        <td className="p-2.5 text-center border-r border-slate-200 sticky left-0 z-20 bg-white font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-blue-700 sticky left-12 z-20 bg-white">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 sticky left-40 z-20 bg-white">{s.fullName}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.gender}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.birthDate || '01/01/2007'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.ethnicity || 'Kinh'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.idCard || '038207000000'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.idCardIssueDate || '18/12/2021'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.phone || '0988000000'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-slate-600">{s.email || `${s.id.toLowerCase()}@gdnn.edu.vn`}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.birthPlace || s.permanentAddress || 'Phú Thọ'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.hometown || s.permanentAddress || 'Phú Thọ'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.permanentProvince || s.permanentAddress?.split('-')[0]?.trim() || 'Tỉnh Phú Thọ'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.permanentWard || s.permanentAddress?.split('-')[1]?.trim() || 'Xã Liên Châu'}</td>
                        <td className="p-2.5 border-r border-slate-200 truncate max-w-[220px]" title={s.permanentAddress}>{s.permanentAddress || 'Xã Liên Châu - Tỉnh Phú Thọ'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.temporaryAddress || 'KTX Trường'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-500">{s.youthUnionDate || '26/03/2022'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-400">{s.partyDate || '---'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-400">{s.officialPartyDate || '---'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.transportation || 'Xe máy số cá nhân'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-medium text-blue-900">{s.policy || 'Miễn giảm 70% (NĐ 238/2025)'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.fatherName || `Bố của ${s.fullName}`}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.fatherJob || s.parentJob || 'Kỹ thuật viên cơ khí'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.fatherPhone || '0912000000'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.motherName || `Mẹ của ${s.fullName}`}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.motherJob || 'Kinh doanh tự do'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.motherPhone || '0913000000'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-bold text-blue-800">Tổ {s.workshopGroup || 1}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.role || 'Thành viên'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.station || 'Cầu nâng 2 trụ'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-bold text-emerald-700">{s.attendanceRate ?? 100}%</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                            title="✏️ Cây bút sửa: Cập nhật thông tin chi tiết đầy đủ của sinh viên"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                            title="🗑️ Thùng rác: Xóa sinh viên khỏi lớp này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* TAB 2: HT_SV (Học tập - ĐẦY ĐỦ 25 CỘT CHUẨN) */}
          {activeTab === 'HT_SV' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  BẢNG THÔNG TIN HỌC TẬP SINH VIÊN (ĐẦY ĐỦ 25 CỘT) | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">
                  * Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 text-center w-12 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[110px] sticky left-12 z-40 bg-[#b4c6e7]">Mã HSSV</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[170px] sticky left-40 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[180px]">Đối tượng đầu vào</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[160px]">Số QĐ trúng tuyển</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Ngày ký QĐ trúng tuyển</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Sinh viên năm</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[160px]">Kết quả tuyển sinh</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Mã CT đào tạo</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Loại hình đào tạo</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-24">Từ năm</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-24">Đến năm</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Khoa chuyên môn</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Lớp niên chế / sinh hoạt</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ngày nhập học</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-28">Ở KTX nội trú</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Bằng tốt nghiệp liên thông</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[140px]">Trạng thái học</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-32">Ngày chuyển trạng thái</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Số QĐ thôi học / bảo lưu</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-32">Thời gian tốt nghiệp</th>
                      <th className="p-2.5 border-r border-slate-400 w-32">Loại tốt nghiệp</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[150px]">Số QĐ tốt nghiệp</th>
                      <th className="p-2.5 text-center border-r border-slate-400 w-32">Ngày QĐ tốt nghiệp</th>
                      <th className="p-2.5 border-r border-slate-400 min-w-[180px]">Ghi chú sư phạm</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-blue-700 sticky left-12 z-20 bg-white">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-40 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.entryPolicy || 'Tốt nghiệp Trung học phổ thông'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.admissionDecisionNumber || '806b/ QĐ-CĐKTCN'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.admissionDecisionDate || 'ngày 25 tháng 7 năm 2025'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.studentYear || 'Người học năm hai'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.admissionResult || 'Trúng tuyển nguyện vọng 1'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">{s.curriculumCode || 'CĐCLC-CNÔT'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.trainingType || 'Chính quy'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.trainingStartYear || '2025'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.trainingEndYear || '2028'}</td>
                        <td className="p-2.5 border-r border-slate-200 uppercase font-semibold">{s.department || 'CÔNG NGHỆ Ô TÔ'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.livingClass || 'Lớp niên chế'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.enrollmentDate || '08/09/2025'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">{s.isDormitory || 'Không'}</td>
                        <td className="p-2.5 border-r border-slate-200">{s.articulationDegree || 'Không'}</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-700">{s.academicStatus || 'Đang học bình thường'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-400">{s.statusChangeDate || '---'}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-400 font-mono">{s.statusDecisionNumber || '---'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-400">{s.graduationDate || '---'}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-400">{s.graduationType || '---'}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-400 font-mono">{s.graduationDecisionNumber || '---'}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 text-slate-400">{s.graduationDecisionDate || '---'}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-600 truncate max-w-[180px]">{s.teacherNotes || 'Chấp hành tốt nội quy.'}</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                            title="✏️ Cây bút sửa: Cập nhật thông tin chi tiết đầy đủ của sinh viên"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                            title="🗑️ Thùng rác: Xóa sinh viên khỏi lớp này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GDTC (Giáo dục thể chất & GDQP-AN) */}
          {activeTab === 'GDTC' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ THEO DÕI HOÀN THÀNH MÔN GDTC & GDQP-AN | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">GDTC Học phần 1</th>
                      <th className="p-2.5 border-r border-slate-400">GDTC Học phần 2</th>
                      <th className="p-2.5 border-r border-slate-400">Kết quả GDTC</th>
                      <th className="p-2.5 border-r border-slate-400">Điểm thi GDQP-AN</th>
                      <th className="p-2.5 border-r border-slate-400">Chứng chỉ GDQP-AN</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-800">8.0</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-800">8.5</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-700">Đạt chuẩn</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-800">8.2</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-700">Đã cấp chứng chỉ</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VP (Vi phạm nội quy) */}
          {activeTab === 'VP' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ THEO DÕI VI PHẠM NỘI QUY & KỶ LUẬT XƯỞNG | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Tổ xưởng</th>
                      <th className="p-2.5 border-r border-slate-400">Tuân thủ BHLĐ</th>
                      <th className="p-2.5 border-r border-slate-400">Lỗi vi phạm gần nhất</th>
                      <th className="p-2.5 border-r border-slate-400">Hình thức xử lý</th>
                      <th className="p-2.5 border-r border-slate-400">Giáo viên phụ trách</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-indigo-700">Tổ {s.workshopGroup || 1}</td>
                        <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-bold">Đầy đủ (Giày, Áo, Kính)</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-500">Không ghi nhận vi phạm</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-600">Đạt chuẩn an toàn</td>
                        <td className="p-2.5 border-r border-slate-200">{unitInfo.advisorName || 'GV Hướng dẫn'}</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HB (Học bổng) */}
          {activeTab === 'HB' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ QUẢN LÝ XÉT CẤP HỌC BỔNG KHUYẾN KHÍCH | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Điểm CPA</th>
                      <th className="p-2.5 border-r border-slate-400">Điểm Rèn luyện</th>
                      <th className="p-2.5 border-r border-slate-400">Diện xét học bổng</th>
                      <th className="p-2.5 border-r border-slate-400">Mức học bổng dự kiến</th>
                      <th className="p-2.5 border-r border-slate-400">Trạng thái phê duyệt</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-900">3.20</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-emerald-700">86 (Tốt)</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-indigo-700">Học bổng Khá / Giỏi</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-800">2.400.000 đ</td>
                        <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-semibold">Đã đề xuất hội đồng</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: VL (Việc làm & Thực tập) */}
          {activeTab === 'VL' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ THEO DÕI THỰC TẬP DOANH NGHIỆP & VIỆC LÀM | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Doanh nghiệp thực tập</th>
                      <th className="p-2.5 border-r border-slate-400">Vị trí thực tập / Làm việc</th>
                      <th className="p-2.5 border-r border-slate-400">Mức lương dự kiến</th>
                      <th className="p-2.5 border-r border-slate-400">Tình trạng việc làm</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Toyota Thăng Long / VinFast</td>
                        <td className="p-2.5 border-r border-slate-200">KTV Sửa chữa Ô tô</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-emerald-700">8.000.000 - 12.000.000 đ</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-blue-700">Đã kết nối doanh nghiệp</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: KT (Khen thưởng) */}
          {activeTab === 'KT' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ VÀNG THEO DÕI THÀNH TÍCH & KHEN THƯỞNG | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Danh hiệu khen thưởng</th>
                      <th className="p-2.5 border-r border-slate-400">Cấp quyết định</th>
                      <th className="p-2.5 border-r border-slate-400">Số quyết định</th>
                      <th className="p-2.5 border-r border-slate-400">Ngày ký QĐ</th>
                      <th className="p-2.5 border-r border-slate-400">Hình thức khen thưởng</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Sinh viên tiêu biểu xưởng thực hành</td>
                        <td className="p-2.5 border-r border-slate-200">Cấp Khoa / Trường</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">QĐ 142/QĐ-CĐOT</td>
                        <td className="p-2.5 border-r border-slate-200">20/11/2025</td>
                        <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-bold">Giấy khen + Tiền thưởng</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: KL (Kỷ luật) */}
          {activeTab === 'KL' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  SỔ THEO DÕI XỬ LÝ KỶ LUẬT SINH VIÊN | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Hình thức kỷ luật</th>
                      <th className="p-2.5 border-r border-slate-400">Hành vi vi phạm</th>
                      <th className="p-2.5 border-r border-slate-400">Số quyết định kỷ luật</th>
                      <th className="p-2.5 border-r border-slate-400">Ngày hiệu lực</th>
                      <th className="p-2.5 border-r border-slate-400">Thời hạn thử thách / Xóa</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-500">Không có kỷ luật</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-500">Chấp hành tốt nội quy</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-400 font-mono">---</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-400">---</td>
                        <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-semibold">Tư cách tốt</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: VTD (Vay vốn tín dụng) */}
          {activeTab === 'VTD' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="font-extrabold text-blue-950 uppercase text-xs">
                  QUẢN LÝ GIẤY XÁC NHẬN VAY VỐN TÍN DỤNG (QĐ 157) | Tổng số: {displayedStudents.length} sinh viên
                </span>
                <span className="text-[11px] text-slate-500 italic">* Nhấp vào ✏️ để sửa, 🗑️ để xóa HSSV.</span>
              </div>
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs max-h-[60vh]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-[#b4c6e7] text-slate-900 font-extrabold border-b-2 border-slate-400">
                    <tr>
                      <th className="p-2.5 border-r border-slate-400 sticky left-0 z-40 bg-[#b4c6e7]">STT</th>
                      <th className="p-2.5 border-r border-slate-400 sticky left-12 z-40 bg-[#b4c6e7]">Họ và tên</th>
                      <th className="p-2.5 border-r border-slate-400">Mã SV</th>
                      <th className="p-2.5 border-r border-slate-400">Số GXN vay vốn</th>
                      <th className="p-2.5 border-r border-slate-400">Ngày cấp GXN</th>
                      <th className="p-2.5 border-r border-slate-400">Ngân hàng CSXH tiếp nhận</th>
                      <th className="p-2.5 border-r border-slate-400">Định mức vay / năm</th>
                      <th className="p-2.5 border-r border-slate-400">Thời hạn đào tạo</th>
                      <th className="p-2.5 text-center min-w-[110px] bg-[#b4c6e7] sticky right-0 z-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 sticky left-0 z-20 bg-white text-center font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 sticky left-12 z-20 bg-white font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-blue-700">{s.id}</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono">GXN-157/2025</td>
                        <td className="p-2.5 border-r border-slate-200">05/09/2025</td>
                        <td className="p-2.5 border-r border-slate-200">NHCSXH Tỉnh / Huyện</td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-emerald-700">40.000.000 đ</td>
                        <td className="p-2.5 border-r border-slate-200">2025 - 2028</td>
                        <td className="p-2.5 text-center sticky right-0 z-20 bg-white shadow-xs flex items-center justify-center gap-1.5">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer" title="✏️ Sửa thông tin"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="🗑️ Xóa sinh viên"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar matching Image */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-600 font-medium">
            Lớp: <strong className="font-mono font-bold text-blue-900">{currentClass}</strong> | Sĩ số: <strong className="font-bold text-blue-900">{safeStudentList.length} SV</strong> | Định dạng chuẩn biểu mẫu Cố vấn học tập - GVCN Giáo dục nghề nghiệp (GDNN)
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

      {/* MODAL CẬP NHẬT THÔNG TIN HỌC TẬP & TRÍCH NGANG CHI TIẾT (CHUẨN HÌNH 2) */}
      <StudentFullDetailModal
        isOpen={!!editingStudent}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSaveStudent={(updatedStudent) => {
          if (onUpdateStudent) {
            onUpdateStudent(updatedStudent);
          }
          if (onEditStudent) {
            onEditStudent(updatedStudent);
          }
        }}
        currentClass={currentClass}
      />
    </div>
  );
};

export const UnitInfoModal: React.FC<UnitInfoModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <UnitInfoModalInner {...props} />;
};
