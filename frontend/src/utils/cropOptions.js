export const CROPS = ['Tomato', 'Cotton', 'Chilli', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize', 'Soybean', 'Sugarcane', 'Grapes', 'Pomegranate', 'Brinjal', 'Cabbage', 'Other']

export const VARIETIES = {
  Tomato: ['Pusa Ruby', 'Arka Vikas', 'Hybrid (local)'],
  Cotton: ['Bt Cotton', 'Suraj', 'Desi cotton'],
  Chilli: ['Byadgi', 'Guntur', 'Jwala'],
  Onion: ['Nashik Red', 'Agrifound Dark Red', 'Bhima Super'],
  Potato: ['Kufri Jyoti', 'Kufri Pukhraj'],
  Wheat: ['HD 2967', 'Lokwan', 'Sharbati'],
  Rice: ['Basmati', 'Indrayani', 'IR 64'],
  Maize: ['Hybrid maize', 'Sweet corn'],
  Soybean: ['JS 335', 'MAUS 71'],
}

export const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting / Grain filling', 'Maturity / Harvest']

export const SYMPTOMS = [
  'Yellowing leaves',
  'Brown or black spots',
  'White powdery coating',
  'Curled leaves',
  'Wilting',
  'Holes in leaves',
  'Visible insects',
  'Stunted growth',
  'Fruit rot or damage',
  'Sticky leaves',
]

export const IMAGE_RULES = {
  types: ['image/jpeg', 'image/png', 'image/webp'],
  maxBytes: 5 * 1024 * 1024,
}
