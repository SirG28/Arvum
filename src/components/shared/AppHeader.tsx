"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { AppNav } from "./AppNav";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { ProfileMenu } from "./ProfileMenu";
import { ReservationsIndicator } from "./ReservationsIndicator";
import { OwnerRequestsIndicator } from "./OwnerRequestsIndicator";

export function AppHeader() {
  return (
    <header className="relative border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo size={36} />
          </Link>
          <AppNav />
        </div>
        <div className="flex items-center gap-2">
          <ReservationsIndicator />
          <OwnerRequestsIndicator />
          <MobileNavDrawer />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
