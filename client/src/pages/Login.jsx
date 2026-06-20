import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

/* =========================================================================
   SUPABASE CLIENT
   npm install @supabase/supabase-js

   Add to your .env (Vite):
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
   (On Create React App instead? swap the two lines below for
    process.env.REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY.)

   Supabase has no built-in "pending admin approval" step the way Wix does,
   so the pending-approval / restricted-access screens below are wired to a
   `profiles` table with an `approved` flag. Create it once in the SQL editor:

     create table profiles (
       id uuid references auth.users on delete cascade primary key,
       email text,
       approved boolean default false,
       created_at timestamp with time zone default now()
     );

     create function public.handle_new_user()
     returns trigger as $$
     begin
       insert into public.profiles (id, email) values (new.id, new.email);
       return new;
     end;
     $$ language plpgsql security definer;

     create trigger on_auth_user_created
       after insert on auth.users
       for each row execute procedure public.handle_new_user();

   Then flip `approved` to true by hand (or from an admin screen) to let
   someone in. If you don't need manual approval, ignore that table — the
   login check below fails open (lets people straight in) when it's missing.
   ========================================================================= */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =========================================================================
   USAGE
   Drop <AuthModal /> once near the root of your app (e.g. App.jsx). Open it
   from anywhere, no prop drilling, by firing a window event:

     window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }));

   Views: 'login' | 'signup' | 'forgotPassword' | 'createPassword'
        | 'linkExpired' | 'restricted' | 'pendingApproval'

   Password-recovery links and expired links are detected automatically on
   page load, so you only need to trigger 'login' / 'signup' yourself —
   e.g. from the Account button in your nav:

     <button onClick={() => window.dispatchEvent(
       new CustomEvent('open-auth-modal', { detail: { view: 'login' } })
     )}>Sign In</button>
   ========================================================================= */

/* ---------- Icons ---------- */
const CloseIcon = (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
        <path d="M5 5l14 14M19 5L5 19" />
    </svg>
);

const EyeIcon = (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a21.4 21.4 0 015.06-5.94M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 7 11 7a21.5 21.5 0 01-2.66 3.79M14.12 14.12a3 3 0 11-4.24-4.24" />
        <path d="M1 1l22 22" />
    </svg>
);

const SpinnerIcon = (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" className="animate-spin" {...props}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 009 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.16.27-1.7V4.97H.95A9 9 0 000 9c0 1.45.35 2.83.95 4.03l3-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
);

