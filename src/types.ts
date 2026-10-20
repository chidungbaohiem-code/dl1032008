export type ActiveTab =
  | 'home'
  | 'unit-info'
  | 'organization'
  | 'students'
  | 'grades'
  | 'attendance'
  | 'retake'
  | 'reports'
  | 'backup-forms'
  | 'portal';

export type AcademicYear = '2025 - 2028' | '2024 - 2027' | '2023 - 2026' | string;
export type ClassId = string;

export interface ClassItem {
  id: string; // Mã lớp (VD: CĐK19.2-OT1.CLC)
  name: string; // Tên hiển thị lớp
  academicYear: string; // Niên khóa (VD: 2025 - 2028)
  major: string; // Ngành nghề (VD: Công nghệ ô tô)
  trainingSystem: string; // Hệ đào tạo (VD: Cao đẳng chính quy)
  headTeacher: string; // GVCN / Cố vấn học tập (VD: ThS. Nguyễn Chí Dũng)
  headTeacherPhone: string; // SĐT GVCN
  headTeacherEmail?: string;
  headDepartment: string; // Khoa chuyên môn
  studentCount?: number;
  classLeaderName?: string;
  classLeaderPhone?: string;
  status: 'Đang đào tạo' | 'Đã tốt nghiệp' | 'Tạm dừng';
  accessPermissions: {
    adminFullAccess: boolean;
    advisorFullAccess: boolean;
    subjectTeacherInputGrades: boolean;
    studentViewOnly: boolean;
  };
  note?: string;
  createdAt: string;
}

export interface Student {
  id: string; // 1. MSSV
  fullName: string; // 2. Họ và tên
  gender: 'Nam' | 'Nữ'; // 3. Giới tính
  birthDate: string; // 4. Ngày sinh (DD/MM/YYYY)
  ethnicity: string; // 5. Dân tộc
  idCard: string; // 6. CCCD
  phone: string; // 7. SĐT cá nhân
  email: string; // 8. Email
  permanentAddress: string; // 9. Hộ khẩu thường trú
  temporaryAddress: string; // 10. Địa chỉ tạm trú / KTX
  fatherName: string; // 11. Họ tên Bố
  fatherPhone: string; // 12. SĐT Bố
  motherName: string; // 13. Họ tên Mẹ
  motherPhone: string; // 14. SĐT Mẹ
  parentJob: string; // 15. Nghề nghiệp phụ huynh / Nghề nghiệp Bố
  fatherJob?: string; // 16. Nghề nghiệp Bố
  motherJob?: string; // 17. Nghề nghiệp Mẹ
  emergencyPhone: string; // SĐT khẩn cấp
  workshopGroup: 1 | 2; // 18. Tổ xưởng (Tổ 1 - 2)
  role: 'Lớp trưởng' | 'Lớp phó HT' | 'Lớp phó ĐS' | 'Bí thư' | 'Tổ trưởng' | 'Tổ phó' | 'Thành viên' | string; // 18. Chức vụ
  station: string; // 19. Phương tiện đi lại / Vị trí thực hành
  policy: 'Nghề nặng nhọc, độc hại' | 'Miễn giảm 70% (NĐ 238/2025)' | 'Hộ nghèo & Miễn 70%' | 'Con thương binh & Miễn 70%' | 'Mồ côi & Miễn 70%' | 'Bộ đội xuất ngũ & Miễn 70%' | string; // 20. Diện chính sách
  tuitionStatus: {
    standardTuition: number; // Định mức (VD 7.500.000)
    governmentSubsidy: number; // 70% cấp bù (5.250.000)
    studentPayable: number; // Còn phải nộp (2.250.000)
    paidAmount: number; // Đã nộp
    debtAmount: number; // Còn nợ
    isComplete: boolean;
  }; // 21. Học phí
  academicStatus: 'Đang học bình thường' | 'Cảnh báo học vụ' | 'Nguy cơ cấm thi' | 'Nợ môn' | 'Bảo lưu'; // 22. Tình trạng học tập
  teacherNotes: string; // 23. Ghi chú sư phạm của GVCN
  classId: ClassId;
  idCardIssueDate?: string; // Ngày cấp CCCD (VD: 18/12/2021)
  attendanceRate?: number; // Tỷ lệ chuyên cần % (VD: 95.5)
  avatar?: string; // Ảnh thẻ / Chân dung HSSV 3x4 chuẩn GDNN (base64 hoặc URL)
  entryPolicy?: string; // Đối tượng đầu vào
  admissionDecisionNumber?: string; // Số quyết định trúng tuyển
  admissionDecisionDate?: string; // Ngày ký QĐ trúng tuyển
  studentYear?: string; // Sinh viên năm
  admissionResult?: string; // Kết quả tuyển sinh
  curriculumCode?: string; // Mã chương trình đào tạo
  trainingType?: string; // Loại hình đào tạo
  trainingStartYear?: string; // Đào tạo từ năm
  trainingEndYear?: string; // Đào tạo đến năm
  department?: string; // Khoa chuyên môn
  livingClass?: string; // Lớp sinh hoạt / Lớp niên chế
  enrollmentDate?: string; // Ngày nhập học
  isDormitory?: string; // Đang ở nội trú (KTX)
  articulationDegree?: string; // Bằng tốt nghiệp liên thông
  statusChangeDate?: string; // Ngày chuyển trạng thái
  statusDecisionNumber?: string; // Số QĐ Thôi học / Buộc thôi học / Bảo lưu
  graduationDate?: string; // Thời gian tốt nghiệp
  graduationType?: string; // Loại tốt nghiệp
  graduationDecisionNumber?: string; // Số QĐ công nhận tốt nghiệp
  graduationDecisionDate?: string; // Ngày QĐ công nhận tốt nghiệp
  youthUnionDate?: string; // Ngày vào đoàn
  partyDate?: string; // Ngày vào đảng
  officialPartyDate?: string; // Ngày vào đảng chính thức
  transportation?: string; // Phương tiện đi lại
  permanentProvince?: string; // Tỉnh/thành phố thường trú
  permanentWard?: string; // Xã/phường thường trú
  birthPlace?: string; // Nơi sinh
  hometown?: string; // Quê quán
}

