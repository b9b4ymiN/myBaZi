import { ProfilesManager } from "@/components/profile/profiles-manager";
import Image from "next/image";

export default function ProfilesPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Image
          src="/assets/brand/logo.png"
          alt="myBaZi logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <h1 className="text-2xl font-bold">โปรไฟล์ (Profile)</h1>
      </div>
      <ProfilesManager />
    </div>
  );
}
