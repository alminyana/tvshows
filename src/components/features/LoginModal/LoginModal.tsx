import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui';
import { LoginForm } from '../LoginForm/LoginForm';
import { MESSAGES } from '@/constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();

  function handleSuccess() {
    onClose();
    navigate('/series');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={MESSAGES.login.title} size="sm">
      <LoginForm onSuccess={handleSuccess} />
    </Modal>
  );
}
