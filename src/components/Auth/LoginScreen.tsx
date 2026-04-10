import React, { useState, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { UserProfile } from '../../types';
import { fetchUserProfile } from '../../services/googleClassroom';
import TeacherDashboard from '../Teacher/TeacherDashboard';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';

interface LoginScreenProps {
    onLogin: (user: UserProfile, accessToken: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [showTeacherDemo, setShowTeacherDemo] = useState(false);
    const [isTeacherLogin, setIsTeacherLogin] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null);
    const [teacherToken, setTeacherToken] = useState<string | null>(null);
    const { language, t } = useLanguage();
    
    // Tilt Effect Logic
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        // Tilt bounds: +/- 5 degrees
        const tiltX = ((clientY / innerHeight) - 0.5) * -10; 
        const tiltY = ((clientX / innerWidth) - 0.5) * 10;
        
        cardRef.current.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const user = await fetchUserProfile(tokenResponse.access_token);
                if (isTeacherLogin) {
                    setTeacherToken(tokenResponse.access_token);
                    setTeacherProfile(user);
                    setShowTeacherDemo(true);
                } else {
                    onLogin(user, tokenResponse.access_token);
                }
            } catch (error) {
                console.error('Failed to fetch user profile', error);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Login Failed', error);
            console.error('Current origin:', window.location.origin);
            setLoading(false);
        },
        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.profile.photos',
    });

    const handleTeacherLogin = () => {
        setIsTeacherLogin(true);
        login();
    };

    if (showTeacherDemo) {
        return <TeacherDashboard user={teacherProfile!} accessToken={teacherToken || undefined} onLogout={() => { setShowTeacherDemo(false); setTeacherToken(null); setIsTeacherLogin(false); setTeacherProfile(null); }} />;
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden bg-gradient-to-br from-[#e6fcf5] via-[#f0fdf4] to-[#ecfdf5]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ambient Background Blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

            <div 
                ref={cardRef}
                className="w-full max-w-5xl bg-white/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50 transition-transform duration-300 ease-out will-change-transform"
            >

                {/* Left Side: Branding & Logos */}
                <div className="md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-center text-center bg-gradient-to-br from-emerald-600 to-green-700 text-white flex flex-col justify-between relative overflow-hidden min-h-[280px] md:min-h-[620px]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="z-10 w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                            <img src="/logos/kmutnb_logo.png" alt="Partner logo 1" className="h-9 sm:h-11 lg:h-12 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm" />
                            <img src="/logos/fte_logo.png" alt="Partner logo 2" className="h-9 sm:h-11 lg:h-12 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm" />
                            <img src="/logos/dce_logo.png" alt="Partner logo 3" className="h-10 sm:h-12 lg:h-14 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm drop-shadow-md" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight tracking-tight drop-shadow-sm">
                            {t('brand.name')}
                        </h1>
                        <h2 className="text-base sm:text-lg font-medium text-emerald-100 mb-3 sm:mb-4 font-sans">
                            {t('brand.tagline')}
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-light max-w-md drop-shadow-sm">
                            {language === 'th'
                                ? 'เครื่องมือเสริมที่ช่วยให้ผู้เรียนและผู้สอนจัดการงานในชั้นเรียนได้ง่ายขึ้น และเห็นข้อมูลสำคัญได้ชัดเจนขึ้น'
                                : 'A third-party workspace that helps students and instructors manage classroom workflows faster and with clearer insights.'}
                        </p>
                    </div>

                    <div className="z-10 mt-8 sm:mt-12">
                        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2 drop-shadow-sm">
                            System
                        </div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                            Classroom Companion
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="md:w-1/2 p-5 sm:p-7 md:p-9 lg:p-10 flex flex-col justify-center relative bg-white">
                    {/* Relocated Language Toggle */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <LanguageToggle />
                    </div>

                    <div className="text-center md:text-left mb-6 sm:mb-8 mt-4 sm:mt-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('login.welcome')}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{t('login.subtitle')}</p>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        {/* Student Mode Card */}
                        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5 hover:bg-emerald-50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-emerald-900">{t('login.studentMode')}</h3>
                                    <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">{t('login.studentWho')}</p>
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-sm">
                                    {language === 'th' ? 'แนะนำ' : 'Recommended'}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-4 leading-relaxed">
                                {t('login.studentDesc')}
                            </p>
                            <button
                                onClick={() => login()}
                                disabled={loading}
                                className="w-full min-h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all px-4 sm:px-6 py-3 rounded-xl group relative overflow-hidden"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold text-sm sm:text-base">{t('login.googleSignIn')}</span>
                                    </>
                                )}
                            </button>
                        </section>

                        {/* Instructor Mode Card */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">{t('login.instructor')}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{t('login.instructorWho')}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-4 leading-relaxed">
                                {t('login.instructorDesc')}
                            </p>
                            <button
                                onClick={handleTeacherLogin}
                                className="w-full min-h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-800 to-green-900 text-white hover:from-emerald-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all px-4 sm:px-6 py-3 rounded-xl font-medium text-sm hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span>{t('login.openInstructor')}</span>
                                <span className="bg-emerald-600/30 text-[10px] px-1.5 py-0.5 rounded text-emerald-100 border border-emerald-500/30">{t('login.teacherMode')}</span>
                            </button>
                        </section>
                    </div>

                    <p className="mt-6 sm:mt-8 text-[11px] sm:text-xs text-gray-400 text-center leading-relaxed">
                        {t('brand.disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
