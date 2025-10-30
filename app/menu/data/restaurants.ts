export type RestaurantKey = 'kaktos' | 'zitoun' | 'toranj' | 'amiralmomenin';

export type Restaurant = {
  key: RestaurantKey;
  name: string;
  description: string;
  items: MenuMap;
};

type Category = 'برنجی' | 'نوشیدنی' | 'سالاد';
type MenuItem = { id: number; name: string; price: number; image: string; available: boolean };
type MenuMap = Record<Category, MenuItem[]>;

export const restaurants: Record<RestaurantKey, Restaurant> = {
  kaktos: {
    key: 'kaktos',
    name: 'کاکتوس',
    description: 'فست‌فود دانشجویی با سرو سریع و تنوع بالا.',
    items: {
      'برنجی': [
        { id: 1, name: 'چلوکباب کوبیده', price: 160000, image: '🍖', available: true },
        { id: 2, name: 'زرشکپلو با مرغ', price: 145000, image: '🍗', available: false },
        { id: 3, name: 'چلوخورش کرفس', price: 130000, image: '🍲', available: true },
        { id: 4, name: 'چلو ماهی قزل‌آلا', price: 210000, image: '🐟', available: true },
      ],
      'نوشیدنی': [
        { id: 5, name: 'نوشابه', price: 25000, image: '🥤', available: true },
        { id: 6, name: 'دوغ', price: 20000, image: '🥛', available: true },
        { id: 7, name: 'آب معدنی', price: 15000, image: '💧', available: true },
      ],
      'سالاد': [
        { id: 8, name: 'سالاد فصل', price: 35000, image: '🥗', available: true },
        { id: 9, name: 'سالاد شیرازی', price: 30000, image: '🍅', available: true },
      ]
    }
  },
  zitoun: {
    key: 'zitoun',
    name: 'زیتون',
    description: 'غذاهای ایرانی خانگی با کیفیت ثابت.',
    items: {
      'برنجی': [
        { id: 1, name: 'چلوکباب کوبیده', price: 160000, image: '🍖', available: true },
        { id: 2, name: 'زرشکپلو با مرغ', price: 145000, image: '🍗', available: false },
        { id: 3, name: 'چلوخورش کرفس', price: 130000, image: '🍲', available: true },
        { id: 4, name: 'چلو ماهی قزل‌آلا', price: 210000, image: '🐟', available: true },
      ],
      'نوشیدنی': [
        { id: 5, name: 'نوشابه', price: 25000, image: '🥤', available: true },
        { id: 6, name: 'دوغ', price: 20000, image: '🥛', available: true },
        { id: 7, name: 'آب معدنی', price: 15000, image: '💧', available: true },
      ],
      'سالاد': [
        { id: 8, name: 'سالاد فصل', price: 35000, image: '🥗', available: true },
        { id: 9, name: 'سالاد شیرازی', price: 30000, image: '🍅', available: true },
      ]
    },
  },
  toranj: {
    key: 'toranj',
    name: 'ترنج',
    description: 'سلامت‌محور با سالادها و نوشیدنی‌های تازه.',
    items: {
      'برنجی': [
        { id: 1, name: 'چلوکباب کوبیده', price: 160000, image: '🍖', available: true },
        { id: 2, name: 'زرشکپلو با مرغ', price: 145000, image: '🍗', available: false },
        { id: 3, name: 'چلوخورش کرفس', price: 130000, image: '🍲', available: true },
        { id: 4, name: 'چلو ماهی قزل‌آلا', price: 210000, image: '🐟', available: true },
      ],
      'نوشیدنی': [
        { id: 5, name: 'نوشابه', price: 25000, image: '🥤', available: true },
        { id: 6, name: 'دوغ', price: 20000, image: '🥛', available: true },
        { id: 7, name: 'آب معدنی', price: 15000, image: '💧', available: true },
      ],
      'سالاد': [
        { id: 8, name: 'سالاد فصل', price: 35000, image: '🥗', available: true },
        { id: 9, name: 'سالاد شیرازی', price: 30000, image: '🍅', available: true },
      ]
    },
  },
  amiralmomenin: {
    key: 'amiralmomenin',
    name: 'امیرالمومنین',
    description: 'سلف سرویس اصلی دانشگاه با ظرفیت بالا و سرویس‌دهی سریع.',
    items: {
      'برنجی': [
        { id: 1, name: 'چلوکباب کوبیده', price: 160000, image: '🍖', available: true },
        { id: 2, name: 'زرشکپلو با مرغ', price: 145000, image: '🍗', available: false },
        { id: 3, name: 'چلوخورش کرفس', price: 130000, image: '🍲', available: true },
        { id: 4, name: 'چلو ماهی قزل‌آلا', price: 210000, image: '🐟', available: true },
      ],
      'نوشیدنی': [
        { id: 5, name: 'نوشابه', price: 25000, image: '🥤', available: true },
        { id: 6, name: 'دوغ', price: 20000, image: '🥛', available: true },
        { id: 7, name: 'آب معدنی', price: 15000, image: '💧', available: true },
      ],
      'سالاد': [
        { id: 8, name: 'سالاد فصل', price: 35000, image: '🥗', available: true },
        { id: 9, name: 'سالاد شیرازی', price: 30000, image: '🍅', available: true },
      ]
    },
  },
};

export const restaurantList = Object.values(restaurants);


