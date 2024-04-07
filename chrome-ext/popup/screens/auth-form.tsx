/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { supabase } from '@root/src/shared/services/supabase';
import userStorage from '@root/src/shared/storages/UserStorage';
import React from 'react';
import validator from 'email-validator';
import useStorage from '@root/src/shared/hooks/useStorage';

const AuthForm = () => {
  const { verifyingEmail } = useStorage(userStorage);
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [screen, setScreen] = React.useState<'login' | 'otp'>(verifyingEmail ? 'otp' : 'login');
  const onLogin = async () => {
    if (loading) return;
    if (!validator.validate(email)) {
      alert('Invalid email.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    console.log(data, error);
    if (error) {
      alert('Error sending OTP. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setScreen('otp');
    userStorage.setVerifyingEmail(email);
  };

  const onVerify = async () => {
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email || verifyingEmail,
      token: otp,
      type: 'email',
    });
    setLoading(false);

    if (error || !data?.user?.id) alert('Error verifying OTP. Please try again.');
    const { data: userData, error: userError } = await supabase.from('users').select().eq('id', data.user.id).single();
    if (userError || !userData?.id) alert('Error fetching user data. Please try again.');
    await userStorage.login(userData);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 grow-1">
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Tab0!</h1>
        <p className="text-sm text-muted-foreground">Enter your email to get started.</p>
      </div>

      <div className="flex flex-row">
        {screen === 'login' ? (
          <>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-stone-900">
                Your email:
              </label>
              <input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onLogin()}
                type="text"
                autoComplete="email"
                placeholder="hey@example.com"
                className="text-stone-900 dark:text-stone-900 border p-2 rounded text-sm mt-1 h-[40px]"
              />
            </div>
            <div
              onClick={onLogin}
              className="bg-stone-900 hover:bg-blue-800 text-stone-100 rounded py-2 px-4 mt-[22px] ml-2 font-bold cursor-pointer h-[38px] flex items-center justify-center">
              {loading ? 'Sending..' : 'Send code'}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <label htmlFor="otp" className="text-stone-900">
                One-time code:
              </label>
              <input
                id="otp"
                value={otp}
                type="text"
                autoComplete="off"
                placeholder="123456"
                onChange={e => setOtp(e.target.value)}
                className="text-stone-900 dark:text-stone-900 border p-2 rounded text-sm mt-1 h-[40px]"
              />
            </div>
            <div
              className="bg-stone-900 hover:bg-blue-800 text-stone-100 rounded py-2 px-4 mt-[22px] ml-2 font-bold cursor-pointer h-[38px] flex items-center justify-center"
              onClick={onVerify}>
              Verify
            </div>
          </>
        )}
      </div>
      {screen === 'otp' && (
        <div
          className="hover:underline cursor-pointer mt-2 text-stone-500"
          onClick={() => {
            setScreen('login');
            userStorage.setVerifyingEmail(null);
          }}>
          Didn't receive an email? Click here to try again.
        </div>
      )}

      <p className="mt-4 px-8 text-center text-xs text-muted-foreground opacity-30 px-16">
        By clicking continue, you agree to our{' '}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="https://tab0.app/terms"
          target="_blank"
          rel="noreferrer">
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="https://tab0.app/privacy"
          target="_blank"
          rel="noreferrer">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default AuthForm;
