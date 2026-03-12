import RoleSelectionCard from './RoleSelectionCard';
import StudentImg from '../../Images/Student.png';
import TeacherImg from '../../Images/Teacher.png';


const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Student can join classes and play learning games',
    img: StudentImg,
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Teacher can create and manage lessons',
    img: TeacherImg,
  },
];

export default function RoleSelection({ selectedRole, setSelectedRole, onContinue, loading }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-xl w-full text-center">
      {/* Judul & Deskripsi */}
      <h2 className="text-lg font-semibold mb-1">Choose your role in Englify</h2>
      <p className="text-sm text-gray-500 mb-6">
        Are you joining as a student or a teacher?
      </p>

      {/* Kartu Pilihan Role */}
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <RoleSelectionCard
            key={role.id}
            role={role}
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
          />
        ))}
      </div>

      {/* Tombol Continue */}
      <button
        onClick={onContinue}
        disabled={!selectedRole || loading}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Continue'}
      </button>

      {/* Step Indicator */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <span className="w-4 h-2 rounded-full bg-gray-800"></span>
        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
      </div>
    </div>
  );
}
