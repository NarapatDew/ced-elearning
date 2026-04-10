import React, { useState, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { UserProfile } from '../../types';
import { fetchUserProfile } from '../../services/googleClassroom';
import TeacherDashboard from '../Teacher/TeacherDashboard';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';
import ParticleBackground from './ParticleBackground';

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

    // Global Parallax Background Logic
    const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

    const handleGlobalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        // Calculate a gentle offset (divide by a large number for subtle movement)
        const offsetX = (clientX - innerWidth / 2) / 40; 
        const offsetY = (clientY - innerHeight / 2) / 40;
        setBgOffset({ x: offsetX, y: offsetY });
    };

    // Spotlight effect logic
    const loginFormRef = useRef<HTMLDivElement>(null);
    const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

    const handleFormMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!loginFormRef.current) return;
        const rect = loginFormRef.current.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleFormMouseLeave = () => {
        setCursorPos({ x: -1000, y: -1000 });
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
            onMouseMove={handleGlobalMouseMove}
        >
            {/* Global Interactive Particle Network */}
            <ParticleBackground />

            {/* Ambient Background Blobs with Parallax Effect */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)` }}
            >
                <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            </div>
            
            <div 
                className="absolute inset-0 z-0 pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translate(${bgOffset.x * -1.5}px, ${bgOffset.y * -1.5}px)` }}
            >
                <div className="absolute top-10 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
            
            <div 
                className="absolute inset-0 z-0 pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translate(${bgOffset.x * 0.5}px, ${bgOffset.y * -2}px)` }}
            >
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-5xl bg-white/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">

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
                <div 
                    ref={loginFormRef}
                    onMouseMove={handleFormMouseMove}
                    onMouseLeave={handleFormMouseLeave}
                    className="md:w-1/2 p-5 sm:p-7 md:p-9 lg:p-10 flex flex-col justify-center relative bg-white overflow-hidden"
                >
                    {/* Interactive Dot Grid Reveal Effect */}
                    <div 
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                        style={{
                            backgroundImage: 'radial-gradient(#059669 1.5px, transparent 1.5px)',
                            backgroundSize: '32px 32px',
                            WebkitMaskImage: `radial-gradient(350px circle at ${cursorPos.x}px ${cursorPos.y}px, black, transparent)`,
                            maskImage: `radial-gradient(350px circle at ${cursorPos.x}px ${cursorPos.y}px, black, transparent)`,
                            opacity: 0.15
                        }}
                    />
                    
                    {/* Vibrant Glow Aura */}
                    <div 
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 mix-blend-overlay"
                        style={{
                            background: `radial-gradient(400px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(16, 185, 129, 0.2), transparent 70%)`
                        }}
                    />

                    {/* Relocated Language Toggle */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                        <LanguageToggle />
                    </div>

                    <div className="text-center md:text-left mb-6 sm:mb-8 mt-4 sm:mt-0 relative z-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('login.welcome')}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{t('login.subtitle')}</p>
                    </div>

                    <div className="space-y-4 sm:space-y-5 relative z-10">
                        {/* Student Mode Card */}
                        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] hover:bg-white hover:border-emerald-300 relative z-0 hover:z-10 group">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{t('login.studentMode')}</h3>
                                    <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">{t('login.studentWho')}</p>
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    {language === 'th' ? 'แนะนำ' : 'Recommended'}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-4 leading-relaxed group-hover:text-gray-800 transition-colors">
                                {t('login.studentDesc')}
                            </p>
                            <button
                                onClick={() => login()}
                                disabled={loading}
                                className="w-full min-h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white group-hover:shadow-md transition-all px-4 sm:px-6 py-3 rounded-xl overflow-hidden"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
                                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5 block" />
                                        </div>
                                        <span className="font-semibold text-sm sm:text-base">{t('login.googleSignIn')}</span>
                                    </>
                                )}
                            </button>
                        </section>

                        {/* Instructor Mode Card */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(15,23,42,0.15)] hover:border-slate-400 relative z-0 hover:z-10 group">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{t('login.instructor')}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{t('login.instructorWho')}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-4 leading-relaxed group-hover:text-gray-800 transition-colors">
                                {t('login.instructorDesc')}
                            </p>
                            <button
                                onClick={handleTeacherLogin}
                                className="w-full min-h-11 flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-gradient-to-r group-hover:from-emerald-700 group-hover:to-green-800 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg transition-all px-4 sm:px-6 py-3 rounded-xl font-medium text-sm"
                            >
                                <span>{t('login.openInstructor')}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded transition-colors bg-slate-200 text-slate-700 border border-slate-300 group-hover:bg-emerald-600/30 group-hover:text-emerald-100 group-hover:border-emerald-500/30">{t('login.teacherMode')}</span>
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
