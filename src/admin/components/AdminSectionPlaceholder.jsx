
import { Construction } from "lucide-react";

export default function AdminSectionPlaceholder({
  title,
  phase,
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600">
        <Construction size={36} />
      </div>

      <h2 className="text-2xl font-black text-indigo-950">
        {title}
      </h2>

      <p className="mt-4 text-slate-600">
        This section is reserved for {phase}.
      </p>
    </section>
  );
}
