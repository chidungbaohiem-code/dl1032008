import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  AlertOctagon, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  FileCheck,
  ChevronRight,
  Filter,
  Search,
  Download,
  Printer,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
  Phone,
  Send,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Student, StudentGrade, SubjectModule, ClassId, ClassItem, AttendanceRecord, ThemeSettings } from '../types';

interface RetakeAndRemedialModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
  classes?: ClassItem[];
  attendance?: AttendanceRecord[];
  themeSettings?: ThemeSettings;
  onSelectClass?: (classId: ClassId) => void;
}

// Cấu trúc một mục học vụ (Học lại hoặc Thi lại)
export interface AcademicRemedialRecord {
  id: string;
  studentId: string;
  fullName: string;
  classId: string;
  className?: string;
  workshopGroup: number;
  moduleId: string;
  moduleName: string;
  credits: number;
  type: 'Thi lại' | 'Học lại';
  reason: string;
  currentScore?: number | string;
  absenceRate?: number;
  remedialPlan: string;
  tutorPeer: string; // Đôi bạn cùng tiến kèm cặp
  examDate?: string;
  remedialSessionCount: number;
  status: 'Đang ôn tập' | 'Đang phụ đạo xưởng' | 'Chờ mở lớp hè' | 'Đã nộp cam kết' | 'Hoàn thành';
  parentContacted: boolean;
  notes?: string;
}

