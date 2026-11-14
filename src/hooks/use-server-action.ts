"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { ActionFailedError, unwrapResult, type ActionResult } from "@/lib/data/result";

type ServerAction<TInput, TOutput> = (input: TInput) => Promise<ActionResult<TOutput>>;

type MutationOptions<TInput, TOutput, TForm extends FieldValues> = {
  /** Toast on success. */
  successMessage?: string | ((data: TOutput, input: TInput) => string);
  /** Toast the error message on failure. Default true. */
  toastErrors?: boolean;
  /** Map server field errors onto this form's fields (any transformed output type). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<TForm, any, any>;
  /** React Query keys to invalidate after success. */
  invalidate?: QueryKey[];
  onSuccess?: (data: TOutput, input: TInput) => void;
  onError?: (error: ActionFailedError["error"], input: TInput) => void;
};

/** Next's redirect errors carry a `NEXT_REDIRECT;…` digest (no public client helper). */
function isRedirectError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

/**
 * Call a server action (from `defineAction`) as a React Query mutation.
 * Handles toasts, form field errors and cache invalidation.
 *
 *   const create = useServerMutation(createRoleAction, { form, successMessage: "Role created" });
 *   form.handleSubmit((values) => create.mutate(values))
 */
export function useServerMutation<TInput, TOutput, TForm extends FieldValues = FieldValues>(
  action: ServerAction<TInput, TOutput>,
  options: MutationOptions<TInput, TOutput, TForm> = {},
) {
  const queryClient = useQueryClient();
  const { successMessage, toastErrors = true, form, invalidate, onSuccess, onError } = options;

  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (input) => {
      let result: ActionResult<TOutput> | undefined;
      try {
        result = await action(input);
      } catch (error) {
        // A redirect() inside the action rejects the call with a redirect
        // error while the router performs the navigation. That's success.
        if (isRedirectError(error)) {
          // The user is leaving this form, but Next keeps visited pages alive
          // (Activity), so clear it: a create form must open empty next time.
          // Edit forms pass `values`, so reset() restores the saved record.
          form?.reset();
          return undefined as TOutput;
        }
        throw error;
      }
      if (result === undefined) return undefined as TOutput;
      return unwrapResult(result);
    },
    onSuccess: async (data, input) => {
      if (successMessage) {
        toast.success(
          typeof successMessage === "function" ? successMessage(data, input) : successMessage,
        );
      }
      await Promise.all(
        (invalidate ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      onSuccess?.(data, input);
    },
    onError: (error, input) => {
      const actionError =
        error instanceof ActionFailedError
          ? error.error
          : { code: "INTERNAL" as const, message: "Something went wrong" };

      let mappedToFields = false;
      if (form && actionError.fieldErrors) {
        for (const [field, messages] of Object.entries(actionError.fieldErrors)) {
          if (field === "_root") continue;
          form.setError(field as Path<TForm>, { type: "server", message: messages[0] });
          mappedToFields = true;
        }
      }

      if (toastErrors && !mappedToFields) toast.error(actionError.message);
      onError?.(actionError, input);
    },
  });
}

/**
 * Read data through a server action from a Client Component (e.g. async
 * select options). Prefer fetching in Server Components for page data:
 * server actions run one at a time per client, so don't fan out many of these.
 */
export function useServerQuery<TInput, TOutput>(
  queryKey: QueryKey,
  action: ServerAction<TInput, TOutput>,
  input: TInput,
  options?: Omit<UseQueryOptions<TOutput, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TOutput, Error>({
    queryKey: [...queryKey, input],
    queryFn: async () => unwrapResult(await action(input)),
    ...options,
  });
}
