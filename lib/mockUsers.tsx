// lib/mockUsers.ts

export type MealStatus = 'رزرو نشده' | 'خورده شده' | 'آماده سفارش' | 'خارج از وعده';

export type Meal = {
  id: number;
  type: 'صبحانه' | 'ناهار' | 'شام';
  restaurant: string;
  key?: string;
  status: MealStatus;
  time: string;
  location: string;
  orderId?: string;
};

export type MockUser = {
  studentId: string;
  password: string;
  name: string;
  avatar: string;
  meals: Meal[];
};

export const mockUsers: MockUser[] = [
  // کاربر 1: صبحانه خورده شده، ناهار آماده سفارش، شام خارج از وعده
  {
    studentId: '4021101008',
    password: '1234',
    name: 'المیرا تقی نسب',
    avatar: 'ا',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: 'امیرالمومنین',
        key: 'amiralmomenin',
        status: 'خورده شده',
        time: '07:30 - 09:30',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001234'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'رستوران کاکتوس',
        key: 'kaktus',
        status: 'آماده سفارش',
        time: '11:45 - 15:15',
        location: 'جنب میدان عشق'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: 'امیرالمومنین',
        key: 'amiralmomenin',
        status: 'خارج از وعده',
        time: '18:00 - 21:00',
        location: 'سلف سرویس خوابگاه'
      }
    ]
  },
  
  // کاربر 2: همه خورده شده
  {
    studentId: '4021101009',
    password: '1234',
    name: 'امید جلالی',
    avatar: 'ا',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: 'امیرالمومنین',
        key: 'amiralmomenin',
        status: 'خورده شده',
        time: '07:30 - 09:30',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001235'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'رستوران ترنج',
        key: 'toranj',
        status: 'خورده شده',
        time: '11:45 - 15:15',
        location: 'زیر ساختمان جعفری',
        orderId: 'ORD-2024-001236'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: 'امیرالمومنین',
        key: 'amiralmomenin',
        status: 'خورده شده',
        time: '18:00 - 21:00',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001237'
      }
    ]
  },

  // کاربر 3: صبحانه و شام رزرو نشده، ناهار آماده سفارش
  {
    studentId: '4021101010',
    password: '1234',
    name: 'حدیث حایری',
    avatar: 'ح',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '07:30 - 09:30',
        location: '-'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'رستوران زیتون',
        key: 'zitoun',
        status: 'آماده سفارش',
        time: '11:45 - 15:15',
        location: 'زیر ساخمان مطهری'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '18:00 - 21:00',
        location: '-'
      }
    ]
  }
];

// تابع پیدا کردن کاربر
export function findUserByStudentId(studentId: string): MockUser | undefined {
  return mockUsers.find(user => user.studentId === studentId);
}

// تابع احراز هویت
export function authenticateUser(studentId: string, password: string): MockUser | null {
  const user = findUserByStudentId(studentId);
  if (user && user.password === password) {
    return user;
  }
  return null;
}