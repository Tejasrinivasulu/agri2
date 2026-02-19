import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, BookOpen, Search, RefreshCw, IndianRupee, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS } from '@/data/cropRates';

interface FarmingClassesScreenProps {
  onBack: () => void;
}

interface ClassItem {
  id: string;
  class_name: string;
  mode: string;
  fees: number;
  duration: string;
  district: string;
  state: string;
  instructor?: string;
  schedule?: string;
  created_at?: string;
}

const STORAGE_KEY = 'farming_classes_local';
const ENROLLMENTS_KEY = 'farming_class_enrollments';

const SAMPLE_CLASSES: ClassItem[] = [
  { id: '1', class_name: 'Organic Farming Basics', mode: 'Online', fees: 999, duration: '4 weeks', district: 'Chennai', state: 'Tamil Nadu', instructor: 'Dr. Ramesh', schedule: 'Sat 10 AM', created_at: new Date().toISOString() },
  { id: '2', class_name: 'Soil Health Workshop', mode: 'Offline', fees: 1500, duration: '2 days', district: 'Thanjavur', state: 'Tamil Nadu', instructor: 'Agri Officer', schedule: 'Next weekend', created_at: new Date().toISOString() },
  { id: '3', class_name: 'Drip Irrigation Training', mode: 'Online', fees: 499, duration: '1 week', district: 'Coimbatore', state: 'Tamil Nadu', schedule: 'Wed 6 PM', created_at: new Date().toISOString() },
  { id: '4', class_name: 'Pesticide Safety', mode: 'Offline', fees: 1200, duration: '1 day', district: 'Madurai', state: 'Tamil Nadu', schedule: 'Monthly', created_at: new Date().toISOString() },
];

const getStored = (): ClassItem[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveStored = (items: ClassItem[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

type Enrollment = { classId: string; className: string; mode: string; enrolledAt: string; reminder: boolean };
const getEnrollments = (): Enrollment[] => {
  try {
    const s = localStorage.getItem(ENROLLMENTS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveEnrollments = (items: Enrollment[]) => {
  try { localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(items)); } catch {}
};

const FarmingClassesScreen: React.FC<FarmingClassesScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [classType, setClassType] = useState<string>('');
  const [classes, setClasses] = useState<ClassItem[]>(SAMPLE_CLASSES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [enrolled, setEnrolled] = useState<string[]>(() => getEnrollments().map((e) => e.classId));
  const [enrollments, setEnrollments] = useState<Enrollment[]>(getEnrollments());
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);
  useEffect(() => {
    saveEnrollments(enrollments);
  }, [enrollments]);

  const loadClasses = async () => {
    setLoading(true);
    const local = getStored();
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([supabase.from('farming_classes').select('*'), timeout]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        class_name: r.class_name,
        mode: r.mode,
        fees: Number(r.fees),
        duration: r.duration,
        district: r.district,
        state: r.state,
        instructor: r.instructor,
        schedule: r.schedule,
        created_at: r.created_at,
      }));
      setClasses(mapped.length ? mapped : [...SAMPLE_CLASSES, ...local]);
    } catch {
      setClasses(local.length ? local : SAMPLE_CLASSES);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (classType && c.mode !== classType) return false;
      if (filterState && c.state !== filterState) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.class_name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
      }
      return true;
    });
  }, [classes, classType, filterState, searchQuery]);

  const handleEnroll = (item: ClassItem) => {
    const newEnrollment: Enrollment = {
      classId: item.id,
      className: item.class_name,
      mode: item.mode,
      enrolledAt: new Date().toISOString(),
      reminder: true,
    };
    setEnrollments((prev) => [newEnrollment, ...prev.filter((e) => e.classId !== item.id)]);
    setEnrolled((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    setEnrollSuccess(`✅ Enrolled in ${item.class_name}! Reminders will be sent.`);
    setTimeout(() => setEnrollSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">🎓 {t.farmingClasses || 'Classes'}</h1>
            <p className="text-sm text-primary-foreground/80">Learn farming, enroll in courses</p>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <Button variant={classType === '' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[40px] ${classType === '' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setClassType('')}>
            All
          </Button>
          <Button variant={classType === 'Online' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[40px] ${classType === 'Online' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setClassType('Online')}>
            🖥️ Online
          </Button>
          <Button variant={classType === 'Offline' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[40px] ${classType === 'Offline' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setClassType('Offline')}>
            🌾 Offline
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search classes..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadClasses()} disabled={loading} className="min-h-[44px] min-w-[44px] text-primary-foreground border-primary-foreground/30">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Select value={filterState || undefined} onValueChange={(v) => setFilterState(v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] mt-2 text-primary-foreground"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 mt-4">
        {enrollSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">{enrollSuccess}</div>}
        {enrollments.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-primary/10">
            <p className="font-semibold text-foreground">✓ {enrollments.length} enrolled • <Bell className="w-4 h-4 inline" /> Reminders on</p>
          </div>
        )}
        {loading && classes.length === 0 ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No classes found.</div>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="text-2xl">{course.mode === 'Online' ? '🖥️' : '🌾'}</span>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{course.class_name}</h3>
                        <p className="text-xs text-muted-foreground">{course.mode}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-primary flex items-center gap-0.5"><IndianRupee className="w-5 h-5" />{course.fees}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="w-4 h-4 text-primary" />{course.duration}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{course.district}, {course.state}</div>
                  {course.schedule && <p className="text-xs text-muted-foreground">Schedule: {course.schedule}</p>}
                  <Button variant={enrolled.includes(course.id) ? 'default' : 'outline'} className="w-full min-h-[44px]" onClick={() => handleEnroll(course)} disabled={enrolled.includes(course.id)}>
                    {enrolled.includes(course.id) ? `✓ ${t.enrolled || 'Enrolled'}` : t.enrollNow || 'Enroll now'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmingClassesScreen;
