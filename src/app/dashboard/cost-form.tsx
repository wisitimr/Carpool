"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n-context";

interface CostFormProps {
  cars: { id: string; name: string; defaultGasCost: number }[];
}

export default function CostForm({ cars }: CostFormProps) {
  const { t } = useT();
  const router = useRouter();

  const [carId, setCarId] = useState(cars[0]?.id ?? "");

  const car = cars.find((c) => c.id === carId);
  const [gasCost, setGasCost] = useState(() => car?.defaultGasCost ? car.defaultGasCost.toString() : "");
  const [parkingCost, setParkingCost] = useState("0");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  function resetForm() {
    const firstCar = cars[0];
    setCarId(firstCar?.id ?? "");
    setGasCost(firstCar?.defaultGasCost ? firstCar.defaultGasCost.toString() : "");
    setParkingCost("0");
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }))
      .toISOString().split("T")[0];

    try {
      const res = await fetch("/api/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          date: today,
          gasCost: parseFloat(gasCost) || 0,
          parkingCost: parseFloat(parkingCost) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      resetForm();
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none sm:py-2.5";

  return (
    <div className="space-y-4">
      {/* Car selector */}
      {cars.length > 1 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t.car}
          </label>
          <select
            value={carId}
            onChange={(e) => {
              setCarId(e.target.value);
              const c = cars.find((c) => c.id === e.target.value);
              setGasCost(c?.defaultGasCost ? c.defaultGasCost.toString() : "");
              setParkingCost("0");
            }}
            className={inputClass}
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cost form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t.gasCost} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={gasCost}
              onChange={(e) => setGasCost(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t.parkingCost} <span className="normal-case tracking-normal font-normal text-gray-400">({t.optional})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={parkingCost}
              onChange={(e) => setParkingCost(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 sm:py-2.5"
        >
          {t.saveCosts}{status === "saving" && "..."}
        </button>
        {status === "error" && (
          <p className="text-sm font-medium text-red-600">
            {t.failedToSave}
          </p>
        )}
      </form>
    </div>
  );
}
