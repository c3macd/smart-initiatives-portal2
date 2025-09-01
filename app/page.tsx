
'use client';
import React, { useMemo, useState } from 'react';
import { Card, GateRow, Input, Select, Static, ScoreBar } from '@/components/UILib';
import { initialForm, ENTITY_TYPES, GOALS, KPI_UNITS, DATA_SOURCES, FREQ, evalGates, evalScores, autoDecision, type Form } from '@/lib/eval';

export default function Page() {
  const [form, setForm] = useState<Form>(initialForm);
  const [aiBusy, setAIBusy] = useState(false);
  const [aiText, setAIText] = useState('');
  const [uploadInfo, setUploadInfo] = useState<any>(null);

  const onChange = (k: keyof Form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const gates = useMemo(() => evalGates(form), [form]);
  const scores = useMemo(() => evalScores(form, gates.months), [form, gates.months]);
  const decision = useMemo(() => autoDecision(form.entityType, gates.autoGate, scores.total), [form.entityType, gates.autoGate, scores.total]);

  async function handleAI() {
    setAIText('');
    setAIBusy(true);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: form, months: gates.months }),
      });
      const data = await res.json();
      setAIText(data?.explanation || data?.text || '');
    } catch {
      setAIText('تعذّر الوصول إلى خدمة الذكاء الاصطناعي. راجع الإعدادات.');
    } finally {
      setAIBusy(false);
    }
  }

  async function handleUploadChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = ev.target.files;
    if (!files || !files.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploadInfo(data);
    // set docs gate if ok
    if (data?.ok) onChange('hasDocs', 'نعم');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">بوابة مبادرات ذكية — تقييم أولي</h1>
          <div className="text-sm text-slate-500">Next.js + API</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
        <section className="md:col-span-2 space-y-4">
          <Card title="بيانات أساسية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select label="نوع الجهة" value={form.entityType} onChange={(v) => onChange('entityType', v)} options={ENTITY_TYPES as any} />
              <Input label="مكتب/قطاع" value={form.sector} onChange={(v) => onChange('sector', v)} />
              <Input label="اسم الجهة" value={form.orgName} onChange={(v) => onChange('orgName', v)} />
              <Input label="عنوان المبادرة" value={form.title} onChange={(v) => onChange('title', v)} />
              <Input label="الرمز" value={form.code} onChange={(v) => onChange('code', v)} />
              <Select label="الهدف الاستراتيجي" value={form.goal} onChange={(v) => onChange('goal', v)} options={GOALS} />
            </div>
          </Card>

          <Card title="بطاقة المؤشر (KPI)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="اسم KPI" value={form.kpiName} onChange={(v) => onChange('kpiName', v)} />
              <Select label="وحدة KPI" value={form.kpiUnit} onChange={(v) => onChange('kpiUnit', v)} options={KPI_UNITS} />
              <Input label="تعريف/صيغة KPI" value={form.kpiFormula} onChange={(v) => onChange('kpiFormula', v)} />
              <Input label="خط الأساس" type="number" value={form.kpiBaseline} onChange={(v) => onChange('kpiBaseline', v)} />
              <Input label="تاريخ خط الأساس (MM/YYYY)" placeholder="09/2024" value={form.kpiBaselineDate} onChange={(v) => onChange('kpiBaselineDate', v)} />
              <Input label="المستهدف النهائي" type="number" value={form.kpiTarget} onChange={(v) => onChange('kpiTarget', v)} />
              <Select label="مصدر البيانات" value={form.kpiSource} onChange={(v) => onChange('kpiSource', v)} options={DATA_SOURCES} />
              <Select label="تكرار القياس" value={form.kpiFreq} onChange={(v) => onChange('kpiFreq', v)} options={FREQ} />
            </div>
          </Card>

          <Card title="جدولة وموازنة">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select label="ليست عملاً روتينيًا" value={form.nonRoutine} onChange={(v) => onChange('nonRoutine', v as any)} options={['نعم','لا']} />
              <Input label="تاريخ البداية (MM/YYYY)" placeholder="09/2025" value={form.start} onChange={(v) => onChange('start', v)} />
              <Input label="تاريخ النهاية (MM/YYYY)" placeholder="06/2027" value={form.end} onChange={(v) => onChange('end', v)} />
              <Static label="المدة (بالأشهر)" value={gates.months > 0 ? String(gates.months) : '—'} />
              <Input label="عدد المستفيدين" type="number" value={form.beneficiaries} onChange={(v) => onChange('beneficiaries', v)} />
              <Input label="الميزانية الإجمالية" type="number" value={form.budget} onChange={(v) => onChange('budget', v)} />
              <Input label="الاحتياطي % (0.10 = 10%)" type="number" value={form.reservePct} onChange={(v) => onChange('reservePct', v)} />
              <Static label="مبلغ الاحتياطي" value={Intl.NumberFormat().format(Math.round(Number(form.budget||0)*Number(form.reservePct||0)))} />
              <Static label="الإجمالي مع الاحتياطي" value={Intl.NumberFormat().format(Math.round(Number(form.budget||0)*(1+Number(form.reservePct||0))))} />
            </div>
          </Card>

          <Card title="مخاطر وامتثال">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="عدد المخاطر الموثقة" type="number" value={form.riskCount} onChange={(v) => onChange('riskCount', v)} />
              <Select label="وثائق داعمة مرفقة" value={form.hasDocs} onChange={(v) => onChange('hasDocs', v as any)} options={['نعم','لا']} />
              <Select label="توقيع مدير الجهة" value={form.hasSignature} onChange={(v) => onChange('hasSignature', v as any)} options={['نعم','لا']} />
            </div>
            <div className="mt-3">
              <label className="block text-sm text-slate-700 mb-1">رفع وثائق داعمة (PDF/صور، متعددة):</label>
              <input type="file" multiple accept=".pdf,image/*" onChange={handleUploadChange} className="block w-full" />
              {uploadInfo && (
                <div className="mt-2 text-xs bg-slate-50 border rounded p-2 whitespace-pre-wrap">
                  {JSON.stringify(uploadInfo, null, 2)}
                </div>
              )}
            </div>
          </Card>

          <Card title="قابلية وأثر">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select label="تقدير الأثر" value={form.impactLevel} onChange={(v) => onChange('impactLevel', v as any)} options={['منخفض','متوسط','مرتفع']} />
              <Select label="فريق جاهز" value={form.teamReady} onChange={(v) => onChange('teamReady', v as any)} options={['نعم','لا']} />
              <Select label="معالم محددة" value={form.hasMilestones} onChange={(v) => onChange('hasMilestones', v as any)} options={['نعم','لا']} />
              <Select label="ابتكار/قيمة مضافة" value={form.isInnovative} onChange={(v) => onChange('isInnovative', v as any)} options={['نعم','لا']} />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <Card title="نتيجة البوابة (Hard Gates)">
            <GateRow label="مواءمة الهدف" pass={gates.gateAlignment === '✓'} />
            <GateRow label="عدم روتينية" pass={gates.gateNonRoutine === '✓'} />
            <GateRow label="اكتمال بطاقة KPI" pass={gates.gateKPIComplete === '✓'} />
            <GateRow label="تواريخ صحيحة" pass={gates.gateDates === '✓'} />
            <GateRow label="مخاطر ≥ 3" pass={gates.gateRisks === '✓'} />
            <GateRow label="ميزانية > 0" pass={gates.gateBudget === '✓'} />
            <GateRow label="وثائق داعمة" pass={gates.gateDocs === '✓'} />
            <GateRow label="توقيع مدير الجهة" pass={gates.gateSign === '✓'} />
            <div className="mt-3 p-3 rounded-xl text-center font-semibold" style={{background: gates.autoGate === 'يمر للتقييم' ? '#DCFCE7' : '#FEE2E2', color: '#0F172A'}}>
              {gates.autoGate}
            </div>
          </Card>

          <Card title="التقييم الكمي (100)">
            <ScoreBar label="مواءمة/مؤشرات" val={scores.sAlign} max={20} />
            <ScoreBar label="جودة KPI" val={scores.sKPI} max={20} />
            <ScoreBar label="الأثر" val={scores.sImpact} max={20} />
            <ScoreBar label="القابلية" val={scores.sFeasible} max={15} />
            <ScoreBar label="الكلفة/الفعالية" val={scores.sCost} max={10} />
            <ScoreBar label="المخاطر/الامتثال" val={scores.sRisk} max={10} />
            <ScoreBar label="الابتكار" val={scores.sInnovation} max={5} />
            <div className="mt-2 text-center text-sm text-slate-600">المجموع: {scores.total}/100</div>
            <div className="mt-2 p-3 rounded-xl text-center font-bold"
                 style={{background: decision.includes('يمر') ? '#E0F2FE' : (decision.includes('رفض') || decision.includes('مرفوض')) ? '#FFE4E6' : '#E2E8F0'}}>
              القرار الأولي: {decision}
            </div>
          </Card>

          <Card title="تقييم ذكي (اختياري)">
            <button onClick={handleAI} disabled={aiBusy}
                    className="w-full py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition">
              {aiBusy ? '...جارِ التحليل' : 'تحليل بالذكاء الاصطناعي'}
            </button>
            {aiText && <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-sm whitespace-pre-wrap leading-7">{aiText}</div>}
            {!aiText && !aiBusy && <p className="mt-2 text-xs text-slate-500">ملاحظة: إن لم تُعِد إعداد /api/ai-eval فسيعود نص تفسير افتراضي.</p>}
          </Card>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500">
        © بوابة مبادرات — نموذج أولي للتقييم الأولي — حدّث وفق سياسات الجهة قبل الإنتاج.
      </footer>
    </div>
  );
}
