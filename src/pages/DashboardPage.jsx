// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Impor komponen KONTEN
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCards from '../components/dashboard/StatCards';
import BadgeDisplay from '../components/dashboard/BadgeDisplay';
import UserProfileCard from '../components/dashboard/UserProfileCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import AuthDebugger from '../components/AuthDebugger';

const DashboardPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                try {
                    // Gunakan maybeSingle() agar tidak throw error jika profil belum ada
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileError) throw profileError;
                    
                    if (data) {
                        // Profil ditemukan, gunakan langsung
                        setProfile({ ...data, email: user.email });
                    } else {
                        // Profil belum ada (trigger belum sempat jalan), buat sekarang
                        const defaultProfile = {
                            id: user.id,
                            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                            role: localStorage.getItem('selectedRole') || 'student',
                            total_points: 0,
                            point_achievement: 0,
                            games_played: 0,
                            badge: 'Bronze',
                        };
                        const { data: newProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert(defaultProfile)
                            .select()
                            .single();

                        if (insertError) throw insertError;
                        setProfile({ ...newProfile, email: user.email });
                    }
                } catch (err) {
                    setError(err.message);
                    console.error("Error fetching profile:", err.message);
                }
            }
            setLoading(false);
        };
        
        fetchProfileData();
    }, [user]);

    if (loading) {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AuthDebugger />
                <p className="text-xl">Gagal memuat data dasbor.</p>
                <p className="text-gray-500 mt-2">Pastikan Anda sudah login dan profil Anda ada.</p>
                <a href="/login" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">
                    Kembali ke Halaman Login
                </a>
            </div>
        );
    }

    return (
        <>
            <AuthDebugger />
            <WelcomeBanner profile={profile} />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <StatCards profile={profile} />
                </div>
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <BadgeDisplay profile={profile} />
                        <UserProfileCard profile={profile} />
                    </div>
                </div>
            </div>
            <RecentActivity />
        </>
    );
};

export default DashboardPage;
