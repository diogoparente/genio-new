import Navbar from "@/components/Navbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<Navbar />
			<main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
		</div>
	);
}
