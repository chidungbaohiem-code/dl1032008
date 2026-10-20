/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { DashboardHome } from './components/DashboardHome';
import { UnitInfoModule } from './components/UnitInfoModule';
import { OrganizationModule } from './components/OrganizationModule';
import { StudentProfilesModule } from './components/StudentProfilesModule';
import { GradeManagementModule } from './components/GradeManagementModule';
import { AttendanceAndRenLuyenModule } from './components/AttendanceAndRenLuyenModule';
import { RetakeAndRemedialModule } from './components/RetakeAndRemedialModule';
import { ReportsAndFundModule } from './components/ReportsAndFundModule';
import { BackupAndFormsModule } from './components/BackupAndFormsModule';
import { StudentPortalModule } from './components/StudentPortalModule';
import { QuickToolsModal } from './components/QuickToolsModal';
import { ThemeSetupModal } from './components/ThemeSetupModal';
import { UnitInfoModal } from './components/UnitInfoModal';
import { CurriculumFrameworkModal } from './components/CurriculumFrameworkModal';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { DriveSyncModal } from './components/DriveSyncModal';
import { ParsedImportData, dataImportService } from './services/dataImportService';
import { loadCurriculumForSystem } from './data/curriculumData';
import { loadUserAccounts, saveUserAccounts, loadCurrentAuthUser, saveCurrentAuthUser } from './data/authData';
import { safeLocalStorage } from './utils/storage';
import { 
  ActiveTab, 
  AcademicYear, 
  ClassId, 
  Student, 
  StudentGrade, 
  AttendanceRecord, 
  RenLuyenCriteria, 
  FundTransaction, 
  WorkshopSafetyLog,
  ThemeSettings,
  DEFAULT_THEME_SETTINGS,
  UnitInfoSettings,
  DEFAULT_UNIT_INFO_SETTINGS,
  ClassItem,
  SubjectModule,
  UserAccount,
  SyncStatus
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_MODULES, 
  INITIAL_GRADES, 
  INITIAL_ATTENDANCE, 
  INITIAL_REN_LUYEN, 
  INITIAL_FUND_TRANSACTIONS, 
  INITIAL_WORKSHOP_LOGS,
  INITIAL_CLASSES
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('2025 - 2028');
  const [currentClass, setCurrentClass] = useState<ClassId>('CĐK19.2-OT1.CLC');
  const [isPublicPortalActive, setIsPublicPortalActive] = useState<boolean>(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      return hash.includes('portal') || search.includes('portal') || hash.includes('tra-cuu');
    } catch {
      return false;
    }
  });

  // Persistence in local storage with safe parsing (preserves empty arrays when deleted)
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_classes');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_students');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Chuẩn hóa và làm sạch dữ liệu, đảm bảo mỗi sinh viên đều có classId rõ ràng
          const seenKeys = new Set<string>();
          const sanitized: Student[] = [];
          parsed.forEach((s: any, idx: number) => {
            if (!s) return;
            let id = String(s.id || '').trim();
            const classId = (s.classId || 'CĐK19.2-OT1.CLC').trim();
            if (!id) {
              const prefix = classId.replace(/[^a-zA-Z0-9]/g, '');
              id = `${prefix}-${String(idx + 1).padStart(3, '0')}`;
            }
            const key = `${classId.toLowerCase()}::${id}`;
            if (seenKeys.has(key)) {
              id = `${id}-${idx + 1}`;
            }
            seenKeys.add(`${classId.toLowerCase()}::${id}`);
            sanitized.push({ ...s, id, classId });
          });
          return sanitized;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_STUDENTS;
  });

  const [modules, setModules] = useState(() => INITIAL_MODULES);

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_grades');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_GRADES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_attendance');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_ATTENDANCE;
  });

  const [renLuyen, setRenLuyen] = useState<RenLuyenCriteria[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_ren_luyen');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_REN_LUYEN;
  });

  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_fund');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Map(parsed.map((t: any) => [t.id || JSON.stringify(t), t])).values());
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_FUND_TRANSACTIONS;
  });

  const [workshopLogs, setWorkshopLogs] = useState<WorkshopSafetyLog[]>(() => {
    try {
      const saved = safeLocalStorage.get('oto_workshop');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Map(parsed.map((l: any) => [l.id || JSON.stringify(l), l])).values());
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_WORKSHOP_LOGS;
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isUnitInfoModalOpen, setIsUnitInfoModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [selectedCurriculumSystem, setSelectedCurriculumSystem] = useState<string>('HỆ CAO ĐẲNG CHÍNH QUY');
  const [isDriveSyncModalOpen, setIsDriveSyncModalOpen] = useState(false);

  // Hệ thống Tài khoản, Xác thực & Phân quyền RBAC chuẩn GDNN
  const [users, setUsers] = useState<UserAccount[]>(() => loadUserAccounts());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentAuthUser());
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  useEffect(() => {
    saveUserAccounts(users);
  }, [users]);

  useEffect(() => {
    saveCurrentAuthUser(currentUser);
  }, [currentUser]);



  const handleRegisterTeacher = (newUser: UserAccount) => {
    setUsers(prev => {
      const existingIdx = prev.findIndex(
        u => u.id === newUser.id || u.email.toLowerCase().trim() === newUser.email.toLowerCase().trim()
      );
      let updated: UserAccount[];
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...newUser };
      } else {
        updated = [...prev, newUser];
      }
      saveUserAccounts(updated);
      return updated;
    });
  };

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    saveUserAccounts(newUsers);
    if (currentUser) {
      const updatedSelf = newUsers.find(u => u.id === currentUser.id);
      if (updatedSelf) {
        setCurrentUser(updatedSelf);
        saveCurrentAuthUser(updatedSelf);
      }
    }
  };

  const handleUpdateClassesFromUserMgmt = (newClasses: ClassItem[]) => {
    setClasses(newClasses);
    safeLocalStorage.set('oto_classes', JSON.stringify(newClasses));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentAuthUser(null);
    setActiveTab('home');
  };

  // Bảo vệ phân quyền truy cập tab theo vai trò (Admin hiện đầy đủ, Người dùng ẩn TT đơn vị & QL lớp, Sinh viên chỉ điểm danh)
  useEffect(() => {
    if (currentUser?.role === 'student') {
      if (activeTab !== 'attendance') {
        setActiveTab('attendance');
      }
    } else if (currentUser?.role === 'teacher') {
      if (activeTab === 'unit-info' || activeTab === 'organization') {
        setActiveTab('students');
      }
    }
  }, [currentUser, activeTab]);

  const pendingUsersCount = users.filter(u => u.status === 'pending').length;

  // Đồng bộ chương trình khung theo hệ đào tạo của lớp hiện tại
  const currentClassObj = classes.find(c => c.id === currentClass);
  const currentTrainingSystem = currentClassObj?.trainingSystem || 'Hệ Cao Đẳng Chính Quy';

  useEffect(() => {
    const curMods = loadCurriculumForSystem(currentTrainingSystem);
    if (curMods && curMods.length > 0) {
      setModules(curMods);
    }
  }, [currentClass, currentTrainingSystem]);

  const handleOpenCurriculumModal = (systemName: string) => {
    setSelectedCurriculumSystem(systemName);
    setIsCurriculumModalOpen(true);
  };

  const handleApplyCurriculum = (systemName: string, updatedModules: SubjectModule[]) => {
    const normSys = systemName.toLowerCase();
    const normCur = currentTrainingSystem.toLowerCase();
    if (
      (normSys.includes('chính quy') && !normCur.includes('liên thông') && !normCur.includes('trung cấp')) ||
      (normSys.includes('liên thông') && normCur.includes('liên thông')) ||
      (normSys.includes('trung cấp') && normCur.includes('trung cấp'))
    ) {
      setModules(updatedModules);
    }
  };

  // Unit info settings state with local storage persistence (Hình 2)
  const [unitInfo, setUnitInfo] = useState<UnitInfoSettings>(() => {
    try {
      const saved = safeLocalStorage.get('oto_unit_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_UNIT_INFO_SETTINGS, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_UNIT_INFO_SETTINGS;
  });

  // Theme settings state with local storage persistence
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = safeLocalStorage.get('oto_theme_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_THEME_SETTINGS, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_THEME_SETTINGS;
  });

  // Save to storage when state updates (protected against QuotaExceededError)
  useEffect(() => {
    safeLocalStorage.set('oto_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    safeLocalStorage.set('oto_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    safeLocalStorage.set('oto_unit_info', JSON.stringify(unitInfo));
  }, [unitInfo]);

  useEffect(() => {
    safeLocalStorage.set('oto_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    safeLocalStorage.set('oto_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    safeLocalStorage.set('oto_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    safeLocalStorage.set('oto_ren_luyen', JSON.stringify(renLuyen));
  }, [renLuyen]);

  useEffect(() => {
    safeLocalStorage.set('oto_fund', JSON.stringify(fundTransactions));
  }, [fundTransactions]);

  useEffect(() => {
    safeLocalStorage.set('oto_workshop', JSON.stringify(workshopLogs));
  }, [workshopLogs]);

  // Cơ chế tự động sao lưu sau 2 giây khi có sự thay đổi dữ liệu
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-saving data to storage...');
      safeLocalStorage.set('oto_classes', JSON.stringify(classes));
      safeLocalStorage.set('oto_students', JSON.stringify(students));
      safeLocalStorage.set('oto_grades', JSON.stringify(grades));
      safeLocalStorage.set('oto_attendance', JSON.stringify(attendance));
      safeLocalStorage.set('oto_ren_luyen', JSON.stringify(renLuyen));
      safeLocalStorage.set('oto_fund', JSON.stringify(fundTransactions));
      safeLocalStorage.set('oto_workshop', JSON.stringify(workshopLogs));
      safeLocalStorage.set('oto_unit_info', JSON.stringify(unitInfo));
      safeLocalStorage.set('oto_theme_settings', JSON.stringify(themeSettings));
    }, 2000);
    return () => clearTimeout(timer);
  }, [classes, students, grades, attendance, renLuyen, fundTransactions, workshopLogs, unitInfo, themeSettings]);

  // Handler functions
  const handleImportDataFromDriveModal = (parsed: ParsedImportData) => {
    if (!parsed.safetyCheck.passed) {
      alert(`Safety Guard từ chối nạp: ${parsed.safetyCheck.reason}`);
      return;
    }
    const targetClass = parsed.detectedClassName || currentClass;

    // 1. Students: keep other classes' students intact, replace/add students for targetClass
    if (parsed.students && parsed.students.length > 0) {
      const sanitizedImportedStudents = parsed.students.map(s => ({
        ...s,
        classId: targetClass
      }));
      setStudents(prev => {
        const otherStudents = prev.filter(s => (s.classId || '').trim() !== targetClass.trim());
        const combined = [...sanitizedImportedStudents, ...otherStudents];
        safeLocalStorage.set('oto_students', JSON.stringify(combined));
        return combined;
      });

      // Update class student count in classes state
      setClasses(prev => prev.map(c => {
        if (c.id.trim() === targetClass.trim()) {
          return { ...c, studentCount: sanitizedImportedStudents.length };
        }
        return c;
      }));
    }

    // 2. Grades: keep grades of students not in targetClass, add/replace grades for students in targetClass
    if (parsed.grades && parsed.grades.length > 0) {
      setGrades(prev => {
        const currentTargetStudentIds = new Set(
          students.filter(s => String(s.classId || '').trim().toLowerCase() === targetClass.trim().toLowerCase()).map(s => s.id)
        );
        const importedStudentIds = new Set((parsed.students || []).map(s => s.id));
        const otherGrades = prev.filter(g => !(currentTargetStudentIds.has(g.studentId) && importedStudentIds.has(g.studentId)));
        const combined = [...parsed.grades, ...otherGrades];
        safeLocalStorage.set('oto_grades', JSON.stringify(combined));
        return combined;
      });
    }

    // 3. Attendance
    if (parsed.attendance && parsed.attendance.length > 0) {
      setAttendance(prev => {
        const currentTargetStudentIds = new Set(
          students.filter(s => String(s.classId || '').trim().toLowerCase() === targetClass.trim().toLowerCase()).map(s => s.id)
        );
        const importedStudentIds = new Set((parsed.students || []).map(s => s.id));
        const otherAtt = prev.filter(a => !(currentTargetStudentIds.has(a.studentId) && importedStudentIds.has(a.studentId)));
        const combined = [...parsed.attendance, ...otherAtt];
        safeLocalStorage.set('oto_attendance', JSON.stringify(combined));
        return combined;
      });
    }

    // 4. RenLuyen
    if (parsed.renLuyen && parsed.renLuyen.length > 0) {
      setRenLuyen(prev => {
        const currentTargetStudentIds = new Set(
          students.filter(s => String(s.classId || '').trim().toLowerCase() === targetClass.trim().toLowerCase()).map(s => s.id)
        );
        const importedStudentIds = new Set((parsed.students || []).map(s => s.id));
        const otherRl = prev.filter(r => !(currentTargetStudentIds.has(r.studentId) && importedStudentIds.has(r.studentId)));
        const combined = [...parsed.renLuyen, ...otherRl];
        safeLocalStorage.set('oto_ren_luyen', JSON.stringify(combined));
        return combined;
      });
    }

    // 5. FundTransactions / WorkshopLogs
    if (parsed.fundTransactions && parsed.fundTransactions.length > 0) {
      setFundTransactions(prev => {
        const combined = Array.from(new Map([...parsed.fundTransactions, ...prev].map((t: any) => [t.id || JSON.stringify(t), t])).values());
        safeLocalStorage.set('oto_fund', JSON.stringify(combined));
        return combined;
      });
    }

    if (parsed.workshopLogs && parsed.workshopLogs.length > 0) {
      setWorkshopLogs(prev => {
        const combined = Array.from(new Map([...parsed.workshopLogs, ...prev].map((l: any) => [l.id || JSON.stringify(l), l])).values());
        safeLocalStorage.set('oto_workshop', JSON.stringify(combined));
        return combined;
      });
    }
  };

  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleAddStudent = (newStudent: Student) => {
    const targetClass = (newStudent.classId || currentClass || '').trim();
    const studentWithClass: Student = {
      ...newStudent,
      classId: targetClass
    };
    setStudents(prev => [studentWithClass, ...prev]);
    setClasses(prev => prev.map(c => {
      if (c.id.trim().toLowerCase() === targetClass.toLowerCase()) {
        return { ...c, studentCount: (c.studentCount || 0) + 1 };
      }
      return c;
    }));
  };

  const handleBulkAddStudents = (newStudents: Student[], replaceClass: boolean = false, targetClassId?: string) => {
    const targetClass = (targetClassId || currentClass || '').trim();
    const targetClassLower = targetClass.toLowerCase();

    setStudents(prev => {
      // 1. Chuẩn hóa sinh viên mới: luôn gán classId = targetClass và làm sạch ID
      const uniqueNew: Student[] = [];
      const seenNew = new Set<string>();
      newStudents.forEach((s, idx) => {
        let cleanId = String(s.id || '').trim();
        if (!cleanId) {
          const classPrefix = targetClass.replace(/[^a-zA-Z0-9]/g, '');
          cleanId = `${classPrefix}-${String(idx + 1).padStart(3, '0')}`;
        }
        if (seenNew.has(cleanId)) {
          cleanId = `${cleanId}-${idx + 1}`;
        }
        seenNew.add(cleanId);
        uniqueNew.push({
          ...s,
          id: cleanId,
          classId: targetClass
        });
      });

      let nextList: Student[];
      if (replaceClass) {
        // Chỉ xóa sinh viên của lớp targetClass, GIỮ NGUYÊN 100% sinh viên của tất cả các lớp khác!
        const otherStudents = prev.filter(s => {
          const sClass = String(s.classId || '').trim().toLowerCase();
          return sClass !== targetClassLower;
        });
        nextList = [...uniqueNew, ...otherStudents];
      } else {
        // Chế độ gộp/thêm: Chỉ thay thế sinh viên trùng ID trong CÙNG lớp targetClass!
        // Tuyệt đối không xóa sinh viên của lớp khác dù có trùng ID!
        const newIds = new Set(uniqueNew.map(s => s.id));
        const keptStudents = prev.filter(s => {
          const sClass = String(s.classId || '').trim().toLowerCase();
          const isTargetClass = sClass === targetClassLower;
          if (isTargetClass && newIds.has(s.id)) {
            return false; // Thay thế bằng bản ghi mới trong uniqueNew
          }
          return true; // Giữ lại
        });
        nextList = [...uniqueNew, ...keptStudents];
      }

      // Đảm bảo không có ID nào bị trùng lặp trong toàn bộ danh sách
      // Nếu 2 sinh viên ở 2 lớp khác nhau có cùng ID, tự động thêm tiền tố lớp để phân biệt
      const seenMap = new Map<string, string>(); // id -> classId
      const finalSanitized: Student[] = [];
      nextList.forEach((s, i) => {
        let id = s.id;
        const sClass = String(s.classId || targetClass).trim();
        if (seenMap.has(id)) {
          const prevClass = seenMap.get(id);
          if (prevClass?.toLowerCase() !== sClass.toLowerCase()) {
            const prefix = sClass.replace(/[^a-zA-Z0-9]/g, '');
            id = `${prefix}-${id}`;
          } else {
            id = `${id}-${i + 1}`;
          }
        }
        seenMap.set(id, sClass);
        finalSanitized.push({ ...s, id, classId: sClass });
      });

      return finalSanitized;
    });

    // Cập nhật sĩ số lớp
    setClasses(prev => prev.map(c => {
      if (c.id.trim().toLowerCase() === targetClassLower) {
        return {
          ...c,
          studentCount: replaceClass ? newStudents.length : Math.max(c.studentCount || 0, newStudents.length)
        };
      }
      return c;
    }));
  };

  const handleDeleteStudent = (id: string, classId?: string) => {
    const cleanId = String(id).trim();
    const targetClass = (classId || currentClass || '').trim().toLowerCase();

    // Xác định chính xác sinh viên thuộc lớp cần xóa
    setStudents(prev => {
      return prev.filter(s => {
        const matchId = String(s.id).trim() === cleanId;
        const sClass = String(s.classId || '').trim().toLowerCase();
        const matchClass = targetClass ? sClass === targetClass : true;
        // Nếu trùng ID và đúng lớp này -> XÓA (return false), còn các lớp khác BẢO LƯU 100%!
        return !(matchId && matchClass);
      });
    });

    // Chỉ xóa điểm, chuyên cần, rèn luyện của sinh viên này
    setGrades(prev => prev.filter(g => String(g.studentId).trim() !== cleanId));
    setAttendance(prev => prev.filter(a => String(a.studentId).trim() !== cleanId));
    setRenLuyen(prev => prev.filter(r => String(r.studentId).trim() !== cleanId));

    // Cập nhật lại sĩ số lớp
    setClasses(prev => prev.map(c => {
      if (c.id.trim().toLowerCase() === targetClass) {
        return { ...c, studentCount: Math.max(0, (c.studentCount || 1) - 1) };
      }
      return c;
    }));
  };

  const handleReorderStudents = (newStudentsOrder: Student[]) => {
    setStudents(newStudentsOrder);
  };

  const handleBulkDeleteStudents = (ids: string[], classId?: string) => {
    const idSet = new Set(ids.map(i => String(i).trim()));
    const targetClass = (classId || currentClass || '').trim().toLowerCase();

    setStudents(prev => {
      return prev.filter(s => {
        const matchId = idSet.has(String(s.id).trim());
        const sClass = String(s.classId || '').trim().toLowerCase();
        const matchClass = targetClass ? sClass === targetClass : true;
        // Chỉ xóa sinh viên thuộc lớp chỉ định, BẢO LƯU 100% sinh viên các lớp khác!
        return !(matchId && matchClass);
      });
    });

    setGrades(prev => prev.filter(g => !idSet.has(String(g.studentId).trim())));
    setAttendance(prev => prev.filter(a => !idSet.has(String(a.studentId).trim())));
    setRenLuyen(prev => prev.filter(r => !idSet.has(String(r.studentId).trim())));

    // Cập nhật sĩ số lớp
    setClasses(prev => prev.map(c => {
      if (c.id.trim().toLowerCase() === targetClass) {
        return { ...c, studentCount: Math.max(0, (c.studentCount || ids.length) - ids.length) };
      }
      return c;
    }));
  };

  const handleClearClassStudents = (classId?: string) => {
    const targetClass = (classId || currentClass || '').trim().toLowerCase();
    
    // Tìm danh sách ID sinh viên của riêng lớp này
    const classStudentIds = new Set(
      students
        .filter(s => String(s.classId || '').trim().toLowerCase() === targetClass)
        .map(s => String(s.id).trim())
    );

    // BẢO TỒN TOÀN BỘ sinh viên lớp khác, chỉ lọc bỏ sinh viên của targetClass!
    setStudents(prev => prev.filter(s => String(s.classId || '').trim().toLowerCase() !== targetClass));
    setGrades(prev => prev.filter(g => !classStudentIds.has(String(g.studentId).trim())));
    setAttendance(prev => prev.filter(a => !classStudentIds.has(String(a.studentId).trim())));
    setRenLuyen(prev => prev.filter(r => !classStudentIds.has(String(r.studentId).trim())));
    setClasses(prev => prev.map(c => c.id.trim().toLowerCase() === targetClass ? { ...c, studentCount: 0 } : c));
  };

  const handleDeleteGrade = (studentId: string, moduleId: string) => {
    setGrades(prev => prev.filter(g => !(String(g.studentId).trim() === String(studentId).trim() && g.moduleId === moduleId)));
  };

  const handleClearModuleGrades = (moduleId: string) => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setGrades(prev => prev.filter(g => !(g.moduleId === moduleId && classStudentIds.has(String(g.studentId).trim()))));
  };

  const handleClearClassGrades = () => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setGrades(prev => prev.filter(g => !classStudentIds.has(String(g.studentId).trim())));
  };

  const handleDeleteAttendanceRecord = (recordId: string) => {
    setAttendance(prev => prev.filter(a => a.id !== recordId));
  };

  const handleClearAttendanceSession = (date: string, shift: string, moduleId: string) => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setAttendance(prev => prev.filter(a => !(a.date === date && a.shift === shift && a.moduleId === moduleId && classStudentIds.has(String(a.studentId).trim()))));
  };

  const handleClearModuleAttendance = (moduleId: string) => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setAttendance(prev => prev.filter(a => !(a.moduleId === moduleId && classStudentIds.has(String(a.studentId).trim()))));
  };

  const handleClearClassAttendance = () => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setAttendance(prev => prev.filter(a => !classStudentIds.has(String(a.studentId).trim())));
  };

  const handleDeleteRenLuyen = (studentId: string, semester: number) => {
    setRenLuyen(prev => prev.filter(r => !(String(r.studentId).trim() === String(studentId).trim() && r.semester === semester)));
  };

  const handleClearClassRenLuyen = (semester?: number) => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    if (semester !== undefined) {
      setRenLuyen(prev => prev.filter(r => !(r.semester === semester && classStudentIds.has(String(r.studentId).trim()))));
    } else {
      setRenLuyen(prev => prev.filter(r => !classStudentIds.has(String(r.studentId).trim())));
    }
  };

  const handleClearFundTransactions = () => {
    setFundTransactions([]);
  };

  const handleClearWorkshopLogs = () => {
    setWorkshopLogs([]);
  };

  const handleResetAllClassData = () => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudentIds = new Set(
      students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower).map(s => String(s.id).trim())
    );
    setStudents(prev => prev.filter(s => String(s.classId || '').trim().toLowerCase() !== classIdLower));
    setGrades(prev => prev.filter(g => !classStudentIds.has(String(g.studentId).trim())));
    setAttendance(prev => prev.filter(a => !classStudentIds.has(String(a.studentId).trim())));
    setRenLuyen(prev => prev.filter(r => !classStudentIds.has(String(r.studentId).trim())));
    setClasses(prev => prev.map(c => c.id.trim().toLowerCase() === classIdLower ? { ...c, studentCount: 0 } : c));
  };

  const handleUpdateGrade = (newGrade: StudentGrade) => {
    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === newGrade.studentId && g.moduleId === newGrade.moduleId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newGrade;
        return copy;
      }
      return [...prev, newGrade];
    });
  };

  const handleAddAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendance(prev => [...newRecords, ...prev]);
  };

  const handleUpdateRenLuyen = (record: RenLuyenCriteria) => {
    setRenLuyen(prev => {
      const idx = prev.findIndex(r => r.studentId === record.studentId && r.semester === record.semester);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const handleAddTransaction = (tx: FundTransaction) => {
    setFundTransactions(prev => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setFundTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddWorkshopLog = (log: WorkshopSafetyLog) => {
    setWorkshopLogs(prev => [log, ...prev]);
  };

  const handleDeleteWorkshopLog = (id: string) => {
    setWorkshopLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleAddClass = (newCls: ClassItem) => {
    setClasses(prev => [newCls, ...prev]);
  };

  const handleUpdateClass = (updated: ClassItem) => {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  const handleImportFullBackup = (data: any) => {
    if (data.classes) setClasses(data.classes);
    if (data.students) setStudents(data.students);
    if (data.grades) setGrades(data.grades);
    if (data.attendance) setAttendance(data.attendance);
    if (data.renLuyen) setRenLuyen(data.renLuyen);
    if (data.fundTransactions) setFundTransactions(data.fundTransactions);
    if (data.workshopLogs) setWorkshopLogs(data.workshopLogs);
  };

  const handleExportFullJSON = () => {
    const classIdLower = String(currentClass || '').trim().toLowerCase();
    const classStudents = students.filter(s => String(s.classId || '').trim().toLowerCase() === classIdLower);
    const classStudentIds = new Set(classStudents.map(s => s.id));
    const fullBackup = {
      system: 'Hệ thống Quản lý Sinh viên Điện tử - Khoa Công nghệ Ô tô',
      author: 'ThS. Nguyễn Chí Dũng - Zalo: 0865.074.668',
      exportDate: new Date().toISOString(),
      currentClass,
      students: classStudents,
      modules,
      grades: grades.filter(g => classStudentIds.has(g.studentId)),
      attendance: attendance.filter(a => classStudentIds.has(a.studentId)),
      renLuyen: renLuyen.filter(r => classStudentIds.has(r.studentId)),
      fundTransactions,
      workshopLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `08_DuLieu_SaoLuu_HeThong_${currentClass}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenNoticeModal = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('backup-forms');
  };

  const handleSaveUnitInfo = (newInfo: UnitInfoSettings) => {
    setUnitInfo(newInfo);
    // Sync classId
    if (newInfo.classId) {
      setCurrentClass(newInfo.classId as ClassId);
    }
    // Sync academicYear
    if (newInfo.academicYear) {
      setAcademicYear(newInfo.academicYear as AcademicYear);
    }
    // Synchronize school, faculty and advisor with themeSettings
    setThemeSettings(prev => ({
      ...prev,
      schoolName: newInfo.schoolName || prev.schoolName,
      facultyName: newInfo.facultyName || prev.facultyName,
      authorName: newInfo.advisorName || prev.authorName
    }));
    // Synchronize with classes list
    setClasses(prev => prev.map(c => {
      if (c.id === (newInfo.classId || currentClass)) {
        return {
          ...c,
          academicYear: newInfo.academicYear || c.academicYear,
          major: newInfo.majorName || c.major,
          trainingSystem: newInfo.trainingSystem || c.trainingSystem,
          headTeacher: newInfo.advisorName || c.headTeacher,
          headDepartment: newInfo.facultyName || c.headDepartment
        };
      }
      return c;
    }));
  };

  // Cho phép Phụ huynh & Sinh viên truy cập Cổng thông tin điện tử tra cứu mà không cần đăng nhập
  if (!currentUser && isPublicPortalActive) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased select-none">
        <header className="bg-gradient-to-r from-[#01427a] via-[#02569b] to-[#0277bd] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-yellow-300 text-lg shadow-xs">
              GD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-tight text-white">
                  {themeSettings.schoolName || 'TRƯỜNG CAO ĐẲNG NGHỀ CÔNG NGHỆ CAO'}
                </h1>
                <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 bg-yellow-400 text-slate-900 rounded-full">
                  CỔNG THÔNG TIN HỌC VỤ
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                {themeSettings.facultyName || 'KHOA CÔNG NGHỆ Ô TÔ'} • Tra cứu Kết quả học tập & Chuyên cần dành cho Phụ huynh & HSSV
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPublicPortalActive(false)}
              className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            >
              <span>Đăng nhập Cán bộ / GVCN ↗</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <StudentPortalModule
            students={students}
            modules={modules}
            grades={grades}
            attendance={attendance}
            renLuyen={renLuyen}
            unitInfo={unitInfo}
            classes={classes}
            themeSettings={themeSettings}
            onBackToLogin={() => setIsPublicPortalActive(false)}
            isStandalonePublic={true}
          />
        </main>
      </div>
    );
  }

  // Cơ chế Đăng nhập bắt buộc theo yêu cầu (Admin: dl1032008@gmail.com / admin | Giáo viên đăng ký chờ duyệt)
  if (!currentUser) {
    return (
      <AuthLoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          saveCurrentAuthUser(user);
          if (user.role === 'student') {
            setActiveTab('attendance');
          } else if (user.role === 'teacher') {
            setActiveTab('students');
          } else {
            setActiveTab('home');
          }
          if (user.assignedClassIds && user.assignedClassIds.length > 0 && user.assignedClassIds[0] !== '*') {
            const firstClass = user.assignedClassIds[0];
            if (classes.some(c => c.id === firstClass)) {
              setCurrentClass(firstClass);
            }
          }
          // Tự động kết nối/sync Google Drive khi đăng nhập
          googleDriveSyncService.checkAuthStatus().then(status => {
            if (!status.isAuthenticated) {
               console.log('User not authenticated with Google Drive, prompt requested.');
            } else {
               console.log('User authenticated with Google Drive, auto-syncing...');
               // Logic to trigger sync if needed
            }
          });
        }}
        users={users}
        onRegisterTeacher={handleRegisterTeacher}
        classes={classes}
        themeSettings={themeSettings}
        onOpenPublicPortal={() => setIsPublicPortalActive(true)}
      />
    );
  }

  const handleSwitchUserRole = (targetRole: 'admin' | 'teacher' | 'student') => {
    const targetUser = users.find(u => u.role === targetRole);
    if (targetUser) {
      setCurrentUser(targetUser);
      saveCurrentAuthUser(targetUser);
      if (targetRole === 'student') {
        setActiveTab('attendance');
      } else if (targetRole === 'teacher') {
        setActiveTab('students');
      } else {
        setActiveTab('home');
      }
      if (targetUser.assignedClassIds && targetUser.assignedClassIds.length > 0 && targetUser.assignedClassIds[0] !== '*') {
        const firstClass = targetUser.assignedClassIds[0];
        if (classes.some(c => c.id === firstClass)) {
          setCurrentClass(firstClass);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased select-none">
      {/* 1. Header (Matching screenshot exactly) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickTools={() => setIsQuickToolsOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        themeSettings={themeSettings}
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onLogout={handleLogout}
        pendingUsersCount={pendingUsersCount}
        onOpenDriveSync={() => setIsDriveSyncModalOpen(true)}
        onSwitchUserRole={handleSwitchUserRole}
      />

      {/* 2. Main Body: Left Sidebar + Central Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          currentClass={currentClass}
          setCurrentClass={setCurrentClass}
          themeSettings={themeSettings}
          onOpenUnitInfoModal={() => setIsUnitInfoModalOpen(true)}
          classes={classes}
          onOpenCurriculumModal={handleOpenCurriculumModal}
          currentUser={currentUser}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          pendingUsersCount={pendingUsersCount}
          students={students}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeTab === 'home' && (
            <DashboardHome
              currentClass={currentClass}
              students={students}
              grades={grades}
              attendance={attendance}
              setActiveTab={setActiveTab}
              themeSettings={themeSettings}
            />
          )}

          {activeTab === 'unit-info' && (
            <UnitInfoModule
              unitInfo={unitInfo}
              onOpenUnitInfoModal={() => setIsUnitInfoModalOpen(true)}
            />
          )}

          {activeTab === 'organization' && (
            <OrganizationModule
              academicYear={academicYear}
              setAcademicYear={setAcademicYear}
              currentClass={currentClass}
              setCurrentClass={setCurrentClass}
              classes={classes}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              themeSettings={themeSettings}
            />
          )}

          {activeTab === 'students' && (
            <StudentProfilesModule
              students={students}
              currentClass={currentClass}
              setCurrentClass={setCurrentClass}
              classes={classes}
              setActiveTab={setActiveTab}
              onUpdateStudent={handleUpdateStudent}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkDeleteStudents={handleBulkDeleteStudents}
              onClearClassStudents={handleClearClassStudents}
              onBulkAddStudents={handleBulkAddStudents}
              onReorderStudents={handleReorderStudents}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              themeSettings={themeSettings}
              unitInfo={unitInfo}
            />
          )}

          {activeTab === 'grades' && (
            <GradeManagementModule
              students={students}
              currentClass={currentClass}
              modules={modules}
              grades={grades}
              onUpdateGrade={handleUpdateGrade}
              onDeleteGrade={handleDeleteGrade}
              onClearModuleGrades={handleClearModuleGrades}
              onClearClassGrades={handleClearClassGrades}
              themeSettings={themeSettings}
              trainingSystem={currentTrainingSystem}
              onOpenCurriculumModal={() => handleOpenCurriculumModal(currentTrainingSystem)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceAndRenLuyenModule
              students={students}
              currentClass={currentClass}
              modules={modules}
              attendance={attendance}
              renLuyen={renLuyen}
              onAddAttendance={handleAddAttendance}
              onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
              onClearAttendanceSession={handleClearAttendanceSession}
              onClearModuleAttendance={handleClearModuleAttendance}
              onClearClassAttendance={handleClearClassAttendance}
              onUpdateRenLuyen={handleUpdateRenLuyen}
              onDeleteRenLuyen={handleDeleteRenLuyen}
              onClearClassRenLuyen={handleClearClassRenLuyen}
              onOpenNoticeModal={handleOpenNoticeModal}
              themeSettings={themeSettings}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'retake' && (
            <RetakeAndRemedialModule
              students={students}
              currentClass={currentClass}
              modules={modules}
              grades={grades}
              classes={classes}
              attendance={attendance}
              themeSettings={themeSettings}
              onSelectClass={(clsId) => setCurrentClass(clsId)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAndFundModule
              students={students}
              currentClass={currentClass}
              fundTransactions={fundTransactions}
              workshopLogs={workshopLogs}
              grades={grades}
              renLuyen={renLuyen}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onClearFundTransactions={handleClearFundTransactions}
              onAddWorkshopLog={handleAddWorkshopLog}
              onDeleteWorkshopLog={handleDeleteWorkshopLog}
              onClearWorkshopLogs={handleClearWorkshopLogs}
              themeSettings={themeSettings}
            />
          )}

          {activeTab === 'backup-forms' && (
            <BackupAndFormsModule
              students={students}
              currentClass={currentClass}
              modules={modules}
              grades={grades}
              attendance={attendance}
              renLuyen={renLuyen}
              fundTransactions={fundTransactions}
              workshopLogs={workshopLogs}
              classes={classes}
              onImportFullBackup={handleImportFullBackup}
              onClearClassStudents={handleClearClassStudents}
              onClearClassGrades={handleClearClassGrades}
              onClearClassAttendance={handleClearClassAttendance}
              onClearClassRenLuyen={handleClearClassRenLuyen}
              onClearFundTransactions={handleClearFundTransactions}
              onClearWorkshopLogs={handleClearWorkshopLogs}
              onResetAllClassData={handleResetAllClassData}
              unitInfo={unitInfo}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'portal' && (
            <StudentPortalModule
              students={students}
              modules={modules}
              grades={grades}
              attendance={attendance}
              renLuyen={renLuyen}
              unitInfo={unitInfo}
              classes={classes}
              themeSettings={themeSettings}
            />
          )}
        </main>
      </div>

      {/* 3. Footer (Nút Setup giao diện như hình 1 mở ra mục tùy biến như hình 2) */}
      <Footer
        currentClass={currentClass}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        themeSettings={themeSettings}
      />

      {/* Quick Tools & Legal Reference Modal */}
      <QuickToolsModal
        isOpen={isQuickToolsOpen}
        onClose={() => setIsQuickToolsOpen(false)}
      />

      {/* Setup Giao Diện Admin Modal (Hình 2: LOGO, Màu Head/Foot, Thanh Tiêu Đề, Bảng, Banner) */}
      <ThemeSetupModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeSettings={themeSettings}
        onSaveTheme={(newTheme) => setThemeSettings(newTheme)}
      />

      {/* Tùy Chỉnh Thông Tin Đơn Vị Modal (Mở khi nhấn THÔNG TIN ĐƠN VỊ Hình 1 -> Bảng Hình 2) */}
      <UnitInfoModal
        isOpen={isUnitInfoModalOpen}
        onClose={() => setIsUnitInfoModalOpen(false)}
        unitInfo={unitInfo}
        onSaveUnitInfo={handleSaveUnitInfo}
        students={students}
        filteredStudents={students.filter(s => (s.classId || '').trim().toLowerCase() === currentClass.trim().toLowerCase())}
        currentClass={currentClass}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Quản Trị Chương Trình Khung Đào Tạo & Phân Bổ Mô Đun Theo Kỳ Học (Mở khi nhấn HỆ CAO ĐẲNG CHÍNH QUY, HỆ LIÊN THÔNG CAO ĐẲNG, HỆ TRUNG CẤP + THPT trong khung Hình 1) */}
      <CurriculumFrameworkModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        initialSystemName={selectedCurriculumSystem}
        onApplyCurriculum={handleApplyCurriculum}
      />

      {/* Quản Trị Người Dùng & Phân Quyền RBAC (Phê duyệt giáo viên, Sửa, Xóa, Đổi mật khẩu, Phân quyền GVCN & Cán bộ lớp) */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        onUpdateUsers={handleUpdateUsers}
        currentUser={currentUser}
        classes={classes}
        onUpdateClasses={handleUpdateClassesFromUserMgmt}
        students={students}
      />

      {/* Trung Tâm Đồng Bộ Google Drive & Google Sheets Tự Động (Mở khi nhấn SAO LƯU bên trái Admin) */}
      <DriveSyncModal
        isOpen={isDriveSyncModalOpen}
        onClose={() => setIsDriveSyncModalOpen(false)}
        currentClass={currentClass}
        students={students}
        grades={grades}
        attendance={attendance}
        renLuyen={renLuyen}
        fundTransactions={fundTransactions}
        workshopLogs={workshopLogs}
        unitInfo={unitInfo}
        currentUser={currentUser}
        onImportData={handleImportDataFromDriveModal}
        classes={classes}
        onRestoreGlobalData={(globalData) => {
          if (globalData.classes) {
            setClasses(globalData.classes);
            safeLocalStorage.set('oto_classes', JSON.stringify(globalData.classes));
          }
          if (globalData.students) {
            setStudents(globalData.students);
            safeLocalStorage.set('oto_students', JSON.stringify(globalData.students));
          }
          if (globalData.grades) {
            setGrades(globalData.grades);
            safeLocalStorage.set('oto_grades', JSON.stringify(globalData.grades));
          }
          if (globalData.attendance) {
            setAttendance(globalData.attendance);
            safeLocalStorage.set('oto_attendance', JSON.stringify(globalData.attendance));
          }
          if (globalData.renLuyen) {
            setRenLuyen(globalData.renLuyen);
            safeLocalStorage.set('oto_ren_luyen', JSON.stringify(globalData.renLuyen));
          }
          if (globalData.fundTransactions) {
            setFundTransactions(globalData.fundTransactions);
            safeLocalStorage.set('oto_fund', JSON.stringify(globalData.fundTransactions));
          }
          if (globalData.workshopLogs) {
            setWorkshopLogs(globalData.workshopLogs);
            safeLocalStorage.set('oto_workshop', JSON.stringify(globalData.workshopLogs));
          }
          if (globalData.unitInfo) {
            setUnitInfo(globalData.unitInfo);
            safeLocalStorage.set('oto_unit_info', JSON.stringify(globalData.unitInfo));
          }
        }}
      />
    </div>
  );
}