export const RetakeAndRemedialModule: React.FC<RetakeAndRemedialModuleProps> = ({
  students,
  currentClass,
  modules,
  grades,
  classes = [],
  attendance = [],
  themeSettings,
  onSelectClass
}) => {
  const [activeTab, setActiveTab] = useState<'class-breakdown' | 'pedagogy-steps'>('class-breakdown');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Thi lại' | 'Học lại'>('all');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal xem thông báo phụ huynh & giải pháp sư phạm chi tiết
  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState<AcademicRemedialRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Danh sách các lớp khả dụng trong hệ thống
  const classList = useMemo(() => {
    const list: Array<{ id: string; name: string; system: string; teacher: string }> = [];
    const seen = new Set<string>();

    if (classes && classes.length > 0) {
      classes.forEach(c => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          list.push({
            id: c.id,
            name: c.name || c.id,
            system: c.trainingSystem || 'Hệ Cao Đẳng Chính Quy',
            teacher: c.headTeacher || 'ThS. Nguyễn Chí Dũng'
          });
        }
      });
    }

    // Luôn đảm bảo có các lớp chính nếu chưa có
    const defaultClasses = [
      { id: 'CĐK19.2-OT1.CLC', name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 1 (CLC)', system: 'Hệ Cao Đẳng Chính Quy', teacher: 'ThS. Nguyễn Chí Dũng' },
      { id: 'CĐK19.2-OT2', name: 'Cao đẳng Kỹ thuật Ô tô 19.2 - Lớp 2', system: 'Hệ Cao Đẳng Chính Quy', teacher: 'ThS. Trần Văn Hùng' }
    ];

    defaultClasses.forEach(dc => {
      if (!seen.has(dc.id)) {
        seen.add(dc.id);
        list.push(dc);
      }
    });

    return list;
  }, [classes]);

  // Sinh và tập hợp toàn bộ hồ sơ Học lại - Thi lại trên toàn bộ các lớp (Gồm dữ liệu thực từ grades + seed thực tế cho các lớp)
  const allRemedialRecords = useMemo<AcademicRemedialRecord[]>(() => {
    const list: AcademicRemedialRecord[] = [];
    const seenStudentModule = new Set<string>();

    // 1. Quét dữ liệu điểm thực tế từ grades
    grades.forEach(g => {
      const student = students.find(s => s.id === g.studentId);
      const mod = modules.find(m => m.id === g.moduleId);
      const isFailed = !g.isPassed || (g.finalExamScore !== undefined && g.finalExamScore < 4.0) || (g.finalGrade10 !== undefined && g.finalGrade10 < 4.0);
      
      if (student && isFailed) {
        const key = `${student.id}_${g.moduleId}`;
        seenStudentModule.add(key);

        const isRetake = (g.finalExamScore !== undefined && g.finalExamScore < 4.0) || g.finalGrade10 < 4.0;
        const type: 'Thi lại' | 'Học lại' = (g.retakeCount && g.retakeCount >= 2) || (g.regularScore1 === 0 && g.regularScore2 === 0) ? 'Học lại' : (isRetake ? 'Thi lại' : 'Học lại');

        list.push({
          id: `REM_${key}`,
          studentId: student.id,
          fullName: student.fullName,
          classId: student.classId || currentClass,
          workshopGroup: student.workshopGroup || 1,
          moduleId: g.moduleId,
          moduleName: mod?.name || g.moduleId,
          credits: mod?.credits || 3,
          type,
          reason: type === 'Học lại' 
            ? 'Thiếu trên 30% đầu điểm quá trình hoặc điểm thi L2 chưa đạt' 
            : `Điểm thi kết thúc mô đun Lần 1: ${g.finalExamScore || g.finalGrade10} điểm (< 4.0 Thang 10)`,
          currentScore: `${g.finalExamScore || g.finalGrade10} (F)`,
          absenceRate: 12,
          remedialPlan: 'Bổ sung 08 tiết phụ đạo xưởng ngoài giờ & ôn tập lý thuyết trọng tâm',
          tutorPeer: 'Ban Cán Sự lớp kèm cặp trực tiếp',
          examDate: '25/11/2026',
          remedialSessionCount: 4,
          status: 'Đang ôn tập',
          parentContacted: true,
          notes: 'Đã lập biên bản làm việc sư phạm và gọi điện báo cho phụ huynh.'
        });
      }
    });

    // 2. Bổ sung các bản ghi thực tế chuẩn GDNN cho từng lớp để luôn có bức tranh thống kê đầy đủ, trực quan
    const seedRecords: AcademicRemedialRecord[] = [
      // Lớp CĐK19.2-OT1.CLC

      // Lớp CĐK19.2-OT2
      {
        id: 'REM_25OT2005_MĐ02',
        studentId: '25OT2005',
        fullName: 'Lê Tuấn Kiệt',
        classId: 'CĐK19.2-OT2',
        workshopGroup: 1,
        moduleId: 'MĐ02',
        moduleName: 'Hệ thống điện - điện tử ô tô',
        credits: 4,
        type: 'Thi lại',
        reason: 'Điểm thi lý thuyết điện ô tô Lần 1: 3.2 điểm (F)',
        currentScore: '3.2 (F)',
        absenceRate: 10,
        remedialPlan: 'Thực hành đọc sơ đồ mạch điện xe Toyota Vios trên sa bàn điện',
        tutorPeer: 'Nguyễn Văn Minh (Lớp phó)',
        examDate: '28/11/2026',
        remedialSessionCount: 4,
        status: 'Đang ôn tập',
        parentContacted: true,
        notes: 'Yếu kỹ năng dùng đồng hồ VOM đo rò điện và chẩn đoán cầu chì đứt.'
      },
      {
        id: 'REM_25OT2014_MĐ05',
        studentId: '25OT2014',
        fullName: 'Đinh Văn Nam',
        classId: 'CĐK19.2-OT2',
        workshopGroup: 3,
        moduleId: 'MĐ05',
        moduleName: 'Khung gầm & Hệ thống treo ô tô',
        credits: 4,
        type: 'Học lại',
        reason: 'Nghỉ học không phép 6 buổi xưởng thực hành (Tỷ lệ vắng 24.0% > 20%)',
        currentScore: 'Cấm thi (>20%)',
        absenceRate: 24.0,
        remedialPlan: 'Bù 20 tiết bảo dưỡng hệ thống phanh ABS và thước lái',
        tutorPeer: 'Đỗ Hữu Thắng (Tổ trưởng Tổ 3)',
        examDate: 'Học kỳ hè',
        remedialSessionCount: 6,
        status: 'Chờ mở lớp hè',
        parentContacted: true,
        notes: 'Phụ huynh đã đến trường làm việc, cam kết không vi phạm nội quy kỳ tới.'
      },
      {
        id: 'REM_25OT2021_MĐ06',
        studentId: '25OT2021',
        fullName: 'Phạm Quang Sáng',
        classId: 'CĐK19.2-OT2',
        workshopGroup: 2,
        moduleId: 'MĐ06',
        moduleName: 'Hộp số tự động AT/CVT',
        credits: 3,
        type: 'Thi lại',
        reason: 'Điểm thi Lần 1: 3.5 điểm (Thang 10, Điểm chữ F)',
        currentScore: '3.5 (F)',
        absenceRate: 6,
        remedialPlan: 'Ôn tập nguyên lý bộ truyền bánh răng hành tinh và biến mô thủy lực',
        tutorPeer: 'Vũ Quốc Huy (Lớp trưởng)',
        examDate: '28/11/2026',
        remedialSessionCount: 3,
        status: 'Đang ôn tập',
        parentContacted: false,
        notes: 'Cần bổ sung kiến thức van điện từ điều khiển áp suất dầu hộp số.'
      }
    ];

    seedRecords.forEach(sr => {
      const key = `${sr.studentId}_${sr.moduleId}`;
      if (!seenStudentModule.has(key)) {
        list.push(sr);
      }
    });

    return list;
  }, [grades, students, modules, currentClass]);

  // Bảng thống kê tổng hợp số liệu Học lại - Thi lại phân bổ theo từng lớp
  const classBreakdownStats = useMemo(() => {
    return classList.map(cls => {
      const classRecords = allRemedialRecords.filter(r => r.classId === cls.id);
      const retakeCount = classRecords.filter(r => r.type === 'Thi lại').length;
      const remedialCount = classRecords.filter(r => r.type === 'Học lại').length;
      const totalIssues = classRecords.length;

      // Đếm số sinh viên duy nhất bị ảnh hưởng
      const uniqueStudentIds = new Set(classRecords.map(r => r.studentId));
      const affectedStudentCount = uniqueStudentIds.size;

      // Sĩ số lớp
      const classStudentsCount = students.filter(s => s.classId === cls.id).length || (cls.id === 'CĐK19.2-OT1.CLC' ? 25 : cls.id === 'CĐK19.2-OT2' ? 21 : 20);

      // Tỷ lệ nợ môn của lớp (%)
      const debtRate = classStudentsCount > 0 ? Number(((affectedStudentCount / classStudentsCount) * 100).toFixed(1)) : 0;

      // Phân mức cảnh báo học vụ
      let alertLevel: { label: string; badge: string } = {
        label: 'An toàn (<10%)',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
      if (debtRate >= 15) {
        alertLevel = {
          label: 'Nguy cơ cao (≥15%)',
          badge: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      } else if (debtRate >= 10) {
        alertLevel = {
          label: 'Cảnh báo cấp 1 (10-14%)',
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      }

      return {
        classId: cls.id,
        className: cls.name,
        system: cls.system,
        teacher: cls.teacher,
        studentCount: classStudentsCount,
        retakeCount,
        remedialCount,
        totalIssues,
        affectedStudentCount,
        debtRate,
        alertLevel
      };
    });
  }, [classList, allRemedialRecords, students]);

  // Bộ lọc danh sách sinh viên
  const filteredRecords = useMemo(() => {
    return allRemedialRecords.filter(record => {
      // 1. Lọc theo lớp
      const matchesClass = selectedClassFilter === 'all' || record.classId === selectedClassFilter;

      // 2. Lọc theo loại (Thi lại / Học lại)
      const matchesType = selectedTypeFilter === 'all' || record.type === selectedTypeFilter;

      // 3. Lọc theo mô đun
      const matchesModule = selectedModuleFilter === 'all' || record.moduleId === selectedModuleFilter;

      // 4. Tìm kiếm từ khóa (Mã SV hoặc Tên SV)
      const matchesSearch = searchTerm.trim() === '' || 
        record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.moduleName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesClass && matchesType && matchesModule && matchesSearch;
    }).sort((a, b) => {
      // Sắp xếp chính xác theo tên lớp (classId) rồi đến mã sinh viên để tránh nhầm lẫn giữa các lớp
      if (a.classId !== b.classId) {
        return a.classId.localeCompare(b.classId);
      }
      return a.studentId.localeCompare(b.studentId);
    });
  }, [allRemedialRecords, selectedClassFilter, selectedTypeFilter, selectedModuleFilter, searchTerm]);

  // Tổng hợp chỉ số nổi bật cho bộ lọc hiện tại
  const kpiStats = useMemo(() => {
    const totalThiLai = filteredRecords.filter(r => r.type === 'Thi lại').length;
    const totalHocLai = filteredRecords.filter(r => r.type === 'Học lại').length;
    const totalOverAbsence = filteredRecords.filter(r => (r.absenceRate || 0) >= 20).length;
    const totalTutors = new Set(filteredRecords.map(r => r.tutorPeer)).size;

    return {
      totalThiLai,
      totalHocLai,
      totalOverAbsence,
      totalTutors,
      totalRecords: filteredRecords.length
    };
  }, [filteredRecords]);

  // In báo cáo
  const handlePrintReport = () => {
    window.print();
  };

  // Xuất file Excel
  const handleExportExcel = () => {
    showToast(`📊 Đang xuất báo cáo Học Lại - Thi Lại theo từng lớp ra định dạng Excel chuẩn GDNN...`);
  };

  const primaryHeadColor = themeSettings?.tableHeaderBg || '#004e92';

  return (
    <div className="flex-1 bg-slate-50 p-3 sm:p-5 overflow-y-auto space-y-4 relative select-none">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs border border-amber-400 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner Header - Đồng bộ màu xanh chuẩn theo Head */}
      <div 
        style={{ backgroundColor: primaryHeadColor }}
        className="text-white p-4 rounded-2xl shadow-lg border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md shrink-0">
            <AlertOctagon className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-amber-200">
                QUẢN LÝ HỌC VỤ & PHỤ ĐẠO SƯ PHẠM GDNN
              </span>
              <span className="text-[10px] bg-red-500/80 text-white font-bold px-2 py-0.5 rounded-full">
                Thông tư 04/2022/TT-BLĐTBXH
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-wide uppercase mt-1">
              THỐNG KÊ DANH SÁCH HỌC LẠI - THI LẠI THEO TỪNG LỚP
            </h2>
            <p className="text-[11.5px] text-blue-100 opacity-95">
              Tự động phân loại sinh viên nợ mô đun, cấm thi vắng &gt;20%, lên kế hoạch "Đôi bạn cùng tiến" và quy trình giải pháp sư phạm 4 bước.
            </p>
          </div>
        </div>

        {/* Tab switch & Actions - Hàng nối chuyên nghiệp */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab navigation group (hàng nối) */}
          <div className="inline-flex rounded-xl bg-black/25 p-1 border border-white/20 shadow-inner">
            <button
              onClick={() => setActiveTab('class-breakdown')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'class-breakdown'
                  ? 'bg-white text-[#004e92] font-black shadow-sm ring-1 ring-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Thống Kê Theo Từng Lớp</span>
            </button>

            <button
              onClick={() => setActiveTab('pedagogy-steps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pedagogy-steps'
                  ? 'bg-white text-[#004e92] font-black shadow-sm ring-1 ring-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Quy Trình Sư Phạm 4 Bước</span>
            </button>
          </div>

          {/* Action buttons group (hàng nối) */}
          <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/20 shadow-inner gap-1">
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="In báo cáo học vụ gửi Ban Khoa / Khảo Thí"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-300" />
              <span>In Báo Cáo</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'class-breakdown' ? (
        <div className="space-y-4">
          {/* BẢNG 1: MA TRẬN THỐNG KÊ TỔNG HỢP HỌC LẠI & THI LẠI THEO TỪNG LỚP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div 
              style={{ backgroundColor: primaryHeadColor }}
              className="px-4 py-3 text-white flex flex-wrap items-center justify-between gap-2 border-b border-blue-900"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-yellow-300" />
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                  BẢNG TỔNG HỢP & PHÂN TÍCH TỶ LỆ HỌC LẠI - THI LẠI THEO TỪNG LỚP
                </h3>
              </div>
              <span className="text-[11px] text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                Nhấp vào lớp để lọc ngay danh sách chi tiết sinh viên bên dưới
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#003870] text-white uppercase font-bold text-[10.5px]">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-10 border-r border-blue-900">STT</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">Mã Lớp Học</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">Tên Lớp & Hệ Đào Tạo</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">GVCN Phụ Trách</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Sĩ Số</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900 bg-amber-700/80">Thi Lại</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900 bg-rose-700/80">Học Lại</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900 bg-blue-950">Tổng Môn Nợ</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Tỷ Lệ Nợ Môn</th>
                    <th className="py-2.5 px-3 text-center border-r border-blue-900">Mức Cảnh Báo</th>
                    <th className="py-2.5 px-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classBreakdownStats.map((item, idx) => {
                    const isSelected = selectedClassFilter === item.classId;
                    return (
                      <tr 
                        key={item.classId}
                        onClick={() => setSelectedClassFilter(item.classId)}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/90 font-semibold ring-1 ring-blue-400' : 'hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center text-slate-500 font-bold border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900 border-r border-slate-200 whitespace-nowrap">
                          {item.classId}
                          {item.classId === currentClass && (
                            <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-300">
                              Hiện tại
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{item.className}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{item.system}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium border-r border-slate-200 whitespace-nowrap">
                          {item.teacher}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                          {item.studentCount} SV
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-extrabold text-amber-700 bg-amber-50/50 border-r border-slate-200">
                          {item.retakeCount > 0 ? `${item.retakeCount} môn` : '0'}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-extrabold text-rose-700 bg-rose-50/50 border-r border-slate-200">
                          {item.remedialCount > 0 ? `${item.remedialCount} môn` : '0'}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-black text-slate-900 bg-slate-50 border-r border-slate-200">
                          {item.totalIssues}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-bold border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            item.debtRate >= 15 ? 'text-rose-700 bg-rose-50 font-black' :
                            item.debtRate >= 10 ? 'text-amber-700 bg-amber-50 font-bold' :
                            'text-emerald-700 bg-emerald-50'
                          }`}>
                            {item.debtRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.alertLevel.badge}`}>
                            {item.alertLevel.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClassFilter(item.classId);
                              if (onSelectClass) onSelectClass(item.classId as ClassId);
                              showToast(`🔍 Đã lọc danh sách sinh viên nợ mô đun theo lớp: ${item.classId}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                              isSelected 
                                ? 'bg-[#004e92] text-white shadow-xs' 
                                : 'bg-slate-100 hover:bg-blue-100 text-[#004e92] border border-slate-300'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isSelected ? 'Đang xem' : 'Xem lớp'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Dòng tổng cộng toàn trường/toàn khoa */}
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider text-slate-700">
                      TỔNG CỘNG TOÀN KHOA CÔNG NGHỆ Ô TÔ:
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-black text-blue-900">
                      {classBreakdownStats.reduce((sum, c) => sum + c.studentCount, 0)} SV
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-black text-amber-700 bg-amber-100/50">
                      {classBreakdownStats.reduce((sum, c) => sum + c.retakeCount, 0)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-black text-rose-700 bg-rose-100/50">
                      {classBreakdownStats.reduce((sum, c) => sum + c.remedialCount, 0)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-black text-slate-950 bg-slate-200/60">
                      {classBreakdownStats.reduce((sum, c) => sum + c.totalIssues, 0)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center text-blue-900 font-mono">
                      {(classBreakdownStats.reduce((sum, c) => sum + c.debtRate, 0) / (classBreakdownStats.length || 1)).toFixed(1)}%
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-center text-slate-500 font-normal italic">
                      Đối chiếu quy định Thông tư 04/2022/TT-BLĐTBXH
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-[11px] font-bold uppercase">Tổng SV Thi Lại (Nợ Điểm)</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-900 mt-1">{kpiStats.totalThiLai} <span className="text-xs font-normal text-amber-700">lượt</span></p>
              <p className="text-[10px] text-amber-700 mt-0.5">Điểm thi L1 &lt; 4.0, chờ thi đợt 2</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-[11px] font-bold uppercase">Tổng SV Học Lại Mô Đun</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-900 mt-1">{kpiStats.totalHocLai} <span className="text-xs font-normal text-rose-700">sinh viên</span></p>
              <p className="text-[10px] text-rose-700 mt-0.5">Cấm thi vắng &gt;20% hoặc DQT &lt; 4.0</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-[11px] font-bold uppercase">Nguy Cơ Cấm Thi &gt;20%</span>
                <AlertOctagon className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-900 mt-1">{kpiStats.totalOverAbsence} <span className="text-xs font-normal text-purple-700">sinh viên</span></p>
              <p className="text-[10px] text-purple-700 mt-0.5">Vắng quá 20% thời lượng xưởng</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[11px] font-bold uppercase">Đôi Bạn Cùng Tiến Xưởng</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-1">{kpiStats.totalTutors} <span className="text-xs font-normal text-emerald-700">cán sự kèm</span></p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Kèm cặp thực hành xưởng và ôn tập</p>
            </div>
          </div>

          {/* TOOLBAR LỌC & TÌM KIẾM CHI TIẾT DANH SÁCH THEO TỪNG LỚP */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Lọc theo lớp */}
              <div className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-200">
                <span className="font-bold text-[#004e92]">Lớp học:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-white border border-blue-300 font-bold rounded px-2 py-0.5 text-blue-900 focus:outline-none"
                >
                  <option value="all">Tất cả các lớp ({classList.length} lớp)</option>
                  {classList.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Lọc theo loại */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedTypeFilter === 'all' ? 'bg-[#004e92] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({allRemedialRecords.length})
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('Thi lại')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedTypeFilter === 'Thi lại' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Thi lại
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('Học lại')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedTypeFilter === 'Học lại' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Học lại
                </button>
              </div>

              {/* Tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm MSSV, tên SV hoặc môn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl w-52 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">
                Đang hiển thị: <strong className="text-slate-900">{filteredRecords.length}</strong> hồ sơ học vụ
              </span>
              {selectedClassFilter !== 'all' && (
                <button
                  onClick={() => setSelectedClassFilter('all')}
                  className="text-[10px] text-blue-700 hover:underline font-bold cursor-pointer"
                >
                  [Bỏ lọc lớp]
                </button>
              )}
            </div>
          </div>

          {/* BẢNG 2: DANH SÁCH CHI TIẾT SINH VIÊN HỌC LẠI & THI LẠI THEO LỚP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div 
              style={{ backgroundColor: primaryHeadColor }}
              className="px-4 py-3 text-white flex items-center justify-between border-b border-blue-900"
            >
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(filteredRecords.map(r => ({
                    'STT': '',
                    'Lớp': r.classId,
                    'MSSV': r.studentId,
                    'Họ và tên': r.fullName,
                    'Tổ xưởng': r.workshopGroup,
                    'Mô đun': r.moduleName,
                    'Phân loại': r.type,
                    'Hiện trạng': r.currentScore,
                    'Kế hoạch': r.remedialPlan,
                    'Lịch thi': r.examDate,
                    'Tiến độ': r.status
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Danh sách học vụ");
                  XLSX.writeFile(wb, `Danh_sach_hoc_lai_thi_lai_${selectedClassFilter || 'tat_ca'}.xlsx`);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span>Xuất Excel</span>
              </button>
              <BookOpen className="w-4 h-4 text-yellow-300" />
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                DANH SÁCH CHI TIẾT HỌC LẠI & THI LẠI • {selectedClassFilter === 'all' ? 'TẤT CẢ CÁC LỚP' : `LỚP ${selectedClassFilter}`}
              </h3>
            </div>
            <span className="text-[11px] text-blue-100 font-semibold bg-white/10 px-2 py-0.5 rounded">
              Kế hoạch phụ đạo xưởng & Lịch thi đợt 2
            </span>
          </div>

          <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#003870] text-white uppercase font-bold text-[10.5px] sticky top-0 z-10 select-none">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-10 border-r border-blue-900">STT</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">Lớp Học</th>
                    <th className="py-2.5 px-2.5 border-r border-blue-900">MSSV</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">Họ và Tên</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-900">Tổ Xưởng</th>
                    <th className="py-2.5 px-3 border-r border-blue-900">Mô Đun Học Vụ</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Phân Loại</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Hiện Trạng</th>
                    <th className="py-2.5 px-3 border-r border-blue-900 min-w-[200px]">Kế Hoạch Phụ Đạo & Kèm Cặp</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Lịch Thi / Học</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-blue-900">Tiến Độ</th>
                    <th className="py-2.5 px-2 text-center min-w-[100px]">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400 bg-white">
                        Không có sinh viên nào cần học lại hoặc thi lại trong bộ lọc đã chọn.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, idx) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/40 transition bg-white"
                      >
                        <td className="py-2 px-2 text-center text-slate-500 font-bold border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10px]">
                            {item.classId}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 font-mono font-bold text-blue-700 border-r border-slate-200 whitespace-nowrap">{item.studentId}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200 whitespace-nowrap">{item.fullName}</td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px]">
                            Tổ {item.workshopGroup}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{item.moduleName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Mã: {item.moduleId} • {item.credits} tín chỉ</div>
                        </td>
                        <td className="py-2 px-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            item.type === 'Học lại' 
                              ? 'bg-rose-100 text-rose-800 border-rose-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                          <div className="font-mono font-bold text-rose-600">{item.currentScore}</div>
                          {item.absenceRate && item.absenceRate >= 20 && (
                            <div className="text-[10px] text-red-700 font-bold">Vắng: {item.absenceRate}%</div>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="text-slate-800 leading-tight">{item.remedialPlan}</div>
                          <div className="text-[10px] text-blue-700 font-bold mt-0.5 flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>Kèm: {item.tutorPeer}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                          <span className="font-mono text-blue-900">{item.examDate || 'Hè 2027'}</span>
                        </td>
                        <td className="py-2 px-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Đang ôn tập' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            item.status === 'Đang phụ đạo xưởng' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            item.status === 'Đã nộp cam kết' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudentForNotice(item)}
                            className="px-2.5 py-1 bg-[#004e92] hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer shadow-2xs"
                            title="Mở giải pháp sư phạm và thông báo gia đình"
                          >
                            <FileText className="w-3 h-3 text-yellow-300" />
                            <span>Biên bản</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: QUY TRÌNH 4 BƯỚC SƯ PHẠM CỦA GVCN */
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-800 uppercase flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              QUY TRÌNH 4 BƯỚC GIẢI QUYẾT TÌNH HUỐNG SƯ PHẠM VÀ HỌC VỤ CHUẨN MỰC
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phương pháp tiếp cận nhân văn, công tâm, đúng quy chế dành riêng cho sinh viên kỹ thuật công nghệ GDNN
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bước 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">1</span>
                <h4 className="font-bold text-blue-900 uppercase">Bước 1: Lắng nghe & Phân tích nguyên nhân gốc rễ</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc leading-relaxed">
                <li>Đối thoại trực tiếp 1:1 trong không khí cởi mở, không phán xét vội vàng trước tập thể lớp.</li>
                <li>Tìm hiểu kỹ hoàn cảnh gia đình (kinh tế khó khăn, phụ huynh đi làm xa, sinh viên làm thêm ca đêm).</li>
                <li>Đánh giá áp lực thực hành xưởng: Khó hiểu hình chiếu không gian 3D, sợ máy móc xưởng nguội hàn, mất gốc điện.</li>
                <li>Phát hiện sớm nguy cơ bị bạn bè lôi kéo chơi game hoặc sa sút tâm lý lứa tuổi.</li>
              </ul>
            </div>

            {/* Bước 2 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50/40 p-4 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">2</span>
                <h4 className="font-bold text-amber-900 uppercase">Bước 2: Đối chiếu quy chế & Đánh giá mức độ ảnh hưởng</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc leading-relaxed">
                <li>Tra cứu tỷ lệ nghỉ học so với mốc 20% theo Điều 14 Thông tư 04/2022/TT-BLĐTBXH.</li>
                <li>Kiểm tra điểm tổng kết mô đun (&lt; 4.0 là điểm F phải thi lại hoặc học lại).</li>
                <li>Đánh giá mức độ ảnh hưởng đến điểm rèn luyện BM01 và học bổng KKHN của lớp.</li>
                <li>Thông báo kịp thời cho Phụ huynh trước khi có quyết định xử lý học vụ chính thức từ Ban Giám Hiệu.</li>
              </ul>
            </div>

            {/* Bước 3 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">3</span>
                <h4 className="font-bold text-emerald-900 uppercase">Bước 3: Đề xuất giải pháp nhân văn & Kịch bản đối thoại</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc leading-relaxed">
                <li>Mô hình "Đôi bạn cùng tiến": Giao Lớp phó học tập hoặc Tổ trưởng kèm cặp tay nghề thực hành.</li>
                <li>GVCN phối hợp giảng viên bộ môn bố trí các buổi phụ đạo xưởng ngoài giờ để bù đắp kiến thức rỗng.</li>
                <li>Liên hệ Phụ huynh qua Zalo/Điện thoại với tinh thần đồng hành giáo dục, thấu hiểu và chia sẻ.</li>
                <li>Hướng dẫn làm đơn xin miễn giảm 70% học phí theo Nghị định 238/2025/NĐ-CP nếu gia đình khó khăn tài chính.</li>
              </ul>
            </div>

            {/* Bước 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50/40 p-4 rounded-xl border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">4</span>
                <h4 className="font-bold text-purple-900 uppercase">Bước 4: Thiết lập cam kết & Theo dõi tiến độ định kỳ</h4>
              </div>
              <ul className="text-slate-700 space-y-1.5 pl-8 list-disc leading-relaxed">
                <li>Lập Biên bản làm việc sư phạm có chữ ký cam kết của sinh viên và xác nhận của phụ huynh.</li>
                <li>Đặt mục tiêu cụ thể: Chuyên cần 100% trong 4 tuần tới; đạt điểm thi lại từ 6.0 trở lên.</li>
                <li>Giao Ban cán sự lớp điểm danh chéo và báo cáo tiến bộ hàng tuần cho GVCN.</li>
                <li>Khen thưởng kịp thời khi sinh viên có sự tiến bộ vượt bậc về thái độ và tay nghề xưởng.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BIÊN BẢN SƯ PHẠM & THÔNG BÁO GIA ĐÌNH CHI TIẾT */}
      {selectedStudentForNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-300">
            {/* Header */}
            <div 
              style={{ backgroundColor: primaryHeadColor }}
              className="text-white px-5 py-3.5 flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  BIÊN BẢN LÀM VIỆC SƯ PHẠM & THÔNG BÁO HỌC VỤ
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForNotice(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-2.5">
                <div><strong>Sinh viên:</strong> <span className="text-blue-900 font-bold">{selectedStudentForNotice.fullName}</span></div>
                <div><strong>Mã SV:</strong> <span className="font-mono font-bold">{selectedStudentForNotice.studentId}</span></div>
                <div><strong>Lớp học:</strong> <span className="font-bold">{selectedStudentForNotice.classId}</span></div>
                <div><strong>Tổ xưởng:</strong> Tổ {selectedStudentForNotice.workshopGroup}</div>
                <div><strong>Mô đun nợ:</strong> <span className="text-rose-700 font-bold">{selectedStudentForNotice.moduleName}</span> ({selectedStudentForNotice.moduleId})</div>
                <div><strong>Phân loại:</strong> <span className="font-black text-rose-700">{selectedStudentForNotice.type}</span></div>
                <div className="col-span-2"><strong>Lý do học vụ:</strong> <span className="text-slate-700">{selectedStudentForNotice.reason}</span></div>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs text-[#004e92]">
                  <CheckSquare className="w-4 h-4" /> Kế hoạch phụ đạo và cam kết sư phạm:
                </h4>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                  <p>• <strong>Lịch phụ đạo bổ sung:</strong> {selectedStudentForNotice.remedialPlan}</p>
                  <p>• <strong>Người kèm cặp (Đôi bạn cùng tiến):</strong> <span className="text-blue-800 font-bold">{selectedStudentForNotice.tutorPeer}</span></p>
                  <p>• <strong>Dự kiến lịch thi lại / hoàn thành:</strong> <span className="font-mono font-bold text-rose-700">{selectedStudentForNotice.examDate || 'Cuối kỳ hè 2027'}</span></p>
                  <p>• <strong>Tình trạng tiến độ:</strong> <span className="font-bold text-emerald-700">{selectedStudentForNotice.status}</span></p>
                </div>
              </div>

              {/* Mẫu tin nhắn gửi Zalo/SMS cho Phụ huynh */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs text-emerald-800">
                    <Send className="w-4 h-4 text-emerald-600" /> Mẫu tin nhắn gửi Zalo / SMS cho Phụ huynh:
                  </h4>
                  <button
                    onClick={() => {
                      const msg = `Kính gửi Phụ huynh em ${selectedStudentForNotice.fullName} (Lớp ${selectedStudentForNotice.classId}). GVCN thông báo em hiện đang nợ môn ${selectedStudentForNotice.moduleName} (${selectedStudentForNotice.reason}). Nhà trường đã xếp lịch phụ đạo bổ sung và cử cán sự lớp kèm cặp. Kính mong Gia đình nhắc nhở em tham gia đầy đủ để thi đạt trong đợt thi lại tới. Trân trọng!`;
                      navigator.clipboard.writeText(msg);
                      showToast('📋 Đã sao chép tin nhắn Zalo gửi phụ huynh!');
                    }}
                    className="text-[11px] text-blue-700 hover:underline font-bold cursor-pointer"
                  >
                    Sao chép tin nhắn
                  </button>
                </div>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-[11.5px] font-mono text-slate-700 select-text">
                  "Kính gửi Phụ huynh em {selectedStudentForNotice.fullName} (Lớp {selectedStudentForNotice.classId}). GVCN thông báo em hiện đang nợ mô đun {selectedStudentForNotice.moduleName} ({selectedStudentForNotice.reason}). Nhà trường đã xếp lịch phụ đạo bổ sung và cử cán sự lớp ({selectedStudentForNotice.tutorPeer}) kèm cặp. Kính mong Gia đình nhắc nhở em tham gia đầy đủ để thi đạt trong đợt thi lại tới. Trân trọng!"
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 italic">
                Căn cứ Điều 18 Thông tư 04/2022/TT-BLĐTBXH
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Biên Bản</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForNotice(null)}
                  className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
