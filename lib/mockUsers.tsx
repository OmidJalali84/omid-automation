// lib/mockUsers.ts

export type MealStatus = 'رزرو نشده' | 'خورده شده' | 'آماده سفارش' | 'خارج از وعده';

export type Meal = {
  id: number;
  type: 'صبحانه' | 'ناهار' | 'شام';
  restaurant: string;
  status: MealStatus;
  time: string;
  location: string;
  orderId?: string; // برای وعده‌های خورده شده
};

export type MockUser = {
  studentId: string;
  password: string;
  name: string;
  avatar: string;
  meals: Meal[];
};

export const mockUsers: MockUser[] = [
  // کاربر 1: همه وعده‌ها آماده سفارش
  {
    studentId: '401101008',
    password: '1234',
    name: 'المیرا تقی نسب',
    avatar: 'ا',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: 'امیرالمومنین',
        status: 'آماده سفارش',
        time: '07:00 - 09:00',
        location: 'سلف سرویس خوابگاه'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'امیرالمومنین',
        status: 'آماده سفارش',
        time: '12:00 - 14:00',
        location: 'سلف سرویس خوابگاه'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: 'امیرالمومنین',
        status: 'آماده سفارش',
        time: '18:00 - 20:00',
        location: 'سلف سرویس خوابگاه'
      }
    ]
  },
  
  // کاربر 2: ترکیبی از وضعیت‌ها
  {
    studentId: '401222222',
    password: '1234',
    name: 'محمد رضایی',
    avatar: 'م',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: 'امیرالمومنین',
        status: 'خورده شده',
        time: '07:00 - 09:00',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001234'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'رستوران کاکتوس',
        status: 'خارج از وعده',
        time: '12:00 - 14:00',
        location: 'بلوار دانشگاه'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: 'امیرالمومنین',
        status: 'آماده سفارش',
        time: '18:00 - 20:00',
        location: 'سلف سرویس خوابگاه'
      }
    ]
  },

  // کاربر 3: همه خورده شده
  {
    studentId: '401333333',
    password: '1234',
    name: 'زهرا کریمی',
    avatar: 'ز',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: 'امیرالمومنین',
        status: 'خورده شده',
        time: '07:00 - 09:00',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001235'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'امیرالمومنین',
        status: 'خورده شده',
        time: '12:00 - 14:00',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001236'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: 'امیرالمومنین',
        status: 'خورده شده',
        time: '18:00 - 20:00',
        location: 'سلف سرویس خوابگاه',
        orderId: 'ORD-2024-001237'
      }
    ]
  },

  // کاربر 4: رزرو نشده و خارج از وعده
  {
    studentId: '401444444',
    password: '1234',
    name: 'فاطمه نوری',
    avatar: 'ف',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '07:00 - 09:00',
        location: '-'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: 'رستوران کاکتوس',
        status: 'خارج از وعده',
        time: '12:00 - 14:00',
        location: 'بلوار دانشگاه'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '18:00 - 20:00',
        location: '-'
      }
    ]
  },

  // کاربر 5: همه رزرو نشده
  {
    studentId: '401555555',
    password: '1234',
    name: 'حسین محمدی',
    avatar: 'ح',
    meals: [
      {
        id: 1,
        type: 'صبحانه',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '07:00 - 09:00',
        location: '-'
      },
      {
        id: 2,
        type: 'ناهار',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '12:00 - 14:00',
        location: '-'
      },
      {
        id: 3,
        type: 'شام',
        restaurant: '-',
        status: 'رزرو نشده',
        time: '18:00 - 20:00',
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