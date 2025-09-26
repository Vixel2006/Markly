import DashboardLayout from "../components/layout/DashboardLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout pageTitle="Markly App">
      {children}
    </DashboardLayout>
  );
}
