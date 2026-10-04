import type { Metadata } from "next";
import { Go } from "./Go";

export const metadata: Metadata = { title: "Getting ready" };

export default function Page() {
  return <Go />;
}
