import { Suspense } from "react";
import { Home } from "@/components/home/Home";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Home />
    </Suspense>
  );
}
