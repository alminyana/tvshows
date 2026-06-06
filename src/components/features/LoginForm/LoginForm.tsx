import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { Button, FormField, Input } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './LoginForm.module.scss';

const schema = z.object({
  email: z.string().email(MESSAGES.errors.invalidEmail),
  password: z.string().min(1, MESSAGES.errors.required),
});

type LoginFormData = z.infer<typeof schema>;

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      onSuccess();
    } catch {
      setServerError(MESSAGES.login.errorCredentials);
    }
  };

  return (
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
  );
}
