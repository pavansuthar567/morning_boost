"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route has been superseded by /driver (the new full-featured Driver Dashboard).
// Redirect to the canonical driver route.
export default function DriverDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/driver'); }, [router]);
  return null;
}
