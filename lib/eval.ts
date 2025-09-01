
export type EntityType = 'مدرسة' | 'إدارة';
export type YesNo = 'نعم' | 'لا' | '';
export type Impact = 'منخفض' | 'متوسط' | 'مرتفع' | '';

export type Form = {
  seq: string;
  entityType: EntityType | '';
  sector: string;
  orgName: string;
  title: string;
  code: string;
  goal: string;
  kpiName: string;
  kpiFormula: string;
  kpiUnit: string;
  kpiBaseline: string;
  kpiBaselineDate: string;
  kpiTarget: string;
  kpiSource: string;
  kpiFreq: string;
  nonRoutine: YesNo;
  start: string;
  end: string;
  beneficiaries: string;
  budget: string;
  reservePct: string;
  riskCount: string;
  hasDocs: YesNo;
  hasSignature: YesNo;
  impactLevel: Impact;
  teamReady: YesNo;
  hasMilestones: YesNo;
  isInnovative: YesNo;
};

export const ENTITY_TYPES: EntityType[] = ['مدرسة','إدارة'] as const;
export const GOALS = ['الهدف 1','الهدف 2','الهدف 3','الهدف 4','الهدف 5','الهدف 6'];
export const KPI_UNITS = ['%','عدد','درجة','ساعة','معدل'];
export const DATA_SOURCES = ['منصة الاختبارات','نظام الحضور','استبيان','سجلات إدارية','منصة LMS','نظام داخلي'];
export const FREQ = ['شهري','ربعي','نصف سنوي','سنوي'];

export const initialForm: Form = {
  seq: '', entityType: '', sector: '', orgName: '', title: '', code: '', goal: '',
  kpiName: '', kpiFormula: '', kpiUnit: '', kpiBaseline: '', kpiBaselineDate: '',
  kpiTarget: '', kpiSource: '', kpiFreq: '', nonRoutine: '', start: '', end: '',
  beneficiaries: '', budget: '', reservePct: '0.10', riskCount: '', hasDocs: '',
  hasSignature: '', impactLevel: '', teamReady: '', hasMilestones: '', isInnovative: ''
}

export function parseMMYYYY(s?: string) {
  const m = s?.match(/^(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const mm = parseInt(m[1], 10);
  const yyyy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return null;
  return { mm, yyyy };
}

export function monthsDiff(a?: string, b?: string) {
  const A = a ? parseMMYYYY(a) : null;
  const B = b ? parseMMYYYY(b) : null;
  if (!A || !B) return 0;
  return (B.yyyy - A.yyyy) * 12 + (B.mm - A.mm);
}

export function evalGates(form: Form) {
  const months = monthsDiff(form.start, form.end);
  const gateAlignment = form.goal.trim().length > 0 ? '✓' : '✖';
  const gateNonRoutine = form.nonRoutine === 'نعم' ? '✓' : '✖';
  const gateKPIComplete = [form.kpiName, form.kpiFormula, form.kpiUnit, form.kpiBaseline, form.kpiTarget, form.kpiSource, form.kpiFreq].every(x => x && String(x).trim().length>0) ? '✓' : '✖';
  const gateDates = form.start && form.end && months > 0 ? '✓' : '✖';
  const gateRisks = Number(form.riskCount || 0) >= 3 ? '✓' : '✖';
  const gateBudget = Number(form.budget || 0) > 0 ? '✓' : '✖';
  const gateDocs = form.hasDocs === 'نعم' ? '✓' : '✖';
  const gateSign = form.hasSignature === 'نعم' ? '✓' : '✖';
  const autoGate = [gateAlignment, gateNonRoutine, gateKPIComplete, gateDates, gateRisks, gateBudget, gateDocs, gateSign].includes('✖') ? 'رفض تلقائي' : 'يمر للتقييم';
  return { months, gateAlignment, gateNonRoutine, gateKPIComplete, gateDates, gateRisks, gateBudget, gateDocs, gateSign, autoGate };
}

export function evalScores(form: Form, months: number) {
  const sAlign = Math.min(20, (form.goal?5:0) + (form.kpiName?5:0) + (form.kpiUnit?5:0) + (form.kpiSource?2:0) + (form.kpiFreq?3:0));
  const kpiFields = [form.kpiName, form.kpiFormula, form.kpiUnit, form.kpiBaseline, form.kpiTarget, form.kpiSource, form.kpiFreq];
  const sKPI = Math.round(20 * kpiFields.filter(x => x && x.trim().length>0).length / 7);
  const sImpact = form.impactLevel === 'مرتفع' ? 20 : form.impactLevel === 'متوسط' ? 14 : form.impactLevel === 'منخفض' ? 8 : 0;
  const sFeasible = (form.teamReady==='نعم'?6:0) + (form.hasMilestones==='نعم'?6:0) + (months>=3 && months<=60 ? 3 : 0);
  const b = Number(form.budget || 0), ben = Number(form.beneficiaries || 0);
  const costPer = b>0 && ben>0 ? b/ben : 0;
  const sCost = (b>0 && ben>0) ? (costPer<=200?10 : costPer<=400?8 : costPer<=800?6 : 4) : 5;
  const sRisk = (Number(form.riskCount||0)>=3?5:0) + (form.hasDocs==='نعم'?3:0) + (form.hasSignature==='نعم'?2:0);
  const sInnovation = form.isInnovative==='نعم'?5:0;
  const total = sAlign + sKPI + sImpact + sFeasible + sCost + sRisk + sInnovation;
  return { sAlign, sKPI, sImpact, sFeasible, sCost, sRisk, sInnovation, total };
}

export function autoDecision(entityType: string, autoGate: string, total: number) {
  if (autoGate === 'رفض تلقائي') return 'رفض (بوابة)';
  if (entityType === 'مدرسة') return total >= 70 ? 'يمر (مدارس)' : 'مرفوض (مدارس<70)';
  if (entityType === 'إدارة') return total >= 75 ? 'يمر (إدارات)' : 'مرفوض (إدارات<75)';
  return '—';
}
