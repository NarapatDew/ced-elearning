import React, { useState, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
    Sparkles,
    ShieldCheck,
    Heart,
    ArrowRight,
    Layers,
    Fingerprint
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { fetchUserProfile } from '../../services/googleClassroom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';
import ParticleBackground from './ParticleBackground';

interface LoginScreenProps {
    onLogin: (user: UserProfile, accessToken: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const { language, t } = useLanguage();

    // Global Parallax Background Logic
    const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

    const handleGlobalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const offsetX = (clientX - innerWidth / 2) / 50;
        const offsetY = (clientY - innerHeight / 2) / 50;
        setBgOffset({ x: offsetX, y: offsetY });
    };

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
                onLogin(user, tokenResponse.access_token);
            } catch (error) {
                console.error('Failed to fetch user profile', error);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Login Failed', error);
            setLoading(false);
        },
        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.profile.photos',
    });

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden bg-[#fafafa]"
            onMouseMove={handleGlobalMouseMove}
        >
            {/* Interactive Particle Network */}
            <ParticleBackground />

            {/* Premium Ambient Layers */}
            <div
                className="absolute inset-0 z-0 pointer-events-none transition-transform duration-500 ease-out opacity-40"
                style={{ transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)` }}
            >
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-6xl bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row relative z-10 border border-white/60">

                {/* Left Side: The "Classroom Companion" Principle */}
                <div className="lg:w-[45%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-slate-900 text-white relative overflow-hidden min-h-[400px]">
                    {/* Decorative Mesh */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

                    <div className="z-10">
                        <div className="flex flex-col gap-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-white rounded-2xl shadow-lg ring-1 ring-slate-200">
                                        <img src="/logos/kmutnb_logo.png" alt="KMUTNB" className="h-10 w-auto" />
                                    </div>
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center leading-tight">KMUTNB</span>
                                </div>
                                <div className="h-10 w-px bg-white/10 mt-[-20px]"></div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-white rounded-2xl shadow-lg ring-1 ring-slate-200">
                                        <img src="/logos/fte_logo.png" alt="FTE" className="h-10 w-auto" />
                                    </div>
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center leading-tight">FTE</span>
                                </div>
                                <div className="h-10 w-px bg-white/10 mt-[-20px]"></div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-white rounded-2xl shadow-lg ring-1 ring-slate-200">
                                        <img src="/logos/dce_logo.png" alt="CED" className="h-10 w-auto" />
                                    </div>
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center leading-tight">CED</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
                                <Sparkles size={12} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Classroom Companion System</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                                Classroom<br />
                                <span className="text-emerald-400">Companion</span>
                            </h1>

                            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-md font-medium pr-8">
                                {language === 'th'
                                    ? 'พื้นที่จัดการเรียนการสอนที่ถูกปรับแต่งเพื่อช่วยติดตามความคืบหน้า และติดตามนักเรียนที่ไม่ส่งงานได้อย่างมีประสิทธิภาพ'
                                    : 'A customized workspace designed to help you track progress and efficiently follow up with students who haven\'t submitted work.'}
                            </p>
                        </div>
                    </div>

                    <div className="z-10 grid grid-cols-2 gap-6 pt-12 border-t border-white/10">
                        <div>
                            <div className="text-emerald-400 mb-2"><Heart size={20} /></div>
                            <h4 className="text-sm font-bold mb-1">{language === 'th' ? 'ความเข้าอกเข้าใจ' : 'Empathy First'}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{language === 'th' ? 'มองเห็นปัญหาผ่านข้อมูลที่เป็นมิตร' : 'Understand hurdles through friendly data.'}</p>
                        </div>
                        <div>
                            <div className="text-blue-400 mb-2"><ShieldCheck size={20} /></div>
                            <h4 className="text-sm font-bold mb-1">{language === 'th' ? 'ความสำเร็จที่ยั่งยืน' : 'Proven Success'}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{language === 'th' ? 'ติดตามความคืบหน้าแบบนาทีต่อนาที' : 'Real-time tracking for every milestone.'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Identity Selection */}
                <div
                    ref={loginFormRef}
                    onMouseMove={handleFormMouseMove}
                    onMouseLeave={handleFormMouseLeave}
                    className="flex-1 p-8 sm:p-12 md:p-16 flex flex-col justify-center relative bg-white"
                >
                    {/* Interactive Spotlight Aura */}
                    <div
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-30"
                        style={{
                            background: `radial-gradient(600px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)`
                        }}
                    />

                    {/* Relocated Language Toggle */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                        <LanguageToggle />
                    </div>

                    <div className="text-center md:text-left mb-12 sm:mb-8 mt-4 sm:mt-0 relative z-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {language === 'th' ? 'เข้าสู่ระบบจัดการชั้นเรียน' : 'Classroom Sign In'}
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">{t('login.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

                        {/* Student Portal Card */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] scale-[0.98] group-hover:scale-105 group-hover:bg-emerald-500/10 blur-xl transition-all duration-500"></div>
                            <div className="relative bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 flex flex-col h-full">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-emerald-100 shadow-lg">
                                    <Fingerprint size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('login.studentMode')}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                                    {language === 'th'
                                        ? 'จัดลำดับงานสำคัญ ดูข้อมูลวิเคราะห์รายบุคคล และติดตามความก้าวหน้าของคุณ'
                                        : 'Prioritize tasks, see personalized insights, and keep track of your learning journey.'}
                                </p>
                                <button
                                    onClick={() => login()}
                                    disabled={loading}
                                    className="w-full h-12 flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all font-bold text-xs shadow-sm hover:shadow-xl hover:shadow-emerald-200 active:scale-95 px-3 group/btn"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    ) : (
                                        <>
                                            <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-sm ring-1 ring-slate-100 group-hover/btn:ring-white/20 transition-all">
                                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="flex-1 text-center whitespace-nowrap">
                                                {t('login.googleSignIn')}
                                            </span>
                                            <ArrowRight size={16} className="shrink-0 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Teacher portal Card */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-[2.5rem] scale-[0.98] group-hover:scale-105 group-hover:bg-indigo-500/10 blur-xl transition-all duration-500"></div>
                            <div className="relative bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col h-full">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-indigo-100 shadow-lg">
                                    <Layers size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('login.instructor')}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                                    {language === 'th'
                                        ? 'ติดตามผลการเรียน ค้นหานักเรียนที่อาจต้องการการดูแล และบริหารคลาสง่ายขึ้น'
                                        : 'Analyze performance, identify at-risk students, and manage your classes seamlessly.'}
                                </p>
                                <button
                                    onClick={() => login()}
                                    className="w-full h-12 flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white transition-all font-bold text-xs active:scale-95 px-3 group/btn"
                                >
                                    <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-sm ring-1 ring-slate-100 group-hover/btn:ring-white/20 transition-all">
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="flex-1 text-center whitespace-nowrap">
                                        {t('login.googleSignIn')}
                                    </span>
                                    <ArrowRight size={16} className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 border-t border-slate-100 pt-8">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                            System Version 1.0.2 / 2024
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 text-center sm:text-right max-w-xs leading-normal">
                            Managed and powered by the DCE Workspace. Strictly for educational purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