export interface SubjectModule {
  id: string; // Mã mô đun
  name: string; // Tên mô đun
  credits: number; // Số tín chỉ
  totalHours: number; // Tổng số tiết (Tổng = Lý thuyết + Thực hành + Kiểm tra)
  theoryHours: number; // Số tiết Lý thuyết (LT)
  practiceHours: number; // Số tiết Thực hành / Thực tập (TH)
  examHours?: number; // Số tiết Kiểm tra / Thi (KT)
  semester: 1 | 2 | 3 | 4 | 5 | 6 | number;
  academicYearNumber?: number; // Năm học: Năm 1, Năm 2, Năm 3
  type?: 'Môn học chung' | 'Cơ sở ngành' | 'Chuyên môn' | 'Thực tập xưởng' | 'Thực tập tốt nghiệp' | 'Đồ án / Khóa luận' | string;
  isMandatory?: boolean; // Bắt buộc / Tự chọn
  trainingSystem?: string; // Hệ Cao Đẳng Chính Quy, Hệ Liên Thông Cao Đẳng, Hệ Trung Cấp + THPT
  classId?: string;
  note?: string;
}

export interface StudentGrade {
  studentId: string;
  moduleId: string;
  regularScore1: number; // Kiểm tra thường xuyên 1 (HS 1)
  regularScore2: number; // Kiểm tra thường xuyên 2 (HS 1)
  midtermScore: number; // Kiểm tra định kỳ (HS 2)
  finalExamScore: number; // Thi kết thúc mô đun (HS 3)
  finalGrade10: number; // Điểm tổng kết hệ 10
  finalGrade4: number; // Thang 4
  letterGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  isPassed: boolean;
  retakeCount: number; // Số lần thi lại
  txScores?: number[]; // Mảng điểm TX (tối đa 5 cột)
  dkScores?: number[]; // Mảng điểm ĐK (tối đa 8 cột)
  finalExamScoreL2?: number; // Thi Lần 2
  finalGrade10L2?: number; // Điểm tổng kết hệ 10 sau thi L2
  finalGrade4L2?: number; // Thang 4 sau thi L2
  letterGradeL2?: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  teacherNote?: string; // Ghi chú cá nhân hóa của GV
}

export type AttendanceStatus = 'P' | 'L' | 'A' | 'LATE'; // P: Có mặt, L: Có phép, A: Không phép, LATE: Muộn/Về sớm

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  moduleId: string;
  shift: 'Sáng' | 'Chiều' | 'Tối';
  sessionHours: number; // Số tiết (thường 4 hoặc 5 tiết)
  status: AttendanceStatus;
  note?: string;
}

