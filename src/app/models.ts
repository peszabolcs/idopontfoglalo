export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  isActive: boolean;
  price?: number;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  isActive: boolean;
}

export interface Appointment {
  id?: number;
  userId: number;
  serviceId: number;
  locationId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
