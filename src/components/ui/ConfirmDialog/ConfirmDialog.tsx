import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { MESSAGES } from '@/constants';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = MESSAGES.actions.confirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {MESSAGES.actions.cancel}
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
