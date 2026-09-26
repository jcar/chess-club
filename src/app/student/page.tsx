import type { Metadata } from "next";
import { StudentHome } from "./StudentHome";

export const metadata: Metadata = { title: "Student" };

export default function Page() {
  return <StudentHome />;
}
