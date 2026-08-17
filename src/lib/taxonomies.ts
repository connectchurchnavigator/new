export interface TaxonomyStore {
  denominations: string[];
  worshipStyles: string[];
  ministries: string[];
  facilities: string[];
  languages: string[];
}

export const INITIAL_TAXONOMIES: TaxonomyStore = {
  denominations: [
    "Pentecostal",
    "Baptist",
    "Catholic",
    "Anglican",
    "Non-Denominational",
    "Methodist",
    "Orthodox",
    "Presbyterian",
    "Seventh-day Adventist",
    "Lutheran",
    "Charismatic",
    "Evangelical",
    "Assemblies of God",
    "Redeemed Christian Church of God (RCCG)",
    "Living Faith Church (Winners Chapel)",
    "Christ Embassy",
    "Church of England",
    "Other"
  ],
  worshipStyles: [
    "Contemporary Worship",
    "Traditional Hymns",
    "Blended Style",
    "Charismatic / Spirit-Filled",
    "Gospel / Uplifting",
    "Liturgical",
    "Acoustic & Reflective",
    "Youth / High-Energy"
  ],
  ministries: [
    "Youth Ministry",
    "Children's Church",
    "Worship & Choir",
    "Prayer & Intercession",
    "Evangelism & Outreach",
    "Women's Fellowship",
    "Men's Fellowship",
    "Young Adults",
    "Marriage & Family",
    "Crèche / Nursery",
    "Food Bank & Community Care",
    "Prison Ministry",
    "Seniors Ministry",
    "Missions & Church Planting",
    "Media & Technical Production"
  ],
  facilities: [
    "Free Parking",
    "Wheelchair Accessible / Step-Free",
    "Nursery / Crèche Room",
    "Parent & Baby Room",
    "Hearing Loop System",
    "Accessible Toilets",
    "Community Café / Kitchen",
    "Bookstore / Resource Centre",
    "Bus Stop Nearby",
    "Train Station Nearby"
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "Portuguese",
    "German",
    "Italian",
    "Yoruba",
    "Igbo",
    "Twi",
    "Swahili",
    "Arabic",
    "Mandarin",
    "Cantonese",
    "Korean",
    "Tagalog",
    "Hindi",
    "Urdu",
    "Tamil",
    "Telugu",
    "Polish",
    "Romanian",
    "Russian",
    "Ukrainian"
  ]
};
