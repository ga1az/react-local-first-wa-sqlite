import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { PowerSyncContext } from "@powersync/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useMemo } from "react";
import { powerSyncDb } from "@/lib/db";

function RootComponent() {
	const queryClient = useMemo(() => new QueryClient(), []);
	return (
		<>
			<PowerSyncContext.Provider value={powerSyncDb}>
				<QueryClientProvider client={queryClient}>
					<Outlet />
				</QueryClientProvider>
			</PowerSyncContext.Provider>
			<TanStackRouterDevtools />
		</>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
