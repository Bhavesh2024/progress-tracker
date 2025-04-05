"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryClientProps {
	children: ReactNode;
}

const QueryProvider = ({ children }: QueryClientProps) => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</>
	);
};

export default QueryProvider;
