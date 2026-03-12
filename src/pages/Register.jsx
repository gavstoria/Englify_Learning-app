import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: fullName },
            }
        });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            // Langsung ke pilih role tanpa konfirmasi email
            navigate('/select-role');
        }
        setLoading(false);
    };

    const handleOAuthRegister = async (provider) => {
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/select-role`,
            },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
                 <h2 className="text-2xl font-bold text-center mb-1">Create a Profile</h2>
                 <p className="text-sm text-gray-500 text-center mb-6">
                     Create a free profile in less than 5 minutes
                 </p>
                 <div className="space-y-3 mb-6">
                     <button type="button" onClick={() => handleOAuthRegister('google')} className="w-full flex items-center justify-center gap-2 border rounded-md py-2 shadow-sm hover:bg-gray-100 transition"><FcGoogle size={20} /><span className="text-sm font-medium">Register with Google</span></button>
                     <button type="button" onClick={() => handleOAuthRegister('twitter')} className="w-full flex items-center justify-center gap-2 border rounded-md py-2 shadow-sm hover:bg-gray-100 transition"><FaXTwitter size={18} /><span className="text-sm font-medium">Register with X</span></button>
                 </div>
                 <div className="flex items-center mb-6"><hr className="flex-grow border-gray-300" /><span className="px-3 text-sm text-gray-500">or</span><hr className="flex-grow border-gray-300" /></div>
                 <form className="space-y-4" onSubmit={handleEmailRegister}>
                     <div>
                         <label className="text-sm font-medium">Full Name*</label>
                         <input type="text" placeholder="e.g. Arief Maulana" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                     </div>
                     <div>
                         <label className="text-sm font-medium">Email*</label>
                         <input type="email" placeholder="Enter your email address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                     </div>
                     <div>
                         <label className="text-sm font-medium">Password*</label>
                         <input type="password" placeholder="Must be at least 8 characters" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                     </div>
                     <div className="flex items-start space-x-2">
                         <input type="checkbox" id="terms" className="mt-1" required />
                         <label htmlFor="terms" className="text-sm cursor-pointer">I agree with terms and conditions</label>
                     </div>
                     {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                     <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition disabled:bg-gray-400">{loading ? 'Sending...' : 'Continue'}</button>
                 </form>
                 <p className="text-sm text-center mt-4">Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link></p>
             </div>
        </div>
    );
}

export default Register;
