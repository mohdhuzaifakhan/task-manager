import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckSquare, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.signup({ name, email, password, role });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome to TaskFlow, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl -ml-64 -mt-64"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-200/20 rounded-full blur-3xl -mr-48 -mb-48"></div>

      <div className="w-full max-w-lg animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-600 rounded-2xl mb-4">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2 font-medium">Join thousands of teams managing work effectively</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-11"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="label">Role Type</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="input pl-11 appearance-none bg-no-repeat bg-[right_1rem_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")` }}
                  >
                    <option value="MEMBER">Team Member</option>
                    <option value="ADMIN">Project Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-start border border-slate-100">
              <input type="checkbox" required className="mt-1 accent-violet-600" />
              <p className="text-[12px] leading-relaxed text-slate-500">
                I agree to the <a href="#" className="text-violet-600 font-semibold underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-violet-600 font-semibold underline underline-offset-2">Privacy Policy</a>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base justify-center mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-violet-600 hover:text-violet-700">Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