export interface RenLuyenCriteria {
  studentId: string;
  semester: number;
  criteria1: number; // Ý thức học tập (0 - 20đ)
  criteria2: number; // Chấp hành nội quy, quy chế (0 - 25đ)
  criteria3: number; // Hoạt động chính trị - xã hội (0 - 20đ)
  criteria4: number; // Quan hệ cộng đồng, phẩm chất đạo đức (0 - 25đ)
  criteria5: number; // Cán sự lớp, khen thưởng đặc biệt (0 - 10đ)
  totalScore: number; // Tổng điểm (0 - 100)
  rank: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';
  evaluationStep: 'SV tự chấm' | 'Lớp họp bình xét' | 'GVCN duyệt';
  disciplineNote?: string;
}

export interface FundTransaction {
  id: string;
  date: string;
  type: 'THU' | 'CHI';
  category: string;
  amount: number;
  performer: string;
  note: string;
  receiptNumber: string;
}

export interface WorkshopSafetyLog {
  id: string;
  date: string;
  shift: 'Sáng' | 'Chiều';
  groupNumber: 1 | 2 | 3 | 4;
  station: string;
  supervisor: string;
  protectiveEquipmentChecked: boolean; // BHLĐ đầy đủ
  equipmentStatus: 'Bình thường' | 'Cảnh báo hao mòn' | 'Cần bảo dưỡng';
  incidentReport?: string;
  note: string;
}

export interface ThemeSettings {
  logoUrl?: string; // Tùy chọn Logo (Data URL hoặc URL hình ảnh)
  schoolName: string; // Tên trường (VD: TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC)
  facultyName: string; // Tên Khoa / Bộ môn (VD: KHOA CÔNG NGHỆ Ô TÔ • BỘ MÔN ĐIỆN - ĐIỆN TỬ Ô TÔ)
  systemTitle: string; // Tiêu đề hệ thống
  authorName: string; // Tên tác giả
  authorPhone: string; // Zalo tác giả
  bannerUrl?: string; // Ảnh bìa / Banner xưởng
  bannerTitle?: string; // Tiêu đề banner
  headerBgStart: string; // Màu dải đầu Header & Footer
  headerBgEnd: string; // Màu dải cuối Header & Footer
  tableHeaderBg: string; // Màu thanh tiêu đề các khung bảng (thead)
  sidebarBtnBgStart: string; // Màu nút menu sidebar (bắt đầu)
  sidebarBtnBgEnd: string; // Màu nút menu sidebar (kết thúc)
  cardBg: string; // Màu nền các khung bảng / thẻ card
  presetTheme: string; // Tên preset đã chọn
}

export interface UnitInfoSettings {
  parentAgency: string; // Cơ quan chủ quản cấp trên (VD: UBND TỈNH PHÚ THỌ)
  schoolName: string; // Tên trường (In hoa) (VD: TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC)
  facultyName: string; // Khoa chuyên môn (In hoa) (VD: KHOA CÔNG NGHỆ Ô TÔ)
  majorName: string; // Ngành nghề đào tạo (VD: Công nghệ ô tô)
  classId: string; // Mã / Tên Lớp (VD: CĐK19.2-OT1.CLC)
  academicYear: string; // Niên khóa đào tạo (VD: 2025-2028)
  trainingSystem: string; // Hệ đào tạo (VD: Cao đẳng chính quy)
  issueLocation: string; // Địa phương ban hành văn bản (VD: Phú Thọ)
  documentSymbol: string; // Ký hiệu số văn bản (VD: .../TN-CĐOT)
  advisorName: string; // Cố vấn học tập / GVCN (VD: ThS: Nguyễn Chí Dũng)
  deanName: string; // Lãnh đạo Khoa (Trưởng Khoa) (VD: ThS: Đỗ Thế Huân)
  secretaryName: string; // Thư ký biên bản / cuộc họp (VD: Nguyễn Đức Hoàng)
  certSignerTitle: string; // Chức danh người ký GXN (VD: TRƯỜNG PHÒNG CTHSSV)
  principalName: string; // Họ tên người ký duyệt / Hiệu trưởng (VD: Nguyễn Văn A)
  classZaloLink: string; // Link Zalo Nhóm Lớp
  parentZaloLink: string; // Link Zalo Nhóm Phụ Huynh
}

