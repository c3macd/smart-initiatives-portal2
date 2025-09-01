
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { input, months } = await req.json();
    // حكم بوابة مبسط
    const hardFails: string[] = [];
    if (!input.goal) hardFails.push('مواءمة هدف');
    if (input.nonRoutine !== 'نعم') hardFails.push('عدم روتينية');
    const kpiOk = [input.kpiName, input.kpiFormula, input.kpiUnit, input.kpiBaseline, input.kpiTarget, input.kpiSource, input.kpiFreq].every((x: string) => x && String(x).trim().length>0);
    if (!kpiOk) hardFails.push('اكتمال بطاقة KPI');
    if (!(input.start && input.end && months > 0)) hardFails.push('تواريخ صحيحة');
    if (!(Number(input.riskCount||0) >= 3)) hardFails.push('مخاطر ≥3');
    if (!(Number(input.budget||0) > 0)) hardFails.push('ميزانية >0');
    if (input.hasDocs !== 'نعم') hardFails.push('وثائق');
    if (input.hasSignature !== 'نعم') hardFails.push('توقيع');

    const gateText = hardFails.length ? `حكم بوابة: رفض — أسباب: ${hardFails.join('، ')}` : 'حكم بوابة: يمر للتقييم';

    const strengths: string[] = [];
    if (kpiOk) strengths.push('بطاقة KPI مكتملة');
    if (input.teamReady === 'نعم' && input.hasMilestones === 'نعم') strengths.push('جهوزية تنفيذية جيدة');
    if (input.isInnovative === 'نعم') strengths.push('قيمة مضافة/ابتكار');
    if (Number(input.budget||0) > 0 && Number(input.beneficiaries||0) > 0 && (Number(input.budget)/Number(input.beneficiaries)) <= 400) strengths.push('فعالية تكلفة مناسبة');

    const fixes: string[] = [];
    if (!kpiOk) fixes.push('استكمال تعريف وصيغة ووحدة وخط الأساس والمستهدف للمؤشر');
    if (!(input.start && input.end && months > 0)) fixes.push('تصحيح تواريخ البداية/النهاية (MM/YYYY)');
    if (!(Number(input.riskCount||0) >= 3)) fixes.push('توثيق ≥3 مخاطر رئيسية مع استجابة');
    if (!(Number(input.budget||0) > 0)) fixes.push('تحديد ميزانية منطقية مرتبطة بالمخرجات');
    if (!fixes.length) fixes.push('تعزيز خطة المتابعة بمؤشرات قائد (Leading) شهرية');

    const explanation = [
      gateText,
      strengths.length ? `نِقا ط قوة: ${strengths.slice(0,3).join('، ')}` : '',
      `تحسينات سريعة: ${fixes.slice(0,3).join('، ')}`
    ].filter(Boolean).join('\n');

    return NextResponse.json({ explanation });
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
