import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Edit, 
  Check, 
  Calculator,
  Search,
  Filter,
  Trash2,
  Plus,
  Printer,
  Lock,
  Save,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Student, SubjectModule, StudentGrade, ClassId, ThemeSettings } from '../types';

interface GradeManagementModuleProps {
  students: Student[];
  currentClass: ClassId;
  modules: SubjectModule[];
  grades: StudentGrade[];
  onUpdateGrade: (grade: StudentGrade) => void;
  onDeleteGrade?: (studentId: string, moduleId: string) => void;
  onClearModuleGrades?: (moduleId: string) => void;
  onClearClassGrades?: () => void;
  themeSettings?: ThemeSettings;
  trainingSystem?: string;
  onOpenCurriculumModal?: () => void;
}

// Kiểm tra quy tắc giá trị điểm hợp lệ (0.0 đến 10.0)
// Các giá trị để trống, vô giá trị, không xác định hoặc /// được loại khỏi tính toán lũy tiến
export const isValidScore = (v: any): boolean => {
  if (v === null || v === undefined || v === '' || v === '///') return false;
  const num = Number(v);
  return !isNaN(num) && num >= 0 && num <= 10;
};

// Quy đổi Thang điểm 4 & Điểm chữ chuẩn GDNN (Thông tư 04/2022/TT-BLĐTBXH)
export const convertTo4AndLetter = (score10: number | null): { score4: number | null; letter: string } => {
  if (score10 === null) return { score4: null, letter: '' };
  if (score10 >= 8.5) return { score4: 4.0, letter: 'A' };
  if (score10 >= 7.0) return { score4: 3.0, letter: 'B' };
  if (score10 >= 5.5) return { score4: 2.0, letter: 'C' };
  if (score10 >= 4.0) return { score4: 1.0, letter: 'D' };
  return { score4: 0.0, letter: 'F' };
};

