import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  PoundSterling,
  CheckCircle,
  Target
} from 'lucide-react';

interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  active: boolean;
  created_at: string;
}

interface VacancyDetailDialogProps {
  vacancy: Vacancy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VacancyDetailDialog: React.FC<VacancyDetailDialogProps> = ({
  vacancy,
  open,
  onOpenChange,
}) => {
  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-600" />
            {vacancy.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Join our team at X-Ample Development
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Details */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {vacancy.location}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {vacancy.type}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {vacancy.department}
            </Badge>
            {vacancy.salary_range && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <PoundSterling className="w-3 h-3" />
                {vacancy.salary_range}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {vacancy.description || 'Join our dynamic team and contribute to exciting projects at X-Ample Development. We offer a collaborative environment where innovation and creativity are valued.'}
            </p>
          </div>

          {/* Requirements */}
          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Requirements
              </h3>
              <ul className="space-y-2">
                {vacancy.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Responsibilities
              </h3>
              <ul className="space-y-2">
                {vacancy.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {responsibility}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Apply Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
              onClick={() => window.open('https://discord.gg/bGhguE93Xp', '_blank')}
            >
              Apply Now via Discord
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VacancyDetailDialog;