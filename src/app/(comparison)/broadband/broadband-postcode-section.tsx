"use client";

import { useRouter } from "next/navigation";
import { PostcodeChecker } from "@/components/shared/postcode-checker";

export function BroadbandPostcodeSection() {
  const router = useRouter();

  function handleSubmit(postcode: string) {
    router.push(
      `/broadband/compare?postcode=${encodeURIComponent(postcode)}`
    );
  }

  return (
    <div className="w-full max-w-lg">
      <PostcodeChecker
        onSubmit={handleSubmit}
        placeholder="Enter your postcode"
        buttonText="Compare broadband deals"
      />
    </div>
  );
}
