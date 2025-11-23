export type RestaurantKey = "kaktus" | "zitoun" | "toranj" | "amiralmomenin";

export type Restaurant = {
  key: RestaurantKey;
  name: string;
  description: string;
  items: MenuMap;
};

type Category = "غذای ایرانی" | "فست فود" | "پیتزا" | "صبحانه";
type MenuItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  available: boolean;
};
type MenuMap = Record<Category, MenuItem[]>;

export const restaurants: Record<RestaurantKey, Restaurant> = {
  kaktus: {
    key: "kaktus",
    name: "کاکتوس",
    description: "فست‌فود دانشجویی با سرو سریع و تنوع بالا.",
    items: {
      "غذای ایرانی": [
        {
          id: 1,
          name: "چلوکباب کوبیده",
          price: 160000,
          image: "",
          available: true,
        },
        {
          id: 2,
          name: "زرشکپلو با مرغ",
          price: 145000,
          image: "",
          available: false,
        },
        { id: 3, name: "چلو جوجه", price: 130000, image: "", available: true },
        {
          id: 4,
          name: "چلو تاوا کبابی",
          price: 210000,
          image: "",
          available: true,
        },
      ],
      "فست فود": [
        { id: 5, name: "همبرگر", price: 60000, image: "", available: true },
        { id: 6, name: "چیزبرگر", price: 70000, image: "", available: true },
        { id: 7, name: "رویال", price: 95000, image: "", available: true },
      ],
      پیتزا: [
        {
          id: 8,
          name: "پیتزا مخلوط",
          price: 100000,
          image: "",
          available: true,
        },
        {
          id: 9,
          name: "پیتزا پپرونی",
          price: 120000,
          image: "",
          available: true,
        },
        {
          id: 10,
          name: "پیتزا مرغ",
          price: 120000,
          image: "",
          available: true,
        },
      ],
      صبحانه: [
        { id: 11, name: "املت", price: 35000, image: "", available: true },
        { id: 12, name: "نیمرو", price: 30000, image: "", available: true },
      ],
    },
  },
  zitoun: {
    key: "zitoun",
    name: "زیتون",
    description: "غذاهای ایرانی خانگی با کیفیت ثابت.",
    items: {
      "غذای ایرانی": [
        {
          id: 1,
          name: "چلوکباب کوبیده",
          price: 160000,
          image: "",
          available: true,
        },
        {
          id: 2,
          name: "زرشکپلو با مرغ",
          price: 145000,
          image: "",
          available: false,
        },
        { id: 3, name: "چلو جوجه", price: 130000, image: "", available: true },
        {
          id: 4,
          name: "چلو تاوا کبابی",
          price: 210000,
          image: "",
          available: true,
        },
      ],
      "فست فود": [
        { id: 5, name: "همبرگر", price: 60000, image: "", available: true },
        { id: 6, name: "چیزبرگر", price: 70000, image: "", available: true },
        { id: 7, name: "رویال", price: 95000, image: "", available: true },
      ],
      پیتزا: [
        {
          id: 8,
          name: "پیتزا مخلوط",
          price: 100000,
          image: "",
          available: true,
        },
        {
          id: 9,
          name: "پیتزا پپرونی",
          price: 120000,
          image: "",
          available: true,
        },
        {
          id: 10,
          name: "پیتزا مرغ",
          price: 120000,
          image: "",
          available: true,
        },
      ],
      صبحانه: [
        { id: 11, name: "املت", price: 35000, image: "", available: true },
        { id: 12, name: "نیمرو", price: 30000, image: "", available: true },
      ],
    },
  },
  toranj: {
    key: "toranj",
    name: "ترنج",
    description: "سلامت‌محور با سالادها و نوشیدنی‌های تازه.",
    items: {
      "غذای ایرانی": [
        {
          id: 1,
          name: "چلوکباب کوبیده",
          price: 160000,
          image: "",
          available: true,
        },
        {
          id: 2,
          name: "زرشکپلو با مرغ",
          price: 145000,
          image: "",
          available: false,
        },
        { id: 3, name: "چلو جوجه", price: 130000, image: "", available: true },
        {
          id: 4,
          name: "چلو تاوا کبابی",
          price: 210000,
          image: "",
          available: true,
        },
      ],
      "فست فود": [
        { id: 5, name: "همبرگر", price: 60000, image: "", available: true },
        { id: 6, name: "چیزبرگر", price: 70000, image: "", available: true },
        { id: 7, name: "رویال", price: 95000, image: "", available: true },
      ],
      پیتزا: [
        {
          id: 8,
          name: "پیتزا مخلوط",
          price: 100000,
          image: "",
          available: true,
        },
        {
          id: 9,
          name: "پیتزا پپرونی",
          price: 120000,
          image: "",
          available: true,
        },
        {
          id: 10,
          name: "پیتزا مرغ",
          price: 120000,
          image: "",
          available: true,
        },
      ],
      صبحانه: [
        { id: 11, name: "املت", price: 35000, image: "", available: true },
        { id: 12, name: "نیمرو", price: 30000, image: "", available: true },
      ],
    },
  },
  amiralmomenin: {
    key: "amiralmomenin",
    name: "امیرالمومنین",
    description: "سلف سرویس اصلی دانشگاه با ظرفیت بالا و سرویس‌دهی سریع.",
    items: {
      "غذای ایرانی": [
        {
          id: 1,
          name: "چلوکباب کوبیده",
          price: 160000,
          image: "",
          available: true,
        },
        {
          id: 2,
          name: "زرشکپلو با مرغ",
          price: 145000,
          image: "",
          available: false,
        },
        { id: 3, name: "چلو جوجه", price: 130000, image: "", available: true },
        {
          id: 4,
          name: "چلو تاوا کبابی",
          price: 210000,
          image: "",
          available: true,
        },
      ],
      "فست فود": [
        { id: 5, name: "همبرگر", price: 60000, image: "", available: true },
        { id: 6, name: "چیزبرگر", price: 70000, image: "", available: true },
        { id: 7, name: "رویال", price: 95000, image: "", available: true },
      ],
      پیتزا: [
        {
          id: 8,
          name: "پیتزا مخلوط",
          price: 100000,
          image: "",
          available: true,
        },
        {
          id: 9,
          name: "پیتزا پپرونی",
          price: 120000,
          image: "",
          available: true,
        },
        {
          id: 10,
          name: "پیتزا مرغ",
          price: 120000,
          image: "",
          available: true,
        },
      ],
      صبحانه: [
        { id: 11, name: "املت", price: 35000, image: "", available: true },
        { id: 12, name: "نیمرو", price: 30000, image: "", available: true },
      ],
    },
  },
};

export const restaurantList = Object.values(restaurants);
