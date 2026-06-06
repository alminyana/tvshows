import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreateSchema, userEditSchema } from '@/utils/userSchema';
import type { UserFormValues } from '@/utils/userSchema';
import type { Role } from '@/types/user';
import { Button, FormField, Input, Select } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './UserForm.module.scss';

const roleOptions = [
  { value: 'admin', label: MESSAGES.users.roles.admin },
  { value: 'user', label: MESSAGES.users.roles.user },
];

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: { email: string; role: Role };
  onSubmit: (data: UserFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel: () => void;
  serverError?: string | null;
}

export function UserForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
  serverError,
}: UserFormProps) {
  const schema = mode === 'create' ? userCreateSchema : userEditSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialValues?.email ?? '',
      password: '',
      role: initialValues?.role ?? 'user',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <FormField
        label={MESSAGES.users.email}
        htmlFor="user-email"
        error={errors.email?.message}
        required
      >
        <Input
          id="user-email"
          type="email"
          {...register('email')}
          hasError={!!errors.email}
        />
      </FormField>

      <FormField
        label={MESSAGES.users.password}
        htmlFor="user-password"
        error={errors.password?.message}
        required={mode === 'create'}
      >
        <Input
          id="user-password"
          type="password"
          {...register('password')}
          hasError={!!errors.password}
          placeholder={mode === 'edit' ? 'Dejar en blanco para no cambiar' : undefined}
        />
      </FormField>

      <FormField
        label={MESSAGES.users.role}
        htmlFor="user-role"
        error={errors.role?.message}
        required
      >
        <Select
          id="user-role"
          options={roleOptions}
          {...register('role')}
          hasError={!!errors.role}
        />
      </FormField>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {MESSAGES.actions.cancel}
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {MESSAGES.actions.save}
        </Button>
      </div>
    </form>
  );
}
