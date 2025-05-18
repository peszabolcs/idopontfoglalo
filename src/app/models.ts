export interface User {
  id?: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  isActive: boolean;
  price?: number;
}

export interface Location {
  id: string;
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
  id?: string;
  userId: string;
  serviceId: string;
  locationId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
