"use client";

import { useTransition } from "react";
import { useFormState } from "react-dom";
import {
  addEmployeeAction,
  removeEmployeeAction,
  type EmployeeActionState,
} from "@/app/(dashboard)/dashboard/equipo/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import { formatDateTime } from "@/lib/utils";
import type { RestaurantEmployeeWithProfile } from "@/lib/types";

const initialState: EmployeeActionState = {};

type EmployeeManagerProps = {
  employees: RestaurantEmployeeWithProfile[];
};

export function EmployeeManager({ employees }: EmployeeManagerProps) {
  const [state, formAction] = useFormState(addEmployeeAction, initialState);
  const [isPending, startTransition] = useTransition();

  function handleRemove(employeeId: string) {
    startTransition(async () => {
      await removeEmployeeAction(employeeId);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Agregar empleado</h2>
        <p className="mt-1 text-sm text-slate-600">
          El usuario debe tener una cuenta registrada en Tu QaRta. Podrá ver
          el mapa de mesas, los pedidos y actualizar su estado.
        </p>

        <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="employee-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="employee-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="bartender@local.com"
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            />
            {state.fieldErrors?.email ? (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email[0]}</p>
            ) : null}
          </div>
          <SubmitButton className="!h-11 !w-auto shrink-0 rounded-lg bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-purple-hover disabled:opacity-60 sm:self-end">
            Agregar
          </SubmitButton>
        </form>

        {state.error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Equipo actual ({employees.length})
        </h2>

        {employees.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Todavía no hay empleados registrados.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {employees.map((employee) => (
              <li
                key={employee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {employee.profile.full_name ?? "Sin nombre"}
                  </p>
                  <p className="text-sm text-slate-600">{employee.profile.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Desde {formatDateTime(employee.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRemove(employee.id)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
