import type { Metadata } from "next";
import { Play } from "./Play";

export const metadata: Metadata = { title: "Club games" };

export default function Page() {
  return <Play />;
}
