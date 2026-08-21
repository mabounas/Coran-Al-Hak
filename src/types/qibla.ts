export interface QiblaResponse {
  success: boolean;
  service?: string;
  data?: {
    latitude?: number;
    longitude?: number;
    direction?: number;
    qibla_direction?: number;
    bearing?: number;
    angle?: number;
    distance_km?: number;
    distance?: number;
  };
}
