// Mock data for services
export const mockServices = [
  {
    id: 1,
    name: "Haircut & Styling",
    description: "Professional haircut and styling service for all hair types",
    price: 45.00,
    duration_minutes: 60,
    category: {
      id: 1,
      name: "Beauty & Personal Care"
    },
    image: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Haircut",
    rating: 4.5,
    review_count: 128,
    is_available: true
  },
  {
    id: 2,
    name: "Massage Therapy",
    description: "Relaxing full-body massage with professional therapist",
    price: 80.00,
    duration_minutes: 90,
    category: {
      id: 2,
      name: "Wellness & Spa"
    },
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Massage",
    rating: 4.8,
    review_count: 89,
    is_available: true
  },
  {
    id: 3,
    name: "Car Repair",
    description: "Complete car diagnostic and repair service",
    price: 120.00,
    duration_minutes: 120,
    category: {
      id: 3,
      name: "Automotive"
    },
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Car+Repair",
    rating: 4.2,
    review_count: 67,
    is_available: true
  },
  {
    id: 4,
    name: "House Cleaning",
    description: "Professional house cleaning service",
    price: 95.00,
    duration_minutes: 180,
    category: {
      id: 4,
      name: "Home Services"
    },
    image: "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Cleaning",
    rating: 4.6,
    review_count: 156,
    is_available: true
  },
  {
    id: 5,
    name: "Personal Training",
    description: "One-on-one personal training session",
    price: 65.00,
    duration_minutes: 60,
    category: {
      id: 2,
      name: "Wellness & Spa"
    },
    image: "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Training",
    rating: 4.9,
    review_count: 94,
    is_available: true
  },
  {
    id: 6,
    name: "Web Design",
    description: "Custom website design and development",
    price: 500.00,
    duration_minutes: 240,
    category: {
      id: 5,
      name: "Professional Services"
    },
    image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Web+Design",
    rating: 4.7,
    review_count: 43,
    is_available: true
  }
];

export const mockCategories = [
  { id: 1, name: "Beauty & Personal Care" },
  { id: 2, name: "Wellness & Spa" },
  { id: 3, name: "Automotive" },
  { id: 4, name: "Home Services" },
  { id: 5, name: "Professional Services" }
];
