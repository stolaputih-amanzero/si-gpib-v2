'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, Award, Users, Home, ArrowRightLeft, Briefcase, Activity, Fingerprint } from 'lucide-react';
import { ReactNode } from 'react';

interface ProfileSectionProps {
  title: string;
  icon: string;
  children: ReactNode;
}

const iconMap: Record<string, any> = {
  church: Church,
  award: Award,
  users: Users,
  home: Home,
  'arrow-right-left': ArrowRightLeft,
  briefcase: Briefcase,
  activity: Activity,
  fingerprint: Fingerprint,
};

export function ProfileSection({ title, icon, children }: ProfileSectionProps) {
  const Icon = iconMap[icon] || Activity;

  return (
    <Card className="mx-4 overflow-hidden shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
          <Icon className="w-4 h-4 text-gray-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-white">
        {children}
      </CardContent>
    </Card>
  );
}
