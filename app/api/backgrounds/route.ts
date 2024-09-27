import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const backgroundsDirectory = path.join(process.cwd(), 'public/images/backgrounds');
  
  try {
    const fileNames = fs.readdirSync(backgroundsDirectory);
    const backgrounds = fileNames.filter(fileName => 
      fileName.endsWith('.webp') || fileName.endsWith('.jpg') || fileName.endsWith('.png')
    );
    return NextResponse.json(backgrounds);
  } catch (error) {
    console.error('Error reading backgrounds directory:', error);
    return NextResponse.json({ error: 'Unable to read backgrounds' }, { status: 500 });
  }
}