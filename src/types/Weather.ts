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
