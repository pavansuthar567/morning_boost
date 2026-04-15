"use client";
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);

interface LiveMapProps {
  driverLat: number;
  driverLng: number;
  homeLat: number;
  homeLng: number;
}

export default function LiveMap({ driverLat, driverLng, homeLat, homeLng }: LiveMapProps) {
  return <DynamicMap driverLat={driverLat} driverLng={driverLng} homeLat={homeLat} homeLng={homeLng} />;
}