// Component ô nhập điểm trực tiếp: bỏ nút tăng giảm stepper, cho phép giáo viên gõ trực tiếp điểm số
interface ScoreInputCellProps {
  value: number | undefined | null;
  onChange: (valStr: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ScoreInputCell: React.FC<ScoreInputCellProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '—',
  className = ''
}) => {
  const [localVal, setLocalVal] = useState<string>(() => {
    return value !== undefined && value !== null ? String(value) : '';
  });
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '///') {
      setLocalVal('');
      onChange('');
      return;
    }

    // Chuyển dấu phẩy tiếng Việt thành dấu chấm
    const normalized = raw.replace(',', '.');

    // Chỉ nhận số và tối đa 1 dấu chấm thập phân
    if (!/^\d*\.?\d*$/.test(normalized)) {
      return;
    }

    setLocalVal(normalized);

    // Khi người dùng đã gõ xong số hoàn chỉnh (không kết thúc bằng dấu chấm), cập nhật ngay
    if (!normalized.endsWith('.') && normalized !== '') {
      const num = Number(normalized);
      if (!isNaN(num)) {
        if (num > 10) {
          setLocalVal('10');
          onChange('10');
        } else {
          onChange(normalized);
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localVal === '' || localVal === '.' || localVal === '///') {
      setLocalVal('');
      onChange('');
      return;
    }
    const num = Number(localVal);
    if (!isNaN(num)) {
      const clamped = Math.min(10, Math.max(0, num));
      const cleanStr = String(Number(clamped.toFixed(2)));
      setLocalVal(cleanStr);
      onChange(cleanStr);
    } else {
      setLocalVal('');
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={handleChange}
      onFocus={(e) => {
        setIsFocused(true);
        e.target.select();
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-14 p-1 text-center font-mono font-bold border rounded focus:bg-white focus:outline-none focus:ring-1 transition select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
        disabled ? 'cursor-not-allowed opacity-70 bg-slate-100 text-slate-400' : ''
      } ${className}`}
    />
  );
};

export const GradeManagementModule: React.FC<GradeManagementModuleProps> = ({
  students,
  currentClass,
  modules,
  grades,
  onUpdateGrade,
  onDeleteGrade,
  onClearModuleGrades,
  onClearClassGrades,
  themeSettings,
  trainingSystem,
  onOpenCurriculumModal
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  
  // Lọc danh sách mô đun thuộc kỳ học đang chọn theo BẢNG QUẢN TRỊ CHƯƠNG TRÌNH
  const semesterModules = useMemo(() => {
    return (modules || []).filter(m => Number(m.semester) === Number(selectedSemester));
  }, [modules, selectedSemester]);

  // Khởi tạo mô đun chọn mặc định theo kỳ 1
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    const inSem1 = (modules || []).filter(m => Number(m.semester) === 1);
    return inSem1[0]?.id || modules[0]?.id || 'MH01';
  });

  // Tự động đồng bộ mô đun khi chuyển kỳ hoặc khi BẢNG QUẢN TRỊ CHƯƠNG TRÌNH thay đổi
  useEffect(() => {
    if (semesterModules.length > 0) {
      const match = semesterModules.some(m => m.id === selectedModuleId);
      if (!match) {
        setSelectedModuleId(semesterModules[0].id);
      }
    }
  }, [semesterModules, selectedModuleId]);

  // Handler khi giáo viên chuyển kỳ học
  const handleSemesterChange = (newSem: number) => {
    setSelectedSemester(newSem);
    const newSemMods = (modules || []).filter(m => Number(m.semester) === Number(newSem));
    if (newSemMods.length > 0) {
      setSelectedModuleId(newSemMods[0].id);
    }
  };

  const [academicYear, setAcademicYear] = useState<string>('2026 - 2027');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 1 | 2>('all');
  
  // Mặc định tỷ lệ điểm là 122 (1 cột TX, 2 cột ĐK). Cho phép thay đổi ví dụ: 1222, 111222 (tối đa 5 TX, 8 ĐK)
  const [scoreRatio, setScoreRatio] = useState<string>('122');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3800);
  };

  const classStudents = students.filter(s => s.classId === currentClass);
  const currentModule = semesterModules.find(m => m.id === selectedModuleId) ||
                        modules.find(m => m.id === selectedModuleId) || 
                        semesterModules[0] || 
                        modules[0] || {
    id: 'MH01',
    name: 'Giáo dục chính trị',
    credits: 3,
    totalHours: 45,
    theoryHours: 30,
    practiceHours: 15,
    semester: selectedSemester
  };

  // Phân tích số cột TX (hs1) và ĐK (hs2) từ chuỗi tỷ lệ điểm (Mặc định 1 TX, 2 ĐK; tối đa 5 TX, 8 ĐK)
  const parseRatio = (ratioStr: string) => {
    const clean = String(ratioStr || '').trim();
    const ones = (clean.match(/1/g) || []).length;
    const twos = (clean.match(/2/g) || []).length;
    
    let tx = 1;
    let dk = 2;
    if (ones > 0 || twos > 0) {
      tx = ones > 0 ? Math.min(5, Math.max(1, ones)) : 1;
      dk = twos > 0 ? Math.min(8, Math.max(1, twos)) : 2;
    } else if (clean.includes(':') || clean.includes('/') || clean.includes('-')) {
      const parts = clean.split(/[:/\-]/);
      tx = Math.min(5, Math.max(1, Number(parts[0]) || 1));
      dk = Math.min(8, Math.max(1, Number(parts[1]) || 2));
    } else if (!isNaN(Number(clean)) && clean.length >= 2) {
      tx = Math.min(5, Math.max(1, Number(clean[0]) || 1));
      dk = Math.min(8, Math.max(1, Number(clean.slice(1)) || 2));
    }
    return { tx, dk };
  };

  const { tx: txCount, dk: dkCount } = parseRatio(scoreRatio);

  // Lọc sinh viên theo tìm kiếm và tổ xưởng
  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || s.workshopGroup === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  // Tìm bản ghi điểm của sinh viên
  const findStudentGrade = (studentId: string, moduleId: string): StudentGrade | null => {
    return grades.find(g => String(g.studentId).trim() === String(studentId).trim() && g.moduleId === moduleId) || null;
  };

  // 1. Tính Điểm Quá Trình (DQT - Trọng số 40%)
  // Tính theo trung bình có trọng số của các điểm TX (hệ số 1) và ĐK (hệ số 2) ĐÃ NHẬP
  // Nếu chưa nhập đủ điểm, tự động tính theo tổng trọng số tương ứng với các cột có điểm
  const calculateProcessGrade = (g: StudentGrade | null, customTxCount: number, customDkCount: number): number | null => {
    if (!g) return null;
    const txArr = g.txScores || [g.regularScore1, g.regularScore2];
    const dkArr = g.dkScores || [g.midtermScore];

    let sum = 0;
    let totalWeight = 0;

    for (let i = 0; i < customTxCount; i++) {
      const val = txArr[i] !== undefined ? txArr[i] : (i === 0 ? g.regularScore1 : i === 1 ? g.regularScore2 : undefined);
      if (isValidScore(val)) {
        sum += Number(val) * 1;
        totalWeight += 1;
      }
    }

    for (let i = 0; i < customDkCount; i++) {
      const val = dkArr[i] !== undefined ? dkArr[i] : (i === 0 ? g.midtermScore : undefined);
      if (isValidScore(val)) {
        sum += Number(val) * 2;
        totalWeight += 2;
      }
    }

    if (totalWeight === 0) return null;
    return Number((sum / totalWeight).toFixed(1));
  };

  // 2. Tính Điểm Tổng Kết Mô Đun Hệ 10 (Trọng số DQT 40% + Thi 60%)
  // Nếu chưa có điểm quá trình nhưng đã có điểm thi, linh hoạt lấy điểm thi để quy chuyển
  const calculateFinalGrade10 = (
    dqt: number | null, 
    examScore: number | null | undefined
  ): number | null => {
    const hasExam = isValidScore(examScore);
    const hasDqt = dqt !== null;

    if (!hasExam && !hasDqt) return null;
    if (hasExam && hasDqt) {
      return Number(((dqt! * 0.4) + (Number(examScore) * 0.6)).toFixed(1));
    }
    if (hasExam && !hasDqt) {
      return Number(Number(examScore).toFixed(1));
    }
    return null;
  };

  // 4. Quy tắc Đánh giá Trạng thái & Ghi chú mô đun chuẩn GDNN
  const evaluateStudentStatus = (
    g: StudentGrade | null, 
    customTxCount: number, 
    customDkCount: number
  ): { status: 'Đạt' | 'Thi lại' | 'Học lại' | 'Chưa có'; badgeClass: string } => {
    if (!g) return { status: 'Chưa có', badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200' };

    const txArr = g.txScores || [g.regularScore1, g.regularScore2];
    const dkArr = g.dkScores || [g.midtermScore];

    let txEntered = 0;
    for (let i = 0; i < customTxCount; i++) {
      const val = txArr[i] !== undefined ? txArr[i] : (i === 0 ? g.regularScore1 : i === 1 ? g.regularScore2 : undefined);
      if (isValidScore(val)) txEntered++;
    }

    let dkEntered = 0;
    for (let i = 0; i < customDkCount; i++) {
      const val = dkArr[i] !== undefined ? dkArr[i] : (i === 0 ? g.midtermScore : undefined);
      if (isValidScore(val)) dkEntered++;
    }

    const hasExamL1 = isValidScore(g.finalExamScore);
    const hasExamL2 = isValidScore(g.finalExamScoreL2);

    // Chưa có: Khi sinh viên hoàn toàn không có bất kỳ điểm thành phần hay điểm thi nào
    if (txEntered === 0 && dkEntered === 0 && !hasExamL1 && !hasExamL2) {
      return { status: 'Chưa có', badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200' };
    }

    const totalExpectedComponents = customTxCount + customDkCount;
    const totalEnteredComponents = txEntered + dkEntered;
    const missingRatio = (totalExpectedComponents - totalEnteredComponents) / totalExpectedComponents;

    const dqt = calculateProcessGrade(g, customTxCount, customDkCount);

    // Xử lý khi đã có điểm thi Lần 2 (Thi lại / Cải thiện điểm)
    if (hasExamL2) {
      const final10L2 = calculateFinalGrade10(dqt, g.finalExamScoreL2);
      if (final10L2 !== null && final10L2 >= 4.0 && Number(g.finalExamScoreL2) >= 4.0) {
        return { status: 'Đạt', badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
      }
      return { status: 'Học lại', badgeClass: 'bg-red-100 text-red-800 border border-red-300' };
    }

    // Các trường hợp Học lại:
    // 1. Không có hệ số 1 và hệ số 2 nào được nhập
    // 2. Thiếu > 30% thành phần quá trình
    // 3. Điểm quá trình (dqt < 4.0) không đủ điều kiện dự thi
    if (totalEnteredComponents === 0 && hasExamL1) {
      return { status: 'Học lại', badgeClass: 'bg-red-100 text-red-800 border border-red-300' };
    }
    if (missingRatio > 0.3 && (hasExamL1 || totalEnteredComponents > 0)) {
      return { status: 'Học lại', badgeClass: 'bg-red-100 text-red-800 border border-red-300' };
    }
    if (dqt !== null && dqt < 4.0) {
      return { status: 'Học lại', badgeClass: 'bg-red-100 text-red-800 border border-red-300' };
    }

    // Các trường hợp Thi lại:
    // 1. Đủ điểm quá trình nhưng chưa có điểm thi L1
    // 2. Điểm thi Lần 1 < 4.0
    // 3. Điểm thi >= 4.0 nhưng tổng kết < 4.0
    const final10L1 = calculateFinalGrade10(dqt, g.finalExamScore);
    if (!hasExamL1) {
      return { status: 'Thi lại', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300' };
    }
    if (Number(g.finalExamScore) < 4.0) {
      return { status: 'Thi lại', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300' };
    }
    if (final10L1 !== null && final10L1 < 4.0) {
      return { status: 'Thi lại', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300' };
    }

    // Đạt: Điểm tổng kết chung >= 4.0 và điểm thi >= 4.0 và đầy đủ thành phần
    if (final10L1 !== null && final10L1 >= 4.0 && Number(g.finalExamScore) >= 4.0) {
      return { status: 'Đạt', badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
    }

    return { status: 'Thi lại', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300' };
  };

  // Cập nhật điểm TX (Hệ số 1)
  const handleTxScoreChange = (studentId: string, index: number, valStr: string) => {
    if (isLocked) {
      showToast('🔒 Sổ điểm đã bị khóa! Không thể chỉnh sửa.');
      return;
    }
    const val = valStr === '' || valStr === '///' ? undefined : Number(valStr);
    const existing = findStudentGrade(studentId, selectedModuleId) || {
      studentId,
      moduleId: selectedModuleId,
      regularScore1: 0,
      regularScore2: 0,
      midtermScore: 0,
      finalExamScore: 0,
      finalGrade10: 0,
      finalGrade4: 0,
      letterGrade: 'F',
      isPassed: false,
      retakeCount: 0,
      txScores: [],
      dkScores: []
    };

    const currentTx = [...(existing.txScores || [existing.regularScore1, existing.regularScore2])];
    if (val !== undefined && !isNaN(val)) {
      currentTx[index] = Math.min(10, Math.max(0, val));
    } else {
      delete currentTx[index];
    }

    const updatedGrade: StudentGrade = {
      ...existing,
      txScores: currentTx,
      regularScore1: currentTx[0] ?? 0,
      regularScore2: currentTx[1] ?? 0
    };

    const dqt = calculateProcessGrade(updatedGrade, txCount, dkCount);
    const final10 = calculateFinalGrade10(dqt, updatedGrade.finalExamScore);
    const { score4, letter } = convertTo4AndLetter(final10);

    updatedGrade.finalGrade10 = final10 ?? 0;
    updatedGrade.finalGrade4 = score4 ?? 0;
    updatedGrade.letterGrade = (letter as any) || 'F';
    updatedGrade.isPassed = (final10 ?? 0) >= 4.0 && (updatedGrade.finalExamScore ?? 0) >= 4.0;

    onUpdateGrade(updatedGrade);
  };

  // Cập nhật điểm ĐK (Hệ số 2)
  const handleDkScoreChange = (studentId: string, index: number, valStr: string) => {
    if (isLocked) {
      showToast('🔒 Sổ điểm đã bị khóa! Không thể chỉnh sửa.');
      return;
    }
    const val = valStr === '' || valStr === '///' ? undefined : Number(valStr);
    const existing = findStudentGrade(studentId, selectedModuleId) || {
      studentId,
      moduleId: selectedModuleId,
      regularScore1: 0,
      regularScore2: 0,
      midtermScore: 0,
      finalExamScore: 0,
      finalGrade10: 0,
      finalGrade4: 0,
      letterGrade: 'F',
      isPassed: false,
      retakeCount: 0,
      txScores: [],
      dkScores: []
    };

    const currentDk = [...(existing.dkScores || [existing.midtermScore])];
    if (val !== undefined && !isNaN(val)) {
      currentDk[index] = Math.min(10, Math.max(0, val));
    } else {
      delete currentDk[index];
    }

    const updatedGrade: StudentGrade = {
      ...existing,
      dkScores: currentDk,
      midtermScore: currentDk[0] ?? 0
    };

    const dqt = calculateProcessGrade(updatedGrade, txCount, dkCount);
    const final10 = calculateFinalGrade10(dqt, updatedGrade.finalExamScore);
    const { score4, letter } = convertTo4AndLetter(final10);

    updatedGrade.finalGrade10 = final10 ?? 0;
    updatedGrade.finalGrade4 = score4 ?? 0;
    updatedGrade.letterGrade = (letter as any) || 'F';
    updatedGrade.isPassed = (final10 ?? 0) >= 4.0 && (updatedGrade.finalExamScore ?? 0) >= 4.0;

    onUpdateGrade(updatedGrade);
  };

  // Cập nhật điểm Thi Lần 1 (Trọng số 60%)
  const handleExamScoreChange = (studentId: string, valStr: string) => {
    if (isLocked) {
      showToast('🔒 Sổ điểm đã bị khóa! Không thể chỉnh sửa.');
      return;
    }
    const val = valStr === '' || valStr === '///' ? undefined : Number(valStr);
    const existing = findStudentGrade(studentId, selectedModuleId) || {
      studentId,
      moduleId: selectedModuleId,
      regularScore1: 0,
      regularScore2: 0,
      midtermScore: 0,
      finalExamScore: 0,
      finalGrade10: 0,
      finalGrade4: 0,
      letterGrade: 'F',
      isPassed: false,
      retakeCount: 0
    };

    const cleanExam = val !== undefined && !isNaN(val) ? Math.min(10, Math.max(0, val)) : undefined;
    const updatedGrade: StudentGrade = {
      ...existing,
      finalExamScore: cleanExam as any
    };

    const dqt = calculateProcessGrade(updatedGrade, txCount, dkCount);
    const final10 = cleanExam !== undefined ? calculateFinalGrade10(dqt, cleanExam) : null;
    const { score4, letter } = convertTo4AndLetter(final10);

    updatedGrade.finalGrade10 = final10 ?? 0;
    updatedGrade.finalGrade4 = score4 ?? 0;
    updatedGrade.letterGrade = (letter as any) || 'F';
    updatedGrade.isPassed = cleanExam !== undefined && (final10 ?? 0) >= 4.0 && cleanExam >= 4.0;

    onUpdateGrade(updatedGrade);
  };

  // Cập nhật điểm Thi Lần 2 (Thi lại / cải thiện)
  const handleExamScoreL2Change = (studentId: string, valStr: string) => {
    if (isLocked) {
      showToast('🔒 Sổ điểm đã bị khóa! Không thể chỉnh sửa.');
      return;
    }
    const val = valStr === '' || valStr === '///' ? undefined : Number(valStr);
    const existing = findStudentGrade(studentId, selectedModuleId) || {
      studentId,
      moduleId: selectedModuleId,
      regularScore1: 0,
      regularScore2: 0,
      midtermScore: 0,
      finalExamScore: 0,
      finalGrade10: 0,
      finalGrade4: 0,
      letterGrade: 'F',
      isPassed: false,
      retakeCount: 1
    };

    const cleanExamL2 = val !== undefined && !isNaN(val) ? Math.min(10, Math.max(0, val)) : undefined;
    const dqt = calculateProcessGrade(existing, txCount, dkCount);
    const final10L2 = cleanExamL2 !== undefined ? calculateFinalGrade10(dqt, cleanExamL2) : undefined;
    const { score4: score4L2, letter: letterL2 } = convertTo4AndLetter(final10L2 ?? null);

    const updatedGrade: StudentGrade = {
      ...existing,
      finalExamScoreL2: cleanExamL2,
      finalGrade10L2: final10L2 ?? undefined,
      finalGrade4L2: score4L2 ?? undefined,
      letterGradeL2: (letterL2 as any) || undefined,
      retakeCount: Math.max(existing.retakeCount || 0, 1),
      isPassed: ((final10L2 ?? existing.finalGrade10) >= 4.0) && ((cleanExamL2 ?? existing.finalExamScore) >= 4.0)
    };

    onUpdateGrade(updatedGrade);
  };

  // Cập nhật ghi chú cá nhân hóa của giáo viên
  const handleTeacherNoteChange = (studentId: string, noteStr: string) => {
    if (isLocked) return;
    const existing = findStudentGrade(studentId, selectedModuleId) || {
      studentId,
      moduleId: selectedModuleId,
      regularScore1: 0,
      regularScore2: 0,
      midtermScore: 0,
      finalExamScore: 0,
      finalGrade10: 0,
      finalGrade4: 0,
      letterGrade: 'F',
      isPassed: false,
      retakeCount: 0
    };
    onUpdateGrade({ ...existing, teacherNote: noteStr });
  };

  const handleExportExcel = () => {
    try {
      const dataRows: any[] = [];
      dataRows.push([`SỔ ĐIỂM ĐIỆN TỬ MÔ ĐUN - LỚP ${currentClass}`]);
      dataRows.push([`Mô đun: ${currentModule.id} - ${currentModule.name} (${currentModule.credits} Tín chỉ)`]);
      dataRows.push([`Học kỳ: ${selectedSemester} | Năm học: ${academicYear}`]);
      dataRows.push([]);

      const headerRow = ['STT', 'Mã SV', 'Họ và đệm', 'Tên', 'Ngày sinh'];
      for (let i = 1; i <= txCount; i++) headerRow.push(`TX${i} (HS1)`);
      for (let i = 1; i <= dkCount; i++) headerRow.push(`ĐK${i} (HS2)`);
      headerRow.push('Thi L1 (60%)', 'Thi L2', 'Tổng kết L1', 'Tổng kết L2', 'Điểm chữ L1', 'Thang 4 L1', 'Trạng thái / Ghi chú');
      dataRows.push(headerRow);

      classStudents.forEach((s, idx) => {
        const g = findStudentGrade(s.id, selectedModuleId);
        const parts = s.fullName.trim().split(' ');
        const lastName = parts.pop() || '';
        const middleName = parts.join(' ');
        const txArr = g?.txScores || [g?.regularScore1, g?.regularScore2];
        const dkArr = g?.dkScores || [g?.midtermScore];

        const dqt = calculateProcessGrade(g, txCount, dkCount);
        const final10L1 = calculateFinalGrade10(dqt, g?.finalExamScore);
        const { score4: score4L1, letter: letterL1 } = convertTo4AndLetter(final10L1);
        const final10L2 = g?.finalExamScoreL2 !== undefined && g?.finalExamScoreL2 !== null
          ? calculateFinalGrade10(dqt, g.finalExamScoreL2)
          : null;
        const statusObj = evaluateStudentStatus(g, txCount, dkCount);

        const row: any[] = [
          idx + 1,
          s.id,
          middleName,
          lastName,
          s.birthDate || ''
        ];

        for (let i = 0; i < txCount; i++) {
          row.push(txArr[i] !== undefined && txArr[i] !== null ? txArr[i] : '');
        }
        for (let i = 0; i < dkCount; i++) {
          row.push(dkArr[i] !== undefined && dkArr[i] !== null ? dkArr[i] : '');
        }

        row.push(
          g?.finalExamScore !== undefined && g?.finalExamScore !== null ? g.finalExamScore : '',
          g?.finalExamScoreL2 !== undefined && g?.finalExamScoreL2 !== null ? g.finalExamScoreL2 : '',
          final10L1 !== null ? Number(final10L1.toFixed(1)) : '',
          final10L2 !== null ? Number(final10L2.toFixed(1)) : '',
          letterL1 || '',
          score4L1 !== null ? score4L1 : '',
          statusObj.status + (g?.teacherNote ? ` (${g.teacherNote})` : '')
        );

        dataRows.push(row);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'SoDiemDienTu');

      const safeModName = currentModule.id.replace(/[^a-zA-Z0-9]/g, '_');
      const safeClassName = currentClass.replace(/[^a-zA-Z0-9._-]/g, '_');
      XLSX.writeFile(workbook, `SoDiem_Modun_${safeModName}_Lop_${safeClassName}.xlsx`);

      showToast(`✅ Đã xuất và tải về máy tệp Excel sổ điểm mô đun ${currentModule.id} thành công!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Lỗi khi xuất tệp Excel. Vui lòng thử lại.');
    }
  };

  const handlePrintGradebook = () => {
    window.print();
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
        className="text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-blue-900 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-white">
              Sổ Điểm Điện Tử Mô Đun (Cả Lớp)
            </h2>
            <p className="text-[11px] text-blue-100">
              Quản lý định mức điểm kiểm tra thường xuyên (hệ số 1), định kỳ (hệ số 2) & thi kết thúc mô đun chuẩn Thông tư 04/2022/TT-BLĐTBXH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintGradebook}
            className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
          >
            <Printer className="w-3.5 h-3.5 text-yellow-300" />
            <span>In Sổ Điểm</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filter Bar with Editable Tỷ lệ điểm (Mặc định 122, tối đa 5 TX, 8 ĐK) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="font-semibold text-slate-700">Năm học:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-white border border-slate-300 font-bold rounded px-2 py-0.5 text-slate-800 focus:outline-none"
            >
              <option value="2025 - 2028">2025 - 2028</option>
              <option value="2026 - 2027">2026 - 2027</option>
              <option value="2024 - 2027">2024 - 2027</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="font-semibold text-slate-700">Kỳ học:</span>
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(Number(e.target.value))}
              className="bg-white border border-slate-300 font-bold rounded px-2 py-0.5 text-slate-800 focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map(k => (
                <option key={k} value={k}>Kỳ {k} (HK{k})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="font-semibold text-slate-700">Mô đun:</span>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="bg-white border border-slate-300 font-bold rounded px-2 py-0.5 text-slate-800 focus:outline-none max-w-[240px] truncate cursor-pointer"
              title={`Danh sách môn học / mô đun được phân bổ trong Kỳ ${selectedSemester} theo BẢNG QUẢN TRỊ CHƯƠNG TRÌNH`}
            >
              {semesterModules.length > 0 ? (
                semesterModules.map(m => (
                  <option key={m.id} value={m.id}>{m.id} - {m.name} ({m.credits} TC)</option>
                ))
              ) : (
                <option value="" disabled>-- Chưa có mô đun trong Kỳ {selectedSemester} --</option>
              )}
            </select>
            {onOpenCurriculumModal && (
              <button
                type="button"
                onClick={onOpenCurriculumModal}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                title="Mở Bảng Quản Trị Chương Trình Khung để phân bổ và điều chỉnh mô đun giữa các học kỳ"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="font-semibold text-slate-700">Số TC:</span>
            <input 
              type="number" 
              value={currentModule.credits || 3} 
              readOnly
              className="w-12 bg-white border border-slate-300 font-bold rounded px-1.5 py-0.5 text-center text-blue-800"
            />
          </div>

          {/* Tỷ lệ điểm tùy chỉnh (Mặc định 122 = 1 TX, 2 ĐK; cho phép nhập 1222, 111222; tối đa 5 TX, 8 ĐK) */}
          <div className="flex items-center gap-1.5 bg-blue-50/90 px-3 py-1.5 rounded-xl border border-blue-200">
            <span className="font-bold text-[#004e92]">Tỷ lệ điểm:</span>
            <input
              type="text"
              value={scoreRatio}
              onChange={(e) => setScoreRatio(e.target.value)}
              placeholder="VD: 122"
              className="w-24 bg-white border border-blue-400 font-black text-center rounded px-1.5 py-0.5 text-[#004e92] text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              title="Nhập cấu trúc tỷ lệ (VD: 122 = 1 TX & 2 ĐK; 1222 = 1 TX & 3 ĐK; 111222 = 3 TX & 3 ĐK; tối đa 5 TX, 8 ĐK)"
            />
            <span className="text-[10px] text-blue-800 font-semibold">({txCount} TX hs1, {dkCount} ĐK hs2)</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              const totalCreds = semesterModules.reduce((acc, cur) => acc + (Number(cur.credits) || 0), 0);
              showToast(`🧮 Đã tính điểm TBC Kỳ ${selectedSemester} (${semesterModules.length} mô đun, ${totalCreds} tín chỉ) cho toàn bộ lớp ${currentClass}`);
            }}
            className="px-3.5 py-1.5 bg-[#004e92] hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tính Điểm TBC Học Kỳ</span>
          </button>
        </div>
      </div>

      {/* Second Toolbar: Search, Clear, Sync, Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <button
            onClick={() => {
              if (onClearModuleGrades && !isLocked) {
                setConfirmDialog({
                  isOpen: true,
                  title: `XÓA TRẮNG ĐIỂM MÔ ĐUN ${selectedModuleId}`,
                  message: `Thầy/Cô có chắc chắn muốn xóa trắng toàn bộ ô điểm của mô đun ${selectedModuleId}?`,
                  confirmText: 'Xóa trắng',
                  onConfirm: () => {
                    onClearModuleGrades(selectedModuleId);
                    showToast(`🧹 Đã xóa trắng ô điểm mô đun ${selectedModuleId}`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Xóa trắng ô điểm</span>
          </button>

          <button
            onClick={() => showToast(`🔄 Đã đồng bộ điểm mô đun ${selectedModuleId} với hệ thống đào tạo trung tâm.`)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#004e92] font-bold rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 text-[#004e92]" />
            <span>Đồng bộ điểm</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${selectedGroupFilter === 'all' ? 'bg-[#004e92] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cả lớp ({classStudents.length})
            </button>
            <button
              onClick={() => setSelectedGroupFilter(1)}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${selectedGroupFilter === 1 ? 'bg-[#004e92] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tổ 1
            </button>
            <button
              onClick={() => setSelectedGroupFilter(2)}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${selectedGroupFilter === 2 ? 'bg-[#004e92] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tổ 2
            </button>
          </div>

          <button
            onClick={() => showToast(`📋 Đã tổng hợp danh sách sinh viên cần học lại / thi lại mô đun ${selectedModuleId}`)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Tổng hợp Học lại / Thi lại</span>
          </button>
        </div>
      </div>

      {/* Main Electronic Gradebook Table - Đồng bộ màu nền Head màu xanh chuẩn cho toàn bộ header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead 
              style={{ backgroundColor: primaryHeadColor }}
              className="text-white uppercase font-bold sticky top-0 z-20 text-[11px] select-none"
            >
              {/* Row 1: Nhóm cột chính */}
              <tr className="border-b border-blue-900">
                <th rowSpan={2} className="py-2.5 px-2 text-center w-10 border-r border-blue-900 bg-[#004e92]">TT</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900 min-w-[95px] bg-[#004e92]">Mã SV</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900 min-w-[130px] bg-[#004e92]">Họ và đệm</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900 min-w-[90px] bg-[#004e92]">Tên</th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-center border-r border-blue-900 min-w-[90px] bg-[#004e92]">Ngày sinh</th>
                
                {/* Dynamic TX Columns (Up to 5) */}
                <th colSpan={txCount} className="py-2 px-2 text-center border-r border-blue-900 bg-[#0284c7]">
                  Thường xuyên <span className="font-normal normal-case text-[10px]">(HS 1)</span>
                </th>
                
                {/* Dynamic ĐK Columns (Up to 8) */}
                <th colSpan={dkCount} className="py-2 px-2 text-center border-r border-blue-900 bg-[#004e92]">
                  Định kỳ <span className="font-normal normal-case text-[10px]">(HS 2)</span>
                </th>

                <th colSpan={2} className="py-2 px-2 text-center border-r border-blue-900 bg-[#0369a1]">
                  Thi <span className="font-normal normal-case text-[10px]">(60%)</span>
                </th>
                <th colSpan={2} className="py-2 px-2 text-center border-r border-blue-900 bg-[#003870]">
                  Tổng kết <span className="font-normal normal-case text-[10px]">(Hệ 10)</span>
                </th>
                <th colSpan={2} className="py-2 px-2 text-center border-r border-blue-900 bg-[#002f60]">
                  Điểm chữ
                </th>
                <th colSpan={2} className="py-2 px-2 text-center border-r border-blue-900 bg-[#002447]">
                  Thang 4
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-center min-w-[170px] bg-[#003870]">
                  Ghi chú
                </th>
              </tr>

              {/* Row 2: Phân cột chi tiết TX, ĐK, Thi L1/L2, Tổng kết L1/L2, Điểm chữ L1/L2, Thang 4 L1/L2 */}
              <tr className="border-b border-blue-900 text-[10px] text-center">
                {Array.from({ length: txCount }).map((_, i) => (
                  <th key={`tx-sub-${i}`} className="py-1.5 px-2 border-r border-blue-900 bg-[#0284c7] w-16">
                    TX{i + 1}
                  </th>
                ))}
                {Array.from({ length: dkCount }).map((_, i) => (
                  <th key={`dk-sub-${i}`} className="py-1.5 px-2 border-r border-blue-900 bg-[#004e92] w-16">
                    ĐK{i + 1}
                  </th>
                ))}
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#0369a1] w-16">L1</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#0369a1] w-16">L2</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#003870] w-16">L1</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#003870] w-16">L2</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#002f60] w-16">L1</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#002f60] w-16">L2</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#002447] w-16">L1</th>
                <th className="py-1.5 px-2 border-r border-blue-900 bg-[#002447] w-16">L2</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={15 + txCount + dkCount} className="py-12 text-center text-slate-400">
                    Không tìm thấy sinh viên nào phù hợp trong lớp {currentClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const g = findStudentGrade(s.id, selectedModuleId);
                  const parts = s.fullName.trim().split(' ');
                  const lastName = parts.pop() || '';
                  const middleName = parts.join(' ');

                  const dqt = calculateProcessGrade(g, txCount, dkCount);
                  const final10L1 = calculateFinalGrade10(dqt, g?.finalExamScore);
                  const { score4: score4L1, letter: letterL1 } = convertTo4AndLetter(final10L1);

                  const final10L2 = g?.finalExamScoreL2 !== undefined && g?.finalExamScoreL2 !== null
                    ? calculateFinalGrade10(dqt, g.finalExamScoreL2)
                    : null;
                  const { score4: score4L2, letter: letterL2 } = convertTo4AndLetter(final10L2);

                  const statusObj = evaluateStudentStatus(g, txCount, dkCount);

                  const txArr = g?.txScores || [g?.regularScore1, g?.regularScore2];
                  const dkArr = g?.dkScores || [g?.midtermScore];

                  return (
                    <tr 
                      key={`${s.id}-${idx}`}
                      className="hover:bg-blue-50/40 transition bg-white"
                    >
                      <td className="py-2 px-2 text-center font-semibold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-800 border-r border-slate-200 whitespace-nowrap">{s.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">{middleName}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">{lastName}</td>
                      <td className="py-2 px-2.5 text-center font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">{s.birthDate || '02/04/2007'}</td>
                      
                      {/* Dynamic TX Inputs (Hệ số 1, Tối đa 5 cột) */}
                      {Array.from({ length: txCount }).map((_, i) => {
                        const cellVal = txArr[i] !== undefined && txArr[i] !== null ? txArr[i] : undefined;
                        return (
                          <td key={`tx-cell-${i}`} className="py-1 px-1 text-center border-r border-slate-200">
                            <ScoreInputCell
                              value={cellVal}
                              onChange={(valStr) => handleTxScoreChange(s.id, i, valStr)}
                              disabled={isLocked}
                              placeholder="—"
                              className="text-slate-800 border-slate-300 focus:ring-blue-600 bg-slate-50/50"
                            />
                          </td>
                        );
                      })}

                      {/* Dynamic ĐK Inputs (Hệ số 2, Tối đa 8 cột) */}
                      {Array.from({ length: dkCount }).map((_, i) => {
                        const cellVal = dkArr[i] !== undefined && dkArr[i] !== null ? dkArr[i] : undefined;
                        return (
                          <td key={`dk-cell-${i}`} className="py-1 px-1 text-center border-r border-slate-200">
                            <ScoreInputCell
                              value={cellVal}
                              onChange={(valStr) => handleDkScoreChange(s.id, i, valStr)}
                              disabled={isLocked}
                              placeholder="—"
                              className="text-slate-800 border-slate-300 focus:ring-blue-600 bg-slate-50/50"
                            />
                          </td>
                        );
                      })}

                      {/* Thi L1 Input */}
                      <td className="py-1 px-1 text-center border-r border-slate-200">
                        <ScoreInputCell
                          value={g?.finalExamScore !== undefined && g?.finalExamScore !== null ? g.finalExamScore : undefined}
                          onChange={(valStr) => handleExamScoreChange(s.id, valStr)}
                          disabled={isLocked}
                          placeholder="—"
                          className="text-blue-900 border-slate-300 focus:ring-blue-600 bg-blue-50/30"
                        />
                      </td>

                      {/* Thi L2 Input (Dành cho thi lại / cải thiện điểm) */}
                      <td className="py-1 px-1 text-center border-r border-slate-200">
                        <ScoreInputCell
                          value={g?.finalExamScoreL2 !== undefined && g?.finalExamScoreL2 !== null ? g.finalExamScoreL2 : undefined}
                          onChange={(valStr) => handleExamScoreL2Change(s.id, valStr)}
                          disabled={isLocked}
                          placeholder="—"
                          className="text-indigo-900 border-slate-300 focus:ring-indigo-600 bg-slate-50/50"
                        />
                      </td>

                      {/* Tổng kết L1 (Tự động tính: DQT * 0.4 + Thi L1 * 0.6) */}
                      <td className="py-1.5 px-2 text-center font-mono font-black text-blue-900 bg-blue-50/30 border-r border-slate-200">
                        {final10L1 !== null ? final10L1.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Tổng kết L2 (DQT * 0.4 + Thi L2 * 0.6) */}
                      <td className="py-1.5 px-2 text-center font-mono font-black text-indigo-900 bg-indigo-50/30 border-r border-slate-200">
                        {final10L2 !== null ? final10L2.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Điểm chữ L1 */}
                      <td className="py-1.5 px-2 text-center font-bold bg-blue-50/30 border-r border-slate-200">
                        {letterL1 ? (
                          <span className={letterL1 === 'F' ? 'text-rose-600 font-black' : 'text-slate-800'}>
                            {letterL1}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Điểm chữ L2 */}
                      <td className="py-1.5 px-2 text-center font-bold bg-indigo-50/30 border-r border-slate-200">
                        {letterL2 ? (
                          <span className={letterL2 === 'F' ? 'text-rose-600 font-black' : 'text-slate-800'}>
                            {letterL2}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Thang điểm 4 L1 */}
                      <td className="py-1.5 px-2 text-center font-mono font-bold bg-slate-50 border-r border-slate-200">
                        {score4L1 !== null ? score4L1.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Thang điểm 4 L2 */}
                      <td className="py-1.5 px-2 text-center font-mono font-bold bg-slate-50 border-r border-slate-200">
                        {score4L2 !== null ? score4L2.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Ghi chú: Hiển thị trạng thái tự động và ô nhập ghi chú cá nhân */}
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold inline-block whitespace-nowrap shadow-2xs ${statusObj.badgeClass}`}>
                            {statusObj.status}
                          </span>
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

      {/* Footer Bar - Đồng bộ phong cách các nút bấm */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-700 font-medium">
          Đang quản lý sổ điểm mô đun: <strong className="text-[#004e92]">{currentModule.name} ({currentModule.id})</strong> • Lớp: <strong className="text-slate-900">{currentClass}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Đã đóng sổ điểm điện tử.')}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-700 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              setIsLocked(!isLocked);
              showToast(isLocked ? '🔓 Đã mở khóa sổ điểm điện tử.' : '🔒 Đã khóa sổ điểm điện tử thành công.');
            }}
            className={`px-4 py-2 font-bold rounded-xl text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isLocked ? 'Mở Khóa Sổ Điểm' : 'Khóa Sổ Điểm'}</span>
          </button>
          <button
            onClick={() => showToast(`💾 Đã lưu thành công Sổ Điểm Điện Tử mô đun ${selectedModuleId} vào hệ thống cơ sở dữ liệu.`)}
            className="px-5 py-2 bg-[#004e92] hover:bg-blue-800 font-bold rounded-xl text-white transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-3.5 h-3.5 text-yellow-300" />
            <span>Lưu Sổ Điểm Điện Tử</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-300">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
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
                {confirmDialog.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
