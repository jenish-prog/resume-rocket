import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, BarChart3, TrendingUp, Calendar, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";

interface SentEmail {
  id: string;
  company: string;
  email: string;
  sent_at: string;
}

const COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)",
  "hsl(350, 65%, 55%)",
  "hsl(190, 70%, 45%)",
];

const Analytics = () => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("sent_emails")
          .select("*")
          .order("sent_at", { ascending: true });
        if (error) throw error;
        setEmails(data || []);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getWeeklyData = () => {
    const days: Record<string, number> = {};
    const start = subDays(new Date(), 6);
    for (let i = 0; i < 7; i++) {
      const d = subDays(new Date(), 6 - i);
      days[format(d, "EEE")] = 0;
    }
    emails
      .filter(e => isAfter(new Date(e.sent_at), start))
      .forEach(e => {
        const key = format(new Date(e.sent_at), "EEE");
        if (days[key] !== undefined) days[key]++;
      });
    return Object.entries(days).map(([name, count]) => ({ name, count }));
  };

  const getMonthlyData = () => {
    const weeks: Record<string, number> = {};
    for (let i = 3; i >= 0; i--) {
      const w = startOfWeek(subDays(new Date(), i * 7));
      weeks[format(w, "MMM d")] = 0;
    }
    const monthStart = startOfMonth(new Date());
    emails
      .filter(e => isAfter(new Date(e.sent_at), monthStart))
      .forEach(e => {
        const w = startOfWeek(new Date(e.sent_at));
        const key = format(w, "MMM d");
        if (weeks[key] !== undefined) weeks[key]++;
      });
    return Object.entries(weeks).map(([name, count]) => ({ name, count }));
  };

  const getYearlyData = () => {
    const months: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months[format(d, "MMM")] = 0;
    }
    const yearStart = startOfYear(new Date());
    emails
      .filter(e => isAfter(new Date(e.sent_at), yearStart))
      .forEach(e => {
        const key = format(new Date(e.sent_at), "MMM");
        if (months[key] !== undefined) months[key]++;
      });
    return Object.entries(months).map(([name, count]) => ({ name, count }));
  };

  const getTopCompanies = () => {
    const map: Record<string, number> = {};
    emails.forEach(e => {
      map[e.company] = (map[e.company] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  };

  const getStreak = () => {
    if (!emails.length) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      const dayStr = format(d, "yyyy-MM-dd");
      const hasSent = emails.some(e => format(new Date(e.sent_at), "yyyy-MM-dd") === dayStr);
      if (hasSent) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();
  const topCompanies = getTopCompanies();
  const streak = getStreak();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Sender
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Application Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your job application progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{emails.length}</p>
                  <p className="text-xs text-muted-foreground">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeklyData.reduce((s, d) => s + d.count, 0)}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(emails.map(e => e.company)).size}</p>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <Flame className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(220, 70%, 50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="monthly">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="yearly">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(280, 60%, 55%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Top Companies</CardTitle>
              <CardDescription>Most applied to</CardDescription>
            </CardHeader>
            <CardContent>
              {topCompanies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={topCompanies} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {topCompanies.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
