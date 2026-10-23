/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Lead Architect & Executive Owner: Sai Venkat Akkineni
 * Official Directorate of Marketing & Inspection (DMI) / Agmarknet Commodity Directory
 * Standard Agmarknet Commodity Master List
 */

export interface CommodityCategory {
  category: string;
  items: string[];
}

export const AGMARKNET_COMMODITY_CATEGORIES: CommodityCategory[] = [
  {
    category: 'Cereals & Food Grains',
    items: [
      'Paddy(Dhan)(Common)',
      'Paddy(Dhan)(Basmati)',
      'Wheat',
      'Maize',
      'Barley (Jau)',
      'Jowar(Sorghum)',
      'Bajra(Pearl Millet)',
      'Ragi (Finger Millet)',
      'Foxtail Millet (Navane)',
      'Kodo Millet',
      'Little Millet',
      'Barnyard Millet',
    ],
  },
  {
    category: 'Pulses & Legumes (Dals)',
    items: [
      'Bengal Gram(Gram)(Whole)',
      'Bengal Gram (Dal)',
      'Arhar (Tur/Red Gram)(Whole)',
      'Arhar Dal(Tur Dal)',
      'Moong(Green Gram)(Whole)',
      'Moong Dal',
      'Urad (Black Gram)(Whole)',
      'Urad Dal',
      'Masur (Lentil)',
      'Masur Dal',
      'Green Peas',
      'Cowpea (Lobia/Karamani)',
      'Horse Gram (Kulthi)',
      'Moth Dal',
      'Kabuli Chana (Chickpeas-White)',
    ],
  },
  {
    category: 'Commercial & Cash Crops',
    items: [
      'Cotton',
      'Sugarcane',
      'Jute',
      'Tobacco',
      'Coffee',
      'Tea',
      'Rubber',
      'Coconut',
      'Arecanut(Betelnut)',
      'Copra',
    ],
  },
  {
    category: 'Oilseeds',
    items: [
      'Soyabean',
      'Groundnut',
      'Mustard',
      'Sunflower',
      'Sesamum(Sesame,Gingelly,Til)',
      'Castor Seed',
      'Linseed',
      'Niger Seed (Ramtil)',
      'Safflower',
      'Cottonseed',
    ],
  },
  {
    category: 'Spices & Condiments',
    items: [
      'Chilli Red',
      'Chilli Green',
      'Turmeric',
      'Coriander(Leaves)',
      'Coriander Seed',
      'Cumin Seed(Jeera)',
      'Garlic',
      'Ginger(Green)',
      'Ginger(Dry)',
      'Black Pepper',
      'Cardamoms',
      'Fenugreek Seeds(Methi)',
      'Fennel (Saunf)',
      'Nutmeg',
      'Clove',
    ],
  },
  {
    category: 'Vegetables',
    items: [
      'Onion',
      'Tomato',
      'Potato',
      'Brinjal',
      'Cabbage',
      'Cauliflower',
      'Okra(Bhindi/Ladyfinger)',
      'Capsicum',
      'Carrot',
      'Beetroot',
      'Bitter Gourd',
      'Bottle Gourd',
      'Ridge Gourd(Tori)',
      'Pumpkin',
      'Cucumber(Kheera)',
      'Drumstick',
      'Spinach',
      'Sweet Potato',
    ],
  },
  {
    category: 'Fruits',
    items: [
      'Apple',
      'Banana',
      'Mango',
      'Orange',
      'Pomegranate',
      'Grapes',
      'Papaya',
      'Guava',
      'Water Melon',
      'Musk Melon',
      'Lemon',
      'Sweet Lime(Mosambi)',
      'Pineapple',
      'Custard Apple',
      'Sapota(Chikoo)',
      'Jack Fruit',
    ],
  },
];

// Flat list of all unique commodities sorted
export const ALL_AGMARKNET_COMMODITIES: string[] = Array.from(
  new Set(AGMARKNET_COMMODITY_CATEGORIES.flatMap((c) => c.items))
).sort((a, b) => a.localeCompare(b));
