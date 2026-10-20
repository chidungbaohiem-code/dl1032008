import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CheckCircle2, 
  BookOpen, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  MapPin, 
  Layers,
  User,
  Shield,
  Briefcase,
  Award,
  CreditCard
} from 'lucide-react';
import { Student } from '../types';

interface StudentFullDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSaveStudent: (updatedStudent: Student) => void;
  currentClass: string;
}

const StudentFullDetailModalInner: React.FC<StudentFullDetailModalProps & { student: Student }> = ({
  isOpen,
  student,
  onClose,
  onSaveStudent,
  currentClass
}) => {

  const [formData, setFormData] = useState<Student>(() => ({
    ...student,
    entryPolicy: student.entryPolicy || 'Tốt nghiệp Trung học phổ thông',
    admissionDecisionNumber: student.admissionDecisionNumber || '806b/ QĐ-CĐKTCN',
    admissionDecisionDate: student.admissionDecisionDate || 'ngày 25 tháng 7 năm 2025',
    studentYear: student.studentYear || 'Người học năm hai',
    admissionResult: student.admissionResult || 'Trúng tuyển nguyện vọng 1',
    curriculumCode: student.curriculumCode || 'CĐCLC-CNÔT',
    trainingType: student.trainingType || 'Chính quy',
    trainingStartYear: student.trainingStartYear || '2025',
    trainingEndYear: student.trainingEndYear || '2028',
    department: student.department || 'CÔNG NGHỆ Ô TÔ',
    livingClass: student.livingClass || 'Lớp niên chế',
    enrollmentDate: student.enrollmentDate || '08/09/2025',
    isDormitory: student.isDormitory || 'Không',
    articulationDegree: student.articulationDegree || 'Không',
    statusChangeDate: student.statusChangeDate || '',
    statusDecisionNumber: student.statusDecisionNumber || '',
    graduationDate: student.graduationDate || '',
    graduationType: student.graduationType || '',
    graduationDecisionNumber: student.graduationDecisionNumber || '',
    graduationDecisionDate: student.graduationDecisionDate || '',
    youthUnionDate: student.youthUnionDate || '',
    partyDate: student.partyDate || '',
    officialPartyDate: student.officialPartyDate || '',
    transportation: student.transportation || 'Xe máy số cá nhân',
    permanentProvince: student.permanentProvince || student.permanentAddress?.split('-')[0]?.trim() || 'Tỉnh Phú Thọ',
    permanentWard: student.permanentWard || student.permanentAddress?.split('-')[1]?.trim() || 'Xã Liên Châu',
    birthPlace: student.birthPlace || student.permanentAddress || 'Xã Liên Châu - Tỉnh Phú Thọ',
    hometown: student.hometown || student.permanentAddress || 'Xã Liên Châu - Tỉnh Phú Thọ',
    classId: student.classId || currentClass
  }));

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        entryPolicy: student.entryPolicy || 'Tốt nghiệp Trung học phổ thông',
        admissionDecisionNumber: student.admissionDecisionNumber || '806b/ QĐ-CĐKTCN',
        admissionDecisionDate: student.admissionDecisionDate || 'ngày 25 tháng 7 năm 2025',
        studentYear: student.studentYear || 'Người học năm hai',
        admissionResult: student.admissionResult || 'Trúng tuyển nguyện vọng 1',
        curriculumCode: student.curriculumCode || 'CĐCLC-CNÔT',
        trainingType: student.trainingType || 'Chính quy',
        trainingStartYear: student.trainingStartYear || '2025',
        trainingEndYear: student.trainingEndYear || '2028',
        department: student.department || 'CÔNG NGHỆ Ô TÔ',
        livingClass: student.livingClass || 'Lớp niên chế',
        enrollmentDate: student.enrollmentDate || '08/09/2025',
        isDormitory: student.isDormitory || 'Không',
        articulationDegree: student.articulationDegree || 'Không',
        statusChangeDate: student.statusChangeDate || '',
        statusDecisionNumber: student.statusDecisionNumber || '',
        graduationDate: student.graduationDate || '',
        graduationType: student.graduationType || '',
        graduationDecisionNumber: student.graduationDecisionNumber || '',
        graduationDecisionDate: student.graduationDecisionDate || '',
        youthUnionDate: student.youthUnionDate || '',
        partyDate: student.partyDate || '',
        officialPartyDate: student.officialPartyDate || '',
        transportation: student.transportation || 'Xe máy số cá nhân',
        permanentProvince: student.permanentProvince || student.permanentAddress?.split('-')[0]?.trim() || 'Tỉnh Phú Thọ',
        permanentWard: student.permanentWard || student.permanentAddress?.split('-')[1]?.trim() || 'Xã Liên Châu',
        birthPlace: student.birthPlace || student.permanentAddress || 'Xã Liên Châu - Tỉnh Phú Thọ',
        hometown: student.hometown || student.permanentAddress || 'Xã Liên Châu - Tỉnh Phú Thọ',
        classId: student.classId || currentClass
      });
    }
  }, [student, currentClass]);

  const handleChange = (field: keyof Student, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveStudent(updated);
  };

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const studentInitial = formData.fullName?.trim()?.slice(-1) || 'S';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar matching Image 2 */}
        <div className="bg-gradient-to-r from-[#003b7a] via-[#005bb5] to-[#0074d9] px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700/80 border border-white/20 flex items-center justify-center font-extrabold text-white text-base shadow-inner">
              {studentInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Cập Nhật Thông Tin: {formData.fullName}
                </h3>
                <span className="bg-blue-800/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  {formData.gender}
                </span>
                <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Tổ {formData.workshopGroup || 1}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-mono mt-0.5">
                Mã SV: <strong className="text-yellow-300">{formData.id}</strong> • CCCD: <strong>{formData.idCard || '---'}</strong> • Lớp: <strong>{currentClass}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick navigation pill bar */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleScrollTo('section-personal')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Định danh & Cá nhân</span>
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('section-ht-sv')}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              <span>Học tập (HT_SV - 25 Cột)</span>
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('section-tt')}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trích ngang (TT - 31 Cột)</span>
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('section-chuyen-de')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Các chuyên đề khác</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 italic hidden sm:inline">
            * Mọi chỉnh sửa được lưu ngay lập tức vào hệ thống
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 bg-slate-50/50">

          {/* CARD 0: THÔNG TIN CÁ NHÂN & LIÊN HỆ ĐỊNH DANH */}
          <div id="section-personal" className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                  Thông Tin Cá Nhân & Liên Hệ Định Danh (Cơ Bản)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Mục định danh HSSV
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mã HSSV (MSSV):</label>
                <input
                  type="text"
                  value={formData.id}
                  disabled
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-600 cursor-not-allowed shadow-2xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Họ và tên HSSV:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Giới tính:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-semibold focus:outline-hidden focus:border-blue-500 shadow-2xs"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày sinh (DD/MM/YYYY):</label>
                <input
                  type="text"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dân tộc:</label>
                <input
                  type="text"
                  value={formData.ethnicity || 'Kinh'}
                  onChange={(e) => handleChange('ethnicity', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số CCCD (12 số):</label>
                <input
                  type="text"
                  value={formData.idCard || ''}
                  onChange={(e) => handleChange('idCard', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày cấp CCCD:</label>
                <input
                  type="text"
                  value={formData.idCardIssueDate || '18/12/2021'}
                  onChange={(e) => handleChange('idCardIssueDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số điện thoại sinh viên:</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email sinh viên:</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phân tổ xưởng:</label>
                <select
                  value={formData.workshopGroup || 1}
                  onChange={(e) => handleChange('workshopGroup', Number(e.target.value) as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-blue-900 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                >
                  <option value={1}>Tổ 1</option>
                  <option value={2}>Tổ 2</option>
                  <option value={3}>Tổ 3</option>
                  <option value={4}>Tổ 4</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chức vụ trong lớp:</label>
                <input
                  type="text"
                  value={formData.role || 'Thành viên'}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vị trí thực hành / Phương tiện:</label>
                <input
                  type="text"
                  value={formData.station || ''}
                  onChange={(e) => handleChange('station', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chuyên cần (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.attendanceRate ?? 100}
                  onChange={(e) => handleChange('attendanceRate', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ghi chú sư phạm của GVCN:</label>
                <textarea
                  rows={2}
                  value={formData.teacherNotes || ''}
                  onChange={(e) => handleChange('teacherNotes', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  placeholder="Ghi chú về ý thức kỷ luật, năng lực tiếp thu..."
                />
              </div>
            </div>
          </div>

          {/* CARD 1: 2. THÔNG TIN HỌC TẬP SINH VIÊN (SHEET HT_SV - ĐẦY ĐỦ 25 CỘT) */}
          <div id="section-ht-sv" className="bg-white border-2 border-rose-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                  2. Thông Tin Học Tập Sinh Viên (Sheet HT_SV - Đầy đủ 25 Cột)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                Theo chuẩn biểu mẫu GDNN
              </span>
            </div>

            {/* A. TUYỂN SINH & PHÂN BAN ĐÀO TẠO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                <BookOpen className="w-4 h-4" />
                <span>A. TUYỂN SINH & PHÂN BAN ĐÀO TẠO</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Đối tượng đầu vào:</label>
                  <input
                    type="text"
                    value={formData.entryPolicy || ''}
                    onChange={(e) => handleChange('entryPolicy', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số quyết định trúng tuyển:</label>
                  <input
                    type="text"
                    value={formData.admissionDecisionNumber || ''}
                    onChange={(e) => handleChange('admissionDecisionNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày ký QĐ trúng tuyển:</label>
                  <input
                    type="text"
                    value={formData.admissionDecisionDate || ''}
                    onChange={(e) => handleChange('admissionDecisionDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sinh viên năm:</label>
                  <input
                    type="text"
                    value={formData.studentYear || ''}
                    onChange={(e) => handleChange('studentYear', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kết quả tuyển sinh:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đạt, Trúng tuyển đợt 1"
                    value={formData.admissionResult || ''}
                    onChange={(e) => handleChange('admissionResult', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mã chương trình đào tạo:</label>
                  <input
                    type="text"
                    value={formData.curriculumCode || ''}
                    onChange={(e) => handleChange('curriculumCode', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Loại hình đào tạo:</label>
                  <input
                    type="text"
                    value={formData.trainingType || ''}
                    onChange={(e) => handleChange('trainingType', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Đào tạo từ năm:</label>
                  <input
                    type="text"
                    value={formData.trainingStartYear || ''}
                    onChange={(e) => handleChange('trainingStartYear', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Đào tạo đến năm:</label>
                  <input
                    type="text"
                    value={formData.trainingEndYear || ''}
                    onChange={(e) => handleChange('trainingEndYear', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Khoa chuyên môn:</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Lớp sinh hoạt / Lớp niên chế:</label>
                  <input
                    type="text"
                    value={formData.livingClass || ''}
                    onChange={(e) => handleChange('livingClass', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* B. NHẬP HỌC, KÝ TÚC XÁ & LIÊN THÔNG */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs">
                <Layers className="w-4 h-4" />
                <span>B. NHẬP HỌC, KÝ TÚC XÁ & LIÊN THÔNG</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày nhập học:</label>
                  <input
                    type="text"
                    value={formData.enrollmentDate || ''}
                    onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Đang ở nội trú (KTX):</label>
                  <input
                    type="text"
                    value={formData.isDormitory || ''}
                    onChange={(e) => handleChange('isDormitory', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Bằng tốt nghiệp liên thông:</label>
                  <input
                    type="text"
                    value={formData.articulationDegree || ''}
                    onChange={(e) => handleChange('articulationDegree', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* C. TRẠNG THÁI HỌC TẬP & BIẾN ĐỘNG HỌC VỤ */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>C. TRẠNG THÁI HỌC TẬP & BIẾN ĐỘNG HỌC VỤ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trạng thái học:</label>
                  <select
                    value={formData.academicStatus}
                    onChange={(e) => handleChange('academicStatus', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  >
                    <option value="Đang học bình thường">🟢 Đang học bình thường</option>
                    <option value="Cảnh báo học vụ">🟡 Cảnh báo học vụ</option>
                    <option value="Nguy cơ cấm thi">🟠 Nguy cơ cấm thi</option>
                    <option value="Nợ môn">🔴 Nợ môn</option>
                    <option value="Bảo lưu">⚪ Bảo lưu</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày chuyển trạng thái:</label>
                  <input
                    type="text"
                    placeholder="Để trống nếu đang học bình thường"
                    value={formData.statusChangeDate || ''}
                    onChange={(e) => handleChange('statusChangeDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số QĐ (Thôi học / Buộc thôi học / Bảo lưu):</label>
                  <input
                    type="text"
                    placeholder="Số QĐ nếu có"
                    value={formData.statusDecisionNumber || ''}
                    onChange={(e) => handleChange('statusDecisionNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* D. TỐT NGHIỆP & RA TRƯỜNG */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
                <GraduationCap className="w-4 h-4" />
                <span>D. TỐT NGHIỆP & RA TRƯỜNG (ĐỂ TRỐNG NẾU SINH VIÊN ĐANG THEO HỌC)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Thời gian tốt nghiệp:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ 20/05/2028 hoặc để trống"
                    value={formData.graduationDate || ''}
                    onChange={(e) => handleChange('graduationDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Loại tốt nghiệp:</label>
                  <input
                    type="text"
                    placeholder="Để trống nếu đang học"
                    value={formData.graduationType || ''}
                    onChange={(e) => handleChange('graduationType', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số QĐ công nhận tốt nghiệp:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ QĐ/123 hoặc để trống"
                    value={formData.graduationDecisionNumber || ''}
                    onChange={(e) => handleChange('graduationDecisionNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày QĐ công nhận tốt nghiệp:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ 25/05/2028 hoặc để trống"
                    value={formData.graduationDecisionDate || ''}
                    onChange={(e) => handleChange('graduationDecisionDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: 1. THÔNG TIN TRÍCH NGANG SINH VIÊN (SHEET TT - ĐẦY ĐỦ 31 CỘT) */}
          <div id="section-tt" className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                  1. Thông Tin Trích Ngang Sinh Viên (Sheet TT - Đầy đủ 31 Cột)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Hồ sơ lý lịch & đoàn thể
              </span>
            </div>

            {/* A. ĐOÀN THỂ & PHƯƠNG TIỆN ĐI LẠI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                <Layers className="w-4 h-4" />
                <span>A. ĐOÀN THỂ & PHƯƠNG TIỆN ĐI LẠI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày vào đoàn:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ 26/03/2022 hoặc để trống"
                    value={formData.youthUnionDate || ''}
                    onChange={(e) => handleChange('youthUnionDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày vào đảng:</label>
                  <input
                    type="text"
                    placeholder="Để trống nếu chưa vào đảng"
                    value={formData.partyDate || ''}
                    onChange={(e) => handleChange('partyDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày vào đảng chính thức:</label>
                  <input
                    type="text"
                    placeholder="Để trống nếu chưa chính thức"
                    value={formData.officialPartyDate || ''}
                    onChange={(e) => handleChange('officialPartyDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phương tiện đi lại:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Xe buýt, Xe máy 88AA-012.75..."
                    value={formData.transportation || ''}
                    onChange={(e) => handleChange('transportation', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* B. ĐỊA BÀN THƯỜNG TRÚ & QUÊ QUÁN */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                <MapPin className="w-4 h-4" />
                <span>B. ĐỊA BÀN THƯỜNG TRÚ & QUÊ QUÁN</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tỉnh/thành phố thường trú:</label>
                  <input
                    type="text"
                    value={formData.permanentProvince || ''}
                    onChange={(e) => handleChange('permanentProvince', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Xã/phường thường trú:</label>
                  <input
                    type="text"
                    value={formData.permanentWard || ''}
                    onChange={(e) => handleChange('permanentWard', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nơi sinh:</label>
                  <input
                    type="text"
                    value={formData.birthPlace || ''}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Quê quán:</label>
                  <input
                    type="text"
                    value={formData.hometown || ''}
                    onChange={(e) => handleChange('hometown', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hộ khẩu thường trú (đầy đủ):</label>
                  <input
                    type="text"
                    value={formData.permanentAddress || ''}
                    onChange={(e) => handleChange('permanentAddress', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Địa chỉ tạm trú / KTX:</label>
                  <input
                    type="text"
                    value={formData.temporaryAddress || ''}
                    onChange={(e) => handleChange('temporaryAddress', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* C. CHÍNH SÁCH & THÔNG TIN GIA ĐÌNH */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                <Users className="w-4 h-4" />
                <span>C. CHÍNH SÁCH & THÔNG TIN GIA ĐÌNH</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Đối tượng chính sách:</label>
                  <input
                    type="text"
                    value={formData.policy || ''}
                    onChange={(e) => handleChange('policy', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Họ tên Bố:</label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={(e) => handleChange('fatherName', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nghề nghiệp Bố:</label>
                    <input
                      type="text"
                      value={formData.fatherJob || formData.parentJob || ''}
                      onChange={(e) => handleChange('fatherJob', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">SĐT Bố:</label>
                    <input
                      type="text"
                      value={formData.fatherPhone || ''}
                      onChange={(e) => handleChange('fatherPhone', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Họ tên Mẹ:</label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={(e) => handleChange('motherName', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nghề nghiệp Mẹ:</label>
                    <input
                      type="text"
                      value={formData.motherJob || ''}
                      onChange={(e) => handleChange('motherJob', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">SĐT Mẹ:</label>
                    <input
                      type="text"
                      value={formData.motherPhone || ''}
                      onChange={(e) => handleChange('motherPhone', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: CÁC CHUYÊN ĐỀ BỔ TRỢ (GDTC, VP, HB, VL, KT, KL, VTD) */}
          <div id="section-chuyen-de" className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                  Dữ Liệu Theo Dõi Các Chuyên Đề GDNN Chuẩn
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                7 Chuyên Đề Phối Hợp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">1. Môn GDTC & GDQP-AN:</span>
                <p className="text-[11px] text-emerald-700 font-semibold">Đạt chuẩn module đào tạo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Chứng chỉ GDQP-AN: Đã cấp</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">2. Kỷ luật xưởng (VP):</span>
                <p className="text-[11px] text-emerald-700 font-semibold">Tuân thủ BHLĐ đầy đủ</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Không vi phạm nội quy an toàn</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">3. Xét cấp học bổng (HB):</span>
                <p className="text-[11px] text-indigo-700 font-semibold">Điểm rèn luyện: 85+</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Diện xét: Khá / Giỏi GDNN</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">4. Thực tập & Việc làm (VL):</span>
                <p className="text-[11px] text-blue-700 font-semibold">VinFast / Toyota Thăng Long</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Vị trí: Kỹ thuật viên bảo dưỡng</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">5. Khen thưởng (KT):</span>
                <p className="text-[11px] text-emerald-700 font-semibold">HSSV tiêu biểu thực hành</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Giấy khen cấp Trường / Khoa</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">6. Vay vốn tín dụng (VTD):</span>
                <p className="text-[11px] text-slate-700 font-semibold">GXN theo Quyết định 157</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Định mức: 40.000.000 đ/năm</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bar matching Image 2 */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tất cả dữ liệu đã được lưu tự động trên hệ thống.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Xong & Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentFullDetailModal: React.FC<StudentFullDetailModalProps> = (props) => {
  if (!props.isOpen || !props.student) return null;
  return <StudentFullDetailModalInner {...props} student={props.student} />;
};
