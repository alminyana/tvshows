import { useEffect, useState } from 'react';
import { usersService } from '@/services';
import { useAuth } from '@/hooks';
import { MESSAGES } from '@/constants';
import { Button, Modal, ConfirmDialog, Spinner } from '@/components/ui';
import { UserList, UserForm } from '@/components/features';
import type { User } from '@/types/user';
import type { UserFormValues } from '@/utils/userSchema';
import styles from './UsersPage.module.scss';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    usersService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(MESSAGES.errors.generic);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  function reload() {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }

  async function handleCreate(data: UserFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await usersService.create({ email: data.email, password: data.password, role: data.role });
      setShowCreate(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : MESSAGES.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(data: UserFormValues) {
    if (!editingUser) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await usersService.update(editingUser.id, {
        email: data.email,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
      });
      setEditingUser(null);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : MESSAGES.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingUser || !currentUser) return;
    try {
      await usersService.remove(deletingUser.id, currentUser.id);
      setDeletingUser(null);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : MESSAGES.errors.generic);
      setDeletingUser(null);
    }
  }

  if (loading) return <Spinner size="lg" />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <Button variant="primary" onClick={() => { setFormError(null); setShowCreate(true); }}>
          {MESSAGES.users.newUser}
        </Button>
      </header>

      <UserList
        users={users}
        currentUserId={currentUser?.id ?? ''}
        onEdit={(user) => { setFormError(null); setEditingUser(user); }}
        onDelete={setDeletingUser}
      />

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={MESSAGES.users.newUser}
      >
        <UserForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          isSubmitting={isSubmitting}
          serverError={formError}
        />
      </Modal>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={MESSAGES.users.editUser}
      >
        {editingUser && (
          <UserForm
            mode="edit"
            initialValues={{ email: editingUser.email, role: editingUser.role }}
            onSubmit={handleEdit}
            onCancel={() => setEditingUser(null)}
            isSubmitting={isSubmitting}
            serverError={formError}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title={MESSAGES.users.deleteConfirm}
        message={MESSAGES.users.deleteConfirmDetail}
      />
    </div>
  );
}
