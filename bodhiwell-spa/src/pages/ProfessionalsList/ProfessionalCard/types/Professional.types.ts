export interface Professional {
  name: string;
  specialty: string;
  dimension: string;
  description: string;
  image: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  isMspVerified: boolean;
}

export interface ProfessionalCardProps {
  professional: Professional;
  uid: string;
}