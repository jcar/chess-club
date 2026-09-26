import type { Metadata } from "next";
import { Planner } from "./Planner";

export const metadata: Metadata = { title: "Plan today" };

export default function Page() {
  return <Planner />;
}
