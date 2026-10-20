import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  GraduationCap, 
  Sparkles, 
  KeyRound, 
  Eye, 
  EyeOff,
  Clock,
  BookOpen,
  Search,
  ArrowRight
} from 'lucide-react';
import { UserAccount, ClassItem, ThemeSettings } from '../types';

interface AuthLoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
  onRegisterTeacher: (newUser: UserAccount) => void;
  classes: ClassItem[];
  themeSettings?: ThemeSettings;
  onOpenPublicPortal?: () => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({
  onLoginSuccess,
  users,
  onRegisterTeacher,
  classes,
  themeSettings,
  onOpenPublicPortal
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('Khoa Công nghệ Ô tô');
  const [regClassId, setRegClassId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  // Xử lý đăng nhập
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!emailTrim || !passTrim) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    // Tìm kiếm tài khoản
    const foundUser = users.find(u => u.email.trim().toLowerCase() === emailTrim);

    if (!foundUser) {
      setLoginError('Email đăng nhập không tồn tại trên hệ thống!');
      return;
    }

    if (foundUser.password !== passTrim) {
      setLoginError('Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
      return;
    }

    if (foundUser.status === 'pending') {
      setLoginError('⚠️ Tài khoản của Thầy/Cô đang ở trạng thái CHỜ ADMIN DUYỆT. Vui lòng liên hệ Quản trị viên (dl1032008@gmail.com - 0865.074.668) để được kích hoạt!');
      return;
    }

    if (foundUser.status === 'locked') {
      setLoginError('⛔ Tài khoản này đã bị khóa hoặc tạm dừng quyền truy cập. Vui lòng liên hệ Admin!');
      return;
    }

    // Đăng nhập thành công
    onLoginSuccess(foundUser);
  };

  // Xử lý đăng ký giáo viên
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);
    setRegSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegErrorMsg('Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    if (regPassword.length < 3) {
      setRegErrorMsg('Mật khẩu phải có tối thiểu 3 ký tự!');
      return;
    }

    const emailTrim = regEmail.trim().toLowerCase();
    const existing = users.find(u => u.email.trim().toLowerCase() === emailTrim);
    if (existing) {
      setRegErrorMsg('Email này đã được đăng ký trên hệ thống! Vui lòng dùng email khác hoặc liên hệ Admin.');
      return;
    }

    const newUser: UserAccount = {
      id: `USR_${Date.now()}`,
      email: emailTrim,
      password: regPassword,
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
      role: 'teacher',
      status: 'pending', // Luôn ở trạng thái chờ admin duyệt theo yêu cầu
      department: regDepartment.trim(),
      assignedClassIds: regClassId ? [regClassId] : [],
      canTakeAttendance: true,
      createdAt: new Date().toLocaleString('vi-VN'),
      note: regClassId ? `Xin phụ trách lớp ${regClassId}` : 'Giảng viên đăng ký mới'
    };

    onRegisterTeacher(newUser);
    setRegSuccessMsg(`✅ Đăng ký thành công! Tài khoản "${newUser.fullName}" đã được gửi lên hệ thống. Vui lòng đợi Admin phê duyệt trước khi đăng nhập.`);
    
    // Reset form
    setRegFullName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegClassId('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Left Col: Cột Nhận Diện Thương Hiệu Chuẩn Hình 2 */}
        <div 
          style={{
            background: `linear-gradient(180deg, ${themeSettings?.headerBgStart || '#013a6b'} 0%, ${themeSettings?.headerBgEnd || '#014c8a'} 100%)`
          }}
          className="md:w-[48%] px-5 sm:px-6 py-8 sm:py-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0 min-h-[460px]"
        >
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-sky-400/10 pointer-events-none blur-xl" />

          {/* Header & Logo: vừa vặn khung, không bị ngắt dòng chữ HỆ THỐNG QUẢN LÝ ĐIỆN TỬ */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 w-full">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              {themeSettings?.logoUrl ? (
                <img src={themeSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                  <defs>
                    <linearGradient id="crestRedClean" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="40%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <linearGradient id="crestBlueClean" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="40%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0c4a6e" />
                    </linearGradient>
                    <linearGradient id="crestDarkClean" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  </defs>
                  <path d="M50 12 L84 32 L50 50 L16 32 Z" fill="url(#crestDarkClean)" />
                  <path d="M16 38 L48 56 L48 90 L16 72 Z" fill="url(#crestBlueClean)" />
                  <path d="M52 56 L84 38 L84 72 L52 90 Z" fill="url(#crestRedClean)" />
                  <path d="M28 48 L48 60 L48 80 L28 68 Z" fill="#38bdf8" opacity="0.75" />
                  <path d="M52 60 L72 48 L72 68 L52 80 Z" fill="#f87171" opacity="0.75" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[12.5px] sm:text-[13px] md:text-[13.5px] lg:text-[14px] font-black text-white uppercase tracking-tight leading-tight whitespace-nowrap">
                HỆ THỐNG QUẢN LÝ ĐIỆN TỬ
              </h2>
              <p className="text-[11px] text-sky-100 font-medium whitespace-nowrap truncate mt-0.5">
                Phát triển bởi: {themeSettings?.authorName || 'ThS: Nguyễn Chí Dũng'}
              </p>
            </div>
          </div>

          {/* Centered Main School & Faculty Titles: không bị rớt chữ KHOA CÔNG NGHỆ Ô TÔ */}
          <div className="relative z-10 my-auto py-8 sm:py-10 text-center space-y-2 w-full px-1">
            <h3 className="text-[11px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider leading-relaxed">
              {themeSettings?.schoolName || 'TRƯỜNG CAO ĐẲNG KỸ THUẬT – CÔNG NGHỆ VĨNH PHÚC'}
            </h3>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-tight whitespace-nowrap leading-tight">
              {themeSettings?.facultyName ? themeSettings.facultyName.split('•')[0].trim() : 'KHOA CÔNG NGHỆ Ô TÔ'}
            </h2>
          </div>

          {/* Subtle bottom badge for vertical elegance */}
          <div className="relative z-10 flex items-center justify-center">
            <span className="text-[10px] text-sky-200/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 tracking-wide uppercase font-semibold">
              Quản trị Đào tạo & Cố vấn GDNN
            </span>
          </div>
        </div>

        {/* Right Col: Form Đăng Nhập & Đăng Ký */}
        <div className="md:w-[52%] p-6 sm:p-8 flex flex-col justify-between bg-white">
          
          {/* Header Switch Tabs */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setLoginError(null); }}
                  className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'login'
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>ĐĂNG NHẬP</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setRegErrorMsg(null); setRegSuccessMsg(null); }}
                  className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'register'
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ĐĂNG KÝ GIÁO VIÊN</span>
                </button>

                {onOpenPublicPortal && (
                  <button
                    type="button"
                    onClick={onOpenPublicPortal}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Cổng tra cứu học tập dành cho Phụ huynh & HSSV không cần tài khoản"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tra Cứu HSSV ↗</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Hệ thống Quản trị v3.5
              </span>
            </div>

            {/* TAB 1: FORM ĐĂNG NHẬP (Giao diện sạch sẽ chuẩn Hình 2) */}
            {activeMode === 'login' && (
              <div className="pt-5 animate-in fade-in duration-200">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Đăng nhập tài khoản làm việc
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn vai trò trải nghiệm nhanh hoặc nhập email/mật khẩu để tiếp tục.
                  </p>
                </div>

                {/* 3 Nút đăng nhập nhanh theo 3 giao diện người dùng yêu cầu */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-200/80 rounded-2xl shadow-2xs space-y-2">
                  <span className="text-[11px] font-black uppercase text-blue-900 tracking-wide block">
                    ⚡ Chọn nhanh vai trò kiểm tra giao diện:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Nút 1: Admin */}
                    <button
                      type="button"
                      onClick={() => {
                        const adminUser = users.find(u => u.role === 'admin') || {
                          id: 'USR_ADMIN_MASTER',
                          email: 'dl1032008@gmail.com',
                          password: 'admin',
                          fullName: 'ThS. Nguyễn Chí Dũng',
                          phone: '0865.074.668',
                          role: 'admin' as const,
                          status: 'active' as const,
                          department: 'Khoa Công nghệ Ô tô',
                          assignedClassIds: ['*'],
                          canTakeAttendance: true,
                          createdAt: '2025-01-01 08:00'
                        };
                        onLoginSuccess(adminUser);
                      }}
                      className="p-2 bg-white hover:bg-amber-50 border border-amber-300 rounded-xl text-left cursor-pointer transition shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">👑</span>
                        <span className="font-black text-amber-900 text-xs">Admin Master</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight group-hover:text-amber-800">
                        Hiện đầy đủ các mục
                      </p>
                    </button>

                    {/* Nút 2: Người dùng */}
                    <button
                      type="button"
                      onClick={() => {
                        const teacherUser = users.find(u => u.role === 'teacher') || {
                          id: 'USR_TEACHER_DEMO',
                          email: 'gv.oto@caodang.edu.vn',
                          password: 'gv123',
                          fullName: 'ThS. Lê Văn Bình',
                          phone: '0912.345.678',
                          role: 'teacher' as const,
                          status: 'active' as const,
                          department: 'Khoa Công nghệ Ô tô',
                          assignedClassIds: ['CĐK19.2-OT1.CLC', 'CĐK19.2-OT2'],
                          canTakeAttendance: true,
                          canViewOtherClasses: true,
                          createdAt: '2025-01-05 09:00'
                        };
                        onLoginSuccess(teacherUser);
                      }}
                      className="p-2 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl text-left cursor-pointer transition shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">👨‍🏫</span>
                        <span className="font-black text-blue-900 text-xs">Người dùng</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight group-hover:text-blue-800">
                        Ẩn TT đơn vị, QL lớp, Sao lưu, Setup admin
                      </p>
                    </button>

                    {/* Nút 3: Sinh viên điểm danh */}
                    <button
                      type="button"
                      onClick={() => {
                        const studentUser = users.find(u => u.role === 'student') || {
                          id: 'USR_STUDENT_ATTENDANCE',
                          email: 'sv.hoang@caodang.edu.vn',
                          password: 'sv123',
                          fullName: 'Trần Văn Hoàng',
                          phone: '0987.654.321',
                          role: 'student' as const,
                          status: 'active' as const,
                          department: 'Lớp CĐK19.2-OT1.CLC',
                          assignedClassIds: ['CĐK19.2-OT1.CLC'],
                          studentId: '25CDOT-001',
                          studentRole: 'Lớp trưởng',
                          canTakeAttendance: true,
                          createdAt: '2025-01-10 10:00'
                        };
                        onLoginSuccess(studentUser);
                      }}
                      className="p-2 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl text-left cursor-pointer transition shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🎓</span>
                        <span className="font-black text-emerald-900 text-xs">Sinh viên</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight group-hover:text-emerald-800">
                        Chỉ hiện lớp và điểm danh
                      </p>
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{loginError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 my-3">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hoặc đăng nhập bằng tài khoản</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Email đăng nhập: <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email đăng nhập"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Mật khẩu: <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Bảo mật cấp cao
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                  </button>
                </form>

                <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Chưa có tài khoản giảng viên?</span>
                  <button
                    type="button"
                    onClick={() => { setActiveMode('register'); setRegErrorMsg(null); }}
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Đăng ký tài khoản mới →
                  </button>
                </div>

                {onOpenPublicPortal && (
                  <div className="mt-2.5 text-center">
                    <button
                      type="button"
                      onClick={onOpenPublicPortal}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Phụ huynh & HSSV tra cứu kết quả trực tuyến (không cần tài khoản) →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FORM ĐĂNG KÝ DÀNH CHO GIÁO VIÊN */}
            {activeMode === 'register' && (
              <div className="pt-5 animate-in fade-in duration-200">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Đăng ký tài khoản Giảng viên / Cố vấn
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sau khi đăng ký, Quản trị viên (dl1032008@gmail.com) sẽ phê duyệt và phân quyền lớp cho Thầy/Cô.
                  </p>
                </div>

                {regSuccessMsg && (
                  <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">{regSuccessMsg}</p>
                      <button
                        type="button"
                        onClick={() => { setActiveMode('login'); }}
                        className="text-blue-700 underline font-bold"
                      >
                        Chuyển về màn hình đăng nhập
                      </button>
                    </div>
                  </div>
                )}

                {regErrorMsg && (
                  <div className="mb-3.5 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold">{regErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Họ và tên Giáo viên: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="VD: ThS. Lê Văn Bình"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Số điện thoại (Zalo): <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="VD: 0912.345.678"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Email đăng nhập: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="VD: gv.binh@caodang.edu.vn"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Khoa / Bộ môn giảng dạy:
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          placeholder="Khoa Công nghệ Ô tô"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Lớp đề xuất phụ trách (nếu có):
                    </label>
                    <select
                      value={regClassId}
                      onChange={(e) => setRegClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="">-- Chưa chọn / Admin sẽ phân công sau --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Mật khẩu: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Nhập mật khẩu"
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nhập lại mật khẩu: <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Xác nhận mật khẩu"
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>GỬI ĐĂNG KÝ ĐỂ ADMIN PHÊ DUYỆT</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-between">
            <span>Hệ thống Quản trị & Cố vấn Học tập Điện tử</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật đa cấp
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