export const DEFAULT_UNIT_INFO_SETTINGS: UnitInfoSettings = {
  parentAgency: 'UBND TỈNH PHÚ THỌ',
  schoolName: 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC',
  facultyName: 'KHOA CÔNG NGHỆ Ô TÔ',
  majorName: 'Công nghệ ô tô',
  classId: 'CĐK19.2-OT1.CLC',
  academicYear: '2025-2028',
  trainingSystem: 'Cao đẳng chính quy',
  issueLocation: 'Phú Thọ',
  documentSymbol: '.../TN-CĐOT',
  advisorName: 'ThS: Nguyễn Chí Dũng',
  deanName: 'ThS: Đỗ Thế Huân',
  secretaryName: 'Nguyễn Thế Quang',
  certSignerTitle: 'TRƯỜNG PHÒNG CTHSSV',
  principalName: 'Nguyễn Văn A',
  classZaloLink: 'https://zalo.me/g/q8w0zyfvuhi14upj3t7d',
  parentZaloLink: 'https://zalo.me/g/phuhuynh-cdk192-ot1'
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  logoUrl: '',
  schoolName: 'TRƯỜNG CAO ĐẲNG KỸ THUẬT - CÔNG NGHỆ VĨNH PHÚC',
  facultyName: 'KHOA CÔNG NGHỆ Ô TÔ • BỘ MÔN ĐIỆN - ĐIỆN TỬ Ô TÔ',
  systemTitle: 'HỆ THỐNG QUẢN LÝ SINH VIÊN ĐIỆN TỬ - KHOA CÔNG NGHỆ Ô TÔ',
  authorName: 'ThS: Nguyễn Chí Dũng',
  authorPhone: '0865.074.668',
  bannerUrl: '',
  bannerTitle: 'MÔ HÌNH HỆ DẪN ĐỘNG & KHUNG GẦM Ô TÔ THỰC HÀNH XƯỞNG',
  headerBgStart: '#01427a',
  headerBgEnd: '#014c8a',
  tableHeaderBg: '#004e92',
  sidebarBtnBgStart: '#006bb6',
  sidebarBtnBgEnd: '#004883',
  cardBg: '#ffffff',
  presetTheme: 'classic-blue'
};

// ==============================================================================
// 11. HỆ THỐNG PHÂN QUYỀN RBAC & TÀI KHOẢN NGƯỜI DÙNG (AUTHENTICATION)
// ==============================================================================
export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'pending' | 'locked';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  department?: string; // Khoa / Bộ môn
  assignedClassIds: string[]; // Các lớp phụ trách hoặc lớp sinh viên thuộc về
  studentId?: string; // Nếu là cán bộ lớp: gắn với MSSV
  studentRole?: string; // Lớp trưởng, Bí thư, Tổ trưởng...
  canTakeAttendance: boolean; // Được phép vào điểm danh
  canViewOtherClasses?: boolean; // Quyền Admin cấp: Cho phép GVCN xem thêm dữ liệu các lớp khác (Chế độ chỉ xem)
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLogin?: string;
  note?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
}


export interface MenuConfigItem {
  id: ActiveTab;
  name: string;
  order: number;
}

export type MenuConfig = MenuConfigItem[];

export const DEFAULT_MENU_CONFIG: MenuConfig = [
  { id: 'home', name: 'Trang Chủ', order: 0 },
  { id: 'unit-info', name: 'Thông Tin Đơn Vị', order: 1 },
  { id: 'organization', name: 'Quản Lý Lớp Học', order: 2 },
  { id: 'students', name: 'Hồ SƠ Sinh Viên', order: 3 },
  { id: 'grades', name: 'Quản Lý Điểm', order: 4 },
  { id: 'attendance', name: 'Theo Dõi Học Tập', order: 5 },
  { id: 'retake', name: 'Học Lại Thi Lại', order: 6 },
  { id: 'reports', name: 'Báo Cáo Thống Kê', order: 7 },
  { id: 'backup-forms', name: 'Văn Bản Hành Chính', order: 8 },
  { id: 'portal', name: 'Cổng Tra Cứu SV/PH', order: 9 },
];

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  progress?: number;
  lastSync?: string;
  message?: string;
}

