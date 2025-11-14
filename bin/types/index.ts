export interface PotholeReport {
  id: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  reportedAt: Date;
  reportedBy: string;
  description: string;
  imageUrl?: string;
  aiAnalysis?: {
    confidence: number;
    dimensions: {
      width: number;
      depth: number;
      length: number;
    };
    riskLevel: string;
  };
  priority: number;
  assignedTo?: string;
  resolvedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'authority' | 'admin';
  department?: string;
}