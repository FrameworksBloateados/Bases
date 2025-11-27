import {useNavigate} from 'react-router';
import {Button} from './Button';
import {ArrowLeftIcon} from './Icons';

type BackButtonProps = {
  to?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  to = '/',
  label = 'Volver al inicio',
  className = '',
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="gradient"
      onClick={() => navigate(to)}
      className={className}
      icon={<ArrowLeftIcon />}
    >
      {label}
    </Button>
  );
}
