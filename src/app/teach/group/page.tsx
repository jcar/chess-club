import type { Metadata } from "next";
import { GroupView } from "./GroupView";

export const metadata: Metadata = { title: "My group" };

// The group arrives in the #fragment (a QR on the session pack cover).
export default function Page() {
  return <GroupView />;
}
