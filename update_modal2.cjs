const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('{authModalOpen && (');
if (startIndex === -1) process.exit(1);

const endIndex = code.indexOf(')}', code.indexOf('</form>', startIndex)) + 2;

const newModal = \`{authModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs" onClick={() => setAuthModalOpen(false)} />
          
          <div className="relative soft-card dark:backdrop-blur-2xl p-6 sm:p-8 rounded-3xl w-full max-w-md animate-zoom-in space-y-4 shadow-2xl">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-lavender-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-2xl">🌸</span>
              <h3 className="font-serif font-bold text-xl text-zinc-800 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authMode === 'login' ? 'Sign in to your account' : authMode === 'register' ? 'Join our creative circle' : 'Recover your account access'}
              </p>
            </div>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 mb-4 rounded-full">
              <button
                className={\`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors \${authMode === 'login' ? 'bg-white dark:bg-zinc-700 shadow flex items-center justify-center text-zinc-800 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}\`}
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthOtpSent(false); }}
              >
                Sign In
              </button>
              <button
                className={\`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors \${authMode === 'register' ? 'bg-white dark:bg-zinc-700 shadow flex items-center justify-center text-zinc-800 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}\`}
                onClick={() => { setAuthMode('register'); setAuthError(''); setAuthOtpSent(false); }}
              >
                Sign Up
              </button>
            </div>

            {authError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-xl text-center font-medium">⚠️ {authError}</p>}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs font-semibold text-zinc-650">
              
              {!authOtpSent && authMode === 'register' && (
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                  />
                </div>
              )}

              <div>
                 <label className="block text-zinc-400 mb-1">Email Address <span className="text-red-400">*</span></label>
                 <input
                   type="email"
                   required
                   disabled={authOtpSent}
                   value={authEmail}
                   onChange={(e) => setAuthEmail(e.target.value)}
                   placeholder="e.g. hello@example.com"
                   className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none disabled:opacity-50"
                 />
              </div>

              {((authMode === 'login') || (authMode === 'register' && !authOtpSent) || (authMode === 'forgot_password' && authOtpSent)) && (
                 <div>
                   <label className="block text-zinc-400 mb-1">
                     {authMode === 'forgot_password' ? 'New Password' : 'Password'} <span className="text-red-400">*</span>
                   </label>
                   <div className="relative">
                     <input
                       type={showPassword ? "text" : "password"}
                       required
                       value={authPassword}
                       onChange={(e) => setAuthPassword(e.target.value)}
                       placeholder="Min. 6 characters"
                       className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 font-normal text-[10px]"
                     >
                       {showPassword ? 'HIDE' : 'SHOW'}
                     </button>
                   </div>
                   {authMode === 'login' && (
                     <button 
                       type="button" 
                       onClick={() => { setAuthMode('forgot_password'); setAuthError(''); setAuthOtpSent(false); }} 
                       className="text-[10px] text-lavender-500 hover:text-lavender-600 mt-1 float-right"
                     >
                       Forgot Password?
                     </button>
                   )}
                   <div className="clear-both"></div>
                 </div>
              )}

              {((authMode === 'register' && !authOtpSent) || (authMode === 'forgot_password' && authOtpSent)) && (
                 <div>
                   <label className="block text-zinc-400 mb-1">Confirm Password <span className="text-red-400">*</span></label>
                   <div className="relative">
                     <input
                       type={showPassword ? "text" : "password"}
                       required
                       value={authConfirmPassword}
                       onChange={(e) => setAuthConfirmPassword(e.target.value)}
                       placeholder="Match your password"
                       className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                     />
                   </div>
                 </div>
              )}

              {authOtpSent && (authMode === 'register' || authMode === 'forgot_password') && (
                <div>
                  <label className="block text-zinc-400 mb-1">Enter Verification Code (OTP) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none text-center tracking-widest text-lg"
                    maxLength={6}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                     <p className="text-[10px] text-zinc-400 font-medium">OTP expires in 5:00</p>
                     <button 
                       type="button"
                       disabled={resendCooldown > 0 || isLoading}
                       onClick={handleSendOtp}
                       className="text-[10px] text-lavender-500 hover:text-lavender-600 disabled:text-zinc-300 disabled:hover:text-zinc-300 font-bold"
                     >
                       {resendCooldown > 0 ? \`Resend in \${resendCooldown}s\` : 'Resend OTP'}
                     </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-lavender-400 hover:bg-lavender-500 text-white font-bold tracking-wide shadow-sm transition-colors mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Secure Login' : (!authOtpSent ? 'Continue' : 'Verify & Complete'))}
              </button>
            </form>
          </div>
        </div>
      )}\`;

code = code.substring(0, startIndex) + newModal + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
