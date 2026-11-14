import Link from "next/link";
import type { Metadata } from "next";
import { KeyRoundIcon, UserIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your personal details"
        icon={UserIcon}
        actions={
          <Button asChild variant="outline">
            <Link href={routes.changePassword}>
              <KeyRoundIcon /> Change password
            </Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Your name, phone and photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </>
  );
}
