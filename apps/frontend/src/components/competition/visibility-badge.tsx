import { Badge } from '../ui/badge';

type VisibilityType = 'public' | 'private' | 'restricted';

interface VisibilityBadgeProps {
  visibility: VisibilityType;
}

const variantMap: Record<VisibilityType, 'success' | 'error' | 'warning'> = {
  public: 'success',
  private: 'error',
  restricted: 'warning',
};

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const displayText = visibility.charAt(0).toUpperCase() + visibility.slice(1);
  
  return (
    <Badge variant={variantMap[visibility]}>
      {displayText}
    </Badge>
  );
} 