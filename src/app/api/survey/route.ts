import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Survey from '@/lib/models/Survey';
import { authenticate, requireRole, isAuthError, ok, error } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, phone, area, society, interestedProducts, frequency } = body;

    if (!name || !phone || !area || !society || !frequency) {
      return error('Missing required fields', 400);
    }

    const survey = await Survey.create({
      name,
      phone,
      area,
      society,
      interestedProducts: interestedProducts || [],
      frequency,
    });

    return ok({ message: 'Survey submitted successfully', survey });
  } catch (err: any) {
    console.error('Submit survey error:', err);
    return error('Failed to submit survey', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    
    // Only admins can view the survey results
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    // Fetch surveys sorted by newest first
    const surveys = await Survey.find().sort({ createdAt: -1 }).lean();

    return ok({ surveys });
  } catch (err: any) {
    console.error('Fetch surveys error:', err);
    return error('Failed to fetch surveys', 500);
  }
}
