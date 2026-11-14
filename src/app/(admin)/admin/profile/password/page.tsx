import type { Metadata } from "next";
import { KeyRoundIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata: Metadata = { title: "Change password" };

export default function ChangePasswordPage() {
  return (
    <>
      <PageHeader
        title="Change password"
        description="You stay signed in here; every other session is signed out."
        icon={KeyRoundIcon}
        back={{ href: routes.profile, label: "Profile" }}
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New password</CardTitle>
          <CardDescription>At least 8 characters, with a letter and a number.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </>
  );
}
