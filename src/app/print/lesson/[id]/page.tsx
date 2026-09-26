import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ALL_LESSONS, getLesson } from "@/content/curriculum";
import { Worksheet } from "./Worksheet";

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${getLesson(id)?.title ?? "Lesson"} worksheet` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLesson(id)) notFound();
  // Search params (?key=1, ?young=1) are read on the client; static export
  // needs the Suspense boundary around that.
  return (
    <Suspense>
      <Worksheet id={id} />
    </Suspense>
  );
}
