import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button, FormField, Input } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './LoginPage.module.scss';

const schema = z.object({
  email: z.string().email(MESSAGES.errors.invalidEmail),
  password: z.string().min(1, MESSAGES.errors.required),
});

type LoginFormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/series';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch {
      setServerError(MESSAGES.login.errorCredentials);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{MESSAGES.login.title}</h1>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField htmlFor="email" label={MESSAGES.login.emailLabel} error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              hasError={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <FormField htmlFor="password" label={MESSAGES.login.passwordLabel} error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register('password')}
            />
          </FormField>
          {serverError && (
            <p className={styles.error} role="alert">
              {serverError}
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting} className={styles.submit}>
            {MESSAGES.login.submitLabel}
          </Button>
        </form>
      </div>
    </main>
  );
}
