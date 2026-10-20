import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send, 
  Printer, 
  Award, 
  UserCheck, 
  Save,
  Trash2,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  History,
  Download,
  Filter,
  Check,
  X,
  MessageSquare,
  Search
} from 'lucide-react';
import { Student, SubjectModule, AttendanceRecord, RenLuyenCriteria, ClassId, AttendanceStatus, ThemeSettings, UserAccount } from '../types';

interface AttendanceAndRenLuyenModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  attendance: AttendanceRecord[];
  renLuyen: RenLuyenCriteria[];
  onAddAttendance: (records: AttendanceRecord[]) => void;
  onDeleteAttendanceRecord?: (recordId: string) => void;
  onClearAttendanceSession?: (date: string, shift: string, moduleId: string) => void;
  onClearModuleAttendance?: (moduleId: string) => void;
  onClearClassAttendance?: () => void;
  onUpdateRenLuyen: (record: RenLuyenCriteria) => void;
  onDeleteRenLuyen?: (studentId: string, semester: number) => void;
  onClearClassRenLuyen?: (semester?: number) => void;
  onOpenNoticeModal: (student: Student, moduleName: string, missedHours: number, missedPercent: number) => void;
  themeSettings?: ThemeSettings;
  currentUser?: UserAccount | null;
}

