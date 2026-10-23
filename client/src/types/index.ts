export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  createdAt: string
}

export interface Listing {
  id: number
  title: string
  description: string
  address: string
  pricePerNight: number
  numberOfGuests: number
  ownerId: number
  images?: string[]
  city?: string
  user?: User
  createdAt?: string
}

export interface ListingCreateDto {
  title: string
  description: string
  address: string
  pricePerNight: number
  numberOfGuests: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'

export interface Booking {
  id: number;
  listingId: number;
  userId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
}
