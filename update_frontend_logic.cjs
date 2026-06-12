const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const newScript = `
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (authMode === 'register') {
      if (!authEmail || !authName || !authPassword || !authConfirmPassword) {
        setAuthError("Email, Full Name, Password, and Confirm Password are required.");
        setIsLoading(false);
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
    } else if (authMode === 'forgot_password') {
      if (!authEmail) {
        setAuthError("Email is required.");
        setIsLoading(false);
        return;
      }
    }

    if (!/^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/.test(authEmail)) {
      setAuthError("Please provide a valid email format.");
      setIsLoading(false);
      return;
    }
    if (authMode === 'register' && authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: authEmail, mode: authMode })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to send OTP.");
      } else {
        setAuthOtpSent(true);
        setResendCooldown(30);
        if (data.simMode) {
          setAuthError("We've sent an OTP to your email! (Simulated, use 123456)");
        } else {
          setAuthError("We've sent an OTP to your email! Please enter it to verify. It expires in 5 minutes.");
        }
      }
    } catch {
      setAuthError("Network error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (authMode === 'login') {
      if (!authEmail || !authPassword) {
        setAuthError("Email and Password are required.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: authEmail, password: authPassword })
        });
        const data = await res.json();
        
        if (!res.ok) {
          setAuthError(data.error || "Login failed");
        } else {
          setAuthData(data);
          setAuthModalOpen(false);
          resetAuthForms();
        }
      } catch (err: any) {
        setAuthError("Server sync error. Please try again.");
      }
    } else if (authMode === 'register') {
      if (!authOtpSent) {
         await handleSendOtp(e);
         return;
      }
      if (!authOtp || authOtp.length !== 6) {
        setAuthError("Exactly 6-digit OTP is required.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Note: using authName as username fallback
          body: JSON.stringify({ email: authEmail, name: authName, phone: authPhone || '', password: authPassword, username: authName, otp: authOtp })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Signup failed");
        } else {
          setAuthData(data);
          setAuthModalOpen(false);
          resetAuthForms();
          alert("Account created successfully!");
        }
      } catch {
        setAuthError("Server sync error. Please try again.");
      }
    } else if (authMode === 'forgot_password') {
       if (!authOtpSent) {
         await handleSendOtp(e);
         return;
      }
      if (!authOtp || authOtp.length !== 6) {
        setAuthError("Exactly 6-digit OTP is required.");
        setIsLoading(false);
        return;
      }
      if (!authPassword || authPassword.length < 6) {
        setAuthError("New password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle: authEmail, newPassword: authPassword, otp: authOtp })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Password reset failed");
        } else {
          alert("Password updated successfully! Please log in.");
          setAuthMode('login');
          resetAuthForms();
        }
      } catch {
        setAuthError("Server sync error. Please try again.");
      }
    }
    
    setIsLoading(false);
  };

  const resetAuthForms = () => {
     setAuthEmail('');
     setAuthName('');
     setAuthPhone('');
     setAuthPassword('');
     setAuthConfirmPassword('');
     setAuthOtpSent(false);
     setAuthOtp('');
     setIsLoading(false);
  };
`;

code = code.replace(/const handleSendOtp =.*?const handleLogout =/s, newScript + "\\n\\n  const handleLogout =");

fs.writeFileSync('src/App.tsx', code);
