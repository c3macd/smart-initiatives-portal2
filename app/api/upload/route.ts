
import { NextRequest, NextResponse } from 'next/server';

const KEYWORDS = ['قرار','تشكيل','تمويل','تعميم','محضر','اعتماد','خطاب','مذكرة'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, message: 'لم يتم استلام ملفات.' }, { status: 400 });
    }

    let pdfCount = 0, imgCount = 0, keywordHits = 0;
    const items: any[] = [];
    for (const f of files) {
      const name = f.name || '';
      const type = f.type || '';
      const size = f.size || 0;
      if (type.includes('pdf')) pdfCount++;
      if (type.startsWith('image/')) imgCount++;
      const lower = name.toLowerCase();
      const hasKeyword = KEYWORDS.some(k => name.includes(k));
      keywordHits += hasKeyword ? 1 : 0;
      items.push({ name, type, size, hasKeyword });
    }

    const validations = [
      { rule: 'صيغة مقبولة (PDF/صور)', pass: (pdfCount + imgCount) === files.length, info: `PDF=${pdfCount}, صور=${imgCount}` },
      { rule: 'تنوّع كافٍ', pass: (pdfCount >= 1), info: 'يفضّل وجود ملف PDF رسمي واحد على الأقل' },
      { rule: 'وجود مستندات قرار/تمويل/تعميم', pass: keywordHits >= 1, info: 'تعرّف عبر أسماء الملفات' },
    ];

    const ok = validations.every(v => v.pass);
    return NextResponse.json({ ok, totalFiles: files.length, pdfCount, imgCount, keywordHits, items, validations });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'خطأ أثناء معالجة الرفع.' }, { status: 500 });
  }
}
