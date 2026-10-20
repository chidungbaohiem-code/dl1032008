import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  MessageCircle, 
  Trash2 
} from 'lucide-react';
import { Student, StudentGrade, SubjectModule, AttendanceRecord, RenLuyenCriteria, FundTransaction, WorkshopSafetyLog, ClassId, UnitInfoSettings, ClassItem, UserAccount } from '../types';

interface BackupAndFormsModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  renLuyen: RenLuyenCriteria[];
  fundTransactions: FundTransaction[];
  workshopLogs: WorkshopSafetyLog[];
  classes?: ClassItem[];
  onImportFullBackup?: (data: any) => void;
  onClearClassStudents?: () => void;
  onClearClassGrades?: () => void;
  onClearClassAttendance?: () => void;
  onClearClassRenLuyen?: () => void;
  onClearFundTransactions?: () => void;
  onClearWorkshopLogs?: () => void;
  onResetAllClassData?: () => void;
  unitInfo?: UnitInfoSettings;
  currentUser?: UserAccount | null;
}

export const BackupAndFormsModule: React.FC<BackupAndFormsModuleProps> = ({
  students,
  currentClass,
  modules: _modules,
  grades: _grades,
  attendance: _attendance,
  renLuyen: _renLuyen,
  fundTransactions: _fundTransactions,
  workshopLogs: _workshopLogs,
  classes: _classes = [],
  onImportFullBackup: _onImportFullBackup,
  unitInfo,
  currentUser: _currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'zalo-templates'>('forms');
  const [targetStudentId, setTargetStudentId] = useState<string>('25OT1006');
  const [_copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const classStudents = students.filter(s => s && s.classId === currentClass);
  const targetStudent = classStudents.find(s => s.id === targetStudentId) || classStudents[0] || students[0] || ({
    id: '25OT1001',
    fullName: 'Trần Văn Hoàng',
    gender: 'Nam',
    birthDate: '15/04/2007',
    ethnicity: 'Kinh',
    idCard: '001207008912',
    permanentAddress: 'Hải Phòng',
    fatherName: 'Trần Văn Mạnh',
    motherName: 'Nguyễn Thị Hoa',
    workshopGroup: 1,
    role: 'Lớp trưởng',
    station: 'Cầu nâng 2 trụ & Khung gầm',
    policy: 'Miễn giảm 70% (NĐ 238/2025)'
  } as Student);

  const [formsList, setFormsList] = useState<Array<{ id: string; title: string; desc: string; type: string }>>([
    { id: 'cam-thi', title: 'Thông Báo Cảnh Báo Học Vụ & Nguy Cơ Cấm Thi', desc: 'V/v: Vắng học quá 20% thời lượng mô đun theo TT 04/2022/TT-BLĐTBXH', type: 'Hành chính' },
    { id: 'thuc-tap', title: 'Giấy Giới Thiệu Thực Tập Tại Doanh Nghiệp / Garage', desc: 'Cấp cho HSSV thực tập tay nghề định kỳ tại các đối tác liên kết', type: 'Hành chính' },
    { id: 'mien-giam', title: 'Đơn Xin Miễn Giảm 70% Học Phí Nghề Nặng Nhọc', desc: 'Áp dụng theo Nghị định 81/2021/NĐ-CP & Nghị định 238/2025/NĐ-CP', type: 'Chính sách' },
    { id: 'bao-luu', title: 'Đơn Xin Bảo Lưu Kết Quả Học Tập & Tạm Dừng', desc: 'Dành cho HSSV có hoàn cảnh đặc biệt hoặc đi nghĩa vụ quân sự', type: 'Hành chính' }
  ]);

  const [selectedForm, setSelectedForm] = useState<string>('cam-thi');

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (formsList.length <= 1) {
      showToast('⚠️ Không thể xóa biểu mẫu cuối cùng trong danh sách.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa biểu mẫu này khỏi hệ thống không?')) {
      const updated = formsList.filter(f => f.id !== formId);
      setFormsList(updated);
      if (selectedForm === formId && updated.length > 0) {
        setSelectedForm(updated[0].id);
      }
      showToast('🗑️ Đã xóa biểu mẫu thành công!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToast('📋 Đã sao chép nội dung vào bộ nhớ tạm!');
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 relative">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            BIỂU MẪU CHUẨN NGHỊ ĐỊNH 30/2020/NĐ-CP
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            BIỂU MẪU SƯ PHẠM & QUẢN TRỊ HÀNH CHÍNH
          </h2>
          <p className="text-xs text-slate-500">
            Tự động điền dữ liệu (Auto-fill) vào thông báo cấm thi, giấy giới thiệu thực tập garage, đơn miễn 70% học phí (Hỗ trợ xóa, chỉnh sửa và in ấn trực tiếp).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'forms' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Văn Bản Hành Chính ({formsList.length})
          </button>
          <button
            onClick={() => setActiveTab('zalo-templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'zalo-templates' ? 'bg-[#004e92] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Mẫu Soạn Zalo / SMS
          </button>
        </div>
      </div>

      {/* FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 lg:col-span-1">
            <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Danh Sách Biểu Mẫu</h3>
            <div className="space-y-2">
              {formsList.map(form => (
                <div
                  key={form.id}
                  onClick={() => setSelectedForm(form.id)}
                  className={`p-3 rounded-xl border transition text-xs flex items-start justify-between gap-2 cursor-pointer ${
                    selectedForm === form.id ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{form.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{form.desc}</div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteForm(form.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0"
                    title="Xóa biểu mẫu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-bold text-slate-700">Chọn HSSV Áp Dụng Biểu Mẫu:</label>
              <select
                value={targetStudent.id}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.fullName} ({s.role || 'HSSV'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-2 bg-[#004e92] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> In Văn Bản (PDF / Máy In)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs lg:col-span-3 space-y-6 text-slate-800 print:shadow-none print:p-0">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div className="text-center w-1/2">
                <div className="text-xs font-bold uppercase text-slate-600">{unitInfo?.schoolName || 'TRƯỜNG CAO ĐẲNG CÔNG NGHỆ VÀ KỸ THUẬT Ô TÔ'}</div>
                <div className="text-xs font-bold text-blue-900 mt-0.5">{unitInfo?.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'}</div>
                <div className="text-[11px] text-slate-500 mt-1">Lớp: {currentClass}</div>
              </div>
              <div className="text-center w-1/2">
                <div className="text-xs font-bold uppercase text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Độc lập - Tự do - Hạnh phúc</div>
                <div className="text-[11px] text-slate-500 italic mt-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
              </div>
            </div>

            {selectedForm === 'cam-thi' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">THÔNG BÁO CHÍNH THỨC</div>
                  <h3 className="text-base font-bold uppercase text-slate-900">V/v Cảnh Báo Học Vụ & Nguy Cơ Cấm Thi Kết Thúc Mô Đun</h3>
                  <div className="text-xs text-slate-500 italic">(Căn cứ Thông tư số 04/2022/TT-BLĐTBXH Quy chế đào tạo trình độ cao đẳng, trung cấp)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Phụ huynh học sinh và sinh viên <span className="text-blue-700 underline">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</p>
                  <p>Khoa Công nghệ Ô tô trân trọng thông báo tình hình học tập và chuyên cần của sinh viên trong học kỳ hiện tại như sau:</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-600">Họ và tên HSSV:</strong> {targetStudent.fullName}</div>
                      <div><strong className="text-slate-600">Mã sinh viên:</strong> {targetStudent.id}</div>
                      <div><strong className="text-slate-600">Lớp học:</strong> {currentClass}</div>
                      <div><strong className="text-slate-600">Tổ xưởng thực hành:</strong> Tổ {targetStudent.workshopGroup || 1} ({targetStudent.station || 'Cầu nâng 2 trụ'})</div>
                      <div><strong className="text-slate-600">Số buổi nghỉ học:</strong> <span className="text-rose-600 font-bold">5 buổi (Nghỉ không phép)</span></div>
                      <div><strong className="text-slate-600">Tỷ lệ vắng mặt:</strong> <span className="text-rose-600 font-bold">22.5% (Vượt mức giới hạn 20%)</span></div>
                    </div>
                  </div>

                  <p>Theo quy định tại khoản 2 Điều 14 Thông tư 04/2022/TT-BLĐTBXH, sinh viên nghỉ quá 20% tổng số thời lượng của mô đun/tín chỉ sẽ <strong>không đủ điều kiện dự thi kết thúc mô đun</strong> và phải đăng ký học lại.</p>
                  
                  <p>Khoa yêu cầu sinh viên <span className="font-bold">{targetStudent.fullName}</span> nghiêm túc chấn chỉnh ý thức học tập, liên hệ ngay với Giáo viên chủ nhiệm để làm giải trình và cam kết chuyên cần trước ngày <span className="font-bold underline">25/{new Date().getMonth() + 1}/{new Date().getFullYear()}</span>.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GIA ĐÌNH</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">CỐ VẤN HỌC TẬP / GVCN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">TRƯỞNG KHOA</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{unitInfo?.deanName || 'Đỗ Thế Huân'}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'thuc-tap' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">GIẤY GIỚI THIỆU THỰC TẬP</div>
                  <h3 className="text-base font-bold uppercase text-slate-900">V/v Tiếp Nhận HSSV Thực Tập Tay Nghề Định Kỳ Tại Doanh Nghiệp</h3>
                  <div className="text-xs text-slate-500 italic">(Cấp cho HSSV Khoa Công nghệ Ô tô thực tập tại Garage / Xưởng dịch vụ ô tô liên kết)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám đốc các Garage / Doanh nghiệp Đối tác liên kết</p>
                  <p>Trường Cao đẳng Công nghệ và Kỹ thuật Ô tô trân trọng giới thiệu sinh viên:</p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-600">Họ và tên HSSV:</strong> {targetStudent.fullName}</div>
                      <div><strong className="text-slate-600">Mã sinh viên:</strong> {targetStudent.id}</div>
                      <div><strong className="text-slate-600">Ngày sinh:</strong> {targetStudent.birthDate}</div>
                      <div><strong className="text-slate-600">CCCD:</strong> {targetStudent.idCard}</div>
                      <div><strong className="text-slate-600">Chuyên ngành:</strong> Công nghệ Kỹ thuật Ô tô</div>
                      <div><strong className="text-slate-600">Lớp học:</strong> {currentClass}</div>
                    </div>
                  </div>

                  <p>Được đến đơn vị để thực tập tay nghề, tìm hiểu công nghệ chẩn đoán điện tử ô tô, hệ thống phun xăng EFI và hộp số tự động từ ngày <span className="font-bold">01/{new Date().getMonth() + 1}/2025</span> đến ngày <span className="font-bold">01/{new Date().getMonth() + 2}/2025</span>.</p>
                  
                  <p>Rất mong Ban Giám đốc và các kỹ thuật viên trưởng tại xưởng tạo điều kiện, hướng dẫn và giúp đỡ em hoàn thành tốt đợt thực tập thực tế.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3"></div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">TM. BAN GIÁM HIỆU / KHOA</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký tên, đóng dấu)</div>
                    <div className="h-20 font-bold text-slate-800 mt-2">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'mien-giam' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-xs font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-4">ĐƠN XIN MIỄN GIẢM 70% HỌC PHÍ</h3>
                  <div className="text-xs text-slate-500 italic">(Áp dụng cho ngành nghề nặng nhọc, độc hại, nguy hiểm theo Nghị định 81/2021/NĐ-CP & Nghị định 238/2025/NĐ-CP)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám hiệu Nhà trường & Phòng Tài chính Kế toán</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>Em tên là: <span className="font-bold text-slate-800">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</div>
                    <div>Ngày sinh: {targetStudent.birthDate} | Giới tính: {targetStudent.gender}</div>
                    <div>Lớp học: {currentClass} | Khoa: Công nghệ Ô tô</div>
                    <div>Hộ khẩu thường trú: {targetStudent.permanentAddress}</div>
                  </div>

                  <p>Căn cứ theo Nghị định số 238/2025/NĐ-CP và Nghị định 81/2021/NĐ-CP quy định chính sách miễn giảm học phí đối với học sinh, sinh viên học các ngành nghề nặng nhọc, độc hại, nguy hiểm thuộc lĩnh vực kỹ thuật công nghệ ô tô, cơ khí.</p>
                  
                  <p>Em làm đơn này kính đề nghị Ban Giám hiệu và các phòng ban chức năng xem xét giải quyết cho em được hưởng chính sách <span className="font-bold text-blue-700">miễn giảm 70% học phí</span> trong suốt khóa học.</p>
                  
                  <p>Em xin cam kết chấp hành nghiêm chỉnh mọi nội quy, quy chế của nhà trường và hoàn thành đầy đủ nghĩa vụ học tập.</p>
                  <p className="italic text-xs text-slate-500">Xin trân trọng cảm ơn!</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GVCN</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">NGƯỜI LÀM ĐƠN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{targetStudent.fullName}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedForm === 'bao-luu' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-xs font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</div>
                  <h3 className="text-base font-bold uppercase text-slate-900 mt-4">ĐƠN XIN BẢO LƯU KẾT QUẢ HỌC TẬP</h3>
                  <div className="text-xs text-slate-500 italic">(Dành cho HSSV tạm dừng học tập vì lý do cá nhân hoặc thực hiện nghĩa vụ quân sự)</div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Kính gửi: Ban Giám hiệu & Phòng Đào tạo Nhà trường</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>Em tên là: <span className="font-bold text-slate-800">{targetStudent.fullName}</span> (Mã SV: {targetStudent.id})</div>
                    <div>Lớp: {currentClass} | Khoa: Công nghệ Ô tô</div>
                    <div>Số điện thoại liên hệ: {targetStudent.phone}</div>
                  </div>

                  <p>Vì lý do cá nhân / gia đình / thực hiện nghĩa vụ quân sự, em làm đơn này kính đề nghị Ban Giám hiệu và Phòng Đào tạo cho phép em được bảo lưu kết quả học tập trong thời gian từ tháng <span className="font-bold">10/2025</span> đến hết tháng <span className="font-bold">10/2026</span>.</p>
                  
                  <p>Sau thời gian trên, em xin cam kết sẽ trở lại trường tiếp tục đăng ký học tập theo đúng quy chế đào tạo.</p>
                  <p className="italic text-xs text-slate-500">Kính mong Ban Giám hiệu xem xét chấp thuận.</p>
                </div>

                <div className="pt-8 flex justify-between">
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">Ý KIẾN CỦA GVCN</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">{unitInfo?.advisorName || 'Trần Văn Mạnh'}</div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="text-xs font-bold uppercase text-slate-700">NGƯỜI LÀM ĐƠN</div>
                    <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16 font-bold text-slate-800 mt-2">{targetStudent.fullName}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZALO TEMPLATES TAB */}
      {activeTab === 'zalo-templates' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Mẫu Tin Nhắn Tương Tác Zalo / SMS Gửi Phụ Huynh & HSSV</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sao chép nhanh các thông báo nhắc nhở học phí, điểm danh chuyên cần và điểm rèn luyện.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Chọn HSSV:</span>
              <select
                value={targetStudent.id}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.id} - {s.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: '1. Nhắc Nhở Học Phí & Chính Sách Miễn Giảm NĐ 238',
                content: `[THÔNG BÁO HỌC PHÍ - LỚP ${currentClass}]\n\nKính gửi Phụ huynh em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nKhoa Công nghệ Ô tô xin thông báo học phí học kỳ hiện tại sau khi được nhà nước hỗ trợ miễn giảm 70% (Nghị định 238/2025/NĐ-CP):\n- Tổng học phí: 4.500.000 đ\n- Nhà nước cấp bù (70%): 3.150.000 đ\n- Số tiền thực đóng: 1.350.000 đ\n\nĐề nghị gia đình hoàn thành học phí trước ngày 30 hằng tháng qua tài khoản Khoa hoặc phòng Tài chính. Trân trọng!`
              },
              {
                title: '2. Cảnh Báo Chuyên Cần & Nguy Cơ Cấm Thi',
                content: `[CẢNH BÁO CHUYÊN CẦN - LỚP ${currentClass}]\n\nKính gửi Phụ huynh em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nGVCN thông báo: Em ${targetStudent.fullName} hiện đã vắng 5 buổi (22.5%) tại các mô đun thực hành xưởng. Theo Thông tư 04/2022/TT-BLĐTBXH, nghỉ quá 20% sẽ bị CẤM THI kết thúc mô đun.\n\nKính mong gia đình phối hợp đôn đốc em đi học đầy đủ và đúng giờ. Trân trọng!`
              },
              {
                title: '3. Thông Báo Điểm Đánh Giá Rèn Luyện (BM01)',
                content: `[KẾT QUẢ RÈN LUYỆN - LỚP ${currentClass}]\n\nThân gửi em: ${targetStudent.fullName} (MSSV: ${targetStudent.id})\n\nKết quả đánh giá rèn luyện học kỳ của em:\n- Ý thức học tập: 19/20đ\n- Chấp hành nội quy: 24/25đ\n- Hoạt động chính trị XH: 19/20đ\n- Quan hệ cộng đồng: 24/25đ\n- Cán sự lớp/thành tích: 9/10đ\n- TỔNG ĐIỂM: 95/100đ (Xếp loại: XUẤT SẮC).\n\nChúc mừng em đã duy trì tốt phong trào thi đua của lớp!`
              },
              {
                title: '4. Thư Mời Họp Phụ Huynh Học Sinh Định Kỳ',
                content: `[THƯ MỜI HỌP PHỤ HUYNH HSSV - LỚP ${currentClass}]\n\nKính gửi Quý Phụ huynh học sinh,\n\nKhoa Công nghệ Ô tô & GVCN ${unitInfo?.advisorName || 'Trần Văn Mạnh'} trân trọng kính mời Quý Phụ huynh đến tham dự buổi họp phụ huynh định kỳ cuối học kỳ để tổng kết kết quả học tập, rèn luyện tay nghề và xét học bổng khuyến khích học nghề.\n- Thời gian: 08h00 Chủ Nhật ngày tới.\n- Địa điểm: Phòng học lý thuyết xưởng ô tô.\nSự hiện diện của Quý phụ huynh là niềm vinh hạnh cho lớp.\nTrân trọng cảm ơn!`
              }
            ].map((tmpl, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{tmpl.title}</h4>
                  <pre className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2 whitespace-pre-wrap font-sans leading-relaxed">
                    {tmpl.content}
                  </pre>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopyText(tmpl.content)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Sao Chép Tin Nhắn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};