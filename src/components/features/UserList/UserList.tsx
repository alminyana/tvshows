import { IconButton } from '@/components/ui';
import { MESSAGES } from '@/constants';
import type { User } from '@/types/user';
import styles from './UserList.module.scss';

interface UserListProps {
  users: User[];
  currentUserId: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserList({ users, currentUserId, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return <p className={styles.empty}>No hay usuarios.</p>;
  }

  return (
    <ul className={styles.list} aria-label="Lista de usuarios">
      {users.map((user) => {
        const isSelf = user.id === currentUserId;
        return (
          <li key={user.id} className={styles.row}>
            <div className={styles.info}>
              <span className={styles.email}>{user.email}</span>
              <span className={styles.role}>{MESSAGES.users.roles[user.role]}</span>
            </div>
            <div className={styles.actions}>
              <IconButton
                icon="✏️"
                label={`${MESSAGES.actions.edit} ${user.email}`}
                variant="default"
                size="sm"
                onClick={() => onEdit(user)}
              />
              <span title={isSelf ? MESSAGES.users.cannotDeleteSelf : undefined}>
                <IconButton
                  icon="🗑️"
                  label={`${MESSAGES.actions.delete} ${user.email}`}
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(user)}
                  disabled={isSelf}
                />
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
