import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import loginBg from '@/assets/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetSent, setResetSent] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    const success = await login(email, password);

    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={loginBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 glow-effect">

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">SmartFinance</span>
          </div>

          <h1 className="text-xl font-semibold text-center mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-center mb-6">
            Sign in to manage your finances
          </p>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(val) => setRemember(val === true)}
                />
                <span className="text-sm">Remember me</span>
              </div>

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-blue-500"
              >
                Forgot Password?
              </button>
            </div>

            {/* Button */}
            <Button type="submit" className="w-full">
              {loading ? 'Loading...' : 'Sign In'}
            </Button>

          </form>

          <p className="text-center text-sm mt-6">
            New user?{' '}
            <Link to="/register" className="text-blue-500">
              Create account
            </Link>
          </p>

        </div>
      </motion.div>

      {/* Forgot Password */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>

          {resetSent ? (
            <p className="text-center">Reset link sent (demo)</p>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Enter email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!resetEmail) {
                    alert("Enter email");
                    return;
                  }
                  setResetSent(true);
                }}
              >
                Send Reset Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;