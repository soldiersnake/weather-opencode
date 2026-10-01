export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type Unit = "C" | "F";

export interface Settings {
  defaultCity: City | null;
  cities: City[];
  unit: Unit;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  code: number;
  daily: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  min: number;
  max: number;
}



