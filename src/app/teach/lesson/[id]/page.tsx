import { notFound } from "next/navigation";
import { ALL_LESSONS, getLesson } from "@/content/curriculum";
import { TeacherLesson } from "./TeacherLesson";

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getLesson(id)?.title ?? "Lesson" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLesson(id)) notFound();
  return <TeacherLesson id={id} />;
}
