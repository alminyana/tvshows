import { Modal } from '@/components/ui';
import { LoginForm } from '../LoginForm/LoginForm';
import { MESSAGES } from '@/constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Solo cierra: quien entra desde el dashboard se queda en el dashboard.
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={MESSAGES.login.title} size="sm">
      <LoginForm onSuccess={onClose} />
    </Modal>
  );
}
