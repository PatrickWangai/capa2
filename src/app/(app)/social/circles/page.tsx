import type { Metadata } from "next";
import { auth } from "@/auth";
import { listCircles } from "@/services/circles";
import { CircleCard } from "@/components/circle-card";
import { CreateCircleForm } from "@/components/create-circle-form";

export const metadata: Metadata = { title: "Circles" };

export default async function CirclesPage() {
  const session = await auth();
  const circles = await listCircles(session?.user?.id ?? null);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Investment Circles</h1>
        <CreateCircleForm />
      </div>
      {circles.length === 0 ? (
        <p className="mt-10 text-center text-[13.5px] text-muted">No circles yet — start one.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {circles.map((c) => (
            <CircleCard key={c.id} id={c.id} name={c.name} description={c.description} visibility={c.visibility} memberCount={c.memberCount} isMember={c.isMember} />
          ))}
        </div>
      )}
    </div>
  );
}
