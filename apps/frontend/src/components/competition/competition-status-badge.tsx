import { Badge } from '../ui/badge';

interface CompetitionStatusBadgeProps {
  startDate?: string | Date;
  endDate?: string | Date;
}

export function CompetitionStatusBadge({ startDate, endDate }: CompetitionStatusBadgeProps) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && now < start) {
    return <Badge variant="warning">Upcoming</Badge>;
  }
  
  if (end && now > end) {
    return <Badge variant="default">Ended</Badge>;
  }
  
  return <Badge variant="success">Active</Badge>;
} 