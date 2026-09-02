"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileInput } from "../schemas/profile.schema";
import type { ChangePasswordInput } from "../schemas/change-password.schema";
import type { NotificationPreferencesInput } from "../schemas/notification-preferences.schema";
import type { ChangeEmailRequestInput } from "../schemas/change-email.schema";
import type { PublicUser, UserSettings } from "../services/user.service";
import { parseErrorOrThrow } from "@/lib/fetch-json";
import { useToast } from "@/components/shared/ToastProvider";

export function useUpdateProfile() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      const response = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: PublicUser };
      return data;
    },
    onSuccess: () => {
      showToast("success", "Perfil atualizado com sucesso!");
    },
  });
}

export function useChangePassword() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const response = await fetch("/api/v1/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: { status: string } };
      return data;
    },
    onSuccess: () => {
      showToast("success", "Senha alterada com sucesso!");
    },
  });
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/users/me/deactivate", { method: "POST" });
      const { data } = (await parseErrorOrThrow(response)) as { data: { status: string } };
      return data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: NotificationPreferencesInput) => {
      const response = await fetch("/api/v1/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: UserSettings };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me", "settings"] });
      showToast("success", "Preferência de notificação atualizada.");
    },
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: async (input: ChangeEmailRequestInput) => {
      const response = await fetch("/api/v1/users/me/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as {
        data: { pendingEmail: string; token: string };
      };
      return data;
    },
  });
}

export function useConfirmEmailChange() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/v1/users/me/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: PublicUser };
      return data;
    },
    onSuccess: () => {
      showToast("success", "E-mail alterado com sucesso!");
    },
  });
}

export function useCancelEmailChange() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/users/me/email", { method: "DELETE" });
      const { data } = (await parseErrorOrThrow(response)) as { data: PublicUser };
      return data;
    },
  });
}

export function useRequestDataDeletion() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/users/me/data-deletion", { method: "POST" });
      const { data } = (await parseErrorOrThrow(response)) as { data: UserSettings };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me", "settings"] });
      showToast("success", "Pedido de exclusão registrado. Nossa equipe vai analisar em breve.");
    },
  });
}
