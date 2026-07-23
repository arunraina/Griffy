// Single source of truth for state → city selection, replacing the flat
// SERVICE_CITIES list and the three independently-duplicated INDIAN_STATES
// arrays (onboarding, checkout, post-project). Not exhaustive — covers the
// state capitals and other major cities relevant to a construction/property
// marketplace, enough for "which state, which city" pickers everywhere.
export const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Durg'],
  'Delhi': ['Delhi', 'New Delhi'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala'],
  // Primary launch market — covers all 20 J&K districts plus other well-known
  // towns, deliberately deeper than the other states' lists below.
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur',
    'Poonch', 'Rajouri', 'Kupwara', 'Pulwama', 'Kulgam', 'Budgam', 'Ganderbal',
    'Bandipora', 'Shopian', 'Doda', 'Kishtwar', 'Ramban', 'Reasi', 'Samba',
    'Handwara', 'Bijbehara', 'Pattan', 'Awantipora', 'Pahalgam', 'Gulmarg', 'Uri', 'Tral',
  ],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'],
};

export const INDIAN_STATES = Object.keys(CITIES_BY_STATE);

export function citiesForState(state: string): string[] {
  return CITIES_BY_STATE[state] ?? [];
}

// Reverse lookup for deep links that only carry a city name (e.g. `?city=
// Baramulla` from the homepage or a /cities/[city] page) -- lets a filter UI
// pre-select the right state instead of showing city alone with no state.
export function stateForCity(city: string): string {
  const match = Object.entries(CITIES_BY_STATE).find(([, cities]) =>
    cities.some((c) => c.toLowerCase() === city.toLowerCase())
  );
  return match?.[0] ?? '';
}
