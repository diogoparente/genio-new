export default function SignInLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D4852]/15 border-t-[#3D4852] dark:border-[#E4E8EE]/15 dark:border-t-[#E4E8EE] mx-auto"></div>
				<p className="mt-4 text-muted-foreground">Loading...</p>
			</div>
		</div>
	);
}
