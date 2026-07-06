import { PageFrame } from "@/components/layout/page-patterns";
import { ProfilesManager } from "@/components/profile/profiles-manager";

export default function ProfilesPage() {
  return (
    <PageFrame maxWidth="narrow">
      <ProfilesManager />
    </PageFrame>
  );
}