// Decorative placeholder matching the reCAPTCHA widget's look. It does not
// perform real verification — see the note above RecaptchaCheckbox below.
const RecaptchaMark = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a9 9 0 016.36 2.64" stroke="#4285F4" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M21 3v5h-5" stroke="#4285F4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 21a9 9 0 01-6.36-2.64" stroke="#34A853" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M3 21v-5h5" stroke="#34A853" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ---------- Shared building blocks ---------- */
function PrimaryButton({ children, loading, className = '', ...rest }) {
    return (
        <button
            {...rest}
            disabled={loading || rest.disabled}
            className={`w-full bg-[#A96142] border border-[#A96142] text-white font-avenir font-light py-3 px-6 transition-colors hover:bg-white hover:text-[#A96142] focus-visible:ring-2 focus-visible:ring-[#A96142] focus-visible:ring-offset-2 outline-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
        >
            {loading && <SpinnerIcon />}
            {children}
        </button>
    );
}

function TextField({ label, type = 'text', value, onChange, autoComplete, rightSlot }) {
    return (
        <div className="mb-5">
            <label className="block font-avenir text-sm text-[#2D3329] mb-2">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    required
                    className="w-full border border-[#2D3329]/30 px-4 py-3 font-avenir text-[#2D3329] focus:outline-none focus:border-[#A96142] transition-colors"
                />
                {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <TextField
            label={label}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            rightSlot={
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="text-[#737373] hover:text-[#2D3329] transition-colors"
                >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            }
        />
    );
}

function OrDivider() {
    return (
        <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-[#2D3329]/15" />
            <span className="font-avenir text-sm text-[#737373]">or</span>
            <div className="h-px flex-1 bg-[#2D3329]/15" />
        </div>
    );
}

function OAuthButtons({ onOAuth, loading }) {
    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => onOAuth('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-[#2D3329]/30 py-3 px-6 font-avenir text-[#2D3329] hover:border-[#2D3329]/60 transition-colors disabled:opacity-60"
            >
                <GoogleIcon /> Continue with Google
            </button>
            <button
                type="button"
                onClick={() => onOAuth('facebook')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-[#2D3329]/30 py-3 px-6 font-avenir text-[#2D3329] hover:border-[#2D3329]/60 transition-colors disabled:opacity-60"
            >
                <FacebookIcon /> Continue with Facebook
            </button>
        </div>
    );
}

// Visual placeholder only — it does not call Google's API or verify anything.
// For real bot protection, Supabase Auth has native support for hCaptcha and
// Cloudflare Turnstile (Authentication → Settings → Bot Protection in your
// project dashboard), which is a better fit here than wiring Google
// reCAPTCHA by hand. Swap this component for theirs if you need it to be real.
function RecaptchaCheckbox({ checked, onChange }) {
    return (
        <div className="border border-[#2D3329]/20 bg-[#FAFAFA] px-4 py-3 flex items-center justify-between mb-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 accent-[#A96142]" />
                <span className="font-avenir text-[#2D3329] text-[15px]">I'm not a robot</span>
            </label>
            <div className="flex flex-col items-center">
                <RecaptchaMark />
                <span className="text-[10px] text-[#737373] font-avenir mt-0.5">reCAPTCHA</span>
            </div>
        </div>
    );
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <p className="text-sm font-avenir text-red-700 bg-red-50 border border-red-200 px-4 py-2 mb-5">
            {message}
        </p>
    );
}

function ModalShell({ onClose, children }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] bg-[#2D3329]/50 flex items-center justify-center p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto relative px-8 py-10 sm:px-12 sm:py-12 shadow-xl">
                <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 text-[#2D3329] hover:text-[#A96142] transition-colors">
                    <CloseIcon />
                </button>
                {children}
            </div>
        </div>
    );
}

/* ---------- Main component ---------- */
export default function AuthModal() {
    const [view, setView] = useState(null); // null = closed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recaptchaChecked, setRecaptchaChecked] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const resetFormState = useCallback(() => {
        setError('');
        setPassword('');
        setConfirmPassword('');
        setRecaptchaChecked(false);
        setResetSent(false);
    }, []);

    const switchView = useCallback((next) => {
        resetFormState();
        setView(next);
    }, [resetFormState]);

    const close = useCallback(() => {
        setView(null);
        resetFormState();
    }, [resetFormState]);

    // Let any component in the app open this modal without prop drilling.
    useEffect(() => {
        const handler = (e) => {
            resetFormState();
            setView(e.detail?.view || 'login');
            if (e.detail?.email) setEmail(e.detail.email);
        };
        window.addEventListener('open-auth-modal', handler);
        return () => window.removeEventListener('open-auth-modal', handler);
    }, [resetFormState]);

    // Auto-detect password-recovery links (and expired ones) on page load.
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const searchParams = new URLSearchParams(window.location.search);

        if (hashParams.get('error_code') === 'otp_expired' || searchParams.get('error_code') === 'otp_expired') {
            setView('linkExpired');
            return;
        }
        if (hashParams.get('type') === 'recovery') {
            setView('createPassword');
        }

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') setView('createPassword');
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    /* ---------- Handlers ---------- */
    async function handleSignUp(e) {
        e.preventDefault();
        setError('');
        if (!recaptchaChecked) return setError("Please confirm you're not a robot.");
        setLoading(true);
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (signUpError) return setError(signUpError.message);
        setPendingEmail(email);
        switchView('pendingApproval');
    }

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        if (!recaptchaChecked) return setError("Please confirm you're not a robot.");
        setLoading(true);
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
            setLoading(false);
            return setError(loginError.message);
        }

        // Optional manual-approval gate — see the `profiles` table note up top.
        // Fails open (lets the sign-in through) if that table doesn't exist yet.
        const { data: profile } = await supabase
            .from('profiles')
            .select('approved')
            .eq('id', data.user.id)
            .single();
        setLoading(false);

        if (profile && profile.approved === false) {
            await supabase.auth.signOut();
            return switchView('restricted');
        }

        close();
    }

    async function handleForgotPassword(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login`,
        });
        setLoading(false);
        if (resetError) return setError(resetError.message);
        setResetSent(true);
    }

    async function handleCreateNewPassword(e) {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) return setError('Passwords do not match.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (updateError) return setError(updateError.message);
        switchView('login');
    }

    async function handleOAuth(provider) {
        setError('');
        const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider });
        if (oauthError) setError(oauthError.message);
    }

    if (!view) return null;

    /* ---------- Views ---------- */
    if (view === 'signup') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-4xl text-center text-[#2D3329] mb-3">Sign Up</h2>
                <p className="text-center font-avenir text-[#737373] mb-8">
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchView('login')} className="text-[#A96142] underline underline-offset-2">
                        Log In
                    </button>
                </p>
                <ErrorBanner message={error} />
                <form onSubmit={handleSignUp}>
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                    <RecaptchaCheckbox checked={recaptchaChecked} onChange={(e) => setRecaptchaChecked(e.target.checked)} />
                    <PrimaryButton type="submit" loading={loading}>Sign Up</PrimaryButton>
                </form>
                <OrDivider />
                <OAuthButtons onOAuth={handleOAuth} loading={loading} />
            </ModalShell>
        );
    }

    if (view === 'login') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-4xl text-center text-[#2D3329] mb-3">Log In</h2>
                <p className="text-center font-avenir text-[#737373] mb-8">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchView('signup')} className="text-[#A96142] underline underline-offset-2">
                        Sign up
                    </button>
                </p>
                <ErrorBanner message={error} />
                <form onSubmit={handleLogin}>
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                    <button
                        type="button"
                        onClick={() => switchView('forgotPassword')}
                        className="font-avenir text-sm text-[#2D3329] underline underline-offset-2 mb-6 inline-block"
                    >
                        Forgot Password
                    </button>
                    <RecaptchaCheckbox checked={recaptchaChecked} onChange={(e) => setRecaptchaChecked(e.target.checked)} />
                    <PrimaryButton type="submit" loading={loading}>Log In</PrimaryButton>
                </form>
                <OrDivider />
                <OAuthButtons onOAuth={handleOAuth} loading={loading} />
            </ModalShell>
        );
    }

    if (view === 'forgotPassword') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-4xl text-center text-[#2D3329] mb-3">Reset password</h2>
                {resetSent ? (
                    <p className="text-center font-avenir text-[#2D3329]">
                        Check <span className="text-[#A96142]">{email}</span> for a link to reset your password.
                    </p>
                ) : (
                    <>
                        <p className="text-center font-avenir text-[#737373] mb-8">
                            Enter your login email and we'll send you a link to reset your password.
                        </p>
                        <ErrorBanner message={error} />
                        <form onSubmit={handleForgotPassword}>
                            <TextField label="Login email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                            <PrimaryButton type="submit" loading={loading}>Send Link</PrimaryButton>
                        </form>
                    </>
                )}
            </ModalShell>
        );
    }

    if (view === 'createPassword') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-4xl text-center text-[#2D3329] mb-8">Create new password</h2>
                <ErrorBanner message={error} />
                <form onSubmit={handleCreateNewPassword}>
                    <PasswordField label="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                    <PasswordField label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                    <PrimaryButton type="submit" loading={loading}>Create Password</PrimaryButton>
                </form>
            </ModalShell>
        );
    }

    if (view === 'linkExpired') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-3xl text-center text-[#2D3329] mb-4">This link has expired</h2>
                <p className="text-center font-avenir text-[#737373] mb-8">
                    To get a new reset link, you'll have to do the reset password process again.
                </p>
                <PrimaryButton type="button" onClick={() => switchView('forgotPassword')}>Reset Password</PrimaryButton>
                <button
                    type="button"
                    onClick={close}
                    className="block w-full text-center font-avenir text-sm text-[#A96142] underline underline-offset-2 mt-5"
                >
                    Go to Site Home
                </button>
            </ModalShell>
        );
    }

    if (view === 'restricted') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-3xl text-center text-[#2D3329] mb-4">Access to this page is restricted</h2>
                <p className="text-center font-avenir text-[#737373] mb-8">
                    You don't have permission to view this page. Contact the site owner for more info.
                </p>
                <PrimaryButton type="button" onClick={close}>Back to Site Home</PrimaryButton>
                <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="block w-full text-center font-avenir text-sm text-[#A96142] underline underline-offset-2 mt-5"
                >
                    Log in with a different email
                </button>
            </ModalShell>
        );
    }

    if (view === 'pendingApproval') {
        return (
            <ModalShell onClose={close}>
                <h2 className="font-poppins text-3xl text-center text-[#2D3329] mb-4">
                    Your signup request was sent and is pending approval
                </h2>
                <p className="text-center font-avenir text-[#737373] mb-8">
                    You'll be notified of your approval via the email you used to sign up:
                    <br />
                    <span className="text-[#2D3329]">{pendingEmail}</span>
                    <br />
                    <br />
                    Once approved, you'll be able to log in as a site member.
                </p>
                <PrimaryButton type="button" onClick={close}>Got It</PrimaryButton>
            </ModalShell>
        );
    }

    return null;
}