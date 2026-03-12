import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelection from '../components/Register/RoleSelection';
import Icon from '../Images/Icon.png';
import { supabase } from '../supabaseClient';

export default function RegisterCard() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);

    try {
      // Ambil user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User tidak ditemukan. Silakan daftar ulang.');

      // Tunggu sebentar agar trigger handle_new_user sempat membuat profil
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update role di tabel profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Simpan ke localStorage juga (opsional, untuk caching)
      localStorage.setItem('selectedRole', selectedRole);
      navigate('/register-success');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo*/}
      <div className="flex items-center space-x-2 mb-6">
        <img src={Icon} alt="Englify Logo" className="w-6 h-6" />
        <h1 className="text-xl font-semibold text-gray-700">Englify</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm max-w-xl w-full text-center">
          {error}
        </div>
      )}

      {/* Komponen Pilihan Role */}
      <RoleSelection
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onContinue={handleContinue}
        loading={loading}
      />
    </div>
  );
}
