"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { CertificationId, DocumentKind, ProfileUpdate, VendorProfile } from "@/features/shop/types";

export const shopKeys = { profile: ["vendor-profile"] as const, categories: ["categories"] as const };

/** The business profile; its status gates the console (ShopGate). */
export function useProfile({ enabled = true }: { enabled?: boolean } = {}) {
	return useQuery({ queryKey: shopKeys.profile, queryFn: () => getData<VendorProfile>(backendRoutes.PROFILE), enabled });
}

export function useCategories() {
	return useQuery({
		queryKey: shopKeys.categories,
		queryFn: () => getData<{ id: string; name: string; slug: string }[]>(backendRoutes.CATEGORIES),
		staleTime: 10 * 60_000,
	});
}

/** Every profile call answers with the whole profile. */
function useProfileMutation<V>(request: (vars: V) => Promise<VendorProfile>, fallback: string, success?: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (profile) => {
			queryClient.setQueryData(shopKeys.profile, profile);
			if (success) toast.success(success);
		},
		onError: (error) => toast.error(errorMessage(error, fallback)),
	});
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export function useUpdateProfile() {
	return useProfileMutation(
		async (update: ProfileUpdate) => (await api.patch(backendRoutes.PROFILE, update)).data.data as VendorProfile,
		"Couldn't save your business details. Try again.",
		"Saved",
	);
}

export function useUploadLogo() {
	return useProfileMutation(async (file: File) => {
		const data = new FormData();
		data.set("logo", file);
		return (await api.put(backendRoutes.LOGO, data, multipart)).data.data as VendorProfile;
	}, "Couldn't upload the logo. Try again.");
}

/** One verification document: a PDF, JPEG, PNG or WebP up to 10 MB. */
export function useUploadDocument() {
	return useProfileMutation(
		async ({ file, kind, certification }: { file: File; kind: DocumentKind; certification?: CertificationId }) => {
			const data = new FormData();
			data.set("file", file);
			data.set("kind", kind);
			if (certification) data.set("certification", certification);
			return (await api.post(backendRoutes.DOCUMENTS, data, multipart)).data.data as VendorProfile;
		},
		"Couldn't upload the document. Try again.",
	);
}

export function useDeleteDocument() {
	return useProfileMutation(
		async (id: string) => (await api.delete(backendRoutes.DOCUMENT(id))).data.data as VendorProfile,
		"Couldn't remove the document. Try again.",
	);
}

/** Sends the application to the admin queue (PRD V3); details lock until a decision. */
export function useSubmitApplication() {
	return useProfileMutation(
		async () => (await api.post(backendRoutes.SUBMIT)).data.data as VendorProfile,
		"Your application isn't complete yet.",
		"Submitted! We'll email you when it's reviewed.",
	);
}
