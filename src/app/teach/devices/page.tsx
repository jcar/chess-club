import type { Metadata } from "next";
import { Devices } from "./Devices";

export const metadata: Metadata = { title: "iPads & sharing" };

export default function Page() {
  return <Devices />;
}