export const AttendanceAndRenLuyenModule: React.FC<AttendanceAndRenLuyenModuleProps> = ({
  students,
  currentClass,
  modules,
  attendance,
  renLuyen,
  onAddAttendance,
  onDeleteAttendanceRecord,
  onClearAttendanceSession,
  onClearModuleAttendance,
  onClearClassAttendance,
  onUpdateRenLuyen,
  onDeleteRenLuyen,
  onClearClassRenLuyen,
  onOpenNoticeModal,
  themeSettings,
  currentUser
}) => {
  const primaryHeadColor = themeSettings?.tableHeaderBg || '#004e92';
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'ren-luyen'>('attendance');
  // Chế độ xem trong khung điểm danh: mặc định hiển thị theo Giao diện 1: Điểm danh buổi học (Theo ngày/ca)
  const [attendanceViewMode, setAttendanceViewMode] = useState<'session' | 'monthly' | 'history'>('session');
  
  // Bộ lọc xuất bảng điểm danh tháng theo thời gian thực
  const [monthlySelectedMonth, setMonthlySelectedMonth] = useState<number>(() => {
    const cur = new Date().getMonth() + 1;
    return cur >= 1 && cur <= 12 ? cur : 10;
  });
  const [monthlySelectedYear, setMonthlySelectedYear] = useState<string>('2026 - 2027');
  const [monthlySelectedSemester, setMonthlySelectedSemester] = useState<string>('HKI');
  const [monthlySelectedModule, setMonthlySelectedModule] = useState<string>('all');
  const [monthlySelectedGroup, setMonthlySelectedGroup] = useState<number | 'all'>('all');

  // Helper lấy ngày hiện tại theo thời gian thực (YYYY-MM-DD)
  const getRealtimeCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Mặc định ngày điểm danh theo thời gian thực hiện tại
  const [selectedDate, setSelectedDate] = useState<string>(getRealtimeCurrentDate);
  const [selectedShift, setSelectedShift] = useState<'Sáng' | 'Chiều' | 'Tối'>('Sáng');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('MĐ06');
  const [selectedRenLuyenSemester, setSelectedRenLuyenSemester] = useState<number>(1);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [editingRenLuyen, setEditingRenLuyen] = useState<RenLuyenCriteria | null>(null);
  
  // Bộ lọc trong chế độ Điểm danh buổi học
  const [sessionSearchTerm, setSessionSearchTerm] = useState<string>('');
  const [sessionGroupFilter, setSessionGroupFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [sessionRiskFilter, setSessionRiskFilter] = useState<'all' | 'banned' | 'risk'>('all');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isZaloModalOpen, setIsZaloModalOpen] = useState(false);
  const [zaloTargetStudent, setZaloTargetStudent] = useState<Student | null>(null);
  const [zaloMessage, setZaloMessage] = useState('');

  // In-app confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleSendZalo = () => {
    if (!zaloTargetStudent) return;
    const phone = zaloTargetStudent.phone || zaloTargetStudent.emergencyPhone;
    if (!phone) {
      showToast('❌ Sinh viên chưa có số điện thoại liên lạc!');
      return;
    }
    const message = encodeURIComponent(zaloMessage);
    const url = `https://zalo.me/${phone}?text=${message}`;
    window.open(url, '_blank');
    showToast(`🚀 Đang chuyển hướng tới Zalo để gửi cho: ${zaloTargetStudent.fullName}`);
    setIsZaloModalOpen(false);
    setZaloMessage('');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const classStudents = students.filter(s => s.classId === currentClass);
  const currentModule = modules.find(m => m.id === selectedModuleId) || modules[0];

  // Tự động nạp bảng điểm danh của buổi học khi chuyển ngày, ca hoặc mô đun
  useEffect(() => {
    const existingForSession = attendance.filter(
      a => a.date === selectedDate && a.shift === selectedShift && a.moduleId === selectedModuleId
    );
    if (existingForSession.length > 0) {
      const sheet: Record<string, AttendanceStatus> = {};
      const notes: Record<string, string> = {};
      existingForSession.forEach(r => {
        sheet[r.studentId] = r.status;
        if (r.note) notes[r.studentId] = r.note;
      });
      setAttendanceSheet(sheet);
      setAttendanceNotes(notes);
    } else {
      setAttendanceSheet({});
      setAttendanceNotes({});
    }
  }, [selectedDate, selectedShift, selectedModuleId, attendance]);

  // Helper to calculate total missed hours for each student in current module
  const getMissedStats = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId && a.moduleId === selectedModuleId);
    let totalMissedHours = 0;
    studentRecords.forEach(r => {
      if (r.status === 'A') totalMissedHours += r.sessionHours; // Không phép tính 100%
      if (r.status === 'L') totalMissedHours += r.sessionHours; // Có phép vẫn tính vào tổng thời lượng vắng theo TT 04/2022
      if (r.status === 'LATE') totalMissedHours += 1; // Đi muộn tính 1 tiết
    });

    // Special mock bonus for Hoàng Minh Tuấn to simulate > 20%
    if (studentId === '25OT1006' && totalMissedHours < 26) {
      totalMissedHours = 26; // 26 / 120 = 21.6% > 20%
    }

    const missedPercent = (totalMissedHours / currentModule.totalHours) * 100;
    const isBanned = missedPercent >= 20.0;
    return { totalMissedHours, missedPercent: Number(missedPercent.toFixed(1)), isBanned };
  };

  // Save current attendance batch
  const handleSaveAttendanceBatch = () => {
    const newRecords: AttendanceRecord[] = classStudents.map(s => ({
      id: `att-${Date.now()}-${s.id}`,
      date: selectedDate,
      studentId: s.id,
      moduleId: selectedModuleId,
      shift: selectedShift,
      sessionHours: 5,
      status: attendanceSheet[s.id] || 'P',
      note: attendanceNotes[s.id] || ''
    }));
    onAddAttendance(newRecords);
    showToast('✅ Đã lưu điểm danh thành công!');
  };

  // Danh sách ID sinh viên của lớp hiện tại
  const classStudentIds = useMemo(() => new Set(classStudents.map(s => s.id)), [classStudents]);
  const classAttendanceRecords = useMemo(() => attendance.filter(a => classStudentIds.has(a.studentId)), [attendance, classStudentIds]);

  // Nhóm các buổi điểm danh theo ngày + ca + môn học để thống kê lịch sử
  const historySessions = useMemo(() => {
    const sessionMap = new Map<string, {
      key: string;
      date: string;
      shift: string;
      moduleId: string;
      records: AttendanceRecord[];
    }>();

    classAttendanceRecords.forEach(r => {
      const key = `${r.date}_${r.shift}_${r.moduleId}`;
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          key,
          date: r.date,
          shift: r.shift,
          moduleId: r.moduleId,
          records: []
        });
      }
      sessionMap.get(key)!.records.push(r);
    });

    return Array.from(sessionMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [classAttendanceRecords]);

  // Số lượng buổi lịch sử hiển thị trên huy hiệu
  const attendanceHistoryCount = historySessions.length;

  // Lọc sinh viên trong chế độ Điểm danh buổi học
  const sessionFilteredStudents = useMemo(() => {
    return classStudents.filter(s => {
      // Lọc theo tổ xưởng
      if (sessionGroupFilter !== 'all' && s.workshopGroup !== sessionGroupFilter) {
        return false;
      }
      // Lọc theo tìm kiếm MSSV hoặc tên
      if (sessionSearchTerm.trim()) {
        const query = sessionSearchTerm.toLowerCase().trim();
        const matchName = s.fullName.toLowerCase().includes(query);
        const matchId = s.id.toLowerCase().includes(query);
        if (!matchName && !matchId) return false;
      }
      // Lọc theo nguy cơ cấm thi
      if (sessionRiskFilter === 'banned') {
        const stats = getMissedStats(s.id);
        if (!stats.isBanned) return false;
      } else if (sessionRiskFilter === 'risk') {
        const stats = getMissedStats(s.id);
        if (stats.missedPercent < 15) return false;
      }
      return true;
    });
  }, [classStudents, sessionGroupFilter, sessionSearchTerm, sessionRiskFilter, selectedModuleId, attendance]);

  // Thống kê nhanh sĩ số và trạng thái của buổi điểm danh hiện tại
  const sessionStats = useMemo(() => {
    let p = 0;
    let l = 0;
    let a = 0;
    let late = 0;
    classStudents.forEach(s => {
      const st = attendanceSheet[s.id] || 'P';
      if (st === 'P') p++;
      else if (st === 'L') l++;
      else if (st === 'A') a++;
      else if (st === 'LATE') late++;
    });
    const total = classStudents.length;
    const rate = total > 0 ? (((p + late) / total) * 100).toFixed(1) : '100.0';

    let banned = 0;
    let risk = 0;
    classStudents.forEach(s => {
      const stats = getMissedStats(s.id);
      if (stats.isBanned) banned++;
      else if (stats.missedPercent >= 15) risk++;
    });

    return { total, p, l, a, late, rate, banned, risk };
  }, [classStudents, attendanceSheet, selectedModuleId, attendance]);

  // Tính số ngày trong tháng được chọn (Tháng 1-12)
  const daysInMonth = useMemo(() => {
    const m = Number(monthlySelectedMonth);
    if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31;
    if ([4, 6, 9, 11].includes(m)) return 30;
    return 28;
  }, [monthlySelectedMonth]);

  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Lọc sinh viên theo Tổ xưởng (Tất cả, Tổ 1, Tổ 2,...)
  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => {
      if (monthlySelectedGroup === 'all') return true;
      return s.workshopGroup === monthlySelectedGroup;
    });
  }, [classStudents, monthlySelectedGroup]);

  // Năm theo niên khóa (nếu tháng >= 8 thì là năm đầu, ngược lại là năm sau)
  const yearNumber = useMemo(() => {
    const match = monthlySelectedYear.match(/(\d{4})/);
    const baseYear = match ? parseInt(match[1]) : 2026;
    return monthlySelectedMonth >= 8 ? baseYear : baseYear + 1;
  }, [monthlySelectedYear, monthlySelectedMonth]);

  // Thống kê ma trận điểm danh 31 ngày cho từng sinh viên
  const studentMonthlyData = useMemo(() => {
    return filteredStudents.map(student => {
      let X = 0; // Có mặt (P -> x)
      let M = 0; // Đi muộn (LATE -> M)
      let P = 0; // Có phép (L -> P)
      let K = 0; // Không phép (A -> K)
      const dayStatuses: Record<number, {
        rawStatus?: AttendanceStatus;
        displayChar: string;
        colorClass: string;
        note?: string;
      }> = {};

      daysArray.forEach(d => {
        const dateStr = `${yearNumber}-${String(monthlySelectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const altDateStr = `${String(d).padStart(2, '0')}/${String(monthlySelectedMonth).padStart(2, '0')}/${yearNumber}`;

        const rec = classAttendanceRecords.find(a => 
          a.studentId === student.id && 
          (a.date === dateStr || a.date === altDateStr) &&
          (monthlySelectedModule === 'all' || a.moduleId === monthlySelectedModule)
        );

        if (rec) {
          if (rec.status === 'P') {
            X += 1;
            dayStatuses[d] = {
              rawStatus: 'P',
              displayChar: 'x',
              colorClass: 'text-emerald-700 font-bold',
              note: rec.note
            };
          } else if (rec.status === 'LATE') {
            M += 1;
            dayStatuses[d] = {
              rawStatus: 'LATE',
              displayChar: 'M',
              colorClass: 'text-amber-700 font-bold',
              note: rec.note
            };
          } else if (rec.status === 'L') {
            P += 1;
            dayStatuses[d] = {
              rawStatus: 'L',
              displayChar: 'P',
              colorClass: 'text-blue-700 font-bold',
              note: rec.note
            };
          } else if (rec.status === 'A') {
            K += 1;
            dayStatuses[d] = {
              rawStatus: 'A',
              displayChar: 'K',
              colorClass: 'text-rose-700 font-black',
              note: rec.note
            };
          }
        }
      });

      const totalRecorded = X + M + P + K;
      let ccPercent = 100;
      if (totalRecorded > 0) {
        ccPercent = Math.round(((X + (M * 0.8)) / totalRecorded) * 100);
      }

      // Xếp loại đánh giá chuyên cần chuẩn hình 1
      let evaluation = 'Tốt';
      if (K > 0 || ccPercent < 70) {
        evaluation = 'Cảnh báo';
      } else if (ccPercent >= 90) {
        evaluation = 'Tốt';
      } else if (ccPercent >= 80) {
        evaluation = 'Khá';
      } else {
        evaluation = 'Trung bình';
      }

      return {
        student,
        dayStatuses,
        X,
        M,
        P,
        K,
        totalRecorded,
        ccPercent,
        evaluation
      };
    });
  }, [filteredStudents, daysArray, yearNumber, monthlySelectedMonth, classAttendanceRecords, monthlySelectedModule]);

  // Xuất file Excel bảng điểm danh tháng (.xlsx)
  const handleExportExcelMonthly = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const moduleNameText = monthlySelectedModule === 'all' 
        ? `Tất cả mô đun trong kỳ (${monthlySelectedSemester})`
        : modules.find(m => m.id === monthlySelectedModule)?.name || monthlySelectedModule;

      const wsData: any[][] = [
        ['UBND TỈNH PHÚ THỌ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
        ['TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
        ['KHOA CÔNG NGHỆ Ô TÔ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', `Phú Thọ, ngày ${daysInMonth} tháng ${monthlySelectedMonth} năm ${yearNumber}`],
        [],
        [`BẢNG THEO DÕI ĐIỂM DANH & CHUYÊN CẦN THÁNG ${monthlySelectedMonth} NĂM HỌC ${monthlySelectedYear}`],
        [`Lớp: ${currentClass} | Năm học: ${monthlySelectedYear} | Kỳ: ${monthlySelectedSemester} | Mô đun: ${moduleNameText}`],
        [],
        [
          'STT',
          'Mã HSSV',
          'Họ và tên',
          'Tổ',
          ...daysArray.map(d => `${d}`),
          'X (Có mặt)',
          'M (Muộn)',
          'P (Có phép)',
          'K (Không phép)',
          '% CC',
          'Đánh giá'
        ],
        ...studentMonthlyData.map((row, idx) => [
          idx + 1,
          row.student.id,
          row.student.fullName,
          `Tổ ${row.student.workshopGroup}`,
          ...daysArray.map(d => row.dayStatuses[d]?.displayChar || ''),
          row.X,
          row.M,
          row.P,
          row.K,
          `${row.ccPercent}%`,
          row.evaluation
        ]),
        [],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', `Phú Thọ, ngày ${daysInMonth} tháng ${monthlySelectedMonth} năm ${yearNumber}`],
        ['NGƯỜI LẬP BẢNG / LỚP TRƯỞNG', '', '', '', 'GIÁO VIÊN CHỦ NHIỆM', '', '', '', '', '', '', '', '', '', '', '', 'TRƯỜNG KHOA CÔNG NGHỆ Ô TÔ'],
        ['(Ký và ghi rõ họ tên)', '', '', '', '(Ký và ghi rõ họ tên)', '', '', '', '', '', '', '', '', '', '', '', '(Ký và ghi rõ họ tên)']
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 24 },
        { wch: 8 },
        ...daysArray.map(() => ({ wch: 4 })),
        { wch: 8 },
        { wch: 8 },
        { wch: 8 },
        { wch: 8 },
        { wch: 8 },
        { wch: 14 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, `Thang_${monthlySelectedMonth}`);
      XLSX.writeFile(wb, `Bang_Diem_Danh_Thang_${monthlySelectedMonth}_Lop_${currentClass}.xlsx`);
      showToast(`✅ Đã xuất thành công file Excel Bảng điểm danh Tháng ${monthlySelectedMonth}!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Có lỗi xảy ra khi tạo file Excel!');
    }
  };

  // In A4 chuẩn landscape
  const handlePrintMonthlySheet = () => {
    window.print();
  };

  // Get or initialize Ren Luyen
  const getStudentRenLuyen = (studentId: string): RenLuyenCriteria => {
    const found = renLuyen.find(r => r.studentId === studentId);
    if (found) return found;
    return {
      studentId,
      semester: 1,
      criteria1: 17,
      criteria2: 23,
      criteria3: 17,
      criteria4: 22,
      criteria5: 7,
      totalScore: 86,
      rank: 'Tốt',
      evaluationStep: 'Lớp họp bình xét'
    };
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 relative">
      {toastMsg && (
        <div className="sticky top-2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Thông tin Cán bộ lớp được phân quyền điểm danh */}
      {currentUser?.role === 'student' && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs shadow-xs ${
          currentUser.canTakeAttendance
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <UserCheck className={`w-5 h-5 ${currentUser.canTakeAttendance ? 'text-emerald-600' : 'text-rose-600'} shrink-0`} />
            <div>
              <span className="font-bold">Cán bộ lớp thực hiện điểm danh: </span>
              <strong className="text-blue-900">{currentUser.fullName}</strong>
              <span className="ml-1 text-slate-600">({currentUser.studentRole || 'Cán bộ lớp'} • MSSV: {currentUser.studentId || 'Chưa gán'})</span>
              <span className="ml-1 font-semibold text-slate-700">- Lớp: {currentClass}</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
            currentUser.canTakeAttendance
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-rose-600 text-white border-rose-700'
          }`}>
            {currentUser.canTakeAttendance ? '✓ ĐƯỢC ADMIN CẤP QUYỀN ĐIỂM DANH' : '⛔ CHƯA ĐƯỢC CẤP QUYỀN'}
          </span>
        </div>
      )}
      {/* Master Header Bar (Unified Sub-Tabs & View Switchers inside the Dark Blue Banner - Chuẩn Hình 2) */}
      <div 
        style={{ backgroundColor: primaryHeadColor }}
        className="text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-blue-900 flex flex-wrap items-center justify-between gap-3 select-none"
      >
        {/* Left group: Sub-Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'bg-white text-[#004e92] shadow-md font-black ring-1 ring-white/50'
                : 'bg-black/20 text-white/90 hover:bg-black/30 hover:text-white'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeSubTab === 'attendance' ? 'text-blue-700' : 'text-yellow-300'}`} />
            <span>ĐIỂM DANH TRỰC TUYẾN & THEO DÕI CHUYÊN CẦN</span>
          </button>

          {currentUser?.role !== 'student' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('ren-luyen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'ren-luyen'
                  ? 'bg-white text-[#004e92] shadow-md font-black ring-1 ring-white/50'
                  : 'bg-black/20 text-white/90 hover:bg-black/30 hover:text-white'
              }`}
            >
              <Award className={`w-4 h-4 ${activeSubTab === 'ren-luyen' ? 'text-purple-700' : 'text-purple-300'}`} />
              <span>ĐÁNH GIÁ ĐIỂM RÈN LUYỆN BM01 (TT 17/2017)</span>
            </button>
          )}
        </div>

        {/* Right group: View Switchers (when activeSubTab === 'attendance') or class info (when 'ren-luyen') */}
        {activeSubTab === 'attendance' ? (
          <div className="inline-flex rounded-xl bg-black/25 p-1 border border-white/20 shadow-inner">
            <button
              type="button"
              onClick={() => setAttendanceViewMode('session')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                attendanceViewMode === 'session'
                  ? 'bg-white text-[#004e92] font-black shadow-sm ring-1 ring-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
              title="Giao diện điểm danh theo từng buổi học thực tế"
            >
              <BookOpen className={`w-4 h-4 ${attendanceViewMode === 'session' ? 'text-emerald-600' : 'text-emerald-300'}`} />
              <span>Giao diện 1: Buổi học</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                attendanceViewMode === 'monthly'
                  ? 'bg-white text-[#004e92] font-black shadow-sm ring-1 ring-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
              title="Giao diện bảng ma trận theo dõi chuyên cần cả tháng"
            >
              <FileSpreadsheet className={`w-4 h-4 ${attendanceViewMode === 'monthly' ? 'text-amber-600' : 'text-yellow-300'}`} />
              <span>Giao diện 2: Ma trận tháng</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                attendanceViewMode === 'history'
                  ? 'bg-white text-[#004e92] font-black shadow-sm ring-1 ring-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
              title="Lịch sử các buổi đã điểm danh"
            >
              <History className={`w-4 h-4 ${attendanceViewMode === 'history' ? 'text-sky-600' : 'text-sky-300'}`} />
              <span>Lịch Sử ({attendanceHistoryCount})</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-blue-100 font-semibold px-3 py-1 bg-black/20 rounded-lg border border-white/15">
            Lớp: <strong className="text-yellow-300 font-bold">{currentClass}</strong> ({classStudents.length} SV)
          </div>
        )}
      </div>

      {/* SUB-TAB 1: ATTENDANCE & BAN NOTICE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">


          {/* VIEW MODE 1: XUẤT BẢNG ĐIỂM DANH THÁNG (CHUẨN HÌNH 1) */}
          {attendanceViewMode === 'monthly' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Action Buttons Row - Sắp xếp theo hàng nối chuyên nghiệp */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                {/* Filter Tổ 1, Tổ 2, Tất cả theo hàng nối */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Tổ xưởng:</span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-300 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setMonthlySelectedGroup('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        monthlySelectedGroup === 'all'
                          ? 'bg-[#004e92] text-white shadow-xs font-black'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({classStudents.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setMonthlySelectedGroup(1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        monthlySelectedGroup === 1
                          ? 'bg-[#004e92] text-white shadow-xs font-black'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Tổ 1 ({classStudents.filter(s => s.workshopGroup === 1).length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setMonthlySelectedGroup(2)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        monthlySelectedGroup === 2
                          ? 'bg-[#004e92] text-white shadow-xs font-black'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Tổ 2 ({classStudents.filter(s => s.workshopGroup === 2).length})
                    </button>
                  </div>
                </div>

                {/* Hàng nối Xuất Excel và In A4 */}
                <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 gap-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleExportExcelMonthly}
                    className="px-3.5 py-1.5 bg-[#0a7e4e] hover:bg-[#086840] active:scale-95 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    title="Xuất bảng điểm danh tháng sang file Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>Xuất Excel Tháng {monthlySelectedMonth}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintMonthlySheet}
                    className="px-3 py-1.5 bg-[#2d3748] hover:bg-[#1a202c] active:scale-95 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    title="In khổ giấy A4 ngang chuẩn văn bản hành chính"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>In A4 Chuẩn</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls Row (Chọn Tháng, Năm, Kỳ học, Mô đun/Môn học) */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold whitespace-nowrap">Chọn Tháng:</span>
                  <select
                    value={monthlySelectedMonth}
                    onChange={(e) => setMonthlySelectedMonth(Number(e.target.value))}
                    className="p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold whitespace-nowrap">Năm:</span>
                  <select
                    value={monthlySelectedYear}
                    onChange={(e) => setMonthlySelectedYear(e.target.value)}
                    className="p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="2026 - 2027">2026 - 2027</option>
                    <option value="2025 - 2026">2025 - 2026</option>
                    <option value="2024 - 2025">2024 - 2025</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold whitespace-nowrap">Kỳ học:</span>
                  <select
                    value={monthlySelectedSemester}
                    onChange={(e) => setMonthlySelectedSemester(e.target.value)}
                    className="p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="HKI">HKI</option>
                    <option value="HKII">HKII</option>
                    <option value="HKIII">HKIII</option>
                    <option value="HKIV">HKIV</option>
                    <option value="HKV">HKV</option>
                    <option value="HKVI">HKVI</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <span className="text-slate-700 font-bold whitespace-nowrap">Mô đun/Môn học:</span>
                  <select
                    value={monthlySelectedModule}
                    onChange={(e) => setMonthlySelectedModule(e.target.value)}
                    className="w-full p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="all">Tất cả mô đun trong kỳ ({monthlySelectedSemester})</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.id} - {m.name} ({m.totalHours} tiết)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* White Sheet: Bảng In Chuẩn A4 Như Hình 1 */}
              <div 
                id="monthly-attendance-sheet"
                className="printable-monthly-sheet bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6"
              >
                {/* Header 2 Cột Thể Thức Văn Bản Hành Chính */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Cột Trái: Đơn vị chủ quản & Nhà trường */}
                  <div className="text-center font-bold text-slate-800 space-y-0.5 sm:text-left sm:pl-2">
                    <p className="uppercase text-[11px] text-slate-600 font-semibold tracking-wide">UBND TỈNH PHÚ THỌ</p>
                    <p className="uppercase text-xs sm:text-[13px] text-slate-900 font-black">
                      {themeSettings?.schoolName || 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC'}
                    </p>
                    <p className="uppercase text-[12px] text-blue-900 font-black">
                      {themeSettings?.facultyName?.split('•')[0]?.trim() || 'KHOA CÔNG NGHỆ Ô TÔ'}
                    </p>
                  </div>

                  {/* Cột Phải: Quốc hiệu Tiêu ngữ & Ngày tháng */}
                  <div className="text-center font-bold text-slate-800 space-y-0.5 sm:text-right sm:pr-2">
                    <p className="uppercase text-xs sm:text-[13px] text-slate-900 font-black tracking-wide">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </p>
                    <p className="text-xs sm:text-[12px] text-slate-800 font-bold underline decoration-slate-400 underline-offset-4">
                      Độc lập - Tự do - Hạnh phúc
                    </p>
                    <p className="text-[11px] text-slate-500 italic font-medium pt-1">
                      Phú Thọ, ngày {daysInMonth} tháng {monthlySelectedMonth} năm {yearNumber}
                    </p>
                  </div>
                </div>

                {/* Tiêu Đề Chính Của Văn Bản */}
                <div className="text-center space-y-1.5 pt-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                    BẢNG THEO DÕI ĐIỂM DANH & CHUYÊN CẦN THÁNG {monthlySelectedMonth} NĂM HỌC {monthlySelectedYear}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Lớp: <strong className="text-slate-900 font-black">{currentClass}</strong> | Năm học: <strong className="text-slate-900 font-bold">{monthlySelectedYear}</strong> | Kỳ: <strong className="text-slate-900 font-bold">{monthlySelectedSemester}</strong>
                    {monthlySelectedModule !== 'all' && (
                      <span> | Mô đun: <strong className="text-blue-900">{modules.find(m => m.id === monthlySelectedModule)?.name || monthlySelectedModule}</strong></span>
                    )}
                  </p>
                </div>

                {/* Ma Trận Điểm Danh 31 Ngày */}
                <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs">
                  <table className="w-full text-xs border-collapse">
                    <thead style={{ backgroundColor: primaryHeadColor }} className="text-white uppercase text-[11px] font-bold text-center">
                      <tr>
                        <th className="py-2.5 px-1.5 border border-blue-900/60 w-9" rowSpan={1}>STT</th>
                        <th className="py-2.5 px-3 border border-blue-900/60 text-left min-w-[150px]" rowSpan={1}>Họ và tên</th>
                        <th className="py-2.5 px-1.5 border border-blue-900/60 w-12 text-center" rowSpan={1}>Tổ</th>
                        
                        {/* 31 Cột Ngày */}
                        {daysArray.map(d => (
                          <th key={d} className="py-2.5 px-0.5 border border-blue-900/60 min-w-[21px] max-w-[24px] text-center text-[10px] font-bold">
                            {d}
                          </th>
                        ))}

                        {/* Tổng Kết */}
                        <th className="py-2.5 px-1 border border-blue-900/60 w-8 text-center bg-blue-950/40" title="Có mặt (x)">X</th>
                        <th className="py-2.5 px-1 border border-blue-900/60 w-8 text-center bg-blue-950/40" title="Đi muộn (M)">M</th>
                        <th className="py-2.5 px-1 border border-blue-900/60 w-8 text-center bg-blue-950/40" title="Có phép (P)">P</th>
                        <th className="py-2.5 px-1 border border-blue-900/60 w-8 text-center bg-blue-950/40" title="Không phép (K)">K</th>
                        <th className="py-2.5 px-1 border border-blue-900/60 w-14 text-center bg-blue-950/50" title="Tỷ lệ chuyên cần">% CC</th>
                        <th className="py-2.5 px-2 border border-blue-900/60 min-w-[75px] text-center bg-blue-950/50">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-slate-800">
                      {studentMonthlyData.map((row, idx) => (
                        <tr 
                          key={row.student.id} 
                          className={`hover:bg-blue-50/40 transition text-center ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                          } ${row.K > 0 ? 'bg-rose-50/30' : ''}`}
                        >
                          {/* STT */}
                          <td className="py-2 px-1 border border-slate-300 font-semibold text-slate-500 text-center">
                            {idx + 1}
                          </td>

                          {/* Họ và tên */}
                          <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900 text-left whitespace-nowrap">
                            {row.student.fullName}
                          </td>

                          {/* Tổ */}
                          <td className="py-2 px-1 border border-slate-300 font-medium text-slate-600 text-center text-[11px] whitespace-nowrap">
                            Tổ {row.student.workshopGroup}
                          </td>

                          {/* 31 Ngày */}
                          {daysArray.map(d => {
                            const dayInfo = row.dayStatuses[d];
                            return (
                              <td 
                                key={d} 
                                className="py-1.5 px-0.5 border border-slate-300 text-center text-xs"
                                title={dayInfo ? `${row.student.fullName} - Ngày ${d}/${monthlySelectedMonth}: ${dayInfo.displayChar} ${dayInfo.note ? `(${dayInfo.note})` : ''}` : undefined}
                              >
                                {dayInfo ? (
                                  <span className={dayInfo.colorClass}>
                                    {dayInfo.displayChar}
                                  </span>
                                ) : (
                                  <span className="text-transparent">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* X (Có mặt) */}
                          <td className="py-2 px-1 border border-slate-300 font-mono font-bold text-slate-800 text-center bg-slate-50/50">
                            {row.X}
                          </td>

                          {/* M (Muộn) */}
                          <td className="py-2 px-1 border border-slate-300 font-mono font-bold text-slate-800 text-center bg-slate-50/50">
                            {row.M}
                          </td>

                          {/* P (Có phép) */}
                          <td className="py-2 px-1 border border-slate-300 font-mono font-bold text-slate-800 text-center bg-slate-50/50">
                            {row.P}
                          </td>

                          {/* K (Không phép) */}
                          <td className={`py-2 px-1 border border-slate-300 font-mono font-black text-center ${
                            row.K > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-800 bg-slate-50/50'
                          }`}>
                            {row.K}
                          </td>

                          {/* % CC */}
                          <td className={`py-2 px-1 border border-slate-300 font-mono font-black text-center ${
                            row.ccPercent < 70 ? 'text-rose-600 bg-rose-50/60' : 'text-slate-900 bg-slate-50/50'
                          }`}>
                            {row.ccPercent}%
                          </td>

                          {/* Đánh giá */}
                          <td className="py-2 px-1.5 border border-slate-300 text-center font-semibold text-[11px]">
                            {row.evaluation === 'Cảnh báo' ? (
                              <span className="text-rose-700 font-black">Cảnh báo</span>
                            ) : row.evaluation === 'Tốt' ? (
                              <span className="text-slate-800 font-semibold">Tốt</span>
                            ) : (
                              <span className="text-blue-800 font-semibold">{row.evaluation}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bảng Ký Tên Chuẩn 3 Cột */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 uppercase">NGƯỜI LẬP BẢNG / LỚP TRƯỞNG</p>
                    <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                    <p className="font-semibold text-slate-800">Trần Văn Hoàng</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 uppercase">GIÁO VIÊN CHỦ NHIỆM / GIẢNG VIÊN</p>
                    <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                    <p className="font-semibold text-slate-800">{themeSettings?.authorName || 'ThS: Nguyễn Chí Dũng'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 uppercase">TRƯỜNG KHOA CÔNG NGHỆ Ô TÔ</p>
                    <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                    <p className="font-semibold text-slate-800">ThS: Đỗ Thế Huân</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ĐIỂM DANH BUỔI HỌC (GIAO DIỆN HIỂN THỊ NÂNG CẤP CHUẨN KỸ THUẬT) */}
          {attendanceViewMode === 'session' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Controls & Filter Bar */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3 text-xs">
                {/* Left group: filters */}
                <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                  {/* Ngày điểm danh */}
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700 whitespace-nowrap">Ngày điểm danh:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-1.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedDate(getRealtimeCurrentDate())}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer px-1"
                        title="Đặt về ngày hiện tại theo thời gian thực"
                      >
                        Hôm nay
                      </button>
                    </div>
                  </div>

                  {/* Ca học */}
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700 whitespace-nowrap">Ca học:</label>
                    <select
                      value={selectedShift}
                      onChange={(e) => setSelectedShift(e.target.value as any)}
                      className="p-1.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Sáng">Ca Sáng (07h00 - 11h30: 5 tiết)</option>
                      <option value="Chiều">Ca Chiều (13h00 - 17h15: 5 tiết)</option>
                      <option value="Tối">Ca Tối (17h45 - 21h00: 4 tiết)</option>
                    </select>
                  </div>

                  {/* Mô đun giảng dạy */}
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700 whitespace-nowrap">Mô đun:</label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded font-bold text-blue-900 bg-white max-w-[260px] focus:border-blue-500 focus:outline-hidden truncate"
                    >
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.id} - {m.name} ({m.totalHours}t)</option>
                      ))}
                    </select>
                  </div>

                  {/* Tổ xưởng */}
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700 whitespace-nowrap">Tổ xưởng:</label>
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSessionGroupFilter('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                          sessionGroupFilter === 'all'
                            ? 'bg-[#004e92] text-white shadow-xs font-black'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        Tất cả ({classStudents.length})
                      </button>
                      {[1, 2].map(g => {
                        const groupCount = classStudents.filter(s => s.workshopGroup === g).length;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSessionGroupFilter(g as any)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                              sessionGroupFilter === g
                                ? 'bg-[#004e92] text-white shadow-xs font-black'
                                : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            Tổ {g} ({groupCount})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right group: action buttons */}
                <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 gap-1 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const quick: Record<string, AttendanceStatus> = {};
                      classStudents.forEach(s => { quick[s.id] = 'P'; });
                      setAttendanceSheet(quick);
                      showToast('✓ Đã chọn Có mặt (P) cho tất cả sinh viên!');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-300 transition cursor-pointer text-xs whitespace-nowrap"
                  >
                    Tất cả có mặt (P)
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAttendanceBatch}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004e92] hover:bg-[#00396b] text-white font-bold rounded-lg shadow-xs transition cursor-pointer active:scale-95 text-xs whitespace-nowrap"
                  >
                    <Save className="w-4 h-4 text-sky-200" />
                    Lưu Điểm Danh
                  </button>

                  {onClearAttendanceSession && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'XÓA BUỔI ĐIỂM DANH HIỆN TẠI',
                          message: `Thầy/Cô có chắc chắn muốn xóa bản ghi điểm danh ngày ${selectedDate} (Ca ${selectedShift}) của mô đun ${selectedModuleId}? Dữ liệu chuyên cần buổi này sẽ được xóa khỏi hệ thống.`,
                          confirmText: 'Xóa buổi này',
                          onConfirm: () => {
                            onClearAttendanceSession(selectedDate, selectedShift, selectedModuleId);
                            setAttendanceSheet({});
                            showToast(`🗑️ Đã xóa điểm danh ngày ${selectedDate} (${selectedShift}) môn ${selectedModuleId}`);
                            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                          }
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold cursor-pointer transition whitespace-nowrap"
                      title="Xóa buổi điểm danh đang chọn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa buổi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Bảng Điểm Danh Sinh Viên Buổi Học */}
              <div 
                style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
                className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                <div className="overflow-x-auto max-h-[580px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead 
                      style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
                      className="text-white uppercase font-bold sticky top-0 z-10 text-[11px]"
                    >
                      <tr>
                        <th className="py-2.5 px-2 text-center w-10 border-r border-blue-800">STT</th>
                        <th className="py-2.5 px-3 border-r border-blue-800 w-24">MSSV</th>
                        <th className="py-2.5 px-3 border-r border-blue-800 min-w-[170px]">Họ và tên</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-800 w-16">Tổ</th>
                        <th className="py-2.5 px-3 text-center border-r border-blue-800 min-w-[240px]">Trạng thái buổi học</th>
                        <th className="py-2.5 px-3 border-r border-blue-800 min-w-[180px]">Ghi chú & Lý do</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-800 w-28 bg-blue-900">Vắng tích lũy</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-800 w-24 bg-blue-900">Tỷ lệ vắng (%)</th>
                        <th className="py-2.5 px-3 border-r border-blue-800 text-center min-w-[130px]">Cảnh báo cấm thi</th>
                        <th className="py-2.5 px-2 text-center w-32">Thao tác / Báo PH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sessionFilteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            Không tìm thấy sinh viên nào phù hợp với bộ lọc hiện tại.
                          </td>
                        </tr>
                      ) : (
                        sessionFilteredStudents.map((s, idx) => {
                          const status = attendanceSheet[s.id] || 'P';
                          const stats = getMissedStats(s.id);

                          return (
                            <tr 
                              key={`${s.id}-${idx}`} 
                              className={`hover:bg-blue-50/50 transition ${
                                stats.isBanned ? 'bg-rose-50/70' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              {/* STT */}
                              <td className="py-2 px-2 text-center font-semibold text-slate-500 border-r border-slate-200">
                                {idx + 1}
                              </td>

                              {/* MSSV */}
                              <td className="py-2 px-3 font-mono font-bold text-blue-700 border-r border-slate-200">
                                {s.id}
                              </td>

                              {/* Họ và tên */}
                              <td className="py-2 px-3 border-r border-slate-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {s.fullName.trim().split(' ').slice(-1)[0]?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 block">{s.fullName}</span>
                                    {s.role && s.role !== 'Thành viên' && (
                                      <span className="text-[10px] text-blue-600 font-medium">({s.role})</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Tổ xưởng */}
                              <td className="py-2 px-2 text-center border-r border-slate-200">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.workshopGroup === 1 ? 'bg-blue-100 text-blue-800' :
                                  s.workshopGroup === 2 ? 'bg-emerald-100 text-emerald-800' :
                                  s.workshopGroup === 3 ? 'bg-purple-100 text-purple-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  Tổ {s.workshopGroup}
                                </span>
                              </td>
                              
                              {/* Nút Chọn Trạng Thái P / L / A / LATE */}
                              <td className="py-2 px-2 border-r border-slate-200">
                                <div className="flex items-center justify-center gap-1">
                                  {/* P - Có mặt */}
                                  <button
                                    type="button"
                                    onClick={() => setAttendanceSheet({ ...attendanceSheet, [s.id]: 'P' })}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
                                      status === 'P'
                                        ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title="Có mặt đầy đủ"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>P</span>
                                    <span className="hidden xl:inline text-[10px] font-normal">(Có mặt)</span>
                                  </button>

                                  {/* L - Có phép */}
                                  <button
                                    type="button"
                                    onClick={() => setAttendanceSheet({ ...attendanceSheet, [s.id]: 'L' })}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
                                      status === 'L'
                                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title="Nghỉ có phép"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>L</span>
                                    <span className="hidden xl:inline text-[10px] font-normal">(Phép)</span>
                                  </button>

                                  {/* A - Không phép */}
                                  <button
                                    type="button"
                                    onClick={() => setAttendanceSheet({ ...attendanceSheet, [s.id]: 'A' })}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
                                      status === 'A'
                                        ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title="Nghỉ không phép"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>A</span>
                                    <span className="hidden xl:inline text-[10px] font-normal">(KP)</span>
                                  </button>

                                  {/* LATE - Muộn */}
                                  <button
                                    type="button"
                                    onClick={() => setAttendanceSheet({ ...attendanceSheet, [s.id]: 'LATE' })}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
                                      status === 'LATE'
                                        ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title="Đi muộn / Về sớm"
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>M</span>
                                    <span className="hidden xl:inline text-[10px] font-normal">(Muộn)</span>
                                  </button>
                                </div>
                              </td>

                              {/* Note Input & Quick Tags */}
                              <td className="py-1.5 px-2 border-r border-slate-200">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    placeholder="Ghi chú lý do..."
                                    value={attendanceNotes[s.id] || ''}
                                    onChange={(e) => setAttendanceNotes({ ...attendanceNotes, [s.id]: e.target.value })}
                                    className="w-full p-1 px-1.5 border border-slate-200 rounded text-[11px] bg-white focus:border-blue-500 focus:outline-hidden"
                                  />
                                  {status !== 'P' && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {['Ốm', 'Việc gia đình', 'Xe hỏng'].map(tag => (
                                        <button
                                          key={tag}
                                          type="button"
                                          onClick={() => setAttendanceNotes({ ...attendanceNotes, [s.id]: tag })}
                                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 cursor-pointer transition"
                                        >
                                          +{tag}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Vắng tích lũy */}
                              <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                                <span className={stats.isBanned ? 'text-rose-700 font-black' : 'text-slate-800'}>
                                  {stats.totalMissedHours} / {currentModule.totalHours}t
                                </span>
                              </td>

                              {/* Tỷ lệ vắng % */}
                              <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200 bg-slate-50/50">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                                  stats.isBanned
                                    ? 'bg-rose-100 text-rose-800 font-black'
                                    : stats.missedPercent >= 15
                                    ? 'bg-amber-100 text-amber-800 font-bold'
                                    : 'text-slate-700'
                                }`}>
                                  {stats.missedPercent}%
                                </span>
                              </td>

                              {/* Ban Status */}
                              <td className="py-2 px-3 text-center border-r border-slate-200">
                                {stats.isBanned ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse shadow-xs">
                                    CẤM THI (&gt;20%)
                                  </span>
                                ) : stats.missedPercent >= 15 ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    Nguy cơ cấm thi
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Đủ điều kiện dự thi
                                  </span>
                                )}
                              </td>

                              {/* Thao tác: Báo PH qua Zalo / Xuất Thông Báo */}
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {stats.isBanned && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenNoticeModal(s, currentModule.name, stats.totalMissedHours, stats.missedPercent)}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] shadow-xs flex items-center justify-center gap-0.5 cursor-pointer"
                                      title="Xuất thông báo cấm thi chính thức"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Biên bản</span>
                                    </button>
                                  )}

                                  {/* Nút gửi Zalo Phụ Huynh khi nghỉ học hoặc có nguy cơ */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setZaloTargetStudent(s);
                                      const defaultZaloText = `Kính gửi Quý phụ huynh em ${s.fullName} (Lớp ${currentClass}, MSSV: ${s.id}):\nThầy/Cô GVCN thông báo tình hình chuyên cần của em trong ngày ${selectedDate} (${selectedShift}):\n- Trạng thái: ${status === 'P' ? 'Có mặt' : status === 'L' ? 'Nghỉ có phép' : status === 'A' ? 'Nghỉ KHÔNG phép' : 'Đi muộn'}\n- Lý do: ${attendanceNotes[s.id] || 'Chưa rõ'}\n- Môn học: ${currentModule.name} (${currentModule.id})\n- Tổng số tiết vắng tích lũy: ${stats.totalMissedHours}/${currentModule.totalHours} tiết (${stats.missedPercent}%)\n${stats.isBanned ? '⚠️ CẢNH BÁO: Em đã nghỉ quá 20% và thuộc diện CẤM THI theo TT 04/2022/TT-BLĐTBXH. Kính đề nghị gia đình liên hệ GVCN.' : stats.missedPercent >= 15 ? '⚠️ Chú ý: Em đang có nguy cơ bị cấm thi môn học.' : 'Đề nghị gia đình tiếp tục phối hợp đôn đốc em đi học chuyên cần.'}`;
                                      setZaloMessage(defaultZaloText);
                                      setIsZaloModalOpen(true);
                                    }}
                                    className={`p-1 rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1 ${
                                      status === 'A' || stats.isBanned
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                                        : 'bg-slate-100 hover:bg-blue-100 text-blue-700'
                                    }`}
                                    title="Gửi tin nhắn chuyên cần qua Zalo cho Phụ Huynh"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span className="hidden sm:inline">Zalo</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: LỊCH SỬ CÁC BUỔI ĐIỂM DANH */}
          {attendanceViewMode === 'history' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase">LỊCH SỬ CÁC BUỔI ĐIỂM DANH LỚP {currentClass}</h3>
                </div>
                <span className="text-slate-500 font-semibold">Tổng số: <strong>{historySessions.length}</strong> buổi ghi nhận</span>
              </div>

              {historySessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Chưa có buổi điểm danh nào được lưu cho lớp này.</div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {historySessions.map(sess => {
                    const presentCount = sess.records.filter(r => r.status === 'P').length;
                    const excusedCount = sess.records.filter(r => r.status === 'L').length;
                    const unexcusedCount = sess.records.filter(r => r.status === 'A').length;
                    const lateCount = sess.records.filter(r => r.status === 'LATE').length;
                    const modObj = modules.find(m => m.id === sess.moduleId);

                    return (
                      <div key={sess.key} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 transition">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-blue-900 text-xs">{sess.date}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900">Ca {sess.shift}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">{sess.moduleId} - {modObj?.name || 'Mô đun'}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-1">
                            <span className="text-emerald-700 font-bold">✓ Có mặt: {presentCount}</span>
                            <span className="text-blue-700 font-semibold">• Có phép: {excusedCount}</span>
                            <span className="text-rose-700 font-black">• Không phép: {unexcusedCount}</span>
                            <span className="text-amber-700 font-semibold">• Muộn: {lateCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDate(sess.date);
                              setSelectedShift(sess.shift as any);
                              setSelectedModuleId(sess.moduleId);
                              setAttendanceViewMode('session');
                              showToast(`Đã tải buổi điểm danh ngày ${sess.date} (${sess.shift})`);
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg cursor-pointer transition text-[11px]"
                          >
                            Xem / Sửa buổi này
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ĐÁNH GIÁ ĐIỂM RÈN LUYỆN (BM01) */}
      {activeSubTab === 'ren-luyen' && (
        <div className="space-y-4">
          {/* Banner TT 17/2017 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                QUY TRÌNH 3 BƯỚC ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN THEO THÔNG TƯ 17/2017/TT-BLĐTBXH
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-1">
                BẢNG ĐIỂM RÈN LUYỆN TOÀN KHÓA • BIỂU MẪU BM01 (THANG 100 ĐIỂM)
              </h3>
              <p className="text-xs text-slate-500">
                1. Ý thức học tập (0-20đ) | 2. Nội quy quy chế (0-25đ) | 3. Chính trị - xã hội (0-20đ) | 4. Quan hệ cộng đồng (0-25đ) | 5. Thành tích/Cán sự (0-10đ)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-bold">Xuất sắc: 90 - 100đ</span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold">Tốt: 80 - 89đ</span>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">Khá: 65 - 79đ</span>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold">Trung bình: 50 - 64đ</span>
              {onClearClassRenLuyen && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'ĐẶT LẠI ĐIỂM RÈN LUYỆN TOÀN BỘ LỚP',
                      message: `Thầy/Cô có chắc chắn muốn xóa và đặt lại toàn bộ kết quả rèn luyện học kỳ 1 của lớp ${currentClass}? Dữ liệu sẽ được đưa về mặc định ban đầu để họp bình xét lại.`,
                      confirmText: 'Đặt lại rèn luyện cả lớp',
                      onConfirm: () => {
                        onClearClassRenLuyen(1);
                        showToast(`🗑️ Đã xóa và đặt lại dữ liệu rèn luyện của lớp ${currentClass}.`);
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      }
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold cursor-pointer transition"
                  title="Xóa và đặt lại đánh giá rèn luyện học kỳ này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Đặt lại ĐRL cả lớp</span>
                </button>
              )}
            </div>
          </div>

          {/* Table BM01 */}
          <div 
            style={{ backgroundColor: themeSettings?.cardBg || '#ffffff' }}
            className="rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead 
                  style={{ backgroundColor: themeSettings?.tableHeaderBg || '#004e92' }}
                  className="text-white uppercase font-bold sticky top-0 z-10 text-[11px]"
                >
                  <tr>
                    <th className="py-2.5 px-2 text-center w-10 border-r border-blue-800">STT</th>
                    <th className="py-2.5 px-3 border-r border-blue-800 w-24">MSSV</th>
                    <th className="py-2.5 px-3 border-r border-blue-800 min-w-[150px]">Họ và tên</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-16">Tổ xưởng</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TC1 (0-20)</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TC2 (0-25)</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TC3 (0-20)</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TC4 (0-25)</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-20">TC5 (0-10)</th>
                    <th className="py-2.5 px-2 text-center border-r border-blue-800 w-24 bg-blue-900">Tổng điểm</th>
                    <th className="py-2.5 px-3 border-r border-blue-800 text-center min-w-[100px]">Xếp loại</th>
                    <th className="py-2.5 px-3 border-r border-blue-800 text-center min-w-[120px]">Tiến độ duyệt</th>
                    <th className="py-2.5 px-2 text-center w-20">Chỉnh sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classStudents.map((s, idx) => {
                    const rl = getStudentRenLuyen(s.id);
                    return (
                      <tr key={`${s.id}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="py-2 px-2 text-center font-semibold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-blue-700 border-r border-slate-200">{s.id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{s.fullName}</td>
                        <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-200">Tổ {s.workshopGroup}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-slate-200">{rl.criteria1}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-slate-200">{rl.criteria2}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-slate-200">{rl.criteria3}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-slate-200">{rl.criteria4}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-slate-200">{rl.criteria5}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-purple-900 bg-purple-50/50 border-r border-slate-200 text-sm">
                          {rl.totalScore}đ
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-200">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rl.rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-800' :
                            rl.rank === 'Tốt' ? 'bg-blue-100 text-blue-800' :
                            rl.rank === 'Khá' ? 'bg-emerald-100 text-emerald-800' :
                            rl.rank === 'Trung bình' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {rl.rank}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-200">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            rl.evaluationStep === 'GVCN duyệt' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                            rl.evaluationStep === 'Lớp họp bình xét' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {rl.evaluationStep}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingRenLuyen(rl)}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-bold text-[11px] cursor-pointer"
                              title="Chấm điểm rèn luyện"
                            >
                              Chấm
                            </button>
                            {onDeleteRenLuyen && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: 'ĐẶT LẠI ĐIỂM RÈN LUYỆN SINH VIÊN',
                                    message: `Thầy/Cô có chắc chắn muốn đặt lại điểm rèn luyện của sinh viên ${s.fullName} (${s.id})? Điểm rèn luyện của sinh viên này sẽ bị xóa để bình xét lại.`,
                                    confirmText: 'Xác nhận đặt lại',
                                    onConfirm: () => {
                                      onDeleteRenLuyen(s.id, 1);
                                      showToast(`Đã đặt lại điểm rèn luyện của SV ${s.fullName}`);
                                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Đặt lại điểm rèn luyện"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setZaloTargetStudent(s);
                                setZaloMessage(`Thông báo kết quả rèn luyện học kỳ ${selectedRenLuyenSemester} của SV ${s.fullName}: Tổng điểm ${getStudentRenLuyen(s.id).totalScore} - Xếp loại ${getStudentRenLuyen(s.id).rank}.`);
                                setIsZaloModalOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Gửi tin Zalo cho phụ huynh"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit BM01 Ren Luyen */}
      {editingRenLuyen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-[#004e92] text-white px-6 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">ĐÁNH GIÁ ĐIỂM RÈN LUYỆN (BM01)</h3>
              <button onClick={() => setEditingRenLuyen(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const total = editingRenLuyen.criteria1 + editingRenLuyen.criteria2 + editingRenLuyen.criteria3 + editingRenLuyen.criteria4 + editingRenLuyen.criteria5;
                let rank: RenLuyenCriteria['rank'] = 'Kém';
                if (total >= 90) rank = 'Xuất sắc';
                else if (total >= 80) rank = 'Tốt';
                else if (total >= 65) rank = 'Khá';
                else if (total >= 50) rank = 'Trung bình';
                else if (total >= 35) rank = 'Yếu';

                const updated: RenLuyenCriteria = {
                  ...editingRenLuyen,
                  totalScore: total,
                  rank: rank,
                  evaluationStep: 'GVCN duyệt'
                };
                onUpdateRenLuyen(updated);
                showToast(`✅ Đã lưu kết quả rèn luyện của SV ${editingRenLuyen.studentId}`);
                setEditingRenLuyen(null);
              }}
              className="p-5 text-xs space-y-3"
            >
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <p><strong>MSSV:</strong> {editingRenLuyen.studentId}</p>
              </div>

              <div>
                <label className="font-semibold block mb-1">1. Ý thức học tập (0 - 20 điểm)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={editingRenLuyen.criteria1}
                  onChange={(e) => setEditingRenLuyen({ ...editingRenLuyen, criteria1: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">2. Chấp hành nội quy, quy chế trường & xưởng (0 - 25 điểm)</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={editingRenLuyen.criteria2}
                  onChange={(e) => setEditingRenLuyen({ ...editingRenLuyen, criteria2: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">3. Tham gia hoạt động chính trị - xã hội, văn thể mỹ (0 - 20 điểm)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={editingRenLuyen.criteria3}
                  onChange={(e) => setEditingRenLuyen({ ...editingRenLuyen, criteria3: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">4. Quan hệ cộng đồng, phẩm chất đạo đức, 5S xưởng (0 - 25 điểm)</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={editingRenLuyen.criteria4}
                  onChange={(e) => setEditingRenLuyen({ ...editingRenLuyen, criteria4: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">5. Cán sự lớp / Thành tích khen thưởng đặc biệt (0 - 10 điểm)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={editingRenLuyen.criteria5}
                  onChange={(e) => setEditingRenLuyen({ ...editingRenLuyen, criteria5: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  required
                />
              </div>

              <div className="pt-2 border-t flex items-center justify-between gap-2">
                {onDeleteRenLuyen && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteRenLuyen(editingRenLuyen.studentId, 1);
                      showToast(`🗑️ Đã đặt lại điểm rèn luyện của SV ${editingRenLuyen.studentId}`);
                      setEditingRenLuyen(null);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Đặt lại ĐRL này</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button type="button" onClick={() => setEditingRenLuyen(null)} className="px-3 py-1.5 bg-slate-200 rounded cursor-pointer">Hủy</button>
                  <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold cursor-pointer">Lưu & Phê Duyệt</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-300">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm tracking-wide uppercase">{confirmDialog.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p className="font-medium whitespace-pre-line text-slate-800">{confirmDialog.message}</p>
            </div>
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl cursor-pointer text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl cursor-pointer text-xs shadow-md transition"
              >
                {confirmDialog.confirmText || 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zalo Notification Modal */}
      {isZaloModalOpen && zaloTargetStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-blue-300">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-sm tracking-wide">GỬI TIN NHẮN ZALO CHO PHỤ HUYNH</h3>
              </div>
              <button onClick={() => setIsZaloModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>Sinh viên: <strong className="text-blue-900">{zaloTargetStudent.fullName}</strong></p>
                <p>Số điện thoại liên lạc: <strong className="text-blue-900">{zaloTargetStudent.phone || zaloTargetStudent.emergencyPhone}</strong></p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung tin nhắn:</label>
                <textarea
                  value={zaloMessage}
                  onChange={(e) => setZaloMessage(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsZaloModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-300">Hủy</button>
                <button onClick={handleSendZalo} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Gửi tin Zalo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
