import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export type Space = {
	ID: string;
	Name: string;
	CreatedAt: string;
};

export const spacesQueryKey = ["spaces"] as const;

export function useSpacesQuery() {
	return useQuery({
		queryKey: spacesQueryKey,
		queryFn: async () => {
			const { data, error } = await apiClient.GET("/api/v1/spaces" as any, {});
			if (error) throw error;
			// The backend doesn't have openapi definitions for Space yet, so we cast it for now
			// based on the manual shape we know it returns
			return (data as any)?.spaces as Space[] ?? [];
		},
		retry: 1,
		refetchInterval: 15_000,
	});
}

export function useCreateSpace() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ name }: { name: string }) => {
			const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
			const { data, error } = await apiClient.POST("/api/v1/spaces" as any, {
				body: { id, name } as any
			});
			if (error) throw error;
			return (data as any)?.space as Space;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: spacesQueryKey });
		},
	});
}
