import Navbar from "@/components/Navbar";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();

  const navLabels = {
    generator: t.dashboard.generateIdeas,
    ideas: t.dashboard.allIdeas,
    history: t.dashboard.history,
  };

  return (
    <div className="min-h-screen">
      <Navbar labels={navLabels} />
      <main className="max-w-6xl mx-auto py-8">{children}</main>
    </div>
  );
}
